import { create } from 'zustand'
import type { StoreProduct, StoreProductCategory } from '@medusajs/types'
import { productApi } from '../lib/api'

interface ProductState {
  products: StoreProduct[]
  categories: StoreProductCategory[]
  currentProduct: StoreProduct | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedCategory: string | null
  sortBy: string
  pagination: {
    offset: number
    limit: number
    count: number
  }
}

interface ProductActions {
  fetchProducts: (params?: {
    limit?: number
    offset?: number
    category_id?: string[]
    q?: string
    order?: string
  }) => Promise<void>
  fetchProduct: (id: string) => Promise<void>
  fetchCategories: () => Promise<void>
  setSearchQuery: (query: string) => void
  setSelectedCategory: (categoryId: string | null) => void
  setSortBy: (sortBy: string) => void
  clearError: () => void
  resetProducts: () => void
}

export const useProductStore = create<ProductState & ProductActions>()(
  (set, get) => ({
    // 状态
    products: [],
    categories: [],
    currentProduct: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,
    sortBy: 'created_at',
    pagination: {
      offset: 0,
      limit: 20,
      count: 0
    },

    // 操作
    fetchProducts: async (params) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await productApi.getProducts(params)
        
        set({ 
          products: (response.products || []) as StoreProduct[],
          pagination: {
            offset: response.offset || 0,
            limit: response.limit || 20,
            count: response.count || 0
          },
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '获取产品列表失败', 
          isLoading: false 
        })
      }
    },

    fetchProduct: async (id: string) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await productApi.getProduct(id)
        
        set({ 
          currentProduct: (response.product || null) as StoreProduct | null,
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '获取产品详情失败', 
          isLoading: false 
        })
      }
    },

    fetchCategories: async () => {
      try {
        const response = await productApi.getCategories()
        
        set({ 
          categories: (response as any).product_categories || []
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '获取产品分类失败'
        })
      }
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query })
    },

    setSelectedCategory: (categoryId: string | null) => {
      set({ selectedCategory: categoryId })
    },

    setSortBy: (sortBy: string) => {
      set({ sortBy })
    },

    clearError: () => {
      set({ error: null })
    },

    resetProducts: () => {
      set({ 
        products: [],
        currentProduct: null,
        searchQuery: '',
        selectedCategory: null,
        pagination: {
          offset: 0,
          limit: 20,
          count: 0
        }
      })
    }
  })
)