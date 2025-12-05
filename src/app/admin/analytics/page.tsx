import { db } from "@/lib/db";
import { pageView } from "@/lib/schema";
import { sql, desc, and, gte, eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Bot, Users, Globe, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Analytics | Admin",
  description: "Site traffic analytics and visitor insights",
};

// Get date ranges
function getDateRanges() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  return { today, yesterday, weekAgo, monthAgo };
}

export default async function AdminAnalyticsPage() {
  const { today, weekAgo, monthAgo } = getDateRanges();

  // Total views stats
  const [totalStats] = await db
    .select({
      totalViews: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageView.visitorHash})::int`,
      botViews: sql<number>`count(*) filter (where ${pageView.isBot} = true)::int`,
      humanViews: sql<number>`count(*) filter (where ${pageView.isBot} = false)::int`,
    })
    .from(pageView);

  // Today's stats
  const [todayStats] = await db
    .select({
      views: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageView.visitorHash})::int`,
      bots: sql<number>`count(*) filter (where ${pageView.isBot} = true)::int`,
    })
    .from(pageView)
    .where(gte(pageView.createdAt, today));

  // Last 7 days stats
  const [weekStats] = await db
    .select({
      views: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageView.visitorHash})::int`,
    })
    .from(pageView)
    .where(gte(pageView.createdAt, weekAgo));

  // Top pages (last 30 days, humans only)
  const topPages = await db
    .select({
      path: pageView.path,
      views: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageView.visitorHash})::int`,
    })
    .from(pageView)
    .where(and(gte(pageView.createdAt, monthAgo), eq(pageView.isBot, false)))
    .groupBy(pageView.path)
    .orderBy(desc(sql`count(*)`))
    .limit(15);

  // Top referrers (last 30 days, humans only, exclude empty)
  const topReferrers = await db
    .select({
      referrer: pageView.referrer,
      views: sql<number>`count(*)::int`,
    })
    .from(pageView)
    .where(
      and(
        gte(pageView.createdAt, monthAgo),
        eq(pageView.isBot, false),
        sql`${pageView.referrer} is not null and ${pageView.referrer} != ''`
      )
    )
    .groupBy(pageView.referrer)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Bot breakdown (last 30 days)
  const botBreakdown = await db
    .select({
      botName: pageView.botName,
      views: sql<number>`count(*)::int`,
    })
    .from(pageView)
    .where(and(gte(pageView.createdAt, monthAgo), eq(pageView.isBot, true)))
    .groupBy(pageView.botName)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Device breakdown (last 30 days, humans only)
  const deviceBreakdown = await db
    .select({
      deviceType: pageView.deviceType,
      views: sql<number>`count(*)::int`,
    })
    .from(pageView)
    .where(and(gte(pageView.createdAt, monthAgo), eq(pageView.isBot, false)))
    .groupBy(pageView.deviceType)
    .orderBy(desc(sql`count(*)`));

  // Browser breakdown (last 30 days, humans only)
  const browserBreakdown = await db
    .select({
      browser: pageView.browser,
      views: sql<number>`count(*)::int`,
    })
    .from(pageView)
    .where(and(gte(pageView.createdAt, monthAgo), eq(pageView.isBot, false)))
    .groupBy(pageView.browser)
    .orderBy(desc(sql`count(*)`));

  // Country breakdown (last 30 days, humans only)
  const countryBreakdown = await db
    .select({
      country: pageView.country,
      views: sql<number>`count(*)::int`,
      uniqueVisitors: sql<number>`count(distinct ${pageView.visitorHash})::int`,
    })
    .from(pageView)
    .where(
      and(
        gte(pageView.createdAt, monthAgo),
        eq(pageView.isBot, false),
        sql`${pageView.country} is not null`
      )
    )
    .groupBy(pageView.country)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Region breakdown (last 30 days, humans only, Canada focus)
  const regionBreakdown = await db
    .select({
      country: pageView.country,
      region: pageView.region,
      views: sql<number>`count(*)::int`,
    })
    .from(pageView)
    .where(
      and(
        gte(pageView.createdAt, monthAgo),
        eq(pageView.isBot, false),
        sql`${pageView.region} is not null`
      )
    )
    .groupBy(pageView.country, pageView.region)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // City breakdown (last 30 days, humans only)
  const cityBreakdown = await db
    .select({
      city: pageView.city,
      region: pageView.region,
      country: pageView.country,
      views: sql<number>`count(*)::int`,
    })
    .from(pageView)
    .where(
      and(
        gte(pageView.createdAt, monthAgo),
        eq(pageView.isBot, false),
        sql`${pageView.city} is not null`
      )
    )
    .groupBy(pageView.city, pageView.region, pageView.country)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Recent page views
  const recentViews = await db
    .select({
      path: pageView.path,
      isBot: pageView.isBot,
      botName: pageView.botName,
      browser: pageView.browser,
      deviceType: pageView.deviceType,
      referrer: pageView.referrer,
      country: pageView.country,
      region: pageView.region,
      city: pageView.city,
      createdAt: pageView.createdAt,
    })
    .from(pageView)
    .orderBy(desc(pageView.createdAt))
    .limit(20);

  // Return visitors (sessions with multiple page views)
  const [returnVisitorStats] = await db
    .select({
      totalSessions: sql<number>`count(distinct ${pageView.sessionId})::int`,
      returnSessions: sql<number>`count(distinct ${pageView.sessionId}) filter (where ${pageView.sessionId} in (
        select session_id from page_view
        where session_id is not null
        group by session_id
        having count(*) > 1
      ))::int`,
    })
    .from(pageView)
    .where(and(gte(pageView.createdAt, monthAgo), eq(pageView.isBot, false)));

  // Calculate percentages
  const botPercentage = totalStats.totalViews > 0
    ? ((totalStats.botViews / totalStats.totalViews) * 100).toFixed(1)
    : "0";

  const returnRate = returnVisitorStats.totalSessions > 0
    ? ((returnVisitorStats.returnSessions / returnVisitorStats.totalSessions) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site Analytics</h1>
        <p className="text-muted-foreground">
          Traffic insights, bot detection, and visitor behavior
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.views} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.uniqueVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.uniqueVisitors} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bot Traffic</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.botViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {botPercentage}% of total traffic
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returnRate}%</div>
            <p className="text-xs text-muted-foreground">
              Sessions with multiple pages (30d)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Page Views</p>
              <p className="text-2xl font-bold">{weekStats.views.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Visitors</p>
              <p className="text-2xl font-bold">{weekStats.uniqueVisitors.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Pages/Visitor</p>
              <p className="text-2xl font-bold">
                {weekStats.uniqueVisitors > 0
                  ? (weekStats.views / weekStats.uniqueVisitors).toFixed(1)
                  : "0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages (last 30 days, humans only)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No data yet
                    </TableCell>
                  </TableRow>
                ) : (
                  topPages.map((page, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm truncate max-w-[200px]">
                        {page.path}
                      </TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                      <TableCell className="text-right">{page.uniqueVisitors}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Referrers
            </CardTitle>
            <CardDescription>Where visitors come from (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topReferrers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No referrer data yet
                    </TableCell>
                  </TableRow>
                ) : (
                  topReferrers.map((ref, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm truncate max-w-[250px]">
                        {ref.referrer ? new URL(ref.referrer).hostname : "Direct"}
                      </TableCell>
                      <TableCell className="text-right">{ref.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Bot Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Bot Traffic
            </CardTitle>
            <CardDescription>Bot visits (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bot</TableHead>
                  <TableHead className="text-right">Hits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {botBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No bot traffic detected
                    </TableCell>
                  </TableRow>
                ) : (
                  botBreakdown.map((bot, i) => (
                    <TableRow key={i}>
                      <TableCell>{bot.botName || "Unknown"}</TableCell>
                      <TableCell className="text-right">{bot.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Device types (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deviceBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No data yet
                    </TableCell>
                  </TableRow>
                ) : (
                  deviceBreakdown.map((device, i) => (
                    <TableRow key={i}>
                      <TableCell className="capitalize">{device.deviceType || "Unknown"}</TableCell>
                      <TableCell className="text-right">{device.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Browser Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
            <CardDescription>Browser usage (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Browser</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {browserBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No data yet
                    </TableCell>
                  </TableRow>
                ) : (
                  browserBreakdown.map((browser, i) => (
                    <TableRow key={i}>
                      <TableCell>{browser.browser || "Unknown"}</TableCell>
                      <TableCell className="text-right">{browser.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Country Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Countries
            </CardTitle>
            <CardDescription>Visitor locations (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Visitors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countryBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No geo data yet
                    </TableCell>
                  </TableRow>
                ) : (
                  countryBreakdown.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.country || "Unknown"}</TableCell>
                      <TableCell className="text-right">{item.views}</TableCell>
                      <TableCell className="text-right">{item.uniqueVisitors}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Region Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Provinces / States</CardTitle>
            <CardDescription>Regional breakdown (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No geo data yet
                    </TableCell>
                  </TableRow>
                ) : (
                  regionBreakdown.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {item.region}, {item.country}
                      </TableCell>
                      <TableCell className="text-right">{item.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* City Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cities</CardTitle>
            <CardDescription>City-level data (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      No geo data yet
                    </TableCell>
                  </TableRow>
                ) : (
                  cityBreakdown.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {item.city}{item.region ? `, ${item.region}` : ""}
                      </TableCell>
                      <TableCell className="text-right">{item.views}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 20 page views</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Referrer</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentViews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No page views yet
                  </TableCell>
                </TableRow>
              ) : (
                recentViews.map((view, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-sm truncate max-w-[150px]">
                      {view.path}
                    </TableCell>
                    <TableCell>
                      {view.isBot ? (
                        <Badge variant="secondary">{view.botName || "Bot"}</Badge>
                      ) : (
                        <Badge variant="outline">Human</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {view.city || view.region || view.country
                        ? [view.city, view.region, view.country].filter(Boolean).join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell className="capitalize">{view.deviceType || "-"}</TableCell>
                    <TableCell className="text-sm truncate max-w-[100px]">
                      {view.referrer ? new URL(view.referrer).hostname : "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatDistanceToNow(view.createdAt, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
