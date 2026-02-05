import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Oxanium, Merriweather, Fira_Code } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const oxanium = Oxanium({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Freddy Beach | Fredericton's Local Business Directory — FreddyBeach.com",
  description:
    "Freddy Beach is Fredericton's go-to local business directory. Find the best restaurants, coffee shops, services, and shops in Freddy Beach, New Brunswick. Discover, review, and support local.",
  metadataBase: new URL("https://fbeach.vercel.app"),
  openGraph: {
    title: "Freddy Beach | Fredericton's Local Business Directory",
    description:
      "Freddy Beach is Fredericton's go-to local business directory. Find the best restaurants, coffee shops, services, and shops in Freddy Beach, New Brunswick.",
    url: "https://fbeach.vercel.app",
    siteName: "FreddyBeach",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freddy Beach | Fredericton's Local Business Directory",
    description:
      "Freddy Beach is Fredericton's go-to local business directory. Find restaurants, shops, and services in Freddy Beach, NB.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T6ZSDXK7');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body
        className={`${oxanium.variable} ${merriweather.variable} ${firaCode.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T6ZSDXK7"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        {/* End Google Tag Manager (noscript) */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-nb-bg">
            <SiteHeader />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
