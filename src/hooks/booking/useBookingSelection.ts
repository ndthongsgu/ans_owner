import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Bus, TripCarResponse, TripStopResponse } from "@/dto/trip.dto";

export interface BookingSelection {
  bus: Bus;
  tripId: string;
  selectedCar: TripCarResponse;
  selectedSeats: string[];
  pickupLocation: TripStopResponse;
  dropoffLocation: TripStopResponse;
  totalPrice: number;
}

interface BookingSelectionState {
  selection: BookingSelection | null;
  setSelection: (data: BookingSelection) => void;
  clearSelection: () => void;
}

export const useBookingSelectionStore = create<BookingSelectionState>()(
  persist(
    (set) => ({
      selection: null,
      setSelection: (data) => set({ selection: data }),
      clearSelection: () => set({ selection: null }),
    }),
    { name: "booking-selection" }
  )
);
