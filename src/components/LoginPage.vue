<template>
  <div class="login-container">
    <!-- 背景遮罩层，用于处理背景图和暗色效果 -->
    <div class="background-overlay"></div>
    
    <div class="login-box">
      <h2 class="title">{{ isRegister ? 'Registration' : 'Login' }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-item">
          <label>User Name</label>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="Please enter your username"
            required
          />
        </div>
        
        <div class="form-item">
          <label>Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Please enter the password"
            required
          />
        </div>
        
        <div class="form-item" v-if="isRegister">
          <label>Confirm Password</label>
          <input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="Please confirm the password"
            required
          />
        </div>
        
        <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>
        
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Login') }}
        </button>
      </form>
      
      <div class="switch-mode">
        <span @click="toggleMode">
          {{ isRegister ? 'Have an account? Login' : 'No account? Go to register' }}
        </span>
      </div>
      
      <div class="guest-access">
        <button @click="guestLogin" class="guest-btn">
          Tourist visit
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { indexedDBHelper, type UserInfo } from '../utils/indexDB'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const isRegister = ref(false)
    const errorMsg = ref('')
    const isLoading = ref(false)
    
    const form = reactive({
      username: '',
      password: '',
      confirmPassword: ''
    })

    const toggleMode = () => {
      isRegister.value = !isRegister.value
      errorMsg.value = ''
      form.password = ''
      form.confirmPassword = ''
    }

    const handleSubmit = async () => {
      errorMsg.value = ''
      isLoading.value = true
      
      try {
        // 注册逻辑
        if (isRegister.value) {
          // 密码一致性验证
          if (form.password !== form.confirmPassword) {
            errorMsg.value = 'The two password entries do not match'
            return
          }
          // 密码长度验证
          if (form.password.length < 6) {
            errorMsg.value = 'The password length should be at least 6 characters'
            return
          }
          
          // 检查用户名是否已存在
          const exists = await indexedDBHelper.usernameExists(form.username)
          if (exists) {
            errorMsg.value = 'The username already exists'
            return
          }
          
          // 创建用户对象
          const userInfo: UserInfo = {
            username: form.username,
            password: form.password,
            createTime: Date.now()
          }
          
          // 调用注册方法
          await indexedDBHelper.registerUser(userInfo)
          alert('Registration successful, please log in')
          toggleMode()
        } 
        // 登录逻辑
        else {
          // 调用验证方法
          const user = await indexedDBHelper.validateUser(form.username, form.password)
          
          // 保存当前用户信息到 localStorage
          localStorage.setItem('currentUser', JSON.stringify(user))
          
          // 跳转到主页面
          router.push('/TravelManager/TravelApp')
        }
      } catch (err: any) {
        errorMsg.value = err.message || 'Operation failed, please try again'
      } finally {
        isLoading.value = false
      }
    }

    const guestLogin = () => {
      const guestUser: UserInfo = {
        username: 'guest',
        password: '',
        createTime: Date.now(),
        isGuest: true
      }
      localStorage.setItem('currentUser', JSON.stringify(guestUser))
      router.push('/Travel/TravelApp')
    }

    return {
      isRegister,
      form,
      errorMsg,
      isLoading,
      toggleMode,
      handleSubmit,
      guestLogin
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  overflow-x: hidden; 
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5; 
  /* 确保容器本身没有奇怪的 padding 或 margin 影响宽度 */
  padding: 0;
  margin: 0;
}

/* 2. 背景图层：替代 background-attachment: fixed */
.background-overlay {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  /* 使用风景图片作为背景 */
  background: url('https://img0.baidu.com/it/u=2175486724,1309616907&fm=253&fmt=auto&app=138&f=JPEG?w=713&h=475') no-repeat center center;
  background-size: cover;
  background-position: center center; 
  /* 添加遮罩渐变，保证文字可读性 */
  filter: brightness(0.9);
}

/* 遮罩颜色层 */
.background-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(228, 229, 232, 0.4) 0%, rgba(139, 138, 139, 0.4) 100%);
  backdrop-filter: blur(3px); 
}

.login-box {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  width: 95%;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  text-align: center;
  color: #4a6cf7;
  margin-bottom: 30px;
  font-size: 26px;
  font-weight: 600;
  position: relative;
  margin-top: 0;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #4a6cf7, #6a11cb);
  border-radius: 3px;
}

.form-item {
  margin-bottom: 20px;
  width: 100%; /* 确保占满父容器 */
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-item input {
  width: 100%;
  padding: 12px 15px; /* 调整内边距 */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px; /* 防止 iOS 缩放 */
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  /* 关键修复：确保输入框不溢出 */
  box-sizing: border-box; 
}

.form-item input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
}

.error-msg {
  color: #ff6b6b;
  font-size: 13px;
  margin-bottom: 15px;
  text-align: center;
  padding: 8px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 6px;
  word-break: break-word; /* 防止长错误信息撑破布局 */
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #7eb6ff 0%, #4a90e2 100%);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  margin-top: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
  color: #4a6cf7;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 0;
}

.switch-mode span:hover {
  text-decoration: underline;
  color: #6a11cb;
}

.guest-access {
  margin-top: 25px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.guest-btn {
  padding: 10px 30px;
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  max-width: 200px;
}

.guest-btn:hover {
  background: #f5f7fa;
  color: #4a6cf7;
  border-color: #4a6cf7;
}

/* --- 响应式适配优化 --- */

/* 平板及小屏笔记本 */
@media (max-width: 768px) {
  .login-box {
    width: 100%;
  }
}

/* 手机竖屏 */
@media (max-width: 560px) {
  .login-container {
    align-items: flex-start; /* 防止键盘弹出时内容被遮挡严重 */
    padding-top: 10vh; /* 顶部留白 */
  }

  .login-box {
    width: 100%; /* 更宽的占比 */
    border-radius: 12px;
  }
  
  .title {
    font-size: 22px;
    margin-bottom: 25px;
  }
  
  .form-item input {
    padding: 10px 12px;
    font-size: 16px; /* 保持16px防止iOS自动缩放 */
  }
  
  .submit-btn {
    padding: 12px;
    font-size: 15px;
  }

  .guest-btn {
    max-width: 100%; /* 手机端按钮全宽 */
  }
}

/* 超小屏幕 (如 iPhone SE 第一代) */
@media (max-width: 480px) {
  .login-box {
    width: 95%;
  }
  
  .title {
    font-size: 20px;
  }
  
  .form-item label {
    font-size: 13px;
  }
}
</style>