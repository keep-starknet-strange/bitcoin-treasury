"use client";

import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useBitcoinPrice } from "../hooks/useBitcoinPrice"; // Adjust path
import { useHoldingStore } from "../../store/holdingStore"; // Import store

// Define HoldingState interface mirroring the one in the store
interface HoldingState {
  holding: number;
  // We only read holding here, so setHolding is not needed in this interface
}

// Interface for projection results
interface ProjectionResult {
  totalInvestedUSD: number;
  totalBitcoinAccumulated: number;
  projectedFinalValueUSD: number;
  projectionStartDate: string; // Today
  projectionEndDate: string;
  monthlyInvestment: number;
  currentBtcPrice: number;
  chartData: { date: string; invested: number; value: number }[];
}

// Helper function to get date string N years from today
const getDateNYearsFromToday = (years: number): string => {
  const today = new Date();
  today.setFullYear(today.getFullYear() + years);
  return today.toISOString().split("T")[0];
};

function DcaSimulatorPage() {
  const { bitcoinPrice: currentBtcPrice, error: priceError, isFetching: priceIsFetching } = useBitcoinPrice();

  const [monthlyAmount, setMonthlyAmount] = useState<number>(100);
  const [projectionEndDate, setProjectionEndDate] = useState<string>(getDateNYearsFromToday(10));
  const [results, setResults] = useState<ProjectionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Read initial holding from global store with explicit type
  const initialHoldingBTC = useHoldingStore((state: HoldingState) => state.holding);

  // Update local error state if price fetching fails
  useEffect(() => {
    if (priceError) {
        setError(`Failed to load current Bitcoin price: ${priceError}`);
    }
  }, [priceError]);

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    if (!currentBtcPrice || currentBtcPrice <= 0) {
        setError("Cannot run projection without a valid current Bitcoin price.");
        setIsLoading(false);
        return;
    }

    if (!projectionEndDate) {
        setError("Please select a future date to project until.");
        setIsLoading(false);
        return;
    }

    // --- Projection Logic --- 
    try {
        const today = new Date();
        const endDate = new Date(projectionEndDate);
        const projectionStartDate = getTodayString();

        if (endDate <= today) {
            setError("Projection end date must be in the future.");
            setIsLoading(false);
            return;
        }

        let btcFromDCA = 0; // BTC accumulated *only* from DCA during projection
        let totalInvested = 0;
        let months = 0;
        const chartDataPoints: { date: string; invested: number; value: number }[] = [];

        // Calculate months difference
        let currentMonth = today.getFullYear() * 12 + today.getMonth();
        const endMonth = endDate.getFullYear() * 12 + endDate.getMonth();

        // Include the end month in the projection
        while (currentMonth <= endMonth) {
            totalInvested += monthlyAmount;
            btcFromDCA += monthlyAmount / currentBtcPrice;
            months++;

            // Get year and month for chart label
            const year = Math.floor(currentMonth / 12);
            const month = (currentMonth % 12) + 1; // JS months are 0-indexed
            const chartDateLabel = `${year}-${month.toString().padStart(2, '0')}`;

            // Chart value now includes initial holding
            const currentTotalBTC = initialHoldingBTC + btcFromDCA;
            chartDataPoints.push({
                date: chartDateLabel,
                invested: totalInvested,
                value: currentTotalBTC * currentBtcPrice, // Value includes initial holding
            });

            currentMonth++;
        }

        const finalTotalBTC = initialHoldingBTC + btcFromDCA;
        const finalProjectedValue = finalTotalBTC * currentBtcPrice;

        setResults({
            totalInvestedUSD: totalInvested, // Amount invested during projection period only
            totalBitcoinAccumulated: finalTotalBTC, // Total BTC including initial holding
            projectedFinalValueUSD: finalProjectedValue, // Total value including initial holding
            projectionStartDate: projectionStartDate,
            projectionEndDate: projectionEndDate,
            monthlyInvestment: monthlyAmount,
            currentBtcPrice: currentBtcPrice,
            chartData: chartDataPoints,
        });

    } catch (err) {
        console.error("Projection calculation error:", err);
        setError("An error occurred during the projection calculation.");
    }
    // --- End Projection Logic ---

    setIsLoading(false);
  };

  // Format numbers for Y-axis
  const formatYAxis = (tickItem: number) => {
    return `$${tickItem.toLocaleString()}`;
  };

  return (
    <div className="w-full h-full font-mono flex flex-col items-center p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-zinc-200">Future Bitcoin DCA Projection</h1>

      {/* Display current price */}
       {priceIsFetching && <p className="text-zinc-400 mb-4">Loading current price...</p>}
       {currentBtcPrice > 0 && !priceError && (
           <p className="text-lg text-zinc-300 mb-4">Current BTC Price: <span className="font-bold text-green-400">${currentBtcPrice.toLocaleString()}</span></p>
       )}
       {priceError && <p className="text-red-400 mb-4">Could not load current price.</p>}

       {/* Display initial holding from store */}
       <p className="text-sm text-zinc-400 mb-4">Starting simulation with current holding of {initialHoldingBTC.toFixed(6)} BTC.</p>

      <div className="w-full max-w-md bg-[#1a1a1a] p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label htmlFor="monthlyAmount" className="block text-sm font-medium text-zinc-400 mb-1">
            Monthly Investment (USD)
          </label>
          <input
            type="number"
            id="monthlyAmount"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-[#2a2a2a] text-zinc-200 border border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            min="1"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="projectionEndDate" className="block text-sm font-medium text-zinc-400 mb-1">
            Project Until Date
          </label>
          <input
            type="date"
            id="projectionEndDate"
            value={projectionEndDate}
            onChange={(e) => setProjectionEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a2a] text-zinc-200 border border-zinc-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            min={getTodayString()} // Can only select today or future dates
          />
        </div>

        <button
          onClick={handleSimulate}
          disabled={isLoading || !monthlyAmount || !projectionEndDate || currentBtcPrice <= 0 || priceIsFetching}
          className={`w-full py-2 px-4 rounded focus:outline-none transition duration-150 ${
            isLoading || !monthlyAmount || !projectionEndDate || currentBtcPrice <= 0 || priceIsFetching
              ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          }`}
        >
          {isLoading ? "Calculating..." : "Run Projection"}
        </button>
      </div>

      {isLoading && (
        <div className="text-center text-zinc-400">
           Calculating... Please wait.
        </div>
      )}

      {error && (
        <div className="w-full max-w-md bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {results && !isLoading && (
        <div className="w-full max-w-xl bg-[#1a1a1a] p-4 sm:p-6 rounded-lg shadow-md text-zinc-200 mt-6">
          <h2 className="text-xl font-semibold mb-4 border-b border-zinc-700 pb-2">Projection Results</h2>
           <p className="mb-2 text-sm text-zinc-400">
             Starting with {initialHoldingBTC.toFixed(6)} BTC, assuming constant BTC price of ${results.currentBtcPrice.toLocaleString()}.
           </p>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-4">
             <p><strong>Period:</strong> {results.projectionStartDate} to {results.projectionEndDate}</p>
            <p><strong>Monthly Investment:</strong> ${results.monthlyInvestment.toLocaleString()}</p>
            <p><strong>Total Invested (This Period):</strong> <span className="text-orange-400">${results.totalInvestedUSD.toLocaleString()}</span></p>
            <p><strong>Projected Final Total Value:</strong> <span className="text-green-400 font-bold">${results.projectedFinalValueUSD.toLocaleString()}</span></p>
            <p className="sm:col-span-2"><strong>Projected Final Total Holding:</strong> {results.totalBitcoinAccumulated.toFixed(6)} BTC</p>
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3">Projected Total Value vs. Amount Invested (This Period)</h3>
          <div style={{ width: '100%', height: 300 }}>
             <ResponsiveContainer>
                 <LineChart
                    data={results.chartData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={formatYAxis} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }}
                        labelStyle={{ color: '#d1d5db' }}
                        itemStyle={{ color: '#d1d5db' }}
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }}/>
                    <Line type="monotone" dataKey="invested" name="Invested (This Period)" stroke="#fb923c" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="value" name="Projected Total Value" stroke="#4ade80" strokeWidth={2} dot={false} />
                    </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}
    </div>
  );
}

export default DcaSimulatorPage; 