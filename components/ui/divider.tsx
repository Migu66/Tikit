'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className }: DividerProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t-2 border-dashed border-ink/30" />
      </div>
      {text && (
        <div className="relative flex justify-center">
          <span className="bg-receipt px-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-ash">
            {text}
          </span>
        </div>
      )}
    </div>
  );
}
