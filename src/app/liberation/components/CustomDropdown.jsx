import { useState, useRef, useEffect } from "react";

export default function CustomDropdown({ options, selectedId, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === selectedId);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-primary-dark text-primary-bright p-2 border border-gray-700 rounded"
      >
        <div className="flex items-center gap-2">
          <img
            src={selected.image}
            alt={selected.name}
            className=""
          />
        </div>
        <span>▼</span>
      </button>

      {open && (
        <ul className="absolute z-10 w-full bg-primary-dark border border-gray-700 rounded mt-1 overflow-hidden">
          {options.map((opt) => (
            <li
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className="flex items-center gap-2 p-2 hover:bg-primary-bright cursor-pointer"
            >
              <img
                src={opt.image}
                alt={opt.name}
                className="rounded"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

