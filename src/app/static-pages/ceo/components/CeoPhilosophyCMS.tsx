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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">CEO Philosophy Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Philosophy Upper Tag"
            value={philosophy.upperTag}
            onChange={(e) => onPhilosophyChange({ ...philosophy, upperTag: e.target.value })}
            placeholder="e.g. Core Values"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
            <InputField
              label="Philosophy Title"
              value={philosophy.title}
              onChange={(e) => onPhilosophyChange({ ...philosophy, title: e.target.value })}
              placeholder="e.g. Our Guiding"
            />
            <InputField
              label="Philosophy Title Highlight"
              value={philosophy.titleHighlight}
              onChange={(e) => onPhilosophyChange({ ...philosophy, titleHighlight: e.target.value })}
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
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest mt-8 mb-4 ml-2">Philosophy Pillars</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => {
            const item = philosophy.items[idx] || { title: "", description: "", icon: "Lightbulb" };
            return (
              <div key={idx} className="border border-gray-100 rounded-3xl p-6 bg-gray-50/30 flex flex-col gap-4">
                <span className="text-xs font-black text-[#D4AF37] tracking-wider uppercase">Pillar {idx + 1}</span>
                <InputField
                  label="Title"
                  value={item.title}
                  onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                  placeholder="e.g. Visionary Innovation"
                />
                <div className="flex flex-col gap-1.5 px-0.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">Icon (Lucide Icon Name)</label>
                  <select
                    className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm focus:ring-1 focus:ring-[#0A0F29] outline-none transition-all text-gray-800"
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
