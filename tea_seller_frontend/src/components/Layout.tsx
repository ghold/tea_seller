import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useRegionStore } from '../stores/regionStore'

const Layout: React.FC = () => {
  const { initializeCart } = useCartStore()
  const { getCurrentUser } = useAuthStore()
  const { fetchRegions } = useRegionStore()

  useEffect(() => {
    // 初始化应用数据
    const initializeApp = async () => {
      try {
        // 1. 首先初始化区域数据
        await fetchRegions()
        
        // 2. 然后初始化购物车（依赖区域数据）
        await initializeCart()
        
        // 3. 获取当前用户信息（如果已登录）
        const token = localStorage.getItem('auth-storage')
        if (token) {
          try {
            const authData = JSON.parse(token)
            if (authData.state?.isAuthenticated) {
              await getCurrentUser()
            }
          } catch (error) {
            console.error('Failed to parse auth data:', error)
          }
        }
      } catch (error) {
        console.error('应用初始化失败:', error)
      }
    }
    
    initializeApp()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout