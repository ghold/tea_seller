import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoreCart, StoreCartLineItem } from '@medusajs/types'
import { cartApi } from '../lib/api'
import { useRegionStore } from './regionStore'

interface CartState {
  cart: StoreCart | null
  cartId: string | null
  isLoading: boolean
  error: string | null
  itemCount: number
  total: number
}

interface CartActions {
  initializeCart: () => Promise<void>
  addToCart: (variantId: string, quantity: number) => Promise<void>
  updateCartItem: (lineItemId: string, quantity: number) => Promise<void>
  removeFromCart: (lineItemId: string) => Promise<void>
  clearCart: () => void
  refreshCart: () => Promise<void>
  clearError: () => void
}

export const useCartStore = create<CartState & CartActions>()(persist(
  (set, get) => ({
    // 状态
    cart: null,
    cartId: null,
    isLoading: false,
    error: null,
    itemCount: 0,
    total: 0,

    // 操作
    initializeCart: async () => {
      const { cartId } = get()
      set({ isLoading: true, error: null })
      
      try {
        let cart: StoreCart
        
        // 确保区域已初始化
        const regionStore = useRegionStore.getState()
        if (regionStore.regions.length === 0) {
          await regionStore.fetchRegions()
        }
        
        const currentRegion = regionStore.getCurrentRegion()
        const regionId = currentRegion?.id
        
        if (cartId) {
          // 尝试获取现有购物车
          try {
            const response = await cartApi.getCart(cartId)
            cart = response.cart
          } catch {
            // 如果获取失败，创建新购物车
            const response = await cartApi.createCart(regionId)
            cart = response.cart
          }
        } else {
          // 创建新购物车
          const response = await cartApi.createCart(regionId)
          cart = response.cart
        }

        const itemCount = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
        const total = cart.total || 0

        set({ 
          cart, 
          cartId: cart.id, 
          itemCount, 
          total, 
          isLoading: false 
        })
      } catch (error) {
        console.error('购物车初始化失败:', error)
        set({ 
          error: error instanceof Error ? error.message : '初始化购物车失败', 
          isLoading: false 
        })
      }
    },

    addToCart: async (variantId: string, quantity: number) => {
      const { cartId, initializeCart } = get()
      
      if (!cartId) {
        await initializeCart()
      }
      
      const currentCartId = get().cartId
      if (!currentCartId) {
        throw new Error('购物车未初始化')
      }

      set({ isLoading: true, error: null })
      
      try {
        const response = await cartApi.addToCart(currentCartId, variantId, quantity)
        const cart = response.cart
        const itemCount = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
        const total = cart.total || 0

        set({ 
          cart, 
          itemCount, 
          total, 
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '添加商品失败', 
          isLoading: false 
        })
        throw error
      }
    },

    updateCartItem: async (lineItemId: string, quantity: number) => {
      const { cartId } = get()
      if (!cartId) return

      set({ isLoading: true, error: null })
      
      try {
        const response = await cartApi.updateCartItem(cartId, lineItemId, quantity)
        const cart = response.cart
        const itemCount = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
        const total = cart.total || 0

        set({ 
          cart, 
          itemCount, 
          total, 
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '更新商品失败', 
          isLoading: false 
        })
        throw error
      }
    },

    removeFromCart: async (lineItemId: string) => {
      const { cartId } = get()
      if (!cartId) return

      set({ isLoading: true, error: null })
      
      try {
        await cartApi.removeFromCart(cartId, lineItemId)
        // 删除后重新获取购物车信息
        await get().refreshCart()
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '删除商品失败', 
          isLoading: false 
        })
        throw error
      }
    },

    refreshCart: async () => {
      const { cartId } = get()
      if (!cartId) return

      set({ isLoading: true, error: null })
      
      try {
        const response = await cartApi.getCart(cartId)
        const cart = response.cart
        const itemCount = cart.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
        const total = cart.total || 0

        set({ 
          cart, 
          itemCount, 
          total, 
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '刷新购物车失败', 
          isLoading: false 
        })
      }
    },

    clearCart: () => {
      set({ 
        cart: null, 
        cartId: null, 
        itemCount: 0, 
        total: 0, 
        error: null 
      })
    },

    clearError: () => {
      set({ error: null })
    }
  }),
  {
    name: 'cart-storage',
    partialize: (state) => ({ 
      cartId: state.cartId 
    })
  }
))