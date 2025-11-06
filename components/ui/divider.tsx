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
        <span className="w-full border-t border-gray-300" />
      </div>
      {text && (
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-600">
            {text}
          </span>
        </div>
      )}
    </div>
  );
}
