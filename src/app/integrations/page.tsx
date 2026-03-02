"use client";

import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";

export default function IntegrationsPage() {
  const dummyIntegrations = [
    {
      id: "1",
      name: "Shopify",
      category: "E-commerce",
      logoUrl: "/integrations/shopify.svg",
    },
    {
      id: "2",
      name: "Salesforce",
      category: "CRM",
      logoUrl: "/integrations/salesforce.svg",
    },
    {
      id: "3",
      name: "Stripe",
      category: "Payments",
      logoUrl: "/integrations/stripe.svg",
    },
  ];

  const columns = [
    {
      header: "Integration Name",
      accessorKey: "name" as keyof (typeof dummyIntegrations)[0],
      className: "font-medium text-gray-900 w-[200px]",
    },
    {
      header: "Category",
      accessorKey: "category" as keyof (typeof dummyIntegrations)[0],
      className: "text-gray-500 w-[150px]",
    },
    {
      header: "Logo URL",
      accessorKey: "logoUrl" as keyof (typeof dummyIntegrations)[0],
      className: "text-gray-500 font-mono text-sm truncate max-w-[200px]",
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyIntegrations)[0]) => (
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
        title="Tech Stack & Integrations"
        description="Manage the tools and platforms your agency integrates with."
        action={{ label: "Add Integration", href: "#" }}
      />

      <DataTable
        data={dummyIntegrations}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
