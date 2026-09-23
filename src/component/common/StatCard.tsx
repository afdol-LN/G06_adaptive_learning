import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = "" }) => {
  return (
    <div className={`p-5 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between ${colorClass}`}>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      {icon && (
        <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
          {icon}
        </div>
      )}
    </div>
  );
};
