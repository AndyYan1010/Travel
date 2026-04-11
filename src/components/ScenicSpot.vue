<template>
	<div class="scenic-spot-container">
		<!-- 页面标题栏 -->
		<header class="page-header">
			<h1 class="page-title">Attraction Reviews</h1>
		</header>

		<!-- 搜索栏 -->
		<div class="search-bar">
			<input
				v-model="searchQuery"
				type="text"
				placeholder="search for scenic spots..."
				class="search-input"
				@keyup.enter="handleSearch" />
			<button class="search-btn" @click="handleSearch">search</button>
		</div>

		<!-- 景点列表 -->
		<div class="scenic-list">
			<div
				v-for="spot in filteredSpots"
				:key="spot.id"
				class="scenic-item"
				@click="openReviewModal(spot)">
				<!-- 景点信息区域 -->
				<div class="spot-info">
					<!-- 景点图片 - 居左 -->
					<div class="spot-image-wrapper">
						<img :src="spot.image" alt="scenic spot image" class="spot-image" />
					</div>

					<!-- 景点详情 - 居中（自身左对齐） -->
					<div class="spot-details">
						<h3 class="spot-name">{{ spot.name }}</h3>
						<p class="spot-description">{{ spot.description }}</p>
					</div>

					<!-- 评分区域 - 居右 -->
					<div class="rating-section">
						<div class="rating-score">
							<span class="score">{{ spot.rating }}</span>
							<span class="reviews-count"
								>{{ spot.reviewsCount }}people rated</span
							>
						</div>
						<div class="stars">
							<span
								v-for="i in 5"
								:key="i"
								class="star"
								:class="{ filled: i <= Math.round(spot.rating / 2) }">
								★
							</span>
						</div>
					</div>
				</div>

				<!-- 用户评论 -->
				<div class="user-review">
					<p class="review-text">
						{{ spot.review || "click to add a review" }}
					</p>
				</div>
			</div>

			<!-- 无搜索结果提示 -->
			<div v-if="filteredSpots.length === 0" class="no-results">
				<p>No matching scenic spots were found.</p>
			</div>
		</div>

		<!-- 评价弹窗 -->
		<div v-if="showModal" class="modal-overlay" @click="closeModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h2>{{ currentSpot?.name }}</h2>
					<button class="close-btn" @click="closeModal">×</button>
				</div>

				<!-- 游客提示 -->
				<div v-if="isGuest" class="guest-notice">
					<p>🔒 Please login to add or modify reviews</p>
					<button @click="goToLogin" class="login-link-btn">Go to Login</button>
				</div>

				<div class="modal-body">
					<!-- 评分 -->
					<div class="rating-input">
						<label>Your rating：</label>
						<div class="star-rating">
							<span
								v-for="i in 5"
								:key="i"
								class="star"
								:class="{ filled: i <= tempRating }"
								@click="tempRating = i">
								★
							</span>
						</div>
						<span class="rating-value">{{ tempRating }}.0</span>
					</div>

					<!-- 评价内容 -->
					<div class="review-input">
						<label>review content：</label>
						<textarea
							v-model="tempReviewText"
							placeholder="Share your travel experiences..."
							rows="4"></textarea>
					</div>
				</div>

				<div class="modal-footer">
					<button class="cancel-btn" @click="closeModal">cancel</button>
					<button
						v-if="!isGuest"
						class="submit-btn"
						@click="submitReview"
						:disabled="isSubmitting">
						{{ isSubmitting ? "Saving..." : "save the review" }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { useRouter } from "vue-router";
import { defineComponent, reactive, ref, computed, onMounted } from "vue";
import {
	indexedDBHelper,
	type SpotReview,
	type UserInfo,
} from "../utils/indexDB";

interface ScenicSpot {
	id: string;
	image: string;
	name: string;
	description: string;
	rating: number;
	reviewsCount: number;
	review?: string;
}

export default defineComponent({
	name: "ScenicSpot",
	setup() {
		const router = useRouter();
		const searchQuery = ref("");
		const showModal = ref(false);
		const currentSpot = ref<ScenicSpot | null>(null);
		const tempRating = ref(5);
		const tempReviewText = ref("");
		const isSubmitting = ref(false);
		// 当前用户信息
		const currentUser = ref<UserInfo | null>(null);

		const scenicSpots = reactive<ScenicSpot[]>([
			{
				id: "spot_001",
				image:
					"https://pic.rmb.bdstatic.com/bjh/3ea15deaa2c/240821/b83ae2e3a69b82ca462699afc40d7b8c.jpeg",
				name: "Leshan Giant Buddha",
				description: "The Buddha is impressive. ",
				rating: 8.7,
				reviewsCount: 1025,
				review:
					"The Buddha is impressive. Initially was misled into the Buddhist scenic area, second visit was just a quick...",
			},
			{
				id: "spot_002",
				image:
					"https://pic.rmb.bdstatic.com/bjh/events/e8bb986688e29449e49710c47d1ddd608893.jpeg@h_1280",
				name: "Yangshuo Landscape",
				description:
					"Guilin scenery is the best under heaven, Yangshuo scenery is the best in Guilin",
				rating: 9.4,
				reviewsCount: 881,
				review:
					"I once crossed the Li River by raft in the wind and rain. The Nine Horse Fresco under the cloudy sky...",
			},
			{
				id: "spot_003",
				image:
					"https://q0.itc.cn/images01/20250828/5e25c3d2a1d4492996d902dd119df9e8.jpeg",
				name: "Xian City Wall",
				description:
					"Nice place. Rent a bike on the Yongning Gate tower and ride around",
				rating: 8.8,
				reviewsCount: 858,
				review:
					"Nice place. Rent a bike on the Yongning Gate tower and ride around",
			},
			{
				id: "spot_004",
				image:
					"https://qcloud.dpfile.com/pc/-i3NzFFrRUf7N-GPZa-D6pBgqMOH7cEi5TK6fMzRkmeXTyzltWS0cMQz64oljHcX.jpg",
				name: "Old Summer Palace",
				description:
					"Large imperial garden of Qing Dynasty China, not only gathering...",
				rating: 9.5,
				reviewsCount: 850,
				review: "Guess how many stars I had before being burned down",
			},
		]);

		// 检查用户登录状态
		const checkUserLogin = () => {
			const userStr = localStorage.getItem("currentUser");
			if (userStr) {
				currentUser.value = JSON.parse(userStr);
			}
		};

		// 判断是否为游客
		const isGuest = computed(() => {
			if (!currentUser.value) {
				return true; // 未登录视为游客
			}
			return currentUser.value.isGuest ?? false;
		});

		// 初始化 IndexDB 并加载评价
		onMounted(async () => {
			try {
				// 检查登录状态
				checkUserLogin();
				// 监听存储变化（处理登录/登出）
				window.addEventListener("storage", checkUserLogin);

				await indexedDBHelper.init();
				await loadUserReviews();
			} catch (error) {
				console.error("IndexDB initialization failed:", error);
			}
		});

		// 加载用户评价
		const loadUserReviews = async () => {
			try {
				const allReviews = await indexedDBHelper.getAllReviews();
				allReviews.forEach((review) => {
					const spot = scenicSpots.find((s) => s.id === review.spotId);
					if (spot) {
						spot.review = review.reviewText;
						spot.rating = review.rating * 2; // 转换为 10 分制
					}
				});
			} catch (error) {
				console.error("Failed to save reviews:", error);
			}
		};

		const handleSearch = () => {
			console.log("Search keywords:", searchQuery.value);
		};

		const filteredSpots = computed(() => {
			if (!searchQuery.value.trim()) {
				return scenicSpots;
			}
			return scenicSpots.filter((spot) =>
				spot.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
			);
		});

		// 打开评价弹窗
		const openReviewModal = async (spot: ScenicSpot) => {
			// 检查是否为游客
			if (isGuest.value) {
				alert("Please login to add or modify reviews");
				// 可跳转到登录页
				router.push('/');
				return;
			}
			currentSpot.value = spot;
			tempReviewText.value = spot.review || "";
			tempRating.value = Math.round(spot.rating / 2) || 5;
			showModal.value = true;
		};

		// 关闭弹窗
		const closeModal = () => {
			showModal.value = false;
			currentSpot.value = null;
			tempRating.value = 5;
			tempReviewText.value = "";
		};

		// 提交评价
		const submitReview = async () => {
			if (!currentSpot.value) return;
			// 再次验证登录状态
			if (isGuest.value) {
				alert("Please login to submit reviews");
				closeModal();
				return;
			}
			isSubmitting.value = true;
			try {
				const review: SpotReview = {
					spotId: currentSpot.value.id,
					spotName: currentSpot.value.name,
					rating: tempRating.value,
					reviewText: tempReviewText.value,
					createdAt: Date.now(),
				};

				await indexedDBHelper.saveReview(review);

				// 更新本地数据
				const spot = scenicSpots.find((s) => s.id === currentSpot.value!.id);
				if (spot) {
					spot.review = tempReviewText.value;
					spot.rating = tempRating.value * 2;
				}

				closeModal();
				alert("Review saved successfully!");
			} catch (error) {
				console.error("Save failed:", error);
				alert("Save failed, please try again");
			} finally {
				isSubmitting.value = false;
			}
		};

		const goToLogin = () => {
			closeModal();
			router.push("/");
		};

		return {
			searchQuery,
			scenicSpots,
			filteredSpots,
			handleSearch,
			showModal,
			currentSpot,
			tempRating,
			tempReviewText,
			isSubmitting,
			currentUser,
			isGuest,
			openReviewModal,
			closeModal,
			submitReview,
			goToLogin,
		};
	},
});
</script>

<style scoped>
/* ========== 原有样式保持不变 ========== */
.scenic-spot-container {
	font-family:
		-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
		Arial, sans-serif;
	color: #333;
	width: 100%;
	margin: 0 auto;
	background-color: #f9f9f9;
	min-height: 100vh;
	box-sizing: border-box;
}

.page-header {
	background: linear-gradient(135deg, #4a6fa5 0%, #6b8fc7 100%);
	color: white;
	padding: 1rem 1.5rem;
	position: sticky;
	top: 0;
	z-index: 100;
	width: 100%;
	box-sizing: border-box;
}

.page-title {
	margin: 0;
	font-size: 1.25rem;
	font-weight: 600;
}

.search-bar {
	display: flex;
	gap: 0.5rem;
	margin: 1rem;
	padding: 0.5rem;
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	width: calc(100% - 2rem);
	box-sizing: border-box;
}

.search-input {
	flex: 1;
	min-width: 0;
	padding: 0.75rem;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 0.9rem;
	outline: none;
	width: 100%;
	box-sizing: border-box;
}

.search-input:focus {
	border-color: #4a6fa5;
	box-shadow: 0 0 0 2px rgba(74, 107, 165, 0.2);
}

.search-btn {
	padding: 0.75rem 1.25rem;
	background-color: #4a6fa5;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.9rem;
	transition: background-color 0.2s;
	flex-shrink: 0;
	white-space: nowrap;
}

.search-btn:hover {
	background-color: #3a5a8a;
}

.scenic-list {
	padding: 0 1rem 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
	min-width: 1000px;
	box-sizing: border-box;
}

.scenic-item {
	background-color: white;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	transition: transform 0.2s;
	width: 100%;
	box-sizing: border-box;
	cursor: pointer;
}

.scenic-item:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.spot-info {
	display: flex;
	padding: 1rem;
	gap: 1rem;
	width: 100%;
	box-sizing: border-box;
}

.spot-image-wrapper {
	flex-shrink: 0;
	width: 100px;
}

.spot-image {
	width: 100px;
	height: 100px;
	object-fit: cover;
	border-radius: 8px;
	display: block;
}

.spot-details {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	text-align: left;
}

.spot-name {
	margin: 0;
	font-size: 1.1rem;
	font-weight: 600;
	color: #1a1a1a;
}

.spot-description {
	margin: 0.25rem 0 0 0;
	color: #666;
	font-size: 0.85rem;
	line-height: 1.4;
	display: -webkit-box;
	/* -webkit-line-clamp: 2; */
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.rating-section {
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	justify-content: center;
	gap: 0.5rem;
	min-width: 80px;
}

.rating-score {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.score {
	font-size: 1.5rem;
	font-weight: 700;
	color: #4a6fa5;
}

.reviews-count {
	font-size: 0.75rem;
	color: #888;
}

.stars {
	display: flex;
	gap: 0.25rem;
}

.star {
	font-size: 1.2rem;
	color: #ddd;
	transition: color 0.2s;
}

.star.filled {
	color: #4a6fa5;
}

.user-review {
	padding: 0.75rem 1rem;
	background-color: #fff8e6;
	border-top: 1px solid #ffeaa7;
	width: 100%;
	box-sizing: border-box;
}

.review-text {
	margin: 0;
	color: #996633;
	font-size: 0.9rem;
	line-height: 1.5;
}

.no-results {
	text-align: center;
	padding: 3rem 2rem;
	color: #888;
	font-size: 1rem;
	width: 100%;
	box-sizing: border-box;
	background-color: white;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* ========== 评价弹窗样式 ========== */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 1rem;
}

.modal-content {
	background: white;
	border-radius: 12px;
	width: 100%;
	max-width: 500px;
	max-height: 90vh;
	overflow-y: auto;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 1.5rem;
	border-bottom: 1px solid #eee;
}

.modal-header h2 {
	margin: 0;
	font-size: 1.25rem;
	color: #333;
}

.close-btn {
	background: none;
	border: none;
	font-size: 1.5rem;
	color: #999;
	cursor: pointer;
	padding: 0;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: background-color 0.2s;
}

.close-btn:hover {
	background-color: #f5f5f5;
	color: #333;
}

.modal-body {
	padding: 1.5rem;
}

.rating-input {
	margin-bottom: 1.5rem;
}

.rating-input label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: 600;
	color: #333;
}

.star-rating {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.star-rating .star {
	font-size: 2rem;
	cursor: pointer;
	transition: transform 0.2s;
}

.star-rating .star:hover {
	transform: scale(1.2);
}

.star-rating .star.filled {
	color: #4a6fa5;
}

.rating-value {
	margin-left: 1rem;
	font-size: 1.25rem;
	font-weight: 700;
	color: #4a6fa5;
}

.review-input {
	margin-bottom: 1rem;
}

.review-input label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: 600;
	color: #333;
}

.review-input textarea {
	width: 100%;
	padding: 0.75rem;
	border: 1px solid #ddd;
	border-radius: 8px;
	font-size: 0.9rem;
	font-family: inherit;
	resize: vertical;
	box-sizing: border-box;
	outline: none;
	transition: border-color 0.2s;
}

.review-input textarea:focus {
	border-color: #4a6fa5;
	box-shadow: 0 0 0 2px rgba(74, 107, 165, 0.2);
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
	padding: 1rem 1.5rem;
	border-top: 1px solid #eee;
	background-color: #f9f9f9;
	border-radius: 0 0 12px 12px;
}

.cancel-btn {
	padding: 0.75rem 1.5rem;
	background-color: white;
	color: #666;
	border: 1px solid #ddd;
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.9rem;
	transition: all 0.2s;
}

.cancel-btn:hover {
	background-color: #f5f5f5;
	border-color: #ccc;
}

.submit-btn {
	padding: 0.75rem 1.5rem;
	background-color: #4a6fa5;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.9rem;
	transition: background-color 0.2s;
}

.submit-btn:hover {
	background-color: #3a5a8a;
}

.submit-btn:disabled {
	background-color: #ccc;
	cursor: not-allowed;
}

/* 游客提示样式 */
.guest-notice {
	padding: 2rem;
	text-align: center;
	color: #666;
}

.guest-notice p {
	margin-bottom: 1rem;
	font-size: 1rem;
}

.login-link-btn {
	padding: 0.75rem 1.5rem;
	background-color: #4a6fa5;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.9rem;
	transition: background-color 0.2s;
}

.login-link-btn:hover {
	background-color: #3a5a8a;
}

/* ========== 响应式适配 ========== */
@media (max-width: 480px) {
	.scenic-spot-container {
		max-width: 100%;
	}

	.page-header {
		padding: 0.75rem 1rem;
	}

	.page-title {
		font-size: 1.1rem;
	}

	.search-bar {
		margin: 0.75rem;
		width: calc(100% - 1.5rem);
		flex-direction: column;
		gap: 0.25rem;
	}

	.scenic-list {
		padding: 0 0.75rem 0.75rem;
		min-width: 400px;
	}

	.spot-info {
		flex-direction: column;
		gap: 0.75rem;
	}

	.spot-image-wrapper {
		width: 100%;
	}

	.spot-image {
		width: 100%;
		height: 150px;
	}

	.rating-section {
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		width: 100%;
	}

	.rating-score {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.score {
		font-size: 1.2rem;
	}

	.modal-content {
		max-height: 85vh;
	}

	.modal-footer {
		flex-direction: column;
	}

	.cancel-btn,
	.submit-btn {
		width: 100%;
	}
}
</style>
