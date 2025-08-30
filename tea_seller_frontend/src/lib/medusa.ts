import Medusa from '@medusajs/js-sdk'

// Token管理类
class TokenManager {
  private static readonly TOKEN_KEY = 'medusa_auth_token'
  private static readonly COOKIE_NAME = 'connect.sid'
  
  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY)
    } catch {
      return null
    }
  }
  
  static getConnectSid(): string | null {
    try {
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === this.COOKIE_NAME) {
          return decodeURIComponent(value)
        }
      }
      return null
    } catch {
      return null
    }
  }
  
  static async setToken(token: string): Promise<void> {
    try {
      localStorage.setItem(this.TOKEN_KEY, token)
      
      // 将JWT token设置为connect.sid cookie
      const encodedToken = encodeURIComponent(token)
      document.cookie = `${this.COOKIE_NAME}=${encodedToken}; path=/; secure; samesite=strict`
      
      // 更新Medusa客户端的认证token
      if (medusa && typeof medusa.client.setToken === 'function') {
        await medusa.client.setToken(token)
      }
    } catch (error) {
      console.error('设置token失败:', error)
    }
  }
  
  static async clearToken(): Promise<void> {
    try {
      localStorage.removeItem(this.TOKEN_KEY)
      
      // 清除connect.sid cookie
      document.cookie = `${this.COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      
      // 清除Medusa客户端的认证token
      if (medusa && typeof medusa.client.clearToken === 'function') {
        await medusa.client.clearToken()
      }
    } catch (error) {
      console.error('清除token失败:', error)
    }
  }
  
  static isTokenExpired(token: string): boolean {
    try {
      // JWT token格式检查
      const parts = token.split('.')
      if (parts.length !== 3) return true
      
      // 解析payload
      const payload = JSON.parse(atob(parts[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      // 检查是否过期
      return payload.exp && payload.exp < currentTime
    } catch {
      return true
    }
  }
}

// Medusa客户端配置
const medusa = new Medusa({
  baseUrl: import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000',
  debug: import.meta.env.DEV,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '',
})

// 初始化时设置已存储的token
const storedToken = TokenManager.getToken()
if (storedToken && !TokenManager.isTokenExpired(storedToken)) {
  if (typeof medusa.client.setToken === 'function') {
    medusa.client.setToken(storedToken).catch(console.error)
  }
}

export { medusa, TokenManager }
export default medusa