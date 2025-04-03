"use client";

import React, { memo } from "react";
import { FlapDisplay, Presets } from "./";

interface BoardRow {
  value: string;
  chars?: string;
  length?: number;
  hinge?: boolean;
  color?: string; // New color property for each row
}

interface SolariBoardProps {
  rows: BoardRow[];
  className?: string;
}

// Memoize the individual FlapDisplay rows
const MemoizedFlapDisplay = memo(FlapDisplay);

export const SolariBoard: React.FC<SolariBoardProps> = memo(
  ({ rows, className }) => {
    return (
      <div className={`flex flex-col ${className} gap-1`}>
        {rows.map((row, index) => (
          <MemoizedFlapDisplay
            key={`row-${index}`}
            chars={row.chars || Presets.ALPHANUM}
            length={row.length}
            value={row.value}
            hinge={row.hinge ?? true}
            color={row.color} // Pass the color to FlapDisplay
          />
        ))}
      </div>
    );
  }
);
