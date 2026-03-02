"use client";

import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";

export default function PartnersPage() {
  const dummyPartners = [
    { id: "1", name: "Google Cloud", logoUrl: "/logos/gcp.svg" },
    { id: "2", name: "AWS", logoUrl: "/logos/aws.svg" },
    { id: "3", name: "Microsoft", logoUrl: "/logos/ms.svg" },
  ];

  const columns = [
    {
      header: "Partner/Client Name",
      accessorKey: "name" as keyof (typeof dummyPartners)[0],
      className: "font-medium text-gray-900 w-[300px]",
    },
    {
      header: "Logo URL",
      accessorKey: "logoUrl" as keyof (typeof dummyPartners)[0],
      className: "text-gray-500 font-mono text-sm",
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyPartners)[0]) => (
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
        title="Partners & Trusted By"
        description="Manage the client and partner logos displayed in the logo marquee."
        action={{ label: "Add Partner Logo", href: "#" }}
      />

      <DataTable
        data={dummyPartners}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
