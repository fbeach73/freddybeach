import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog/get-posts";
import { getCategoryById } from "@/lib/data/categories";
import { formatDate } from "@/lib/utils/format";

export const runtime = "edge";

// Image dimensions for OG image
const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Get the blog post
  const post = await getPostBySlug(slug);

  if (!post) {
    // Return a fallback image for missing posts
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a2e",
            color: "#ffffff",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: "bold" }}>
            Post Not Found
          </div>
        </div>
      ),
      { width: WIDTH, height: HEIGHT }
    );
  }

  // Get category info
  const category = getCategoryById(post.categoryId);
  const categoryName = category?.name || "Blog";

  // Truncate title if too long
  const title = post.title.length > 80
    ? post.title.substring(0, 77) + "..."
    : post.title;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a", // slate-900
          position: "relative",
        }}
      >
        {/* Background gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "60px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Top section: Category badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#3b82f6", // blue-500
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "9999px",
                fontSize: 24,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {categoryName}
            </div>
          </div>

          {/* Middle section: Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              paddingRight: "80px",
            }}
          >
            <div
              style={{
                fontSize: title.length > 50 ? 56 : 64,
                fontWeight: "bold",
                color: "#ffffff",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom section: Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Author & Date */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: "#94a3b8", // slate-400
                }}
              >
                {post.author.name} • {formatDate(post.publishedAt, { year: "numeric", month: "short", day: "numeric" })}
              </div>
            </div>

            {/* Site branding */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#3b82f6", // blue-500
                }}
              >
                FreddyBeach
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: "#64748b", // slate-500
                }}
              >
                .com
              </div>
            </div>
          </div>
        </div>

        {/* Decorative accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
          }}
        />
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}
