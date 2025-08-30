import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { 
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { Button, Input, Loading } from '../components'
import { toast } from 'react-hot-toast'

interface Order {
  id: string
  status: string
  created_at: string
  total: number
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
  }>
}

const UserCenter: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout, isLoading } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }
    
    // 模拟订单数据
    setOrders([
      {
        id: '1',
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        total: 15800,
        items: [
          { id: '1', title: '龙井茶叶礼盒装', quantity: 2, unit_price: 7900 }
        ]
      },
      {
        id: '2',
        status: 'shipped',
        created_at: '2024-01-10T14:20:00Z',
        total: 8900,
        items: [
          { id: '2', title: '铁观音特级茶叶', quantity: 1, unit_price: 8900 }
        ]
      }
    ])
  }, [user, navigate])

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      try {
        await logout()
        navigate('/')
        toast.success('已退出登录')
      } catch (error) {
        console.error('退出失败:', error)
        toast.error('退出失败，请重试')
      }
    }
  }

  const handleProfileUpdate = () => {
    // 这里应该调用API更新用户信息
    console.log('更新用户信息:', profileData)
    setIsEditingProfile(false)
    toast.success('个人信息更新成功！')
  }

  const formatPrice = (price: number) => {
    return `¥${(price / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString('zh-CN')
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '待付款',
      'paid': '已付款',
      'shipped': '已发货',
      'delivered': '已送达',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'text-yellow-600 bg-yellow-50',
      'paid': 'text-blue-600 bg-blue-50',
      'shipped': 'text-purple-600 bg-purple-50',
      'delivered': 'text-green-600 bg-green-50',
      'completed': 'text-gray-600 bg-gray-50',
      'cancelled': 'text-red-600 bg-red-50'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-50'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="正在加载用户信息..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">用户中心</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              退出登录
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* 用户头像和基本信息 */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>

              {/* 导航菜单 */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    activeTab === 'profile'
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  个人信息
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    activeTab === 'orders'
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  我的订单
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    activeTab === 'favorites'
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <HeartIcon className="h-5 w-5" />
                  我的收藏
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    activeTab === 'settings'
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CogIcon className="h-5 w-5" />
                  账户设置
                </button>
              </nav>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            {/* 个人信息 */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">个人信息</h2>
                  <Button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    {isEditingProfile ? '取消编辑' : '编辑信息'}
                  </Button>
                </div>

                {isEditingProfile ? (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          姓
                        </label>
                        <Input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          名
                        </label>
                        <Input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        邮箱
                      </label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        手机号
                      </label>
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={handleProfileUpdate}
                        variant="primary"
                        size="md"
                      >
                        保存更改
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        variant="outline"
                        size="md"
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          姓名
                        </label>
                        <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          注册时间
                        </label>
                        <p className="text-gray-900">{user.created_at ? formatDate(user.created_at) : '未知'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        邮箱地址
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        手机号码
                      </label>
                      <p className="text-gray-900">{user.phone || '未设置'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 我的订单 */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">我的订单</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
                    <p className="text-gray-600 mb-4">您还没有任何订单记录</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      去购物
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              订单号: {order.id}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {formatDate(order.created_at)}
                            </span>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span className="text-gray-900">{item.title}</span>
                              <span className="text-gray-600 text-sm">
                                {formatPrice(item.unit_price)} × {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-gray-600">订单总额</span>
                          <span className="text-lg font-semibold text-green-600">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 我的收藏 */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">我的收藏</h2>
                <div className="text-center py-12">
                  <HeartIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收藏</h3>
                  <p className="text-gray-600 mb-4">您还没有收藏任何商品</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    去逛逛
                  </button>
                </div>
              </div>
            )}

            {/* 账户设置 */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">账户设置</h2>
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">密码设置</h3>
                    <p className="text-gray-600 mb-3">定期更换密码可以提高账户安全性</p>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      修改密码
                    </button>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">通知设置</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" defaultChecked />
                        <span className="ml-2 text-gray-700">订单状态通知</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" defaultChecked />
                        <span className="ml-2 text-gray-700">促销活动通知</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <span className="ml-2 text-gray-700">新品推荐通知</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">账户操作</h3>
                    <p className="text-gray-600 mb-3">注意：删除账户将无法恢复</p>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50">
                      删除账户
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserCenter