'use client';

import { useState, useEffect, useMemo } from 'react';
import { Document, DocumentWithStatus } from '@/types';
import { addDocumentStatus, formatDate } from '@/lib/utils';
import { STATUS_CONFIG } from '@/lib/constants';
import Link from 'next/link';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarPage() {
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents')
      .then((r) => r.json())
      .then((docs: Document[]) => {
        setDocuments(docs.map(addDocumentStatus));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return days;
  }, [year, month]);

  const documentsByDate = useMemo(() => {
    const map = new Map<string, DocumentWithStatus[]>();
    documents.forEach((doc) => {
      const date = doc.expiry_date;
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(doc);
    });
    return map;
  }, [documents]);

  const getDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const selectedDocs = selectedDate ? documentsByDate.get(selectedDate) || [] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin w-8 h-8 border-3 border-[#3182CE] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Calendar header */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[#718096]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-[#1A202C]">
            {year}년 {month + 1}월
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[#718096]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-t border-gray-100">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-[#718096]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-t border-gray-100">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-14 border-b border-r border-gray-50" />;
            }

            const dateStr = getDateStr(day);
            const dayDocs = documentsByDate.get(dateStr) || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayOfWeek = new Date(year, month, day).getDay();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                className={`h-14 flex flex-col items-center justify-start pt-1.5 border-b border-r border-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <span
                  className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-[#3182CE] text-white font-bold' :
                    dayOfWeek === 0 ? 'text-red-400' :
                    dayOfWeek === 6 ? 'text-blue-400' : 'text-[#1A202C]'
                  }`}
                >
                  {day}
                </span>
                {dayDocs.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayDocs.slice(0, 3).map((d) => (
                      <div
                        key={d.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: STATUS_CONFIG[d.status].color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date docs */}
      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-gray-50">
            <h3 className="font-bold text-[#1A202C]">
              {formatDate(selectedDate)} 만료 서류
            </h3>
          </div>
          {selectedDocs.length === 0 ? (
            <div className="p-6 text-center text-[#718096] text-sm">
              이 날짜에 만료되는 서류가 없습니다
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedDocs.map((doc) => {
                const config = STATUS_CONFIG[doc.status];
                return (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-[#718096]">{doc.company?.name}</p>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: config.bg, color: config.textColor }}
                    >
                      {config.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
