const CACHE_NAME = 'travel-app-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// 安装阶段 - 缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('缓存核心资源')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('删除旧缓存:', key)
          return caches.delete(key)
        })
      )
    })
  )
  self.clients.claim()
})

// 请求拦截 - 缓存优先策略
self.addEventListener('fetch', event => {
  const { request } = event
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') return
  
  // 跳过跨域请求
  if (!request.url.startsWith(self.location.origin)) return
  
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        // 缓存命中，返回缓存
        return cachedResponse
      }
      
      // 缓存未命中，发起网络请求
      return fetch(request).then(networkResponse => {
        // 克隆响应（因为响应流只能使用一次）
        const responseClone = networkResponse.clone()
        
        // 缓存新资源
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone)
        })
        
        return networkResponse
      }).catch(() => {
        // 网络失败，返回离线页面
        if (request.destination === 'document') {
          return caches.match('/index.html')
        }
      })
    })
  )
})

// 后台同步 - 离线数据同步（可选）
self.addEventListener('sync', event => {
  if (event.tag === 'sync-travel-data') {
    event.waitUntil(syncTravelData())
  }
})

async function syncTravelData() {
  // 实现离线数据同步逻辑
  console.log('同步旅行数据')
}