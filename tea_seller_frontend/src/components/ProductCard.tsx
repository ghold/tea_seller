import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { useCartStore } from '../stores/cartStore';
import { toast } from 'react-hot-toast';
import type { StoreProduct } from '@medusajs/types';

interface ProductCardProps {
  product: StoreProduct;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart, isLoading } = useCartStore();
  
  const variant = product.variants?.[0];
  const price = variant?.calculated_price;
  const priceText = price ? `¥${(price.calculated_amount / 100).toFixed(2)}` : '价格面议';
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.variants?.[0]) {
      toast.error('该商品暂时无法购买');
      return;
    }
    
    try {
      await addToCart(product.variants[0].id, 1);
      toast.success('已添加到购物车');
    } catch (error) {
      toast.error('添加失败，请重试');
    }
  };
  
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-green-100 ${className}`}>
      <Link to={`/products/${product.id}`} className="block group">
        <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gradient-to-br from-green-50 to-amber-50">
          <img
            src={product.thumbnail || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20chinese%20tea%20leaves%20in%20elegant%20traditional%20packaging%20with%20bamboo%20elements&image_size=square'}
            alt={product.title}
            className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200 flex-1">
              {product.title}
            </h3>
            {product.status === 'published' && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                现货
              </span>
            )}
          </div>
          
          {product.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-700">
                {priceText}
              </span>
              {variant?.calculated_price && (
                 <span className="text-sm text-gray-400 line-through">
                   ¥{(variant.calculated_price.calculated_amount * 1.2 / 100).toFixed(2)}
                 </span>
               )}
            </div>
            
            {/* 茶叶等级或特色标签 */}
            <div className="flex flex-col items-end">
              <div className="flex items-center text-amber-600 mb-1">
                <span className="text-xs font-medium">精选茶叶</span>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="px-5 pb-5">
        <Button
          variant="primary"
          size="sm"
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleAddToCart}
          loading={isLoading}
          disabled={!product.variants?.[0]}
        >
          <ShoppingCartIcon className="h-4 w-4 mr-2" />
          {isLoading ? '添加中...' : '加入购物车'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;