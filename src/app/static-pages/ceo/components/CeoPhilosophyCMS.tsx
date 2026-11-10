"use client";

import { InputField } from "@/app/components/InputField";
import { TextAreaField } from "@/app/components/TextAreaField";

export interface CeoPhilosophyItem {
  title: string;
  description: string;
  icon: string;
}

export interface CeoPhilosophyData {
  upperTag: string;
  title: string;
  titleHighlight: string;
  description: string;
  items: CeoPhilosophyItem[];
}

interface Props {
  philosophy: CeoPhilosophyData;
  onPhilosophyChange: (philosophy: CeoPhilosophyData) => void;
}

export function CeoPhilosophyCMS({ philosophy, onPhilosophyChange }: Props) {
  const handleItemChange = (idx: number, key: keyof CeoPhilosophyItem, val: string) => {
    const newItems = [...philosophy.items];
    newItems[idx] = { ...newItems[idx], [key]: val };
    onPhilosophyChange({ ...philosophy, items: newItems });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-800">CEO Philosophy Settings</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputField
            label="Philosophy Upper Tag"
            value={philosophy.upperTag}
            onChange={(e) => onPhilosophyChange({ ...philosophy, upperTag: e.target.value })}
            placeholder="e.g. Core Values"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
            <InputField
              label="Philosophy Title"
              value={philosophy.title}
              onChange={(e) => onPhilosophyChange({ ...philosophy, title: e.target.value })}
              placeholder="e.g. Our Guiding"
            />
            <InputField
              label="Philosophy Title Highlight"
              value={philosophy.titleHighlight}
              onChange={(e) =>
                onPhilosophyChange({ ...philosophy, titleHighlight: e.target.value })
              }
              placeholder="e.g. Philosophy"
            />
          </div>
          <TextAreaField
            label="Philosophy Section Subtitle"
            value={philosophy.description}
            onChange={(e) => onPhilosophyChange({ ...philosophy, description: e.target.value })}
            placeholder="Enter section description..."
            containerClassName="md:col-span-2"
            rows={3}
          />
        </div>

        {/* Philosophy Items */}
        <h4 className="mt-8 mb-4 ml-2 text-sm font-bold tracking-widest text-gray-700 uppercase">
          Philosophy Pillars
        </h4>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => {
            const item = philosophy.items[idx] || { title: "", description: "", icon: "Lightbulb" };
            return (
              <div
                key={idx}
                className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-gray-50/30 p-6"
              >
                <span className="text-xs font-black tracking-wider text-[#D4AF37] uppercase">
                  Pillar {idx + 1}
                </span>
                <InputField
                  label="Title"
                  value={item.title}
                  onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                  placeholder="e.g. Visionary Innovation"
                />
                <div className="flex flex-col gap-1.5 px-0.5">
                  <label className="ml-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    Icon (Lucide Icon Name)
                  </label>
                  <select
                    className="w-full rounded-2xl border-none bg-white px-6 py-4 text-sm text-gray-800 transition-all outline-none focus:ring-1 focus:ring-[#0A0F29]"
                    value={item.icon}
                    onChange={(e) => handleItemChange(idx, "icon", e.target.value)}
                  >
                    <option value="Lightbulb">Lightbulb</option>
                    <option value="Target">Target</option>
                    <option value="ShieldCheck">ShieldCheck</option>
                  </select>
                </div>
                <TextAreaField
                  label="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                  placeholder="Explain this core pillar..."
                  rows={4}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
