<template>
  <div class="self-travel-container">
    <!-- 头部区域 -->
    <header class="header">
      <h1 class="title">Personal Center</h1>
      <div class="header-actions">
        <span class="icon-btn" title="Settings">⚙️</span>
        <span class="icon-btn" title="Messages">💬</span>
      </div>
    </header>

    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <img :src="userInfo.avatar" alt="Avatar" class="avatar" />
      <div class="user-details">
        <h2 class="username">{{ userInfo.name }}</h2>
        <p class="age-location">{{ userInfo.age }}years old | {{ userInfo.profession }} | {{ userInfo.location }}</p>
        <p class="bio">{{ userInfo.bio }}</p>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="stats">
      <div class="stat-item">
        <span class="number">{{ userInfo.likes }}</span>
        <span class="label">likes</span>
      </div>
      <div class="stat-item">
        <span class="number">{{ userInfo.following }}</span>
        <span class="label">following</span>
      </div>
      <div class="stat-item">
        <span class="number">{{ userInfo.followers }}</span>
        <span class="label">followers</span>
      </div>
    </div>

    <!-- 动态标签页 -->
    <div class="tabs">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="['tab-button', { active: activeTab === index }]"
        @click="activeTab = index"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 动态列表 - 白底设计 -->
    <div class="dynamic-list">
      <div v-for="(post, index) in posts" :key="index" class="post-item">
        <!-- 时间线连接 -->
        <div class="timeline-line" v-if="index > 0"></div>
        
        <!-- 时间戳 -->
        <div class="timestamp">
          <div class="date-box">
            <span class="month">{{ post.date.split('/')[0] }}</span>
            <span class="day">{{ post.date.split('/')[1] }}</span>
          </div>
          <div class="year">{{ post.date.split('/')[2] }}year</div>
        </div>
        
        <!-- 内容区域 -->
        <div class="content-area">
          <div class="post-header">
            <h3 class="post-author">{{ post.author }}</h3>
            <div class="post-meta">
              <span class="post-time">{{ post.time }}</span>
              <span class="post-location">{{ post.location }}</span>
            </div>
          </div>
          
          <div class="post-content">
            <p>{{ post.content }}</p>
            
            <!-- 图片/视频展示 -->
            <div v-if="post.image" class="media-container">
              <img :src="post.image" alt="Post image " class="media-image" />
            </div>
            
            <div v-if="post.video" class="media-container">
              <video controls class="media-video">
                <source :src="post.video" type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </div>
          </div>
          
          <!-- 互动按钮 -->
          <div class="post-actions">
            <button class="action-btn">👍 like</button>
            <button class="action-btn">💬 comment</button>
            <button class="action-btn">🔗 share</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';

export default defineComponent({
  name: 'SelfTravel',
  setup() {
    const activeTab = ref(0);
    
    const tabs = reactive(['Posts', 'Shares', 'Publish']);

    const userInfo = reactive({
      avatar: 'https://q1.itc.cn/q_70/images03/20250129/4d820c22829549d9a2008243b262458f.jpeg',
      name: 'Helen Heller',
      age: '24',
      profession: 'Freelancer',
      location: 'Wuxi, Jiangsu',
      bio: ' Traveling across mountains and rivers, seeking that tranquility in the heart ',
      likes: 36,
      following: 2799,
      followers: 530
    });

    const posts = reactive([
      {
        date: '11/22/2024',
        author: 'Helen Heller',
        time: '11/22/2024 12:16',
        location: 'Shanghai',
        content: '0.5h by high-speed rail, discovered the "hometown of world ginkgo trees", ginkgo leaves flying everywhere, delicious crabs and lake fresh food, a must-visit in autumn!',
        image: null,
        video: null
      },
      {
        date: '10/01/2024',
        author: 'Helen Heller',
        time: '10/01/2024 12:16',
        location: 'Shanghai',
        content: 'Seaside views rival the Maldives, more fairy-tale-like than Finland',
        image: 'https://via.placeholder.com/400x300',
        video: null
      },
      {
        date: '01/31/2023',
        author: 'Helen Heller',
        time: '01/31/2023 12:16',
        location: 'Shanghai',
        content: 'Looking forward to the next trip!',
        image: null,
        video: null
      }
    ]);

    return {
      activeTab,
      tabs,
      userInfo,
      posts
    };
  }
});
</script>

<style scoped>
/* 容器基础样式 */
.self-travel-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  max-width: 600px;
  margin: 0 auto;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 头部区域 */
.header {
  background: linear-gradient(135deg, #4a6fa5 0%, #6b8fc7 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.icon-btn {
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  padding: 1.5rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.username {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
}

.age-location {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.85rem;
}

.bio {
  margin: 0.5rem 0 0 0;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* 统计数据 */
.stats {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.stat-item {
  text-align: center;
  padding: 0.5rem;
}

.number {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: #4a6fa5;
}

.label {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
}

/* 标签页 */
.tabs {
  display: flex;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 60px;
  z-index: 90;
}

.tab-button {
  flex: 1;
  padding: 0.875rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.95rem;
  color: #666;
  transition: all 0.2s;
  position: relative;
}

.tab-button:hover {
  color: #4a6fa5;
  background-color: #f9f9f9;
}

.tab-button.active {
  color: #4a6fa5;
  font-weight: 600;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background-color: #4a6fa5;
  border-radius: 2px 2px 0 0;
}

/* 动态列表 - 白底设计 */
.dynamic-list {
  padding: 1rem;
  background-color: white; /* 改为白色背景 */
  border-top: 1px solid #e0e0e0;
}

.post-item {
  margin-bottom: 1rem;
  position: relative;
  padding: 0;
  background-color: transparent; /* 移除卡片背景 */
  box-shadow: none; /* 移除阴影 */
}

/* 时间线连接 - 优化为自然连接 */
.timeline-line {
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
  border-radius: 1px;
  z-index: 1;
}

/* 时间戳 */
.timestamp {
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.date-box {
  background-color: #e8f0fe;
  color: #4a6fa5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.month {
  display: block;
  font-size: 0.8rem;
}

.day {
  display: block;
  font-size: 0.8rem;
  font-weight: bold;
}

.year {
  font-size: 0.6rem;
  color: #888;
  margin-top: 0.25rem;
}

/* 内容区域 */
.content-area {
  margin-left: 50px;
  padding: 0;
}

.post-header {
  margin-bottom: 0.75rem;
}

.post-author {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.post-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #888;
}

.post-time,
.post-location {
  font-size: 0.75rem;
  color: #888;
}

.post-content {
  line-height: 1.6;
  color: #333;
  margin-bottom: 0.75rem;
}

.post-content p {
  margin: 0;
}

/* 媒体容器 */
.media-container {
  margin-top: 0.75rem;
  border-radius: 8px;
  overflow: hidden;
}

.media-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.media-video {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

/* 互动按钮 */
.post-actions {
  display: flex;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 0.75rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #555;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f5f5f5;
  border-color: #4a6fa5;
  color: #4a6fa5;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .self-travel-container {
    max-width: 100%;
  }
  
  .header {
    padding: 0.75rem 1rem;
  }
  
  .title {
    font-size: 1.1rem;
  }
  
  .user-info-card {
    padding: 1rem;
  }
  
  .avatar {
    width: 60px;
    height: 60px;
  }
  
  .stats {
    padding: 0.75rem;
  }
  
  .number {
    font-size: 1.1rem;
  }
  
  .tabs {
    top: 52px;
  }
  
  .tab-button {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
}
</style>