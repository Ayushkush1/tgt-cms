"use client";

import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";
import { useState } from "react";
import { AddServicePopUp } from "./components/AddServicePopUp";

export default function ServicesPage() {
  const [addService, setAddService] = useState(false);
  const [editingService, setEditingService] = useState<
    (typeof dummyServices)[0] | null
  >(null);

  const dummyServices = [
    {
      id: "1",
      title: "Custom Web Development",
      description: "Building scalable web applications.",
      iconName: "Code",
    },
    {
      id: "2",
      title: "UI/UX Design",
      description: "Creating intuitive and beautiful interfaces.",
      iconName: "Palette",
    },
    {
      id: "3",
      title: "Cloud Architecture",
      description: "Designing reliable cloud infrastructure.",
      iconName: "Cloud",
    },
  ];

  const columns = [
    {
      header: "Icon Class/Name",
      accessorKey: "iconName" as keyof (typeof dummyServices)[0],
      className: "text-gray-500 w-[150px] font-mono text-xs",
    },
    {
      header: "Service Title",
      accessorKey: "title" as keyof (typeof dummyServices)[0],
      className: "font-medium text-gray-900 w-[200px]",
    },
    {
      header: "Description",
      accessorKey: "description" as keyof (typeof dummyServices)[0],
    },
    {
      header: "Actions",
      accessorKey: (row: (typeof dummyServices)[0]) => (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingService(row);
              setAddService(true);
            }}
            className="text-brand-navy hover:underline text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() =>
              setAllServices((prev) => prev.filter((s) => s.id !== row.id))
            }
            className="text-red-600 hover:underline text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const [allServices, setAllServices] = useState(dummyServices);

  return (
    <section className=" flex flex-col gap-6 ">
      <PageHeader
        title="Services"
        description="Manage the list of services offered by your company."
        action={{ label: "Add Service" }}
        setIsOpen={(value) => {
          setEditingService(null);
          setAddService(value as any);
        }}
      />

      <DataTable
        data={allServices}
        columns={columns}
        keyExtractor={(item) => item.id}
      />

      <AddServicePopUp
        isModalOpen={addService}
        setIsModalOpen={(isOpen) => {
          setAddService(isOpen);
          if (!isOpen) {
            setEditingService(null);
          }
        }}
        serviceToEdit={editingService}
        onSave={(service) => {
          if ("id" in service && service.id) {
            // Edit existing service
            setAllServices((prev) =>
              prev.map((s) => (s.id === service.id ? { ...s, ...service } : s)),
            );
          } else {
            // Add new service
            setAllServices((prev) => [
              ...prev,
              {
                ...service,
                id: Math.random().toString(36).substr(2, 9),
              } as (typeof dummyServices)[0],
            ]);
          }
          setAddService(false);
          setEditingService(null);
        }}
      />
    </section>
  );
}
