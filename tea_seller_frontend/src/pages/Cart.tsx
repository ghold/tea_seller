import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon,
  ShoppingBagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Loading, Button } from '../components'
import { toast } from 'react-hot-toast'

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const { 
    cart, 
    isLoading, 
    error, 
    refreshCart, 
    updateCartItem, 
    removeFromCart,
    clearCart
  } = useCartStore()

  useEffect(() => {
    refreshCart()
  }, [])

  const formatPrice = (price: number) => {
    return `¥${(price / 100).toFixed(2)}`
  }

  const handleQuantityChange = async (lineItemId: string, quantity: number) => {
    if (quantity < 1) return
    try {
      await updateCartItem(lineItemId, quantity)
    } catch (error) {
      console.error('更新商品数量失败:', error)
      toast.error('更新失败，请重试')
    }
  }

  const handleRemoveItem = async (lineItemId: string) => {
    try {
      await removeFromCart(lineItemId)
      toast.success('商品已移除')
    } catch (error) {
      console.error('移除商品失败:', error)
      toast.error('移除失败，请重试')
    }
  }

  const handleClearCart = async () => {
    if (window.confirm('确定要清空购物车吗？')) {
      try {
        await clearCart()
        toast.success('购物车已清空')
      } catch (error) {
        console.error('清空购物车失败:', error)
        toast.error('清空失败，请重试')
      }
    }
  }

  const calculateSubtotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      return total + (item.unit_price * item.quantity)
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const shipping = subtotal > 10000 ? 0 : 1000 // 满100元免运费
    return subtotal + shipping
  }

  const getShippingFee = () => {
    const subtotal = calculateSubtotal()
    return subtotal > 10000 ? 0 : 1000
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="正在加载购物车..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refreshCart()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  const isEmpty = !cart?.items || cart.items.length === 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">购物车</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          /* 空购物车状态 */
          <div className="text-center py-16">
            <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">购物车是空的</h2>
            <p className="text-gray-600 mb-6">快去挑选您喜欢的茶叶吧！</p>
            <Button
              onClick={() => navigate('/products')}
              variant="primary"
              size="lg"
            >
              去购物
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 购物车商品列表 */}
            <div className="lg:col-span-2 space-y-4">
              {/* 操作栏 */}
              <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                <span className="text-gray-600">共 {cart.items.length} 件商品</span>
                <Button
                  onClick={handleClearCart}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  清空购物车
                </Button>
              </div>

              {/* 商品列表 */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      {/* 商品图片 */}
                      <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        {item.variant?.product?.images && item.variant.product.images.length > 0 ? (
                          <img
                            src={item.variant.product.images[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                            <span className="text-green-600 text-lg font-bold">茶</span>
                          </div>
                        )}
                      </div>

                      {/* 商品信息 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {item.variant?.title && `规格: ${item.variant.title}`}
                        </p>
                        <p className="text-green-600 font-semibold mt-1">
                          {formatPrice(item.unit_price)}
                        </p>
                      </div>

                      {/* 数量控制 */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 border border-gray-300 rounded min-w-[50px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* 小计 */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(item.unit_price * item.quantity)}
                        </p>
                      </div>

                      {/* 删除按钮 */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 订单摘要 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">订单摘要</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">商品小计</span>
                    <span className="font-semibold">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">运费</span>
                    <span className="font-semibold">
                      {getShippingFee() === 0 ? '免费' : formatPrice(getShippingFee())}
                    </span>
                  </div>
                  {getShippingFee() > 0 && (
                    <p className="text-sm text-green-600">
                      再购买 {formatPrice(10000 - calculateSubtotal())} 即可免运费
                    </p>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>总计</span>
                      <span className="text-green-600">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/checkout')}
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  去结算
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/products')}
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    继续购物
                  </button>
                </div>

                {/* 购物保障 */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">购物保障</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• 7天无理由退换货</li>
                    <li>• 正品保证</li>
                    <li>• 满100元免运费</li>
                    <li>• 24小时客服支持</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart