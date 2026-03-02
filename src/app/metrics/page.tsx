"use client";

import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";

export default function MetricsPage() {
  const dummyMetrics = [
    { id: "1", value: "10+", label: "Years Experience" },
    { id: "2", value: "500+", label: "Clients Served" },
    { id: "3", value: "99%", label: "Satisfaction Rate" },
  ];

  const columns = [
    {
      header: "Metric Value",
      accessorKey: "value" as keyof (typeof dummyMetrics)[0],
      className: "font-medium text-gray-900",
    },
    {
      header: "Label / Description",
      accessorKey: "label" as keyof (typeof dummyMetrics)[0],
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyMetrics)[0]) => (
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
        title="Metrics & Statistics"
        description="Manage the key figures displayed in the highlights section."
        action={{ label: "Add Metric", href: "#" }}
      />

      <DataTable
        data={dummyMetrics}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
