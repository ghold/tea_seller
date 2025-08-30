import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useProductStore } from '../stores/productStore';
import { ProductCard, Loading, Input, Button } from '../components';

const Products: React.FC = () => {
  const { products, isLoading, error, searchQuery, selectedCategory, sortBy, fetchProducts, setSearchQuery, setSelectedCategory, setSortBy } = useProductStore();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [showFilters, setShowFilters] = useState(false)

  // 茶叶分类选项
  const teaCategories = [
    { id: '1', name: '绿茶', description: '清香淡雅，回甘甘甜' },
    { id: '2', name: '红茶', description: '醇厚浓郁，温润暖胃' },
    { id: '3', name: '乌龙茶', description: '半发酵茶，香气独特' },
    { id: '4', name: '白茶', description: '清淡甘甜，养生佳品' },
    { id: '5', name: '普洱茶', description: '陈香醇厚，越陈越香' }
  ]

  // 排序选项
  const sortOptions = [
    { value: 'created_at', label: '最新上架' },
    { value: 'title', label: '名称排序' },
    { value: 'price_asc', label: '价格从低到高' },
    { value: 'price_desc', label: '价格从高到低' }
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const params: any = {}
    if (searchQuery) params.q = searchQuery
    if (selectedCategory) params.category_id = [selectedCategory]
    if (sortBy) params.order = sortBy
    
    fetchProducts(params)
  }, [searchQuery, selectedCategory, sortBy])

  const handleSearch = () => {
    setSearchQuery(localSearchQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSearchQuery('')
    setLocalSearchQuery('')
    setSortBy('created_at')
  }



  const formatPrice = (price: number) => {
    return `¥${(price / 100).toFixed(2)}`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">加载失败</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 搜索和筛选栏 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索茶叶产品..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                />
                <Button
                  onClick={handleSearch}
                  variant="primary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-700 hover:bg-green-800"
                >
                  搜索
                </Button>
              </div>
            </div>
            
            {/* 筛选按钮 */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "primary" : "outline"}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              筛选
            </Button>
          </div>
          
          {/* 筛选面板 */}
          {showFilters && (
            <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-amber-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-green-800">筛选条件</h3>
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-green-700 hover:text-green-800"
                >
                  清除筛选
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 茶叶分类筛选 */}
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-3">
                    茶叶分类
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`p-3 text-sm rounded-lg border transition-all ${
                        !selectedCategory
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                      }`}
                    >
                      全部分类
                    </button>
                    {teaCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-3 text-sm rounded-lg border transition-all text-left ${
                          selectedCategory === category.id
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                        }`}
                        title={category.description}
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs opacity-75 mt-1">{category.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 排序方式 */}
                <div>
                  <label className="block text-sm font-medium text-green-800 mb-3">
                    排序方式
                  </label>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`w-full p-3 text-sm rounded-lg border transition-all text-left ${
                          sortBy === option.value
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 产品网格 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">暂无产品</p>
            <Button onClick={() => fetchProducts()} variant="outline">
              重新加载
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products