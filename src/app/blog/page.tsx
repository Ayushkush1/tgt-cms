"use client";

import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";

export default function BlogAdminPage() {
  const dummyPosts = [
    {
      id: "1",
      title: "The Future of Web Development",
      date: "Oct 12, 2026",
      status: "Published",
    },
    {
      id: "2",
      title: "How to Optimize Your React App",
      date: "Sep 28, 2026",
      status: "Draft",
    },
    {
      id: "3",
      title: "Understanding Next.js Server Components",
      date: "Sep 15, 2026",
      status: "Published",
    },
  ];

  const columns = [
    {
      header: "Post Title",
      accessorKey: "title" as keyof (typeof dummyPosts)[0],
      className: "font-medium text-gray-900 w-[300px]",
    },
    {
      header: "Publish Date",
      accessorKey: "date" as keyof (typeof dummyPosts)[0],
      className: "text-gray-500",
    },
    {
      header: "Status",
      accessorKey: (row: (typeof dummyPosts)[0]) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            row.status === "Published"
              ? "bg-green-50 text-green-700 ring-green-600/20"
              : "bg-yellow-50 text-yellow-800 ring-yellow-600/20"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyPosts)[0]) => (
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
        title="Blog Posts"
        description="Write and publish articles to your site's blog."
        action={{ label: "Write New Post", href: "#" }}
      />

      <DataTable
        data={dummyPosts}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </div>
  );
}
