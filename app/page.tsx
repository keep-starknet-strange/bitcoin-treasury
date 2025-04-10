"use client";

import { SolariBoard } from "./components/solari/SolariBoard";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBitcoinPrice } from "./hooks/useBitcoinPrice";
import Link from 'next/link';
import { useHoldingStore, initializeHoldingFromParams } from "../store/holdingStore"; // Import store
// import { useDisplayLength } from "./components/useDisplayLength";

// Define HoldingState interface mirroring the one in the store
interface HoldingState {
  holding: number;
  setHolding: (newHolding: number) => void;
}

function formatCurrency(number: number, locale = "en-US", currency = "USD") {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
    notation: "standard",
  });
  return formatter.format(number).replace("$", "USD ");
}

// Initial loading rows - defined outside component to avoid recreation
const getLoadingRows = (displayLength: number) => [
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: " Loading...", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
  { value: "", length: displayLength },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // const displayLength = useDisplayLength();
  const displayLength = 20; // Fallback to a fixed length for simplicity

  const { bitcoinPrice, priceDirection, error, countdown, isFetching } =
    useBitcoinPrice();

  // Use global state for holding with explicit type
  const holding = useHoldingStore((state: HoldingState) => state.holding);
  const setHolding = useHoldingStore((state: HoldingState) => state.setHolding);

  // Remove local holding state and getHoldingFromParams
  // const [holding, setHolding] = useState(getHoldingFromParams);
  const [holdingValue, setHoldingValue] = useState(0);
  const [currentRowIndex, setCurrentRowIndex] = useState(-1);
  const [ticker, setTicker] = useState(searchParams.get("ticker") || "XYZ");
  // Removed inputError as it wasn't used
  // Removed explicit error, countdown, isFetching states - now handled by hook

  // Initialize store from URL params once on mount
  useEffect(() => {
      initializeHoldingFromParams(searchParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once

  // Initialize loading rows immediately
  const loadingBoardRows = useMemo(
    () => getLoadingRows(displayLength),
    [displayLength]
  );

  // Update holding value display when price or global holding changes
  useEffect(() => {
    setHoldingValue(bitcoinPrice * holding);
  }, [bitcoinPrice, holding]);

  // Format the display values
  const displayValue = error
    ? error // Display the error message from the hook
    : `${formatCurrency(bitcoinPrice).toString()}${priceDirection ? ` ${priceDirection}` : ""}`;

  const holdingDisplay = error ? "Error" : formatCurrency(holdingValue);
  const holdingDisplayBTC = error ? "Error" : `${holding.toFixed(2)} BTC`; // Format slightly

  // Define the final board rows
  const finalBoardRows = useMemo(
    () => [
      { value: "", length: displayLength },
      { value: ` ${ticker}`, length: displayLength },
      { value: "", length: displayLength },
      { value: ` ${holdingDisplayBTC}`, length: displayLength, color: "#FFA500" },
      { value: " TOTAL HOLDING USD", length: displayLength },
      { value: ` ${holdingDisplay}`, length: displayLength },
      { value: "", length: displayLength },
      { value: " BTC PRICE", length: displayLength },
      { value: ` ${displayValue}`, length: displayLength },
      { value: "", length: displayLength },
    ],
    [ticker, holdingDisplay, holdingDisplayBTC, displayValue, displayLength]
  );

  // Current board rows based on loading state and animation progress
  const currentBoardRows = useMemo(() => {
    if (currentRowIndex === -1) {
      return loadingBoardRows;
    }

    return loadingBoardRows.map((row, index) => {
      if (index <= currentRowIndex) {
        return finalBoardRows[index];
      }
      return row;
    });
  }, [loadingBoardRows, finalBoardRows, currentRowIndex]);

  // Handle the row-by-row animation
  useEffect(() => {
    // Start animation only when initial fetch is done AND no error
    if (!isFetching && currentRowIndex === -1 && !error) {
      // Start the row animation after data is loaded
      const animateRows = () => {
        const interval = setInterval(() => {
          setCurrentRowIndex((prev) => {
            if (prev >= finalBoardRows.length - 1) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 300); // Adjust timing between each row update

        return () => clearInterval(interval);
      };

      // Small delay before starting the animation
      setTimeout(animateRows, 1000);
    }
  }, [isFetching, currentRowIndex, finalBoardRows.length, error]); // Added error dependency

  return (
    <div className="w-full h-full font-mono flex flex-col justify-center items-center px-4">
      {/* Input field for holding - Optional feature */}
      {/* Consider adding an input field here if direct editing is desired */}

      <div className="relative p-4 rounded-lg bg-[#0e0d0d]">
        <SolariBoard rows={currentBoardRows} className="relative" />
      </div>

      <div className="flex flex-col sm:flex-row w-full max-w-3xl items-center justify-between opacity-0 transition-opacity duration-300 animate-fadeIn mt-4">
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-zinc-400 mb-2 sm:mb-0">
          <div
            className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${
              isFetching
                ? "animate-pulse bg-yellow-500"
                : "animate-pulse bg-green-500"
            }`}
          ></div>
          <div className="text-xs sm:text-sm">
            {isFetching
              ? "Fetching..."
              : `Fetching latest in ${countdown} second${
                  countdown > 1 ? "s" : ""
                }`}
          </div>
        </div>

        {/* Link to DCA Simulator - no longer passes holding */}
        <Link href={`/dca-simulator`}
              className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 underline">
          Project Future DCA →
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
