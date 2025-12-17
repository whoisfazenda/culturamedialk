"use client";

import { Bell, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getNotifications, markAllNotificationsAsRead } from "@/app/actions";
import Link from "next/link";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    fetchNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-surfaceHover transition-colors text-textMuted hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-surface animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface rounded-xl border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2">
          <div className="flex items-center justify-between p-4 border-b border-border bg-surfaceHover/50">
            <h3 className="font-bold">Уведомления</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:text-primaryHover flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-textMuted text-sm">
                Нет новых уведомлений
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <Link 
                    key={n.id} 
                    href={n.link || "#"} 
                    onClick={() => setIsOpen(false)} // Close on click
                    className={`block p-4 hover:bg-surfaceHover transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-sm font-bold ${!n.isRead ? 'text-primary' : 'text-white'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-textMuted">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-textMuted line-clamp-2">{n.message}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}