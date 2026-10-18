"use client";
import { useId, useState } from "react";

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
  label?: string;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search…",
  label = "Search",
  initialValue = "",
}: Props) {
  const id = useId();
  const [value, setValue] = useState(initialValue);

  const update = (next: string) => {
    setValue(next);
    onSearch(next.trim());
  };

  return (
    <div className="relative w-full max-w-sm">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") update("");
        }}
        className="w-full rounded-lg border border-slate-300 py-2 pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => update("")}
          className="absolute inset-y-0 right-2 my-auto h-6 w-6 rounded text-slate-400 hover:text-slate-700"
        >
          ×
        </button>
      )}
    </div>
  );
}
