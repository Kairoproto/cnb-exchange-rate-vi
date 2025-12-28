import { useKV } from '@github/spark/hooks'
import { useCallback } from 'react'

export interface FilterPreset {
  id: string
  name: string
  description?: string
  filters: any
  createdAt: string
  updatedAt: string
  useCount: number
  category?: 'search' | 'rate' | 'comparison' | 'custom'
}

export function useFilterPresets() {
  const [presets, setPresets] = useKV<FilterPreset[]>('filter-presets', [])

  const createPreset = useCallback(
    (name: string, filters: any, description?: string, category?: FilterPreset['category']) => {
      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        description,
        filters,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        useCount: 0,
        category: category || 'custom',
      }

      setPresets((currentPresets) => [...(currentPresets || []), newPreset])
      return newPreset
    },
    [setPresets]
  )

  const updatePreset = useCallback(
    (id: string, updates: Partial<Omit<FilterPreset, 'id' | 'createdAt'>>) => {
      setPresets((currentPresets) =>
        (currentPresets || []).map((preset) =>
          preset.id === id
            ? {
                ...preset,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : preset
        )
      )
    },
    [setPresets]
  )

  const deletePreset = useCallback(
    (id: string) => {
      setPresets((currentPresets) => (currentPresets || []).filter((preset) => preset.id !== id))
    },
    [setPresets]
  )

  const incrementUseCount = useCallback(
    (id: string) => {
      setPresets((currentPresets) =>
        (currentPresets || []).map((preset) =>
          preset.id === id
            ? {
                ...preset,
                useCount: preset.useCount + 1,
                updatedAt: new Date().toISOString(),
              }
            : preset
        )
      )
    },
    [setPresets]
  )

  const duplicatePreset = useCallback(
    (id: string, newName?: string) => {
      const preset = presets?.find((p) => p.id === id)
      if (!preset) return null

      const duplicated: FilterPreset = {
        ...preset,
        id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: newName || `${preset.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        useCount: 0,
      }

      setPresets((currentPresets) => [...(currentPresets || []), duplicated])
      return duplicated
    },
    [presets, setPresets]
  )

  const getPresetById = useCallback(
    (id: string) => {
      return presets?.find((preset) => preset.id === id)
    },
    [presets]
  )

  const getPresetsByCategory = useCallback(
    (category: FilterPreset['category']) => {
      return presets?.filter((preset) => preset.category === category) || []
    },
    [presets]
  )

  return {
    presets: presets || [],
    createPreset,
    updatePreset,
    deletePreset,
    incrementUseCount,
    duplicatePreset,
    getPresetById,
    getPresetsByCategory,
  }
}
