<template>
	<div class="travel-app" :class="{ 'dark-mode': darkMode }">
		<header class="app-header">
			<div class="header-content">
				<div class="logo">
					<span class="logo-icon">🏔️</span>
					<span>Travel Tracker</span>
				</div>
				<nav class="nav-menu">
					<div class="theme-toggle" @click="toggleTheme">
						<span :class="['theme-icon', darkMode ? 'sun-icon' : 'moon-icon']">
							{{ darkMode ? "☀️" : "🌙" }}
						</span>
					</div>
					<div class="menu-toggle" @click="toggleMenu" v-if="isMobile">
						<span :class="['hamburger', { active: menuOpen }]"></span>
					</div>
					<ul :class="['nav-list', { 'mobile-open': menuOpen }]">
						<li><a href="#home" @click="closeMenu">Home</a></li>
						<li><a href="#features" @click="closeMenu">Features</a></li>
					</ul>
				</nav>
			</div>
		</header>

		<main>
			<section class="hero" id="home">
				<div class="hero-content">
					<h1>Explore the Beauty of the World</h1>
					<p>
						A simple travel management platform that makes every trip an
						unforgettable memory. Discover beautiful scenery, plan your
						itinerary, and enjoy your journey.
					</p>
					<div class="btn-container">
						<button class="btn primary-btn" @click="startExploring">
							Start Exploring
						</button>
						<button class="btn outline-btn" @click="viewDestinations">
							View Destinations
						</button>
					</div>
				</div>
			</section>

			<div class="container">
				<div class="stats">
					<div
						class="stat-item"
						v-for="(stat, index) in statsData"
						:key="index">
						<span class="stat-number">{{ stat.number }}</span>
						<span class="stat-label">{{ stat.label }}</span>
					</div>
				</div>

				<section id="features">
					<div class="section-title">
						<h2>Core Features</h2>
					</div>
					<div class="features">
						<div
							class="feature-card"
							v-for="(feature, index) in featuresData"
							:key="index"
							@mouseover="hoveredCard = index"
							@mouseleave="hoveredCard = -1"
							@click="exploringFun(feature)">
							<div class="feature-icon">{{ feature.icon }}</div>
							<h3>{{ feature.title }}</h3>
							<p>{{ feature.description }}</p>
						</div>
					</div>
				</section>
			</div>
		</main>

		<footer>
			<div class="footer-content">
				<div class="footer-links">
					<a
						href="#"
						v-for="(link, index) in footerLinks"
						:key="index"
						@click="closeMenu"
						>{{ link.text }}</a
					>
				</div>
				<p class="copyright">
					© 2026 Travel Tracker. All rights reserved. Make every trip a
					beautiful memory
				</p>
			</div>
		</footer>
	</div>
</template>

<!-- 初始数据、方法 -->
<script>
import { useRouter } from "vue-router";
import router from "../router";

export default {
	name: "TravelManagementApp",
	data() {
		return {
			hoveredCard: -1,
			menuOpen: false,
			isMobile: false,
			darkMode: false,
			statsData: [
				{ number: "500+", label: "Global Destinations" },
				{ number: "10K+", label: "Satisfied Users" },
				{ number: "24/7", label: "24/7 Service" },
				{ number: "100%", label: "Security Guarantee" },
			],
			featuresData: [
				{
					number: 0,
					icon: "🗺️",
					title: "Trip Planning",
					description:
						"Plan your itinerary based on your preferences and time, set your route, and discover hidden gems",
				},
				{
					number: 1,
					icon: "📱",
					title: "Attraction Rating",
					description:
						"Rate attractions based on your experience and feelings, helping more people learn about the scenery along the way",
				},
			],
			footerLinks: [
				{ text: "About Us" },
				{ text: "Privacy Policy" },
				{ text: "Terms of Service" },
				{ text: "Help Center" },
				{ text: "Contact Us" },
			],
		};
	},
	mounted() {
		this.checkDevice();
		this.initTheme();
		this.initPWA();
		this.addScrollAnimations();
		window.addEventListener("resize", this.checkDevice);
	},
	beforeUnmount() {
		window.removeEventListener("resize", this.checkDevice);
	},

	// 方法
	methods: {
		checkDevice() {
			this.isMobile = window.innerWidth <= 768;
		},

		initTheme() {
			// 检查系统主题偏好
			if (
				window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
			) {
				this.darkMode = true;
			} else {
				// 检查本地存储的主题设置
				const savedTheme = localStorage.getItem("theme");
				if (savedTheme === "dark") {
					this.darkMode = true;
				} else if (savedTheme === "light") {
					this.darkMode = false;
				}
			}
			this.applyTheme();
		},

		toggleTheme() {
			this.darkMode = !this.darkMode;
			this.applyTheme();
			localStorage.setItem("theme", this.darkMode ? "dark" : "light");
		},

		applyTheme() {
			if (this.darkMode) {
				document.documentElement.classList.add("dark-mode");
				document.body.classList.add("dark-mode");
			} else {
				document.documentElement.classList.remove("dark-mode");
				document.body.classList.remove("dark-mode");
			}
		},

		toggleMenu() {
			this.menuOpen = !this.menuOpen;
		},

		closeMenu() {
			this.menuOpen = false;
		},

		initPWA() {
			let deferredPrompt;

			window.addEventListener("beforeinstallprompt", (e) => {
				e.preventDefault();
				deferredPrompt = e;
				this.showInstallButton(deferredPrompt);
			});

			window.addEventListener("appinstalled", () => {
				console.log("The app has been installed!");
			});
		},

		showInstallButton(deferredPrompt) {
			console.log("PWA installaton prompt is available!");
		},

		addScrollAnimations() {
			const observerOptions = {
				root: null,
				rootMargin: "0px",
				threshold: 0.1,
			};

			const observer = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("animate-in");
					}
				});
			}, observerOptions);

			// 应用动画到元素
			this.$nextTick(() => {
				document
					.querySelectorAll(".feature-card, .stat-item")
					.forEach((card) => {
						card.classList.add("animate-out");
						observer.observe(card);
					});
			});
		},
		startExploring() {
			console.log("Start Exploring button clicked");
			// 实现开始探索功能
			const featuresSection = document.getElementById("features");
			if (featuresSection) {
				featuresSection.scrollIntoView({ behavior: "smooth" });
			}
		},

		viewDestinations() {
			console.log("View Destinations button clicked");
			// 实现查看目的地功能
		},

		exploringFun(feature) {
			console.log("Feature list button clicked");
			if (feature.number === 0) {
				// 未登录或游客用户，提示登录
				const loginStatus = this.checkLoginStatus();
				if (!loginStatus.isLoggedIn || loginStatus.isGuest) {
					alert("Please login");
				} else {
          console.log("Plan itinerary");
				//规划行程
				  router.push("/Travel/TravelManager");
        }
			} else if (feature.number === 1) {
				//景点评分
				// this.scoreScenicSpot();
				//router.push('/SelfTravel')
				router.push("/Travel/ScenicSpot").then(() => {
        console.log("导航成功");
      })
      .catch(err => {
        console.error("导航失败:", err);
        // Vue Router 3.x/4.x 常见错误：NavigationDuplicated
        if (err.name !== 'NavigationDuplicated') {
          alert("页面跳转失败，请重试");
        }
      });
			}
		},
		planTrip() {
			console.log("Plan trip functionality");
			// toast提示
		},
		scoreScenicSpot() {
			console.log("Attraction rating functionality");
			// 功能
		},

		// 检查用户登录状态
		checkLoginStatus() {
			const currentUser = localStorage.getItem("currentUser");
			if (!currentUser) {
				return { isLoggedIn: false, isGuest: false };
			}

			const user = JSON.parse(currentUser);
			return {
				isLoggedIn: true,
				isGuest: user.isGuest || false,
				userInfo: user,
			};
		},
	},
};
</script>

<!-- 样式 -->
<style scoped>
:root {
	--primary-color: #4a6cf7;
	--secondary-color: #6a11cb;
	--accent-color: #ff6b6b;
	--light-bg: #f8f9fa;
	--dark-text: #333;
	--light-text: #f8f9fa;
	--card-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
	--transition: all 0.3s ease;
	--bg-color: #ffffff;
	--text-color: #333333;
	--header-bg: rgba(9, 9, 9, 0.95);
	--card-bg: rgba(255, 255, 255, 0.95);
	--footer-bg: #333333;
	--border-color: #e0e0e0;
	--hero-gradient-start: rgba(74, 108, 247, 0.85);
	--hero-gradient-end: rgba(106, 17, 203, 0.85);
	--stat-bg: rgba(255, 255, 255, 0.95);
	--cta-bg: rgba(255, 255, 255, 0.95);
}

.dark-mode {
	--bg-color: #121212;
	--text-color: #f0f0f0;
	--header-bg: rgba(30, 30, 30, 0.95);
	--card-bg: rgba(40, 40, 40, 0.95);
	--footer-bg: #1e1e1e;
	--border-color: #444444;
	--hero-gradient-start: rgba(30, 30, 50, 0.95);
	--hero-gradient-end: rgba(40, 20, 60, 0.95);
	--stat-bg: rgba(40, 40, 40, 0.95);
	--cta-bg: rgba(40, 40, 40, 0.95);
}

.travel-app {
	font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
	background-color: var(--bg-color);
	color: var(--text-color);
	line-height: 1.6;
	min-height: 100vh;
	transition:
		background-color 0.3s ease,
		color 0.3s ease;
}

.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
}

.app-header {
	background-color: var(--header-bg);
	backdrop-filter: blur(10px);
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	padding: 20px 0;
	position: sticky;
	top: 0;
	z-index: 100;
	transition: background-color 0.3s ease;
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.logo {
	font-size: 24px;
	font-weight: bold;
	color: var(--primary-color);
	display: flex;
	align-items: center;
}

.logo-icon {
	margin-right: 10px;
	width: 32px;
	height: 32px;
	background: var(--primary-color);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
}

.nav-menu {
	display: flex;
	align-items: center;
}

.theme-toggle {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.1);
	margin-right: 15px;
	cursor: pointer;
	transition: var(--transition);
}

.theme-toggle:hover {
	background: rgba(0, 0, 0, 0.2);
}

.dark-mode .theme-toggle {
	background: rgba(255, 255, 255, 0.1);
}

.dark-mode .theme-toggle:hover {
	background: rgba(255, 255, 255, 0.2);
}

.theme-icon {
	font-size: 1.2rem;
}

.menu-toggle {
	display: none;
	flex-direction: column;
	cursor: pointer;
	padding: 5px;
}

.hamburger {
	width: 25px;
	height: 3px;
	background-color: var(--text-color);
	margin: 3px 0;
	transition: 0.3s;
	border-radius: 3px;
}

.hamburger.active:nth-child(1) {
	transform: rotate(-45deg) translate(-5px, 6px);
}

.hamburger.active:nth-child(2) {
	opacity: 0;
}

.hamburger.active:nth-child(3) {
	transform: rotate(45deg) translate(-5px, -6px);
}

nav ul {
	display: flex;
	list-style: none;
}

nav li {
	margin-left: 30px;
}

nav a {
	text-decoration: none;
	color: var(--text-color);
	font-weight: 500;
	transition: var(--transition);
	position: relative;
	padding: 8px 0;
}

nav a:hover {
	color: var(--primary-color);
}

nav a::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 0;
	width: 0;
	height: 2px;
	background: var(--primary-color);
	transition: var(--transition);
}

nav a:hover::after {
	width: 100%;
}

.hero {
	background: url("https://img0.baidu.com/it/u=2175486724,1309616907&fm=253&fmt=auto&app=138&f=JPEG?w=713&h=475");
	background-size: cover;
	background-position: center;
	color: var(--light-text);
	padding: 120px 0;
	text-align: center;
	margin-bottom: 40px;
	border-radius: 10px;
	position: relative;
	overflow: hidden;
}

.hero::before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-image:
		radial-gradient(
			circle at 10% 20%,
			rgba(255, 255, 255, 0.1) 0%,
			transparent 20%
		),
		radial-gradient(
			circle at 90% 80%,
			rgba(255, 255, 255, 0.1) 0%,
			transparent 20%
		);
}

.hero-content {
	position: relative;
	z-index: 1;
	padding: 0 20px;
}

.hero h1 {
	font-size: 3.5rem;
	margin-bottom: 20px;
	text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero p {
	font-size: 1.3rem;
	max-width: 700px;
	margin: 0 auto 30px;
	opacity: 0.95;
}

.btn {
	padding: 14px 35px;
	border-radius: 30px;
	font-size: 1.1rem;
	cursor: pointer;
	transition: var(--transition);
	text-decoration: none;
	display: inline-block;
	font-weight: 600;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	border: none;
	margin: 5px;
}

.primary-btn {
	background-color: white;
	color: var(--primary-color);
}

.primary-btn:hover {
	transform: translateY(-3px);
	box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
}

.outline-btn {
	background: transparent;
	border: 2px solid white;
	color: white;
}

.outline-btn:hover {
	background: white;
	color: var(--primary-color);
}

.btn-container {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 15px;
}

.section-title {
	text-align: center;
	margin-bottom: 50px;
	position: relative;
}

.section-title h2 {
	font-size: 2.5rem;
	color: var(--text-color);
	display: inline-block;
	margin-bottom: 15px;
}

.section-title h2::after {
	content: "";
	position: absolute;
	bottom: -10px;
	left: 50%;
	transform: translateX(-50%);
	width: 60px;
	height: 3px;
	background: var(--primary-color);
	border-radius: 3px;
}

.features {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 30px;
	margin-bottom: 60px;
}

.feature-card {
	background: var(--card-bg);
	backdrop-filter: blur(10px);
	border-radius: 10px;
	padding: 30px;
	box-shadow: var(--card-shadow);
	transition: var(--transition);
	text-align: center;
	min-height: 280px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
}

.feature-card:hover {
	transform: translateY(-10px);
	box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
	font-size: 3rem;
	color: var(--primary-color);
	margin-bottom: 20px;
	width: 80px;
	height: 80px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 20px;
	background: rgba(74, 108, 247, 0.1);
	border-radius: 50%;
}

.feature-card h3 {
	font-size: 1.5rem;
	margin-bottom: 15px;
	color: var(--text-color);
}

.feature-card p {
	color: #666;
	flex-grow: 1;
	display: flex;
	align-items: center;
}

.dark-mode .feature-card p {
	color: #aaa;
}

.stats {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 20px;
	margin-bottom: 60px;
}

.stat-item {
	background: var(--stat-bg);
	backdrop-filter: blur(10px);
	padding: 30px 15px;
	border-radius: 10px;
	text-align: center;
	box-shadow: var(--card-shadow);
	border: 1px solid var(--border-color);
}

.stat-number {
	font-size: 2rem;
	font-weight: bold;
	color: var(--primary-color);
	display: block;
	margin-bottom: 10px;
}

.stat-label {
	color: #666;
	font-size: 0.9rem;
}

.dark-mode .stat-label {
	color: #aaa;
}

footer {
	background: var(--footer-bg);
	color: var(--light-text);
	padding: 40px 0 20px;
	text-align: center;
}

.footer-content {
	max-width: 1200px;
	margin: 0 auto;
	padding: 0 20px;
}

.footer-links {
	display: flex;
	justify-content: center;
	margin-bottom: 20px;
	flex-wrap: wrap;
}

.footer-links a {
	color: var(--light-text);
	margin: 0 10px;
	text-decoration: none;
	transition: var(--transition);
	padding: 5px 10px;
	border-radius: 5px;
	font-size: 0.9rem;
}

.footer-links a:hover {
	color: var(--primary-color);
	background: rgba(255, 255, 255, 0.1);
}

.copyright {
	color: #aaa;
	font-size: 0.8rem;
}

/* 动画类 */
.animate-out {
	opacity: 0;
	transform: translateY(20px);
	transition:
		opacity 0.5s ease,
		transform 0.5s ease;
}

.animate-in {
	opacity: 1;
	transform: translateY(0);
}

/* 移动端样式 */
@media (max-width: 768px) {
	.theme-toggle {
		margin-right: 10px;
	}

	.menu-toggle {
		display: flex;
	}

	.nav-list {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--header-bg);
		backdrop-filter: blur(10px);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
		flex-direction: column;
		align-items: center;
		padding: 20px 0;
		clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
		transition: clip-path 0.4s ease;
	}

	.nav-list.mobile-open {
		clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
	}

	.nav-list li {
		margin: 10px 0;
	}

	.header-content {
		flex-wrap: wrap;
	}

	.logo {
		order: 1;
		font-size: 20px;
	}

	nav {
		order: 2;
		width: 100%;
		margin-top: 10px;
	}

	.hero {
		padding: 80px 0;
	}

	.hero h1 {
		font-size: 2.5rem;
	}

	.hero p {
		font-size: 1.1rem;
	}

	.section-title h2 {
		font-size: 2rem;
	}

	.btn-container {
		flex-direction: column;
		align-items: center;
	}

	.outline-btn {
		margin-top: 10px;
		margin-left: 0;
	}

	.features {
		grid-template-columns: 1fr;
	}

	.stats {
		grid-template-columns: repeat(2, 1fr);
	}

	.footer-links {
		flex-direction: column;
		gap: 10px;
	}

	.footer-links a {
		margin: 5px 0;
	}
}

@media (max-width: 480px) {
	.hero h1 {
		font-size: 2rem;
	}

	.hero p {
		font-size: 1rem;
	}

	.section-title h2 {
		font-size: 1.8rem;
	}

	.stat-item {
		padding: 20px 10px;
	}

	.stat-number {
		font-size: 1.6rem;
	}

	.feature-card {
		min-height: auto;
		padding: 20px;
	}

	.feature-icon {
		width: 60px;
		height: 60px;
		font-size: 2rem;
	}
}
</style>
