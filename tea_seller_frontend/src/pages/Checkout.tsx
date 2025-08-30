import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Button, Input, Loading } from '../components'
import { toast } from 'react-hot-toast'

interface ShippingAddress {
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
}

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { cart, isLoading } = useCartStore()
  const { user } = useAuthStore()
  
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>('alipay')
  const [orderNote, setOrderNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 模拟收货地址数据
  const [addresses] = useState<ShippingAddress[]>([
    {
      name: '张三',
      phone: '13800138000',
      province: '福建省',
      city: '福州市',
      district: '鼓楼区',
      address: '五四路123号茶叶大厦8楼',
      isDefault: true
    },
    {
      name: '李四',
      phone: '13900139000',
      province: '广东省',
      city: '广州市',
      district: '天河区',
      address: '珠江新城花城大道456号',
      isDefault: false
    }
  ])

  // 支付方式
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'alipay',
      name: '支付宝',
      icon: <DevicePhoneMobileIcon className="h-6 w-6" />,
      description: '推荐使用，安全快捷'
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: <DevicePhoneMobileIcon className="h-6 w-6" />,
      description: '微信扫码支付'
    },
    {
      id: 'unionpay',
      name: '银联支付',
      icon: <CreditCardIcon className="h-6 w-6" />,
      description: '支持各大银行卡'
    },
    {
      id: 'cod',
      name: '货到付款',
      icon: <BanknotesIcon className="h-6 w-6" />,
      description: '收货时现金支付'
    }
  ]

  useEffect(() => {
    // 检查用户登录状态
    if (!user) {
      navigate('/auth?redirect=/checkout')
      return
    }

    // 检查购物车是否为空
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart')
      return
    }

    // 设置默认地址
    const defaultAddress = addresses.find(addr => addr.isDefault)
    if (defaultAddress) {
      setSelectedAddress(defaultAddress)
    }
  }, [user, cart, navigate, addresses])

  const formatPrice = (price: number) => {
    return `¥${(price / 100).toFixed(2)}`
  }

  // 计算订单金额
  const subtotal = cart?.items?.reduce((total, item) => {
    return total + (item.unit_price * item.quantity)
  }, 0) || 0

  const shippingFee = subtotal >= 19900 ? 0 : 1000 // 满199免运费
  const total = subtotal + shippingFee

  const handleSubmitOrder = async () => {
    if (!selectedAddress) {
      alert('请选择收货地址')
      return
    }

    setIsSubmitting(true)
    
    try {
      // 模拟提交订单
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 这里应该调用实际的订单创建API
      // const order = await createOrder({
      //   cart_id: cart.id,
      //   shipping_address: selectedAddress,
      //   payment_method: selectedPayment,
      //   note: orderNote
      // })
      
      toast.success('订单提交成功！')
      navigate('/user-center?tab=orders')
    } catch (error) {
      console.error('提交订单失败:', error)
      toast.error('提交订单失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="正在加载订单信息..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">确认订单</h1>
          <p className="text-gray-600 mt-2">请确认您的订单信息</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 收货地址 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">收货地址</h2>
              </div>
              
              <div className="space-y-3">
                {addresses.map((address, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedAddress(address)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress === address
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">{address.name}</span>
                          <span className="text-gray-600">{address.phone}</span>
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">默认</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {address.province} {address.city} {address.district} {address.address}
                        </p>
                      </div>
                      {selectedAddress === address && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium">
                + 添加新地址
              </button>
            </div>

            {/* 配送方式 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TruckIcon className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">配送方式</h2>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">标准配送</h3>
                    <p className="text-sm text-gray-600">预计3-5个工作日送达</p>
                  </div>
                  <span className="text-green-600 font-medium">
                    {shippingFee === 0 ? '免运费' : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>
            </div>

            {/* 支付方式 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCardIcon className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">支付方式</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedPayment === method.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 订单备注 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">订单备注</h2>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="如有特殊要求，请在此留言..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>
          </div>

          {/* 右侧订单摘要 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">订单摘要</h2>
              
              {/* 商品列表 */}
              <div className="space-y-3 mb-6">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-green-600 font-bold">茶</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600">数量: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* 费用明细 */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">商品小计</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">运费</span>
                  <span className={`${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingFee === 0 ? '免运费' : formatPrice(shippingFee)}
                  </span>
                </div>
                {subtotal < 19900 && (
                  <p className="text-xs text-gray-500">
                    再购买 {formatPrice(19900 - subtotal)} 即可免运费
                  </p>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">总计</span>
                  <span className="text-green-600">{formatPrice(total)}</span>
                </div>
              </div>
              
              {/* 提交订单按钮 */}
              <Button
                onClick={handleSubmitOrder}
                loading={isSubmitting}
                disabled={!selectedAddress}
                variant="primary"
                size="lg"
                className="w-full mt-6"
              >
                提交订单 {formatPrice(total)}
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                点击提交订单即表示您同意我们的服务条款
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout