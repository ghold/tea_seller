import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  StarIcon,
  MinusIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Loading, Button } from '../components'
import { toast } from 'react-hot-toast'

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProduct, isLoading, error, fetchProduct } = useProductStore()
  const { addToCart } = useCartStore()
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct(id)
    }
  }, [id, fetchProduct])

  useEffect(() => {
    if (currentProduct?.variants && currentProduct.variants.length > 0) {
      setSelectedVariant(currentProduct.variants[0])
    }
  }, [currentProduct])

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    
    try {
      await addToCart(selectedVariant.id, quantity)
      toast.success('已添加到购物车')
    } catch (error) {
      console.error('添加到购物车失败:', error)
      toast.error('添加失败，请重试')
    }
  }

  const handleBuyNow = async () => {
    if (!selectedVariant) return
    
    try {
      await addToCart(selectedVariant.id, quantity)
      navigate('/cart')
    } catch (error) {
      console.error('添加到购物车失败:', error)
      toast.error('添加失败，请重试')
    }
  }

  const formatPrice = (price: number) => {
    return `¥${(price / 100).toFixed(2)}`
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="正在加载产品详情..." />
      </div>
    )
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">产品未找到</h2>
          <p className="text-gray-600 mb-4">{error || '请检查产品链接是否正确'}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            返回产品列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            返回
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 产品图片 */}
          <div className="space-y-4">
            {/* 主图 */}
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {currentProduct.thumbnail ? (
                <img
                  src={currentProduct.thumbnail}
                  alt={currentProduct.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                  <span className="text-green-600 text-6xl font-bold">茶</span>
                </div>
              )}
            </div>
          </div>

          {/* 产品信息 */}
          <div className="space-y-6">
            {/* 标题和收藏 */}
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentProduct.title}
              </h1>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </div>

            {/* 评分 */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.0) 128条评价</span>
            </div>

            {/* 价格 */}
            <div className="space-y-2">
              {selectedVariant && selectedVariant.calculated_price && (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-green-600">
                    ¥{(selectedVariant.calculated_price.calculated_amount / 100).toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ¥{(selectedVariant.calculated_price.calculated_amount * 1.2 / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* 产品描述 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">产品描述</h3>
              <p className="text-gray-600 leading-relaxed">
                {currentProduct.description || '暂无描述'}
              </p>
            </div>

            {/* 规格选择 */}
            {currentProduct.variants && currentProduct.variants.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">选择规格</h3>
                <div className="grid grid-cols-3 gap-2">
                  {currentProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 border rounded-md text-center ${
                        selectedVariant?.id === variant.id
                          ? 'border-green-600 bg-green-50 text-green-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{variant.title}</div>
                      {variant.calculated_price && (
                        <div className="text-sm text-gray-600">
                          ¥{(variant.calculated_price.calculated_amount / 100).toFixed(2)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 数量选择 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">数量</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={decrementQuantity}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 border border-gray-300 rounded-md min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 购买按钮 */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                variant="primary"
                size="lg"
                className="w-full"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                加入购物车
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!selectedVariant}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                立即购买
              </Button>
            </div>

            {/* 产品特点 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">产品特点</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 精选优质茶叶，传统工艺制作</li>
                <li>• 香气浓郁，口感醇厚</li>
                <li>• 包装精美，适合自饮或送礼</li>
                <li>• 支持7天无理由退换货</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail