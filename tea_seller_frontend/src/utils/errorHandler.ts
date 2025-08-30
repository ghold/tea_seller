// 错误处理工具

// 错误类型定义
export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

// 通用错误处理函数
export const handleApiError = (error: any): ApiError => {
  // 如果是网络错误
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      message: '网络连接失败，请检查网络设置',
      status: 0,
      code: 'NETWORK_ERROR'
    }
  }

  // 如果是HTTP错误
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          message: '认证失败，请重新登录',
          status: 401,
          code: 'UNAUTHORIZED'
        }
      case 403:
        return {
          message: '权限不足，无法访问该资源',
          status: 403,
          code: 'FORBIDDEN'
        }
      case 404:
        return {
          message: '请求的资源不存在',
          status: 404,
          code: 'NOT_FOUND'
        }
      case 422:
        return {
          message: '请求参数有误，请检查输入信息',
          status: 422,
          code: 'VALIDATION_ERROR',
          details: error.details
        }
      case 500:
        return {
          message: '服务器内部错误，请稍后重试',
          status: 500,
          code: 'INTERNAL_ERROR'
        }
      default:
        return {
          message: `请求失败 (${error.status})`,
          status: error.status,
          code: 'HTTP_ERROR'
        }
    }
  }

  // 如果是Medusa特定错误
  if (error.message) {
    if (error.message.includes('No regions found')) {
      return {
        message: '暂无可用区域，请联系客服',
        code: 'NO_REGIONS'
      }
    }
    
    if (error.message.includes('Unauthorized')) {
      return {
        message: '认证失败，请检查API配置',
        code: 'AUTH_ERROR'
      }
    }
    
    if (error.message.includes('publishable')) {
      return {
        message: 'API密钥配置错误，请联系管理员',
        code: 'API_KEY_ERROR'
      }
    }
  }

  // 默认错误处理
  return {
    message: error.message || '未知错误，请稍后重试',
    code: 'UNKNOWN_ERROR'
  }
}

// 重试机制
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // 如果是最后一次重试，直接抛出错误
      if (i === maxRetries - 1) {
        throw error
      }
      
      // 如果是认证错误或权限错误，不进行重试
      const apiError = handleApiError(error)
      if (apiError.status === 401 || apiError.status === 403) {
        throw error
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
  
  throw lastError
}

// 回退数据提供器
export const withFallback = async <T>(
  primaryFn: () => Promise<T>,
  fallbackData: T,
  shouldUseFallback?: (error: any) => boolean
): Promise<T> => {
  try {
    return await primaryFn()
  } catch (error) {
    console.warn('主要数据源失败，使用回退数据:', error)
    
    // 如果提供了判断函数，使用它来决定是否使用回退数据
    if (shouldUseFallback && !shouldUseFallback(error)) {
      throw error
    }
    
    return fallbackData
  }
}

// 日志记录
export const logError = (context: string, error: any, additionalInfo?: any) => {
  const apiError = handleApiError(error)
  
  console.group(`❌ ${context} 错误`)
  console.error('错误信息:', apiError.message)
  console.error('错误代码:', apiError.code)
  console.error('HTTP状态:', apiError.status)
  console.error('原始错误:', error)
  
  if (additionalInfo) {
    console.error('附加信息:', additionalInfo)
  }
  
  console.groupEnd()
}