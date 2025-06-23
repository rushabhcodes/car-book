import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dealer } from '@/types/dealer';

interface DealerState {
  dealers: Dealer[];
  addDealer: (dealer: Dealer) => void;
  updateDealer: (id: string, updatedDealer: Dealer) => void;
  deleteDealer: (id: string) => void;
  getDealerListingLimit: (dealerId: string) => number;
}

// Initial dealers for demo
const initialDealers: Dealer[] = [
  {
    id: '2',
    name: 'Dealer User',
    email: 'mobi24india@gmail.com',
    phone: '9960456992',
    role: 'dealer',
    status: 'active',
    companyName: 'Mobi24 Motors',
    address: '123 Main Street, Mumbai, Maharashtra',
    subscription: {
      plan: 'premium',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 1999,
      listingLimit: 10
    }
  },
];

export const useDealerStore = create<DealerState>()(
  persist(
    (set, get) => ({
      dealers: initialDealers,
      
      addDealer: (dealer) => {
        set((state) => ({
          dealers: [...state.dealers, dealer],
        }));
      },
      
      updateDealer: (id, updatedDealer) => {
        set((state) => ({
          dealers: state.dealers.map((dealer) => 
            dealer.id === id ? { ...updatedDealer } : dealer
          ),
        }));
      },
      
      deleteDealer: (id) => {
        set((state) => ({
          dealers: state.dealers.filter((dealer) => dealer.id !== id),
        }));
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
    }
  )
);