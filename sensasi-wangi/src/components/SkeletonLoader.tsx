"use client";

import { ReactNode } from "react";

interface SkeletonProps {
  rows?: number;
  className?: string;
}

export function SkeletonCard({ rows = 3, className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded-lg bg-white/[0.04]" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {/* Header */}
      <div className="flex gap-2">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-8 flex-1 rounded-lg bg-white/[0.06]" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-2">
          {Array.from({ length: cols }).map((_, ci) => (
            <div key={ci} className="h-6 flex-1 rounded bg-white/[0.03]" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="animate-pulse grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="h-3 w-20 rounded bg-white/[0.06]" />
          <div className="mt-2 h-7 w-28 rounded bg-white/[0.04]" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="h-4 w-32 rounded bg-white/[0.06]" />
      <div className="mt-4 flex items-end gap-2 h-32">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-white/[0.04]"
            style={{ height: `${20 + Math.random() * 80}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function FullPageLoader({ message = "Memuat data..." }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-400" />
      <p className="text-sm text-[#6b9e8f]">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-center text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-white/[0.06] px-4 py-2 text-xs font-bold text-white transition hover:bg-white/[0.1]"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = "Belum ada data" }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.06] p-8">
      <p className="text-sm text-[#4a7a6a]">{message}</p>
    </div>
  );
}
