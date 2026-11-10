"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchWithCache } from "../lib/apiCache";
import {
  LayoutDashboard,
  Settings,
  Compass,
  BookOpen,
  Layers,
  LucideIcon,
  ChevronDown,
  LogOut,
  Globe,
  ShoppingCart,
} from "lucide-react";
import { cn } from "../lib/utils";
import { signOut } from "next-auth/react";

type SidebarLink = {
  title: string;
  icon: LucideIcon;
  href?: string;
  sublinks?: { title: string; href: string }[];
  badge?: string | number;
};

const staticSidebarLinks: SidebarLink[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Navigation & Links",
    icon: Compass,
    sublinks: [
      { title: "Menu Links", href: "/navigation/menu-links" },
      { title: "Social Media", href: "/navigation/social-media" },
    ],
  },
  {
    title: "Static pages",
    icon: BookOpen,
    sublinks: [
      { title: "Home", href: "/static-pages/home" },
      { title: "About", href: "/static-pages/about" },
      { title: "Contact", href: "/static-pages/contact" },
      { title: "Services", href: "/static-pages/services" },
      { title: "Products", href: "/static-pages/products" },
      { title: "Portfolio", href: "/static-pages/portfolio" },
      { title: "CEO", href: "/static-pages/ceo" },
    ],
  },
  {
    title: "SEO Management",
    icon: Globe,
    sublinks: [
      { title: "Global Settings", href: "/seo/global" },
      { title: "Page Settings", href: "/seo/pages" },
      { title: "Sitemap & Robots", href: "/seo/sitemap-robots" },
    ],
  },
  {
    title: "Ecommerce",
    icon: ShoppingCart,
    sublinks: [
      { title: "Products", href: "/ecommerce/products" },
      { title: "Categories", href: "/ecommerce/categories" },
      { title: "Banners", href: "/ecommerce/banners" },
    ],
  },
  {
    title: "Submissions",
    icon: Layers,
    sublinks: [
      { title: "Enquiries", href: "/submissions/enquiries" },
      { title: "Audits", href: "/submissions/audits" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    sublinks: [{ title: "Profile", href: "/settings/profile" }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [customPages, setCustomPages] = useState<{ title: string; href: string }[]>([]);

  useEffect(() => {
    fetchWithCache("/api/pages")
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const fetchedPages = json.data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((p: any) => p.type === "standard")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((p: any) => ({
              title: p.title,
              href: `/custom-pages/${p.slug}`,
            }));
          setCustomPages(fetchedPages);
        }
      })
      .catch(console.error);
  }, []);

  const dynamicCustomSection: SidebarLink = {
    title: "Custom pages",
    icon: Layers,
    sublinks: [...customPages],
  };

  // Reconstruct full links array
  const sidebarLinks = [
    ...staticSidebarLinks.slice(0, 3),
    ...(customPages.length > 0 ? [dynamicCustomSection] : []),
    ...staticSidebarLinks.slice(3),
  ];

  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    return sidebarLinks
      .filter((item) => item.sublinks?.some((sublink) => pathname.startsWith(sublink.href)))
      .map((item) => item.title);
  });

  // Ensure active group is open when custom pages load or pathname changes
  useEffect(() => {
    const activeGroups = sidebarLinks
      .filter((item) => item.sublinks?.some((sublink) => pathname.startsWith(sublink.href)))
      .map((item) => item.title);

    setOpenGroups((prev) => {
      const newGroups = [...prev];
      activeGroups.forEach((group) => {
        if (!newGroups.includes(group)) {
          newGroups.push(group);
        }
      });
      return newGroups;
    });
  }, [pathname, customPages.length]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  return (
    <div className="flex h-full w-[280px] flex-col overflow-hidden rounded-l-[2.5rem] bg-[#0B0F29] text-white">
      {/* Logo Area */}
      <div className="flex h-24 items-center px-8">
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-black text-[#0B0F29] italic shadow-sm">
            T
          </div>
          <span className="text-2xl font-bold tracking-tighter italic">
            TGT <span className="text-[#D4AF37]">CMS</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="custom-scrollbar flex-1 overflow-y-auto py-2">
        <nav className="space-y-1.5 px-6">
          {sidebarLinks.map((item, index) => {
            const isActive = pathname === item.href;
            const isOpen = openGroups.includes(item.title);

            if (item.sublinks) {
              return (
                <div key={index} className="pt-4 first:pt-0">
                  <div
                    className="group mb-2 flex cursor-pointer items-center justify-between pr-4 pl-4"
                    onClick={() => toggleGroup(item.title)}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-gray-500 uppercase transition-colors group-hover:text-gray-300">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-gray-500 transition-transform group-hover:text-gray-300",
                        isOpen ? "rotate-180" : "",
                      )}
                    />
                  </div>
                  {isOpen && (
                    <div className="ml-2 space-y-1 border-l border-gray-800 py-1 pl-4">
                      {item.sublinks.map((sublink, subIndex) => {
                        const isSubActive = pathname === sublink.href;
                        return (
                          <Link
                            key={subIndex}
                            href={sublink.href}
                            className={cn(
                              "block rounded-2xl px-4 py-2.5 text-[13px] font-medium transition-all duration-200",
                              isSubActive
                                ? "scale-[1.02] transform bg-[#D4AF37] text-[#0B0F29] shadow-sm"
                                : "text-gray-400 hover:bg-white/5 hover:text-white",
                            )}
                          >
                            {sublink.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                href={item.href!}
                className={cn(
                  "mt-2 flex items-center justify-between rounded-2xl px-4 py-3 text-[14px] font-medium transition-all duration-200",
                  isActive
                    ? "scale-[1.02] transform bg-[#D4AF37] text-[#0B0F29] shadow-sm"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon
                    className={cn("h-5 w-5", isActive ? "text-[#0B0F29]" : "text-gray-400")}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.title}
                </div>
                {item.badge && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B5952F] text-[10px] font-bold text-white">
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-800 px-6 pt-6 pb-8">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-[14px] font-medium text-gray-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
