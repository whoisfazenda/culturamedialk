"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: (string | Option)[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder, className }: SelectProps) {
  // Helper to normalize options
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check trigger
      if (ref.current && ref.current.contains(event.target as Node)) {
        return;
      }
      // Check portal content
      const target = event.target as Element;
      if (target.closest('.select-portal')) {
        return;
      }
      setIsOpen(false);
    }

    function updatePosition() {
      if (isOpen && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      updatePosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full h-12 rounded-xl border border-border bg-surfaceHover px-4 text-base text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      >
        <span className={value ? "text-textMain" : "text-textMuted"}>
          {selectedOption ? selectedOption.label : (placeholder || "Выберите...")}
        </span>
        <ChevronDown className={`w-5 h-5 text-textMuted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && mounted && createPortal(
        <div
          className="select-portal fixed z-[9999] border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            backgroundColor: '#0a0a0a', // Принудительно черный фон
            color: '#ffffff'            // Принудительно белый текст
          }}
        >
          {normalizedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-base hover:bg-primary/20 hover:text-primary transition-colors ${
                value === option.value ? "text-primary bg-primary/10 font-medium" : ""
              }`}
              style={{ color: value === option.value ? undefined : '#ffffff' }}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}