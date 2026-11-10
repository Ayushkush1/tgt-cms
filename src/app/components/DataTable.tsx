import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "../lib/utils";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey: keyof T | ((row: T) => React.ReactNode);
    className?: string; // e.g. w-[100px] or text-right
  }[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
}

export function DataTable<T>({ columns, data, keyExtractor, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-16 text-center shadow-sm">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#D4AF37]"></div>
        <p className="animate-pulse text-sm font-bold tracking-widest text-gray-400 uppercase">
          Fetching data...
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-16 text-center shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-gray-50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <Inbox className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
        </div>
        <h3 className="mt-2 text-lg font-bold tracking-tight text-[#0B0F29]">No data available</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm font-medium text-gray-500">
          There isn&apos;t any data to display right now. Get started by creating a new entry.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100/50">
      <div className="overflow-x-auto p-2">
        <table className="min-w-full divide-y divide-gray-100/50">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={cn(
                    "px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="group transition-colors hover:bg-[#fafafb]">
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      "px-6 py-5 text-[14px] font-medium whitespace-nowrap text-gray-600 transition-colors group-hover:text-[#0B0F29]",
                      col.className,
                    )}
                  >
                    {typeof col.accessorKey === "function"
                      ? col.accessorKey(row)
                      : String(row[col.accessorKey] || "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
