"use client";

import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";

export default function NavLinksPage() {
  const dummyLinks = [
    { id: "1", label: "About Us", url: "#about", order: 1 },
    { id: "2", label: "Services", url: "#services", order: 2 },
    { id: "3", label: "Work", url: "#work", order: 3 },
    { id: "4", label: "Contact", url: "#contact", order: 4 },
  ];

  const columns = [
    {
      header: "Display Order",
      accessorKey: "order" as keyof (typeof dummyLinks)[0],
      className: "text-gray-500 w-[100px]",
    },
    {
      header: "Label",
      accessorKey: "label" as keyof (typeof dummyLinks)[0],
      className: "font-medium text-gray-900",
    },
    {
      header: "Destination URL",
      accessorKey: "url" as keyof (typeof dummyLinks)[0],
      className: "font-mono text-gray-500",
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyLinks)[0]) => (
        <div className="flex gap-3">
          <button className="text-brand-navy hover:underline text-sm font-medium">
            Edit
          </button>
          <button className="text-red-600 hover:underline text-sm font-medium">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Navigation Links"
        description="Manage the links that appear in the main website navigation bar."
        action={{ label: "Add Link", href: "#" }}
      />

      <DataTable
        data={dummyLinks}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
