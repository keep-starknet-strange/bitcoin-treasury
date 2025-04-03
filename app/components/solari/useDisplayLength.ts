import { useState, useEffect, useMemo } from "react";
import _ from "lodash";

const DIGIT_WIDTH = 1.7; // width in ch units
const GAP_WIDTH = 1; // gap in pixels
const MIN_LENGTH = 15;

// Memoized font size calculation
const getFontSize = (width: number): number => {
  if (width < 480) return 30; // text-3xl (1.875rem * 16)
  if (width < 640) return 36; // text-4xl (2.25rem * 16)
  if (width < 768) return 48; // text-5xl (3rem * 16)
  if (width < 1024) return 60; // text-6xl (3.75rem * 16)
  return 72; // text-7xl (4.5rem * 16)
};

// Calculate display length based on window width
const calculateLength = (windowWidth: number): number => {
  const fontSize = getFontSize(windowWidth);

  // Calculate how many digits can fit
  const digitWidthPx = DIGIT_WIDTH * (fontSize * 0.5);
  const totalGapWidth = GAP_WIDTH;

  // Calculate max digits that can fit
  const maxDigits = Math.ceil(windowWidth / (digitWidthPx + totalGapWidth)) - 4;

  // Ensure we don't go below minimum length
  return Math.max(maxDigits, MIN_LENGTH);
};

export function useDisplayLength() {
  // Initialize with minimum length
  const [displayLength, setDisplayLength] = useState(MIN_LENGTH);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the debounced update function
  const debouncedUpdate = useMemo(
    () =>
      _.debounce((width: number) => {
        const newLength = calculateLength(width);
        setDisplayLength(newLength);
      }, 100),
    [] // Empty deps since this function never needs to change
  );

  useEffect(() => {
    if (!isClient) return;

    // Function to handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const newLength = calculateLength(width);
      setDisplayLength(newLength);
    };

    // Initial calculation
    handleResize();

    // Add event listener with debounced updates
    window.addEventListener("resize", () => debouncedUpdate(window.innerWidth));

    // Cleanup
    return () => {
      window.removeEventListener("resize", () =>
        debouncedUpdate(window.innerWidth)
      );
      debouncedUpdate.cancel();
    };
  }, [isClient, debouncedUpdate]); // Include isClient and debouncedUpdate in deps array

  return displayLength;
}
