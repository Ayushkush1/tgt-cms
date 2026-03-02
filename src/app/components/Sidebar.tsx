"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Users,
  MessageSquare,
  FileText,
  MenuSquare,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { cn } from "../lib/utils";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Site Settings",
    icon: Settings,
    sublinks: [
      { title: "General Info", href: "/settings/general" },
      { title: "Hero Section", href: "/settings/hero" },
      { title: "About Section", href: "/settings/about" },
    ],
  },
  {
    title: "Content",
    icon: FileText,
    sublinks: [
      { title: "Services", href: "/services" },
      { title: "Blog Posts", href: "/blog" },
      { title: "Metrics & Stats", href: "/metrics" },
    ],
  },
  {
    title: "Public Relations",
    icon: Users,
    sublinks: [
      { title: "Testimonials", href: "/testimonials" },
      { title: "Partners & Clients", href: "/partners" },
      { title: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Navigation & Links",
    icon: MenuSquare,
    sublinks: [
      { title: "Menu Links", href: "/navlinks" },
      { title: "Social Media", href: "/socials" },
    ],
  },
  {
    title: "Enquiries",
    href: "/enquiries",
    icon: MessageSquare,
    badge: "2",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[280px] flex-col bg-[#0B0F29] text-white overflow-hidden rounded-l-[2.5rem]">
      {/* Logo Area */}
      <div className="flex h-24 items-center px-8">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#0B0F29] font-black italic shadow-sm">
            e
          </div>
          <span className="font-semibold text-xl tracking-tight">Eduplex</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <nav className="space-y-1.5 px-6">
          {sidebarLinks.map((item, index) => {
            const isActive = pathname === item.href;
            const isGroupActive = item.sublinks?.some((sublink) =>
              pathname.startsWith(sublink.href),
            );

            if (item.sublinks) {
              return (
                <div key={index} className="pt-4 first:pt-0">
                  <div className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.title}
                  </div>
                  <div className="space-y-1 pl-4 ml-2 border-l border-gray-800 py-1">
                    {item.sublinks.map((sublink, subIndex) => {
                      const isSubActive = pathname === sublink.href;
                      return (
                        <Link
                          key={subIndex}
                          href={sublink.href}
                          className={cn(
                            "block px-4 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200",
                            isSubActive
                              ? "bg-[#D4AF37] text-[#0B0F29] shadow-sm transform scale-[1.02]"
                              : "text-gray-400 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          {sublink.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={index}
                href={item.href!}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 mt-2",
                  isActive
                    ? "bg-[#D4AF37] text-[#0B0F29] shadow-sm transform scale-[1.02]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-[#0B0F29]" : "text-gray-400",
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.title}
                </div>
                {item.badge && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#B5952F] text-white text-[10px] font-bold">
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Card (Mobile App Promo) */}
      <div className="p-6 mt-4">
        <div className="relative bg-[#D4AF37] rounded-3xl p-5 text-[#0B0F29] overflow-hidden">
          {/* Decorative Lines */}
          <svg
            className="absolute top-4 right-4 text-[#0B0F29]/20 w-12 h-12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform="rotate(-45 12 12) translate(0 -6)"
            />
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform="rotate(-45 12 12)"
            />
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              transform="rotate(-45 12 12) translate(0 6)"
            />
          </svg>

          <div className="absolute -top-4 -right-2 bg-white rounded-full p-2 shadow-sm border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
            <ArrowUpRight className="w-4 h-4 text-[#0B0F29]" strokeWidth={3} />
          </div>

          <div className="mt-8">
            <h4 className="font-bold text-[15px] leading-tight pr-4">
              Download our
              <br />
              mobile app
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
