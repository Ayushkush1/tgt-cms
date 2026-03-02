"use client";

import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";
import { Eye, Trash2 } from "lucide-react";

export default function EnquiriesPage() {
  const dummyEnquiries = [
    {
      id: "1",
      name: "Alice Johnson",
      company: "RetailCorp",
      date: "Oct 24, 2026",
      service: "E-Commerce",
      status: "New",
    },
    {
      id: "2",
      name: "Bob Smith",
      company: "StartupX",
      date: "Oct 23, 2026",
      service: "Web App",
      status: "Read",
    },
    {
      id: "3",
      name: "Diana Prince",
      company: "Wayne Ent",
      date: "Oct 21, 2026",
      service: "Cloud Migration",
      status: "Read",
    },
  ];

  const columns = [
    {
      header: "Status",
      accessorKey: (row: (typeof dummyEnquiries)[0]) => (
        <span
          className={`inline-block w-2 h-2 rounded-full ${row.status === "New" ? "bg-brand-gold" : "bg-gray-300"}`}
          title={row.status}
        />
      ),
      className: "w-[50px] text-center",
    },
    {
      header: "Sender Name",
      accessorKey: "name" as keyof (typeof dummyEnquiries)[0],
      className: "font-medium text-gray-900",
    },
    {
      header: "Company",
      accessorKey: "company" as keyof (typeof dummyEnquiries)[0],
      className: "text-gray-500",
    },
    {
      header: "Service Needed",
      accessorKey: "service" as keyof (typeof dummyEnquiries)[0],
      className: "text-gray-600",
    },
    {
      header: "Date Received",
      accessorKey: "date" as keyof (typeof dummyEnquiries)[0],
      className: "text-gray-500 text-sm",
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyEnquiries)[0]) => (
        <div className="flex gap-4">
          <button className="text-brand-navy hover:text-brand-navy/80 flex items-center gap-1 text-sm font-medium transition-colors">
            <Eye className="w-4 h-4" /> View
          </button>
          <button className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales Enquiries / Inbox"
        description="View messages and leads submitted through the contact form."
      />

      <DataTable
        data={dummyEnquiries}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
