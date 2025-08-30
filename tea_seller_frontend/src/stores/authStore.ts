import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoreCustomer } from '@medusajs/types'
import { authApi } from '../lib/api'
import { TokenManager } from '../lib/medusa'

interface AuthState {
  user: StoreCustomer | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(persist(
  (set, get) => ({
    // 状态
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // 操作
    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null })
      try {
        const response = await authApi.login(email, password)
        // TokenManager已经在authApi中处理token存储
        set({ 
          user: response.customer, 
          isAuthenticated: true, 
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '登录失败', 
          isLoading: false 
        })
        throw error
      }
    },

    register: async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
      set({ isLoading: true, error: null })
      try {
        const response = await authApi.register({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone
        })
        // 注册成功后，用户已通过SDK认证流程，自动登录
        set({ 
          user: response.user, 
          isAuthenticated: true, // 使用SDK流程后自动登录
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : '注册失败', 
          isLoading: false 
        })
        throw error
      }
    },

    logout: async () => {
      set({ isLoading: true })
      try {
        await authApi.logout()
        // TokenManager已经在authApi.logout中处理token清除
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false, 
          error: null 
        })
      } catch (error) {
        // 即使logout失败，TokenManager也会清除token
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false, 
          error: null 
        })
      }
    },

    getCurrentUser: async () => {
      set({ isLoading: true })
      try {
        // 首先检查token是否有效
        if (!authApi.isTokenValid()) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
          return
        }
        
        const response = await authApi.getCurrentUser()
        if (response.customer) {
          set({ 
            user: response.customer, 
            isAuthenticated: true, 
            isLoading: false 
          })
        } else {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      } catch (error) {
        console.error('获取当前用户失败:', error)
        // TokenManager会在authApi中处理token清除
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      }
    },

    clearError: () => {
      set({ error: null })
    }
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({ 
      user: state.user, 
      isAuthenticated: state.isAuthenticated 
    })
  }
))