import { useState } from "react";

export default function CustomSelect({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {label && (
        <p className="text-sm text-gray-400 mb-1">{label}</p>
      )}

      {/* Selected value */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="auth-input flex justify-between items-center cursor-pointer"
      >
        <span className={value ? "text-white" : "text-gray-500"}>
          {value || "Select option"}
        </span>
        <span className="text-gray-400">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full
          bg-black border border-white/10
          rounded-lg shadow-xl overflow-hidden"
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="px-4 py-3 cursor-pointer
                hover:bg-white/10 text-white"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
