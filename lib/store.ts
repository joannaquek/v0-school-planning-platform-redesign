'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { School, FilterState, CompareItem } from './types';

interface AppState {
  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Compare
  compareList: CompareItem[];
  addToCompare: (school: School) => void;
  removeFromCompare: (schoolId: string) => void;
  clearCompare: () => void;
  isInCompare: (schoolId: string) => boolean;

  // Favorites
  favorites: string[];
  toggleFavorite: (schoolId: string) => void;
  isFavorite: (schoolId: string) => boolean;

  // UI
  showCompareDrawer: boolean;
  setShowCompareDrawer: (show: boolean) => void;
  showMapView: boolean;
  setShowMapView: (show: boolean) => void;
  selectedSchoolId: string | null;
  setSelectedSchoolId: (id: string | null) => void;

  // Address
  userAddress: string;
  setUserAddress: (address: string) => void;
}

const defaultFilters: FilterState = {
  distanceBand: 'all',
  pressure: 'all',
  year: '2025',
  phase: '2C',
  ccaFilter: [],
  sortBy: 'distance',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Filters
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Compare
      compareList: [],
      addToCompare: (school) =>
        set((state) => {
          if (state.compareList.length >= 4) return state;
          if (state.compareList.some((item) => item.school.id === school.id)) return state;
          return {
            compareList: [...state.compareList, { school, addedAt: new Date() }],
            showCompareDrawer: true,
          };
        }),
      removeFromCompare: (schoolId) =>
        set((state) => ({
          compareList: state.compareList.filter((item) => item.school.id !== schoolId),
        })),
      clearCompare: () => set({ compareList: [], showCompareDrawer: false }),
      isInCompare: (schoolId) => get().compareList.some((item) => item.school.id === schoolId),

      // Favorites
      favorites: [],
      toggleFavorite: (schoolId) =>
        set((state) => ({
          favorites: state.favorites.includes(schoolId)
            ? state.favorites.filter((id) => id !== schoolId)
            : [...state.favorites, schoolId],
        })),
      isFavorite: (schoolId) => get().favorites.includes(schoolId),

      // UI
      showCompareDrawer: false,
      setShowCompareDrawer: (show) => set({ showCompareDrawer: show }),
      showMapView: false,
      setShowMapView: (show) => set({ showMapView: show }),
      selectedSchoolId: null,
      setSelectedSchoolId: (id) => set({ selectedSchoolId: id }),

      // Address
      userAddress: '',
      setUserAddress: (address) => set({ userAddress: address }),
    }),
    {
      name: 'schoolmatch-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        userAddress: state.userAddress,
        filters: state.filters,
      }),
    }
  )
);
