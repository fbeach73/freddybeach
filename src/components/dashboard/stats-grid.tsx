import { Building2, Sparkles, Clock, Crown } from "lucide-react";
import { StatsCard } from "./stats-card";
import type { MockDashboardStats } from "@/lib/types/dashboard";

interface StatsGridProps {
  stats: MockDashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    {
      title: "Businesses Claimed",
      value: stats.businessesClaimed,
      icon: Building2,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-500/10",
    },
    {
      title: "AI Tools Used",
      value: stats.aiToolsUsed,
      icon: Sparkles,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-500/10",
    },
    {
      title: "Hours Saved",
      value: stats.hoursSaved,
      icon: Clock,
      iconColor: "text-green-600",
      iconBgColor: "bg-green-500/10",
    },
    {
      title: "Current Plan",
      value: stats.currentPlan,
      icon: Crown,
      iconColor: "text-amber-600",
      iconBgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statItems.map((item) => (
        <StatsCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          iconColor={item.iconColor}
          iconBgColor={item.iconBgColor}
        />
      ))}
    </div>
  );
}
