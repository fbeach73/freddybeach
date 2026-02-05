import Link from "next/link";
import { MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const directoryLinks = [
  { title: "Browse", href: "/search" },
  { title: "Categories", href: "/#categories" },
  { title: "Add Business", href: "/add-business" },
  { title: "Blog", href: "/blog" },
];

const companyLinks = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Advertise", href: "/advertise" },
];

const legalLinks = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
  { title: "Refund Policy", href: "/refund" },
];

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-nb-border bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo & Tagline */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <div className="flex h-9 w-9 items-center justify-center rounded-none bg-nb-yellow border-2 border-nb-border">
                <MapPin className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-black uppercase">FreddyBeach</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Freddy Beach is your guide to discovering and supporting local
              businesses in Fredericton, New Brunswick.
            </p>
          </div>

          {/* Column 2: Directory Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wide">Directory</h3>
            <nav className="flex flex-col gap-2">
              {directoryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground font-bold transition-all duration-150 hover:text-nb-yellow hover:translate-x-1"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Company Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wide">Company</h3>
            <nav className="flex flex-col gap-2">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground font-bold transition-all duration-150 hover:text-nb-yellow hover:translate-x-1"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wide">Legal</h3>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground font-bold transition-all duration-150 hover:text-nb-yellow hover:translate-x-1"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t-2 border-nb-border my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground font-bold">
            © {new Date().getFullYear()} FreddyBeach. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground font-bold">
            Made with ❤️ in Fredericton, NB
          </p>
        </div>
      </div>
    </footer>
  );
}
