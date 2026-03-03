"use client";

import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";

export default function NavLinksPage() {
  const dummyLinks = [
    {
      id: "1",
      label: "Home",
      url: "/",
      type: "Main Link",
      parent: "-",
      order: 1,
    },
    {
      id: "2",
      label: "About Us",
      url: "/about",
      type: "Main Link",
      parent: "-",
      order: 2,
    },
    {
      id: "3",
      label: "Services",
      url: "#",
      type: "Dropdown",
      parent: "-",
      order: 3,
    },
    {
      id: "3-1",
      label: "UI/UX Designing",
      url: "/service/ui-ux-designing",
      type: "Sub-link",
      parent: "Services",
      order: 1,
    },
    {
      id: "3-2",
      label: "Website Design & Development",
      url: "/service/website-design-development",
      type: "Sub-link",
      parent: "Services",
      order: 2,
    },
    {
      id: "3-3",
      label: "Mobile App Development",
      url: "/service/mobile-app-development",
      type: "Sub-link",
      parent: "Services",
      order: 3,
    },
    {
      id: "3-4",
      label: "Custom Software Development",
      url: "/service/custom-software-development",
      type: "Sub-link",
      parent: "Services",
      order: 4,
    },
    {
      id: "3-5",
      label: "Business Software Solutions",
      url: "/service/business-software-solutions",
      type: "Sub-link",
      parent: "Services",
      order: 5,
    },
    {
      id: "3-6",
      label: "Business Intelligence Solutions",
      url: "/service/business-intelligence-solutions",
      type: "Sub-link",
      parent: "Services",
      order: 6,
    },
    {
      id: "3-7",
      label: "IOT Solutions",
      url: "/service/iot-solutions",
      type: "Sub-link",
      parent: "Services",
      order: 7,
    },
    {
      id: "3-8",
      label: "AI & ML Solution",
      url: "/service/ai-ml-solutions",
      type: "Sub-link",
      parent: "Services",
      order: 8,
    },
    {
      id: "3-9",
      label: "Branding",
      url: "/service/branding",
      type: "Sub-link",
      parent: "Services",
      order: 9,
    },
    {
      id: "3-10",
      label: "Digital Marketing",
      url: "/service/digital-marketing",
      type: "Sub-link",
      parent: "Services",
      order: 10,
    },
    {
      id: "3-11",
      label: "Accessibility Services",
      url: "/service/accessibility-services",
      type: "Sub-link",
      parent: "Services",
      order: 11,
    },
    {
      id: "4",
      label: "Products",
      url: "#",
      type: "Dropdown",
      parent: "-",
      order: 4,
    },
    {
      id: "4-1",
      label: "IP ERP",
      url: "/products",
      type: "Sub-link",
      parent: "Products",
      order: 1,
    },
    {
      id: "4-2",
      label: "Catfy Catalog",
      url: "/products",
      type: "Sub-link",
      parent: "Products",
      order: 2,
    },
    {
      id: "5",
      label: "Contact Us",
      url: "/contactUs",
      type: "Main Link",
      parent: "-",
      order: 5,
    },
  ];

  const columns = [
    {
      header: "Order",
      accessorKey: "order" as keyof (typeof dummyLinks)[0],
      className: "text-gray-500 w-[60px]",
    },
    {
      header: "Label",
      accessorKey: (row: (typeof dummyLinks)[0]) => (
        <span
          className={
            row.parent !== "-"
              ? "pl-6 text-gray-500 text-[14px]"
              : "font-semibold text-gray-900"
          }
        >
          {row.parent !== "-" && <span className="text-gray-300 mr-2">↳</span>}
          {row.label}
        </span>
      ),
      className: "w-[300px]",
    },
    {
      header: "Type",
      accessorKey: (row: (typeof dummyLinks)[0]) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            row.type === "Main Link"
              ? "bg-blue-50 text-[#D3AF37]"
              : row.type === "Dropdown"
                ? "bg-purple-50 text-purple-600"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {row.type}
        </span>
      ),
    },
    {
      header: "Destination URL",
      accessorKey: "url" as keyof (typeof dummyLinks)[0],
      className: "font-mono text-[13px] text-gray-500",
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyLinks)[0]) => (
        <div className="flex gap-3">
          <button className="text-[#0B0F29] hover:text-[#D4AF37] hover:underline text-sm font-semibold transition-colors">
            Edit
          </button>
          <button className="text-red-500 hover:text-red-700 hover:underline text-sm font-semibold transition-colors">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className=" flex flex-col gap-6 ">
      <PageHeader
        title="Navigation Links"
        description="Manage the links that appear in the main website navigation bar."
        action={{ label: "Add Link" }}
      />

      <DataTable
        data={dummyLinks}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </section>
  );
}
