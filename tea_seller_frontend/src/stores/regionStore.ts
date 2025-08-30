import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import medusa from '../lib/medusa'

interface Region {
  id: string
  name: string
  currency_code: string
  tax_rate?: number
  countries?: Array<{
    id: string
    name?: string
    iso_2?: string
  }>
}

interface RegionState {
  regions: Region[]
  currentRegion: Region | null
  isLoading: boolean
  error: string | null
}

interface RegionActions {
  fetchRegions: () => Promise<void>
  setCurrentRegion: (region: Region) => void
  getCurrentRegion: () => Region | null
  clearError: () => void
}

export const useRegionStore = create<RegionState & RegionActions>()(persist(
  (set, get) => ({
    // 状态
    regions: [],
    currentRegion: null,
    isLoading: false,
    error: null,

    // 操作
    fetchRegions: async () => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await medusa.store.region.list()
        const regions = response.regions || []
        
        // 如果没有当前区域，设置第一个区域为默认区域
        const { currentRegion } = get()
        let newCurrentRegion = currentRegion
        
        if (!currentRegion && regions.length > 0) {
          newCurrentRegion = regions[0]
        }
        
        set({ 
          regions, 
          currentRegion: newCurrentRegion,
          isLoading: false 
        })
      } catch (error) {
        console.error('获取区域列表失败:', error)
        
        // 如果API调用失败，创建一个默认区域
        const defaultRegion: Region = {
          id: 'default-region',
          name: '默认区域',
          currency_code: 'CNY'
        }
        
        set({ 
          regions: [defaultRegion],
          currentRegion: defaultRegion,
          error: error instanceof Error ? error.message : '获取区域失败',
          isLoading: false 
        })
      }
    },

    setCurrentRegion: (region: Region) => {
      set({ currentRegion: region })
    },

    getCurrentRegion: () => {
      return get().currentRegion
    },

    clearError: () => {
      set({ error: null })
    }
  }),
  {
    name: 'region-storage',
    partialize: (state) => ({ 
      currentRegion: state.currentRegion 
    })
  }
))

// 导出区域相关的API
export const regionApi = {
  // 获取区域列表
  async getRegions() {
    try {
      const response = await medusa.store.region.list()
      return response
    } catch (error) {
      console.error('获取区域列表失败:', error)
      throw error
    }
  },

  // 获取单个区域详情
  async getRegion(regionId: string) {
    try {
      const response = await medusa.store.region.retrieve(regionId)
      return response
    } catch (error) {
      console.error('获取区域详情失败:', error)
      throw error
    }
  }
}