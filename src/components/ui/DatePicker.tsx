"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, minDate, placeholder, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if click is inside the trigger button
      if (ref.current && ref.current.contains(event.target as Node)) {
        return;
      }
      
      // Check if click is inside the portal content (we need a ref for the portal content too, or check closest)
      const target = event.target as Element;
      if (target.closest('.datepicker-portal')) {
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
      updatePosition(); // Initial position update
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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, etc.
    // Adjust to make Monday = 0, Sunday = 6
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const months = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = value && date.toDateString() === value.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const isDisabled = minDate && date < minDate && date.toDateString() !== minDate.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => {
            onChange(date);
            setIsOpen(false);
          }}
          disabled={!!isDisabled}
          className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-colors
            ${isSelected ? 'bg-primary text-white font-bold' : ''}
            ${!isSelected && !isDisabled ? 'hover:bg-surfaceHover text-textMain' : ''}
            ${isToday && !isSelected ? 'border border-primary text-primary' : ''}
            ${isDisabled ? 'text-textMuted/50 cursor-not-allowed' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full h-11 rounded-xl border border-border bg-surfaceHover px-3 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary transition-all group"
      >
        <span className={value ? "text-textMain" : "text-textMuted"}>
          {value ? value.toLocaleDateString('ru-RU') : (placeholder || "Выберите дату...")}
        </span>
        <CalendarIcon className="w-4 h-4 text-textMuted group-hover:text-primary transition-colors" />
      </button>

      {isOpen && mounted && createPortal(
        <div
          className="datepicker-portal fixed z-[9999] p-4 bg-background border border-border rounded-xl shadow-2xl min-w-[300px]"
          style={{ top: position.top, left: position.left }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="p-1 hover:bg-surfaceHover rounded-lg text-textMain">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-bold text-textMain">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} className="p-1 hover:bg-surfaceHover rounded-lg text-textMain">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(day => (
              <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-textMuted font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {renderCalendar()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}