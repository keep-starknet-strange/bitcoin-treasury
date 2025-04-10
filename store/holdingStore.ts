import { create, StateCreator } from "zustand";

interface HoldingState {
  holding: number;
  setHolding: (newHolding: number) => void;
}

// Default holding amount
const DEFAULT_HOLDING = 8485;

// Type the StateCreator
const createHoldingSlice: StateCreator<HoldingState> = (set) => ({
  holding: DEFAULT_HOLDING, // Initialize with default
  setHolding: (newHolding: number) => {
    set((state: HoldingState) => {
      if (typeof newHolding === "number" && newHolding >= 0) {
        return { holding: newHolding };
      }
      return state; // Return current state if invalid input
    });
  },
});

export const useHoldingStore = create<HoldingState>(createHoldingSlice);

// Function to initialize store from search params (optional, can be called on main page load)
export const initializeHoldingFromParams = (
  searchParams: URLSearchParams | null
) => {
  const holdingParam = searchParams?.get("holding");
  if (holdingParam) {
    const parsedHolding = parseFloat(holdingParam);
    if (!isNaN(parsedHolding) && parsedHolding >= 0) {
      useHoldingStore.setState({ holding: parsedHolding });
      return; // Stop if initialized from param
    }
  }
  // If not initialized from params, ensure it has the default
  // This is mostly redundant because the store initializes with default,
  // but ensures consistency if this function is always called.
  // useHoldingStore.setState({ holding: DEFAULT_HOLDING });
};
