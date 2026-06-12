import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface SearchableDropdownProps {
  options: Option[];
  selectedValue?: string;
  onChange: (value: string | undefined) => void;
  placeholder: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  loading?: boolean;
}

export function SearchableDropdown({
  options,
  selectedValue,
  onChange,
  placeholder,
  searchPlaceholder,
  query,
  onQueryChange,
  loading = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === selectedValue);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-3 text-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400 hover:border-yellow-400/60 transition-all cursor-pointer flex items-center justify-between"
      >
        <span className={selectedOption ? "text-white" : "text-neutral-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-yellow-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden backdrop-blur-md">
          {/* Search Input Container */}
          <div className="p-2 border-b border-neutral-800 flex items-center gap-2">
            <Search className="h-4 w-4 text-neutral-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-1.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {loading ? (
              <div className="text-neutral-400 text-xs py-2 px-3 text-center">Loading...</div>
            ) : options.length === 0 ? (
              <div className="text-neutral-400 text-xs py-2 px-3 text-center">No options found</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-all cursor-pointer",
                    option.id === selectedValue
                      ? "bg-yellow-400 text-black font-semibold"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  )}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
