import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductStore } from '../stores/productStore'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { ProductCard, Loading, Button } from '../components'
import { productApi } from '../lib/api'

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { products, categories, isLoading, error, fetchProducts, fetchCategories, clearError } = useProductStore()
  
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({})

  // 轮播图数据
  const slides = [
    {
      id: 1,
      title: '精选龙井茶',
      subtitle: '传统工艺，醇香回甘',
      description: '来自西湖龙井核心产区，每一片茶叶都经过精心挑选',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Beautiful%20Chinese%20Longjing%20green%20tea%20leaves%20in%20elegant%20white%20porcelain%20cup%2C%20traditional%20tea%20ceremony%20setting%2C%20soft%20natural%20lighting%2C%20minimalist%20zen%20aesthetic&image_size=landscape_16_9',
      buttonText: '立即选购',
      buttonAction: () => navigate('/products?category=green-tea')
    },
    {
      id: 2,
      title: '铁观音礼盒',
      subtitle: '送礼佳品，品质保证',
      description: '精美包装，适合商务送礼和节日馈赠',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Elegant%20Chinese%20Tieguanyin%20oolong%20tea%20gift%20box%20set%2C%20luxury%20packaging%2C%20traditional%20Chinese%20design%2C%20premium%20tea%20presentation&image_size=landscape_16_9',
      buttonText: '查看礼盒',
      buttonAction: () => navigate('/products?category=oolong-tea')
    },
    {
      id: 3,
      title: '普洱陈茶',
      subtitle: '岁月沉淀，越陈越香',
      description: '云南普洱，经过时间洗礼的醇厚口感',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Aged%20Chinese%20Puer%20tea%20cake%2C%20dark%20rich%20color%2C%20traditional%20bamboo%20wrapping%2C%20vintage%20tea%20storage%20setting%2C%20warm%20lighting&image_size=landscape_16_9',
      buttonText: '品味经典',
      buttonAction: () => navigate('/products?category=puer-tea')
    }
  ]

  // 分类图片映射（为API数据提供默认图片）
  const categoryImageMap: Record<string, string> = {
    'green-tea': 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Fresh%20green%20tea%20leaves%2C%20vibrant%20green%20color%2C%20delicate%20texture%2C%20natural%20lighting%2C%20clean%20white%20background&image_size=square',
    'black-tea': 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Premium%20black%20tea%20leaves%2C%20dark%20reddish%20brown%20color%2C%20rich%20texture%2C%20elegant%20presentation%2C%20warm%20lighting&image_size=square',
    'oolong-tea': 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20oolong%20tea%20leaves%2C%20partially%20oxidized%2C%20twisted%20shape%2C%20golden%20brown%20color%2C%20artisanal%20quality&image_size=square',
    'puer-tea': 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Aged%20Puer%20tea%20compressed%20cake%2C%20dark%20mature%20color%2C%20traditional%20Chinese%20tea%20culture%2C%20vintage%20aesthetic&image_size=square',
    'white-tea': 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Delicate%20white%20tea%20buds%2C%20silvery%20white%20color%2C%20fine%20downy%20texture%2C%20premium%20quality%2C%20soft%20natural%20lighting&image_size=square',
    'flower-tea': 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Beautiful%20flower%20tea%20blend%2C%20dried%20flowers%20and%20tea%20leaves%2C%20colorful%20petals%2C%20aromatic%20herbal%20tea%2C%20natural%20beauty&image_size=square'
  }

  // 获取分类的显示图片
  const getCategoryImage = (category: any) => {
    return category.image || categoryImageMap[category.handle] || categoryImageMap['green-tea']
  }

  // 获取所有分类的产品数量
  const fetchCategoryProductCounts = useCallback(async (categories: any[]) => {
    const counts: Record<string, number> = {}
    
    for (const category of categories) {
      try {
        const count = await productApi.getCategoryProductCount(category.id)
        counts[category.id] = count
      } catch (error) {
        console.error(`获取分类 ${category.name} 的产品数量失败:`, error)
        counts[category.id] = 0
      }
    }
    
    setCategoryProductCounts(counts)
  }, [])

  // 获取分类的产品数量
  const getCategoryCount = (category: any) => {
    const count = categoryProductCounts[category.id]
    if (count !== undefined) {
      return `${count}款商品`
    }
    
    // 回退到本地计算（如果API数据还未加载）
    if (category.products) {
      return `${category.products.length}款商品`
    }
    const categoryProducts = products.filter(product => 
      product.categories?.some((cat: any) => cat.id === category.id)
    )
    return `${categoryProducts.length}款商品`
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // 当分类数据加载完成后，获取每个分类的产品数量
  useEffect(() => {
    if (categories.length > 0) {
      fetchCategoryProductCounts(categories)
    }
  }, [categories, fetchCategoryProductCounts])

  useEffect(() => {
    // 设置推荐产品（取前6个产品）
    if (products.length > 0) {
      setFeaturedProducts(products.slice(0, 6))
    }
  }, [products])



  useEffect(() => {
    // 自动轮播
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const formatPrice = (price: number) => {
    return `¥${(price / 100).toFixed(2)}`
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* 轮播图区域 */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                  <h2 className="text-xl md:text-2xl mb-4">{slide.subtitle}</h2>
                  <p className="text-lg mb-8 opacity-90">{slide.description}</p>
                  <button
                    onClick={slide.buttonAction}
                    className="px-8 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                  >
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* 轮播控制按钮 */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
        
        {/* 轮播指示器 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 茶叶分类导航 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">茶叶分类</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              精选六大茶类，每一种都有其独特的风味和文化底蕴
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 text-center animate-pulse">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category) => (
                <div
                  key={category.id}
                  onClick={() => {
                    navigate(`/products?category=${category.handle}`)
                  }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-80 transition-opacity">
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{getCategoryCount(category)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 推荐产品 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">精选推荐</h2>
              <p className="text-gray-600">为您精心挑选的优质茶叶</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              查看全部
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
          
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">加载产品时出现错误</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
              </div>
              <button
                onClick={() => {
                  clearError();
                  fetchProducts();
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
              >
                重新加载
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                </svg>
                <p className="text-lg font-medium">暂无推荐产品</p>
                <p className="text-sm text-gray-400 mt-2">请稍后再试或浏览全部产品</p>
              </div>
              <button
                onClick={() => navigate('/products')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
              >
                浏览全部产品
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 品牌故事 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">传承千年茶文化</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                我们致力于传承中华茶文化，精选来自全国各大茶区的优质茶叶。
                每一片茶叶都经过严格筛选，确保为您提供最纯正的茶香体验。
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                从采摘到包装，我们坚持传统工艺与现代技术相结合，
                让每一杯茶都承载着深深的文化底蕴和匠心精神。
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/about')}
              >
                了解更多
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20tea%20ceremony%20scene%2C%20elegant%20teapot%20and%20cups%2C%20bamboo%20mat%2C%20peaceful%20zen%20atmosphere%2C%20warm%20natural%20lighting&image_size=landscape_4_3"
                alt="茶文化"
                className="w-full rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black from-0% to-transparent to-50% rounded-lg"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-semibold mb-2">品茶如品人生</h3>
                <p className="text-sm opacity-90">在茶香中感悟生活的美好</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home