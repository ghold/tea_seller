import React from 'react'
import { Link } from 'react-router-dom'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useEffect } from 'react'
import { useProductStore } from '../stores/productStore'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const { categories, fetchCategories } = useProductStore()

  useEffect(() => {
    fetchCategories()
  }, [])

  const footerLinks = {
    company: [
      { name: '关于我们', href: '/about' },
      { name: '联系我们', href: '/contact' },
      { name: '招聘信息', href: '/careers' },
      { name: '新闻资讯', href: '/news' },
    ],
    service: [
      { name: '配送说明', href: '/shipping' },
      { name: '退换货政策', href: '/returns' },
      { name: '隐私政策', href: '/privacy' },
      { name: '服务条款', href: '/terms' },
    ],
    help: [
      { name: '常见问题', href: '/faq' },
      { name: '购买指南', href: '/guide' },
      { name: '茶叶知识', href: '/knowledge' },
      { name: '在线客服', href: '/support' },
    ]
  }

  return (
    <footer className="bg-gray-900 text-white">
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 品牌信息 */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">茶</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">茶香园</h3>
                <p className="text-sm text-gray-400">传承千年茶文化</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              茶香园致力于传承中华茶文化，精选全国各大茶区的优质茶叶，
              为茶友们提供最纯正的茶香体验。每一片茶叶都承载着深厚的文化底蕴。
            </p>
            
            {/* 联系信息 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">400-888-8888</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">service@chaxiangyuan.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">福建省福州市茶叶大道88号</span>
              </div>
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">客服时间：9:00-21:00</span>
              </div>
            </div>
          </div>

          {/* 公司信息 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">公司信息</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 客户服务 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">客户服务</h4>
            <ul className="space-y-2">
              {footerLinks.service.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 茶叶分类 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">茶叶分类</h4>
            <ul className="space-y-2">
              {categories.slice(0, 4).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/products?category=${category.handle}`}
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* 帮助中心 */}
            <h4 className="text-lg font-semibold mb-4 mt-6">帮助中心</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 社交媒体和认证 */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* 社交媒体 */}
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <span className="text-gray-400 text-sm">关注我们：</span>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <span className="sr-only">微信</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18 0 .659-.52 1.188-1.162 1.188-.642 0-1.162-.529-1.162-1.188 0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18 0 .659-.52 1.188-1.162 1.188-.642 0-1.162-.529-1.162-1.188 0-.651.52-1.18 1.162-1.18z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <span className="sr-only">微博</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.586 8.217c-3.91-.225-7.297 1.381-7.563 3.589-.266 2.207 2.743 4.215 6.653 4.44 3.91.225 7.297-1.381 7.563-3.589.266-2.207-2.743-4.215-6.653-4.44zm-.711 6.686c-2.715.156-4.916-1.077-4.916-2.756 0-1.679 2.201-3.135 4.916-3.291 2.715-.156 4.916 1.077 4.916 2.756 0 1.679-2.201 3.135-4.916 3.291z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <span className="sr-only">抖音</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-1.032-.083 6.411 6.411 0 0 0-6.4 6.4 6.411 6.411 0 0 0 6.4 6.4 6.411 6.411 0 0 0 6.4-6.4V8.109a8.19 8.19 0 0 0 4.865 1.575V6.686z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* 认证信息 */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>食品经营许可证</span>
              <span>|</span>
              <span>ICP备案号：闽ICP备12345678号</span>
              <span>|</span>
              <span>增值电信业务经营许可证</span>
            </div>
          </div>
        </div>
      </div>

      {/* 版权信息 */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="mb-2 md:mb-0">
              <p>&copy; {currentYear} 茶香园. 保留所有权利.</p>
            </div>
            <div className="flex items-center space-x-4">
              <span>安全认证</span>
              <span>|</span>
              <span>诚信网站</span>
              <span>|</span>
              <span>绿色网站</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer