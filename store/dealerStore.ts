import { supabase } from '@/lib/supabase';
import { Dealer } from '@/types/dealer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface DealerState {
  dealers: Dealer[];
  addDealer: (dealer: Dealer) => void;
  updateDealer: (id: string, updatedDealer: Dealer) => void;
  deleteDealer: (id: string) => void;
  fetchDealers: () => Promise<void>;
} 

export const useDealerStore = create<DealerState>()(
  persist(
    (set, get) => ({
      dealers: [], // Start with empty, fetch from Supabase

      // Fetch all dealers from Supabase
      fetchDealers: async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'dealer');
        if (error) {
          console.error('Error fetching dealers:', error);
          set({ dealers: [] });
        } else {
          set({ dealers: data });
        }
      },

      addDealer: async (dealer) => {
        const { data, error } = await supabase
          .from('users')
          .insert([dealer])
          .select();
        if (error) {
          console.error('Error adding dealer:', error);
        } else {
          set((state) => ({ dealers: [...state.dealers, ...data] }));
        }
      },

      updateDealer: async (id, updatedDealer) => {
        const { data, error } = await supabase
          .from('users')
          .update(updatedDealer)
          .eq('id', id)
          .select();
        if (error) {
          console.error('Error updating dealer:', error);
        } else {
          set((state) => ({
            dealers: state.dealers.map((dealer) =>
              dealer.id === id ? { ...updatedDealer } : dealer
            ),
          }));
        }
      },

      deleteDealer: async (id) => {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('Error deleting dealer:', error);
        } else {
          set((state) => ({
            dealers: state.dealers.filter((dealer) => dealer.id !== id),
          }));
        }
      }
    }),
    {
      name: 'dealer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ dealers: state.dealers }),
    }
  )
);