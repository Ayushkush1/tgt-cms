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
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-16 text-center flex flex-col items-center justify-center">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <Inbox className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
        </div>
        <h3 className="mt-2 text-lg font-bold text-[#0B0F29] tracking-tight">
          No data available
        </h3>
        <p className="mt-2 text-sm text-gray-500 font-medium max-w-xs mx-auto">
          There isn&apos;t any data to display right now. Get started by
          creating a new entry.
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
                    "px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="hover:bg-[#fafafb] transition-colors group"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      "whitespace-nowrap px-6 py-5 text-[14px] font-medium text-gray-600 group-hover:text-[#0B0F29] transition-colors",
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
