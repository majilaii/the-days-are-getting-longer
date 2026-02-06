"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayCell } from "./DayCell";
import { DayDetail } from "./DayDetail";
import type { DayMark } from "@/lib/types";

const START_YEAR = 2026;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface DayInfo {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Mon, 6=Sun
  weekIndex: number;
  month: number;
}

function buildYearData(year: number) {
  const days: DayInfo[] = [];
  const d = new Date(year, 0, 1);
  const startDow = (d.getDay() + 6) % 7; // Mon=0, Sun=6

  let dayIndex = 0;
  while (d.getFullYear() === year) {
    const dow = (d.getDay() + 6) % 7;
    const weekIndex = Math.floor((dayIndex + startDow) / 7);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    days.push({
      date: `${year}-${mm}-${dd}`,
      dayOfWeek: dow,
      weekIndex,
      month: d.getMonth(),
    });
    d.setDate(d.getDate() + 1);
    dayIndex++;
  }

  const monthLabels: { month: number; weekIndex: number }[] = [];
  let lastMonth = -1;
  for (const day of days) {
    if (day.month !== lastMonth) {
      monthLabels.push({ month: day.month, weekIndex: day.weekIndex });
      lastMonth = day.month;
    }
  }

  const totalWeeks = days[days.length - 1].weekIndex + 1;
  return { days, monthLabels, totalWeeks };
}

interface YearGridProps {
  year: number;
  marks: DayMark[];
}

export function YearGrid({ year, marks: initialMarks }: YearGridProps) {
  const [marks, setMarks] = useState<DayMark[]>(initialMarks);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { days, monthLabels, totalWeeks } = useMemo(
    () => buildYearData(year),
    [year],
  );

  // Group marks by date
  const marksByDate = useMemo(() => {
    const map = new Map<string, DayMark[]>();
    for (const mark of marks) {
      const existing = map.get(mark.date) || [];
      existing.push(mark);
      map.set(mark.date, existing);
    }
    return map;
  }, [marks]);

  // Determine author order (sorted by slug for consistent stroke assignment)
  const authorOrder = useMemo(() => {
    const slugs = new Set<string>();
    for (const mark of marks) {
      if (mark.author?.slug?.current) {
        slugs.add(mark.author.slug.current);
      }
    }
    return Array.from(slugs).sort();
  }, [marks]);

  const today = new Date().toISOString().split("T")[0];

  // Build grid lookup: [dayOfWeek][weekIndex] -> DayInfo | null
  const grid = useMemo(() => {
    const g: (DayInfo | null)[][] = Array.from({ length: 7 }, () =>
      Array(totalWeeks).fill(null),
    );
    for (const day of days) {
      g[day.dayOfWeek][day.weekIndex] = day;
    }
    return g;
  }, [days, totalWeeks]);

  // Stats
  const totalMarkedDays = marksByDate.size;
  const fullyCrossed = Array.from(marksByDate.values()).filter(
    (m) => m.length >= 2,
  ).length;

  const selectedMarks = selectedDate ? marksByDate.get(selectedDate) || [] : [];

  // Optimistic update: add new mark to local state instantly
  const handleMarkAdded = useCallback((newMark: DayMark) => {
    setMarks((prev) => [...prev, newMark]);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const currentYear = new Date().getFullYear();
  const hasPrev = year > START_YEAR;
  const hasNext = year < currentYear;

  return (
    <div className="w-full">
      {/* Header with year navigation */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasPrev ? (
              <Link
                href={`/${year - 1}`}
                className="text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors"
                aria-label="Previous year"
              >
                <ChevronLeft size={24} />
              </Link>
            ) : (
              <span className="text-muted/30 dark:text-muted-dark/30">
                <ChevronLeft size={24} />
              </span>
            )}
            <h1 className="font-typewriter text-4xl font-base text-ink dark:text-ink-light tracking-tight">
              {year}
            </h1>
            {hasNext ? (
              <Link
                href={`/${year + 1}`}
                className="text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors"
                aria-label="Next year"
              >
                <ChevronRight size={24} />
              </Link>
            ) : (
              <span className="text-muted/30 dark:text-muted-dark/30">
                <ChevronRight size={24} />
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted dark:text-muted-dark font-typewriter">
          {totalMarkedDays} days marked &middot; {fullyCrossed} fully crossed
        </p>
      </div>

      {/* Grid container -- scrolls horizontally on small screens */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block">
          {/* Month labels */}
          <div
            className="relative mb-1"
            style={{ height: "16px", marginLeft: "20px" }}
          >
            {monthLabels.map(({ month, weekIndex }) => (
              <span
                key={month}
                className="absolute text-[10px] text-muted dark:text-muted-dark"
                style={{ left: `${weekIndex * (16 + 2)}px` }}
              >
                {MONTH_NAMES[month]}
              </span>
            ))}
          </div>

          {/* Grid rows */}
          <div className="flex flex-col gap-[4px]">
            {Array.from({ length: 7 }, (_, dow) => (
              <div key={dow} className="flex items-center gap-0">
                <span className="w-[18px] text-[10px] text-muted dark:text-muted-dark text-right mr-[2px] flex-shrink-0">
                  {dow % 2 === 0 ? DAY_LABELS[dow] : ""}
                </span>
                <div className="flex gap-[2px]">
                  {Array.from({ length: totalWeeks }, (_, week) => {
                    const dayInfo = grid[dow][week];
                    const dateStr = dayInfo?.date || null;
                    const dayMarks = dateStr
                      ? marksByDate.get(dateStr) || []
                      : [];
                    return (
                      <DayCell
                        key={week}
                        date={dateStr}
                        marks={dayMarks}
                        authorOrder={authorOrder}
                        isToday={dateStr === today}
                        isFuture={dateStr ? dateStr > today : false}
                        onClick={() => dateStr && setSelectedDate(dateStr)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-xs text-muted dark:text-muted-dark">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-[1px] bg-stone-100 dark:bg-stone-800/50" />
          <span>empty</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-[1px]"
            style={{
              background:
                "linear-gradient(to bottom right, transparent calc(50% - 0.5px), var(--stroke-a) calc(50% - 0.5px), var(--stroke-a) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
            }}
          />
          <span>one mark</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-[1px]"
            style={{
              background: [
                "linear-gradient(to bottom right, transparent calc(50% - 0.5px), var(--stroke-a) calc(50% - 0.5px), var(--stroke-a) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
                "linear-gradient(to bottom left, transparent calc(50% - 0.5px), var(--stroke-b) calc(50% - 0.5px), var(--stroke-b) calc(50% + 0.5px), transparent calc(50% + 0.5px))",
              ].join(", "),
            }}
          />
          <span>fully crossed</span>
        </div>
      </div>

      {/* Day modal: shows marks + form to add */}
      {selectedDate && (
        <DayDetail
          date={selectedDate}
          marks={selectedMarks}
          onClose={handleClose}
          onMarkAdded={handleMarkAdded}
        />
      )}
    </div>
  );
}
