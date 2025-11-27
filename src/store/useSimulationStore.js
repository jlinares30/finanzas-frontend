import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSimulationStore = create(
    persist(
        (set) => ({
            entidadFinancieraId: null,
            localId: null,
            setSimulationData: (entidadId, localId) => set({ entidadFinancieraId: entidadId, localId }),
            clearSimulationData: () => set({ entidadFinancieraId: null, localId: null }),
        }),
        {
            name: 'simulation-storage',
        }
    )
);
