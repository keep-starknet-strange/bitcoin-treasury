"use client";

import React, { useEffect, useState } from 'react';
import { FlapDigit } from './FlapDigit';

interface CursorState {
  current: number;
  previous: number;
  target: number;
}

interface FlapStackProps {
  stack: string[];
  value: string;
  timing: number;
  [key: string]: any; // For rest props
}

// Set these three values as one state var
// to avoid in-between render states
const InitialCursor: CursorState = {
  current: -1,
  previous: -1,
  target: 0,
};

export const FlapStack = React.memo<FlapStackProps>(({ stack, value, timing, ...restProps }) => {
  const [cursor, setCursor] = useState<CursorState>(InitialCursor);

  useEffect(() => {
    setCursor(InitialCursor);
  }, [stack]);

  useEffect(() => {
    const target = Math.max(stack.indexOf(value), 0);
    
    const increment = (prevState: CursorState) => {
      const { current } = prevState;
      const previous = current;
      const nextCurrent = current >= stack.length - 1 ? 0 : current + 1;
      
      return {
        current: nextCurrent,
        previous,
        target,
      };
    };

    // Initial increment
    setCursor(prevState => increment(prevState));

    const timer = setInterval(() => {
      setCursor(prevState => {
        if (prevState.current === target) {
          clearInterval(timer);
          return prevState;
        }
        return increment(prevState);
      });
    }, timing);

    return () => clearInterval(timer);
  }, [stack, value, timing]);

  const { current, previous, target } = cursor;
  return (
    <FlapDigit
      value={stack[current]}
      prevValue={stack[previous]}
      final={current === target}
      {...restProps}
    />
  );
});