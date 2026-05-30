"use client";

import type { ReactNode } from "react";

interface DivisionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  progress: number;
  color?: string;
}

export default function DivisionCard({
  icon,
  title,
  description,
  progress,
  color = "bg-[#0D9488]",
}: DivisionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white shrink-0`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#10201d] mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">{description}</p>
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>Progress</span>
          <span className="font-semibold text-[#0D9488]">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#14B8A6] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
