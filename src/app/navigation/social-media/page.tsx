"use client";

import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Link as LinkIcon } from "lucide-react";

export default function SocialLinksPage() {
  const dummySocials = [
    { id: "1", platform: "LinkedIn", url: "https://linkedin.com/company/tgt" },
    { id: "2", platform: "Twitter", url: "https://twitter.com/tgt" },
    { id: "3", platform: "Instagram", url: "https://instagram.com/tgt" },
  ];

  const columns = [
    {
      header: "Platform",
      accessorKey: "platform" as keyof (typeof dummySocials)[0],
      className: "font-medium text-gray-900",
    },
    {
      header: "URL",
      accessorKey: (row: (typeof dummySocials)[0]) => (
        <a
          href={row.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-brand-navy hover:underline"
        >
          <LinkIcon className="w-3 h-3" />
          {row.url}
        </a>
      ),
    },
    {
      header: "Actions",
      accessorKey: () => (
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
    <section className=" flex flex-col gap-6 ">
      <PageHeader
        title="Social Media Links"
        description="Manage the social connectivity icons displayed in the footer."
        action={{ label: "Add Social Link" }}
      />

      <DataTable
        data={dummySocials}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    </section>
  );
}
