'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  School,
  FilterState,
  CompareItem,
  ParentRegistrationProfile,
  Phase2ATie,
  Phase2BTie,
} from './types';
import { NEARBY_WITHIN_2 } from './nearby-radius';
import { defaultRegistrationProfile } from './registration-profile';

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

  // Home location (Google Geocoding via server; drives distances on /schools)
  userAddress: string;
  userLat: number | null;
  userLng: number | null;
  /** Optional upstream warning text (legacy field name). */
  oneMapLastWarning: string | null;
  setUserAddress: (address: string) => void;
  setGeocodedHome: (
    address: string,
    lat: number,
    lng: number,
    oneMapWarning?: string | null
  ) => void;
  dismissOneMapWarning: () => void;

  registrationProfile: ParentRegistrationProfile;
  setRegistrationProfile: (profile: Partial<ParentRegistrationProfile>) => void;
  setSchoolPhaseSelection: (
    schoolId: string,
    phase: '2A' | '2B',
    value: Phase2ATie | Phase2BTie | null
  ) => void;
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
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

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

      favorites: [],
      toggleFavorite: (schoolId) =>
        set((state) => ({
          favorites: state.favorites.includes(schoolId)
            ? state.favorites.filter((id) => id !== schoolId)
            : [...state.favorites, schoolId],
        })),
      isFavorite: (schoolId) => get().favorites.includes(schoolId),

      showCompareDrawer: false,
      setShowCompareDrawer: (show) => set({ showCompareDrawer: show }),
      showMapView: false,
      setShowMapView: (show) => set({ showMapView: show }),
      selectedSchoolId: null,
      setSelectedSchoolId: (id) => set({ selectedSchoolId: id }),

      userAddress: '',
      userLat: null,
      userLng: null,
      oneMapLastWarning: null,
      setUserAddress: (address) =>
        set((state) =>
          address.trim() === ''
            ? {
                userAddress: address,
                userLat: null,
                userLng: null,
                oneMapLastWarning: null,
                filters: { ...state.filters, distanceBand: 'all' },
              }
            : { userAddress: address }
        ),
      setGeocodedHome: (address, lat, lng, oneMapWarning = null) =>
        set((state) => ({
          userAddress: address,
          userLat: lat,
          userLng: lng,
          oneMapLastWarning: oneMapWarning ?? null,
          filters: { ...state.filters, sortBy: 'distance', distanceBand: NEARBY_WITHIN_2 },
        })),
      dismissOneMapWarning: () => set({ oneMapLastWarning: null }),

      registrationProfile: {
        ...defaultRegistrationProfile,
        selectionsBySchoolId: {},
      },
      setRegistrationProfile: (profile) =>
        set((state) => ({
          registrationProfile: { ...state.registrationProfile, ...profile },
        })),
      setSchoolPhaseSelection: (schoolId, phase, value) =>
        set((state) => {
          const selectionsBySchoolId = {
            ...state.registrationProfile.selectionsBySchoolId,
          };
          const existing = { ...(selectionsBySchoolId[schoolId] ?? {}) };

          if (phase === '2A') {
            if (value) existing.phase2A = value as Phase2ATie;
            else delete existing.phase2A;
          } else if (value) {
            existing.phase2B = value as Phase2BTie;
          } else {
            delete existing.phase2B;
          }

          if (!existing.phase2A && !existing.phase2B) {
            delete selectionsBySchoolId[schoolId];
          } else {
            selectionsBySchoolId[schoolId] = existing;
          }

          return {
            registrationProfile: {
              ...state.registrationProfile,
              selectionsBySchoolId,
            },
          };
        }),
    }),
    {
      name: 'schoolmatch-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        userAddress: state.userAddress,
        userLat: state.userLat,
        userLng: state.userLng,
        filters: state.filters,
        registrationProfile: state.registrationProfile,
      }),
    }
  )
);
