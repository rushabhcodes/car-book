import { dealerService } from '@/lib/services';
import { Dealer } from '@/types/dealer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DealerState {
  dealers: Dealer[];
  addDealer: (dealer: Dealer) => void;
  updateDealer: (id: string, updatedDealer: Dealer) => void;
  deleteDealer: (id: string) => void;
  getDealerListingLimit: (dealerId: string) => number;
  fetchDealers: () => Promise<void>;
}

export const useDealerStore = create<DealerState>()(
  persist(
    (set, get) => ({
      dealers: [], // Start with empty, fetch from Supabase

      // Fetch all dealers from Supabase
      fetchDealers: async () => {
        try {
          const data = await dealerService.getAllDealers();
          set({ dealers: data });
        } catch (error) {
          console.error('Error fetching dealers:', error);
          set({ dealers: [] });
        }
      },

      addDealer: async (dealer) => {
        try {
          const newDealer = await dealerService.createDealer(dealer);
          set((state) => ({ dealers: [...state.dealers, newDealer] }));
        } catch (error) {
          console.error('Error adding dealer:', error);
        }
      },

      updateDealer: async (id, updatedDealer) => {
        try {
          await dealerService.updateDealer(id, updatedDealer);
          set((state) => ({
            dealers: state.dealers.map((dealer) =>
              dealer.id === id ? { ...updatedDealer } : dealer
            ),
          }));
        } catch (error) {
          console.error('Error updating dealer:', error);
        }
      },

      deleteDealer: async (id) => {
        try {
          await dealerService.deleteDealer(id);
          set((state) => ({
            dealers: state.dealers.filter((dealer) => dealer.id !== id),
          }));
        } catch (error) {
          console.error('Error deleting dealer:', error);
        }
      },

      getDealerListingLimit: (dealerId) => {
        const dealer = get().dealers.find(d => d.id === dealerId);
        if (!dealer || !dealer.subscription) return 10; // Default limit
        return dealer.subscription.listingLimit;
      }
    }),
    {
      name: 'dealer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ dealers: state.dealers }),
    }
  )
);