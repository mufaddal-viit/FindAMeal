"use client";

interface ViewToggleProps {
  currentView: "map" | "list";
  onViewChange: (view: "map" | "list") => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-leaf/10 bg-paper p-1 dark:border-slate-600 dark:bg-slate-800">
      <button
        onClick={() => onViewChange("list")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
          currentView === "list"
            ? "bg-leaf text-paper dark:bg-emerald-600 dark:text-slate-900"
            : "text-ink hover:bg-sand dark:text-slate-300 dark:hover:bg-slate-700"
        }`}
      >
        <span>📋</span>
        <span className="hidden sm:inline">List</span>
      </button>
      <button
        onClick={() => onViewChange("map")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
          currentView === "map"
            ? "bg-leaf text-paper dark:bg-emerald-600 dark:text-slate-900"
            : "text-ink hover:bg-sand dark:text-slate-300 dark:hover:bg-slate-700"
        }`}
      >
        <span>🗺️</span>
        <span className="hidden sm:inline">Map</span>
      </button>
    </div>
  );
}
