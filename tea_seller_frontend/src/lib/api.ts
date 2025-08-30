import medusa, { TokenManager } from './medusa'
import { handleApiError, withRetry, withFallback, logError } from '../utils/errorHandler'
import type { 
  StoreProduct, 
  StoreProductCategory,
  StoreCart,
  StoreCustomer,
  StoreOrder
} from '@medusajs/types'

// 获取API请求头
const getApiHeaders = () => {
  const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY
  const token = TokenManager.getToken()
  const connectSid = TokenManager.getConnectSid()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  // 添加publishable key
  if (publishableKey) {
    headers['x-publishable-api-key'] = publishableKey
  }
  
  // 添加JWT token
  if (token && !TokenManager.isTokenExpired(token)) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // 添加connect.sid cookie到请求头
  if (connectSid) {
    headers['connect.sid'] = connectSid
  }
  
  return headers
}



// 产品相关API
export const productApi = {
  // 获取产品列表
  async getProducts(params?: {
    limit?: number;
    offset?: number;
    category_id?: string[];
    q?: string;
    order?: string;
  }) {
    return withRetry(async () => {
      const { products, count, offset, limit } = await medusa.store.product.list(params);
      return { products, count, offset, limit };
    });
  },

  // 获取单个产品详情
  async getProduct(id: string, params?: {
    fields?: string
    region_id?: string
    currency_code?: string
  }) {
    try {
      // 构建查询参数
      const queryParams: any = {}
      
      if (params?.fields) {
        queryParams.fields = params.fields
      }
      
      if (params?.region_id) {
        queryParams.region_id = params.region_id
      }
      
      if (params?.currency_code) {
        queryParams.currency_code = params.currency_code
      }
      
      // 调用Medusa API
      const headers = getApiHeaders()
      const baseUrl = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000'
      
      const url = new URL(`/store/products/${id}`, baseUrl)
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined) {
          url.searchParams.append(key, queryParams[key].toString())
        }
      })
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return { product: data.product }
    } catch (error) {
      console.error('获取产品详情失败:', error)
      throw error
    }
  },

  // 获取产品分类
  async getCategories(params?: {
    limit?: number
    offset?: number
    q?: string
    parent_category_id?: string
    include_descendants_tree?: boolean
    include_ancestors_tree?: boolean
  }) {
    return withRetry(async () => {
      try {
        const { product_categories, count, offset, limit } = await medusa.store.category.list({
          ...params,
          limit: params?.limit || 50,
          offset: params?.offset || 0
        });
        
        return {
          product_categories,
          count,
          offset,
          limit
        };
      } catch (error) {
        logError('getCategories', error);
        throw error;
      }
    });
  },

  // 获取分类下的产品数量
  async getCategoryProductCount(categoryId: string) {
    return withRetry(async () => {
      try {
        const { products, count } = await medusa.store.product.list({
          category_id: [categoryId],
          limit: 1, // 只需要获取数量，不需要实际产品数据
          fields: 'id' // 只获取最少的字段
        });
        
        return count || 0;
      } catch (error) {
        logError('getCategoryProductCount', error);
        return 0; // 如果出错，返回0
      }
    });
  }
}

// 购物车相关API
export const cartApi = {
  // 创建购物车
  async createCart(regionId?: string) {
    return withRetry(async () => {
      try {
        // 如果没有提供区域ID，尝试获取默认区域
        let cartData: any = {}
        
        if (regionId) {
          cartData.region_id = regionId
        } else {
          // 尝试获取可用区域列表并使用第一个
          try {
            const regionsResponse = await medusa.store.region.list()
            if (regionsResponse.regions && regionsResponse.regions.length > 0) {
              cartData.region_id = regionsResponse.regions[0].id
            }
          } catch (regionError) {
            logError('获取区域列表', regionError)
            console.warn('获取区域列表失败，将尝试不指定区域创建购物车')
          }
        }
        
        const response = await medusa.store.cart.create(cartData)
        return response
      } catch (error) {
        logError('创建购物车', error, { regionId })
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    }, 3)
  },

  // 获取购物车
  async getCart(cartId: string) {
    return withRetry(async () => {
      try {
        const response = await medusa.store.cart.retrieve(cartId)
        return response
      } catch (error) {
        logError('获取购物车', error, { cartId })
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    }, 2)
  },

  // 添加商品到购物车
  async addToCart(cartId: string, variantId: string, quantity: number) {
    return withRetry(async () => {
      try {
        const response = await medusa.store.cart.createLineItem(cartId, {
          variant_id: variantId,
          quantity
        })
        return response
      } catch (error) {
        logError('添加商品到购物车', error, { cartId, variantId, quantity })
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    }, 2)
  },

  // 更新购物车商品数量
  async updateCartItem(cartId: string, lineItemId: string, quantity: number) {
    return withRetry(async () => {
      try {
        const response = await medusa.store.cart.updateLineItem(cartId, lineItemId, {
          quantity
        })
        return response
      } catch (error) {
        logError('更新购物车商品', error, { cartId, lineItemId, quantity })
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    }, 2)
  },

  // 删除购物车商品
  async removeFromCart(cartId: string, lineItemId: string) {
    return withRetry(async () => {
      try {
        const response = await medusa.store.cart.deleteLineItem(cartId, lineItemId)
        return response
      } catch (error) {
        logError('删除购物车商品', error, { cartId, lineItemId })
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    }, 2)
  }
}

// 用户认证相关API
export const authApi = {
  // 用户登录
  async login(email: string, password: string) {
    return withRetry(async () => {
      try {
        console.log('🔐 尝试用户登录:', { email })
        
        // 使用Medusa v2的认证API进行登录
        const result = await medusa.auth.login('customer', 'emailpass', {
          email,
          password
        })
        
        // Check if result is a redirect (third-party auth)
        if (typeof result !== 'string') {
          throw new Error('Third-party authentication redirect required')
        }
        
        console.log('✅ 登录成功，获取到token')
        
        // 存储token
        await TokenManager.setToken(result)
        
        // 获取用户信息
        const customerResponse = await medusa.store.customer.retrieve()
        
        return {
          token: result,
          customer: customerResponse.customer
        }
      } catch (error) {
        console.error('❌ 登录失败:', error)
        logError('用户登录', error, { email })
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    }, 2)
  },

  // 用户注册 - 遵循Medusa文档的推荐流程
  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) {
    return withRetry(async () => {
      console.log("🚀 Starting registration process for:", userData.email);

      try {
        await medusa.auth.register("customer", "emailpass", {
          email: userData.email,
          password: userData.password,
        });
        console.log("✅ Registration token obtained.");

      } catch (error: any) {
        // This is the special case where the email is already in use by another identity (e.g., an admin)
        if (error.message?.includes("Identity with email already exists")) {
          console.log("📧 Email already exists, attempting to login instead...");
          try {
            const loginResponse = await medusa.auth.login('customer', 'emailpass', {
              email: userData.email,
              password: userData.password,
            });

            if (typeof loginResponse !== 'string') {
              throw new Error("Authentication requires more actions, which isn't supported by this flow.");
            }
            console.log("✅ Login successful after identity exists error.");
            // The SDK now has the login token for the next step
          } catch (loginError: any) {
            console.error("❌ Login attempt failed after identity exists error:", loginError);
            throw new Error("该邮箱已被注册，但密码不正确。");
          }
        } else {
          // For other registration errors, re-throw
          console.error("❌ Registration error:", error);
          throw new Error(error.message || "注册时发生未知错误");
        }
      }

      // Step 2: Create the customer record.
      // The JS SDK should automatically use the token from auth.register or auth.login.
      console.log("👤 Step 2: Creating customer record...");
      try {
        const { customer } = await medusa.store.customer.create({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
        });
        console.log("✅ Customer created successfully:", customer.id);

        // The customer is created, but we need to ensure they are logged in
        // and we have a session token, not just a registration token.
        // Re-logging in ensures we have a valid session.
        console.log("🔐 Ensuring user is logged in to get a session token...");
        const loginToken = await medusa.auth.login('customer', 'emailpass', {
          email: userData.email,
          password: userData.password,
        });

        if (typeof loginToken !== 'string') {
          throw new Error("Login after registration failed to return a token.");
        }

        TokenManager.setToken(loginToken);
        console.log("💾 Session token stored.");

        return {
          success: true,
          user: customer,
          token: loginToken,
        };

      } catch (creationError: any) {
        console.error("❌ Customer creation error:", creationError);
        if (creationError.message?.includes("Customer already exists")) {
           throw new Error("客户信息已存在，请尝试登录");
        }
        throw new Error(creationError.message || "创建客户记录时失败");
      }
    }, 2)
  },

  // 获取当前用户信息
  async getCurrentUser() {
    return withRetry(async () => {
      try {
        console.log('👤 获取当前用户信息')
        // 使用正确的端点获取已登录客户信息
        const response = await medusa.store.customer.retrieve()
        console.log('✅ 获取用户信息成功:', response)
        return response
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error)
        logError('获取当前用户', error)
        const apiError = handleApiError(error)
        throw new Error(apiError.message)
      }
    }, 2)
  },

  // 用户登出
  async logout() {
    return withRetry(async () => {
      try {
        console.log('🚪 用户登出')
        
        // 清除本地存储的token
        await TokenManager.clearToken()
        
        // 注意：Medusa v2可能没有专门的登出API，主要依赖token过期
        console.log('✅ 登出成功')
        return { success: true }
      } catch (error) {
        console.error('❌ 登出失败:', error)
        logError('用户登出', error)
        
        // 即使登出API失败，也清除本地token
        await TokenManager.clearToken()
        return { success: true }
      }
    }, 1)
  },
  
  // 检查token是否有效
  isTokenValid() {
    const token = TokenManager.getToken()
    return token && !TokenManager.isTokenExpired(token)
  },
  
  // 刷新token（如果需要）
  async refreshTokenIfNeeded() {
    const token = TokenManager.getToken()
    if (!token) {
      throw new Error('没有可用的认证token')
    }
    
    if (TokenManager.isTokenExpired(token)) {
      TokenManager.clearToken()
      throw new Error('认证token已过期，请重新登录')
    }
    
    return token
  }
}

// 订单相关API
export const orderApi = {
  // 获取用户订单列表
  async getOrders() {
    try {
      const response = await medusa.store.order.list()
      return response
    } catch (error) {
      console.error('获取订单列表失败:', error)
      throw error
    }
  },

  // 获取单个订单详情
  async getOrder(orderId: string) {
    try {
      const response = await medusa.store.order.retrieve(orderId)
      return response
    } catch (error) {
      console.error('获取订单详情失败:', error)
      throw error
    }
  }
}