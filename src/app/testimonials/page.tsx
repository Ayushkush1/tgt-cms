"use client";

import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";

export default function TestimonialsPage() {
  const dummyTestimonials = [
    {
      id: "1",
      clientName: "Sarah Jenkins",
      company: "TechFlow Inc.",
      quote: "TGT transformed our digital presence completely.",
    },
    {
      id: "2",
      clientName: "Michael Chang",
      company: "DataSync",
      quote: "Outstanding service and technical expertise.",
    },
  ];

  const columns = [
    {
      header: "Client Name",
      accessorKey: "clientName" as keyof (typeof dummyTestimonials)[0],
      className: "font-medium text-gray-900 w-[200px]",
    },
    {
      header: "Company",
      accessorKey: "company" as keyof (typeof dummyTestimonials)[0],
      className: "text-gray-500 w-[200px]",
    },
    {
      header: "Quote Snippet",
      accessorKey: "quote" as keyof (typeof dummyTestimonials)[0],
      className: "truncate max-w-sm",
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyTestimonials)[0]) => (
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
        title="Testimonials & Reputation"
        description="Manage client feedback and quotes displayed on the site."
        action={{ label: "Add Testimonial", href: "#" }}
      />

      <DataTable
        data={dummyTestimonials}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
