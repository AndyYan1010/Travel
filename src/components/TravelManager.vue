<template>
	<div class="tour-management">
		<header class="main-header">
			<div>
				<h1>Travel Planner</h1>
				<p>Record every beautiful moment</p>
			</div>
			<div class="user-info" v-if="currentUser">
				<span class="username">👤 {{ currentUser.username }}</span>
				<span class="user-type" :class="{ guest: currentUser.isGuest }">
					{{ currentUser.isGuest ? "Tourist" : "Registered User" }}
				</span>
				<button @click="logout" class="btn btn-logout">Log out</button>
			</div>
		</header>

		<!-- 悬浮统计栏 -->
		<div class="floating-stats">
			<div class="stats-container">
				<div class="stat-card">
					<div class="stat-number">{{ itineraries.length }}</div>
					<div class="stat-label">Total Itineraries</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{{ totalAttractions }}</div>
					<div class="stat-label">Attractions</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{{ totalPhotos }}</div>
					<div class="stat-label">Photos</div>
				</div>
				<div class="stat-card">
					<div class="stat-number">{{ totalNotes }}</div>
					<div class="stat-label">Travel Notes</div>
				</div>
			</div>
		</div>

		<main class="main-content">
			<!-- 搜索和筛选 -->
			<div class="search-filters">
				<div class="filter-section">
					<input
						v-model="searchTerm"
						placeholder="Search destinations..."
						class="input-field search-input" />
					<select v-model="statusFilter" class="input-field filter-select">
						<option value="">All Status</option>
						<option value="upcoming">Upcoming</option>
						<option value="ongoing">Ongoing</option>
						<option value="completed">Completed</option>
					</select>
				</div>
				<div class="controls">
					<button @click="openCreateItineraryModal" class="btn btn-primary">
						+ Create New Itinerary
					</button>
				</div>
			</div>

			<!-- 行程列表 - 横条样式 -->
			<div class="itinerary-list">
				<!-- 空状态提示 -->
				<div v-if="filteredItineraries.length === 0" class="empty-state">
					<div class="empty-icon">📭</div>
					<p>No matching itineraries found</p>
				</div>
				<div
					v-for="itinerary in filteredItineraries"
					:key="itinerary.id"
					class="itinerary-row"
					@click="viewItineraryDetails(itinerary)">
					<div class="row-content">
						<div class="itinerary-title">{{ itinerary.title }}</div>
						<div class="itinerary-date">
							{{ formatDate(itinerary.startDate) }} -
							{{ formatDate(itinerary.endDate) }}
						</div>
						<div class="itinerary-location">{{ itinerary.destination }}</div>
						<div
							class="itinerary-status"
							:class="getItineraryStatusClass(itinerary)">
							{{ getItineraryStatusText(itinerary) }}
						</div>
						<div class="itinerary-actions">
							<button
								@click.stop="editItinerary(itinerary)"
								class="btn btn-icon">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2">
									<path
										d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
									<path
										d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
								</svg>
							</button>
							<button
								@click.stop="deleteItinerary(itinerary.id)"
								class="btn btn-icon">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2">
									<path d="M3 6h18"></path>
									<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
									<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- 分页控件 - 始终显示 -->
			<div class="pagination">
				<button
					@click="prevPage"
					:disabled="currentPage === 1"
					class="btn btn-pagination">
					‹ Previous
				</button>
				<span class="page-info"
					>Page {{ currentPage }} ，of {{ totalPages }}
				</span>
				<button
					@click="nextPage"
					:disabled="currentPage === totalPages"
					class="btn btn-pagination">
					Next ›
				</button>
			</div>
		</main>

		<!-- 创建/编辑行程模态框 -->
		<div
			v-if="showItineraryModal"
			class="modal-overlay"
			@click="closeItineraryModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>
						{{ editingItinerary ? "Edit Itinerary" : "Create New Itinerary" }}
					</h3>
					<button @click="closeItineraryModal" class="close-btn">×</button>
				</div>
				<div class="form-section">
					<input
						v-model="newItinerary.title"
						placeholder="Itinerary Name"
						class="input-field" />
					<input
						v-model="newItinerary.destination"
						placeholder="Destination"
						class="input-field" />
					<div class="date-group">
						<input
							v-model="newItinerary.startDate"
							type="date"
							class="input-field" />
						<span class="date-separator">to</span>
						<input
							v-model="newItinerary.endDate"
							type="date"
							class="input-field" />
					</div>
					<textarea
						v-model="newItinerary.notes"
						placeholder="Notes"
						class="input-field"></textarea>
				</div>
				<div class="modal-actions">
					<button @click="saveItinerary" class="btn btn-primary">Save</button>
					<button @click="closeItineraryModal" class="btn btn-secondary">
						Cancel
					</button>
				</div>
			</div>
		</div>

		<!-- 查看行程详情模态框 -->
		<div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
			<div class="modal-content detail-modal" @click.stop>
				<div class="detail-header">
					<div>
						<h3>{{ currentItinerary?.title }}</h3>
						<div class="itinerary-dates">
							{{ formatDate(currentItinerary?.startDate) }} -
							{{ formatDate(currentItinerary?.endDate) }}
						</div>
						<div class="itinerary-destination">
							Destination: {{ currentItinerary?.destination }}
						</div>
					</div>
					<button @click="closeDetailModal" class="close-btn">×</button>
				</div>
				<p class="itinerary-notes">
					<strong>notes：</strong>{{ currentItinerary?.notes || "No notes" }}
				</p>

				<!-- 添加景点表单 -->
				<div class="sub-form">
					<button @click="openAttractionModal" class="btn btn-secondary">
						📍 Add Attraction
					</button>
					<!-- 添加旅行笔记表单 -->
					<button @click="openNoteModal" class="btn btn-secondary">
						📝 Add Note
					</button>
				</div>

				<!-- 景点列表 -->
				<div class="attractions-list">
					<h4>Attractions List</h4>

					<div class="table-container">
						<table class="attraction-table">
							<thead>
								<tr>
									<th>Attraction Name</th>
									<th>Location</th>
									<th>Status</th>
									<th>Photos</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="attraction in attractionsByCurrentItinerary"
									:key="attraction.id"
									class="attraction-row">
									<td>{{ attraction.name }}</td>
									<td>{{ attraction.location }}</td>
									<td>
										<span
											@click="toggleAttractionStatus(attraction.id)"
											:class="[
												'status-tag',
												attraction.visited ? 'visited' : 'not-visited',
											]">
											{{ attraction.visited ? "Visited" : "Not visited" }}
										</span>
									</td>
									<td class="photo-cell">
										<span
											class="photo-count"
											@click="openPhotoGallery(attraction.id)"
											:class="{
												'has-photos':
													getPhotosByAttraction(attraction.id).length > 0,
											}">
											{{ getPhotosByAttraction(attraction.id).length }}photos
										</span>
										<button
											@click="openPhotoModal(attraction.id)"
											class="btn btn-icon btn-add-photo-icon"
											title="Add photo">
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2">
												<line x1="12" y1="5" x2="12" y2="19"></line>
												<line x1="5" y1="12" x2="19" y2="12"></line>
											</svg>
										</button>
									</td>
									<td class="action-cell">
										<div class="action-buttons">
											<button
												@click="editAttraction(attraction)"
												class="btn btn-icon"
												title="Edit">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2">
													<path
														d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
													<path
														d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
												</svg>
											</button>
											<button
												@click="deleteAttraction(attraction.id)"
												class="btn btn-icon"
												title="Delete">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2">
													<path d="M3 6h18"></path>
													<path
														d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
													<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
												</svg>
											</button>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<!-- 笔记列表 -->
				<div class="notes-list">
					<h4>Travel Notes</h4>
					<div class="table-container">
						<table class="note-table">
							<thead>
								<tr>
									<th>Note Title</th>
									<th>Note Content</th>
									<th>Created At</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="note in notesByCurrentItinerary"
									:key="note.id"
									class="note-row">
									<td>{{ note.title }}</td>
									<td class="note-content-cell">{{ note.content }}</td>
									<td>{{ formatDate(note.createdAt) }}</td>
									<td class="action-cell">
										<div class="action-buttons">
											<button
												@click="editNote(note)"
												class="btn btn-icon"
												title="Edit">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2">
													<path
														d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
													<path
														d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
												</svg>
											</button>
											<button
												@click="deleteNote(note.id)"
												class="btn btn-icon"
												title="Delete">
												<svg
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="2">
													<path d="M3 6h18"></path>
													<path
														d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
													<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
												</svg>
											</button>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>

		<!-- 照片上传模态框 -->
		<div v-if="showPhotoModal" class="modal-overlay" @click="closePhotoModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>Add Photo</h3>
					<div class="storage-info" v-if="showPhotoModal">
						<span
							>Used：{{ storageInfo.usedMB }}MB / Remaining：{{
								storageInfo.remainingMB
							}}MB</span
						>
					</div>
					<button @click="closePhotoModal" class="close-btn">×</button>
				</div>
				<div class="form-section">
					<input
						v-model="newPhoto.title"
						placeholder="Photo Title"
						class="input-field" />
					<textarea
						v-model="newPhoto.description"
						placeholder="Photo Description"
						class="input-field"></textarea>

					<!-- 照片选择方式 -->
					<div class="photo-input-options">
						<label class="radio-label">
							<input type="radio" v-model="photoInputType" value="upload" />
							upload photo
						</label>
						<label class="radio-label">
							<input type="radio" v-model="photoInputType" value="camera" />
							Use Camera
						</label>
						<label class="radio-label">
							<input type="radio" v-model="photoInputType" value="gallery" />
							Choose from Gallery
						</label>
					</div>

					<!-- 文件输入 -->
					<input
						v-if="photoInputType === 'upload'"
						type="file"
						accept="image/*"
						@change="handleFileUpload"
						class="input-field" />

					<!-- 摄像头输入 -->
					<div v-if="photoInputType === 'camera'" class="camera-container">
						<video
							ref="videoRef"
							autoplay
							playsinline
							class="camera-preview"
							@error="handleVideoError"></video>
						<canvas ref="canvasRef" style="display: none"></canvas>
						<button
							@click="capturePhoto"
							class="btn btn-primary"
							:disabled="!isVideoReady || isCapturing">
							{{
								isVideoReady
									? isCapturing
										? "Processing..."
										: "Take Photo"
									: "Starting camera..."
							}}
						</button>
						<img
							v-if="capturedImage"
							:src="capturedImage"
							class="captured-preview"
							@error="handleImagePreviewError" />
					</div>

					<!-- 相册输入 -->
					<input
						v-if="photoInputType === 'gallery'"
						type="file"
						accept="image/*"
						multiple
						@change="handleGallerySelect"
						class="input-field" />
				</div>

				<div class="modal-actions">
					<button @click="addPhoto" class="btn btn-primary">Confirm Add</button>
					<button @click="closePhotoModal" class="btn btn-secondary">
						Cancel
					</button>
				</div>
			</div>
		</div>

		<!-- 编辑景点模态框 -->
		<div
			v-if="showAttractionModal"
			class="modal-overlay"
			@click="closeAttractionModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>
						{{ editingAttraction ? "Edit Attraction" : "Add Attraction" }}
					</h3>
					<button @click="closeAttractionModal" class="close-btn">×</button>
				</div>
				<div class="form-section">
					<input
						v-model="newAttraction.name"
						placeholder="Attraction Name"
						class="input-field" />
					<textarea
						v-model="newAttraction.description"
						placeholder="Attraction Description"
						class="input-field"></textarea>
					<input
						v-model="newAttraction.location"
						placeholder="location"
						class="input-field" />
					<!-- 添加位置信息 -->
					<div class="location-info">
						<span class="location-text"
							>Current Coordinates：{{ currentPosition.lat.toFixed(6) }},
							{{ currentPosition.lng.toFixed(6) }}</span
						>
						<button @click="updateLocation" class="btn btn-secondary">
							Update Location
						</button>
					</div>
				</div>
				<div class="modal-actions">
					<button @click="saveAttraction" class="btn btn-primary">Save</button>
					<button @click="closeAttractionModal" class="btn btn-secondary">
						Cancel
					</button>
				</div>
			</div>
		</div>

		<!-- 编辑笔记模态框 -->
		<div v-if="showNoteModal" class="modal-overlay" @click="closeNoteModal">
			<div class="modal-content" @click.stop>
				<div class="modal-header">
					<h3>{{ editingNote ? "Edit Note" : "Add Note" }}</h3>
					<button @click="closeNoteModal" class="close-btn">×</button>
				</div>
				<div class="form-section">
					<input
						v-model="newNote.title"
						placeholder="Note Title"
						class="input-field" />
					<textarea
						v-model="newNote.content"
						placeholder="Note Content"
						class="input-field"></textarea>
				</div>
				<div class="modal-actions">
					<button @click="saveNote" class="btn btn-primary">save</button>
					<button @click="closeNoteModal" class="btn btn-secondary">
						cancel
					</button>
				</div>
			</div>
		</div>

		<!-- 照片浏览模态框 -->
		<div
			v-if="showPhotoGalleryModal"
			class="modal-overlay"
			@click="closePhotoGallery">
			<div class="modal-content photo-gallery-modal" @click.stop>
				<div class="gallery-header">
					<h3>Photo Gallery</h3>
					<button @click="closePhotoGallery" class="close-btn">×</button>
				</div>

				<div class="gallery-content">
					<!-- 照片显示区域 -->
					<div class="photo-display">
						<button
							@click="prevPhoto"
							class="gallery-nav prev"
							:disabled="currentPhotoIndex === 0">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2">
								<path d="M15 18l-6-6 6-6" />
							</svg>
						</button>

						<div class="photo-wrapper">
							<img
								v-if="currentPhoto"
								:src="currentPhoto.url"
								:alt="currentPhoto.title"
								class="gallery-image"
								@error="handleImageError" />
							<div v-else class="no-photo">No photos available</div>
						</div>

						<button
							@click="nextPhoto"
							class="gallery-nav next"
							:disabled="
								currentPhotoIndex >= currentAttractionPhotos.length - 1
							">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2">
								<path d="M9 18l6-6-6-6" />
							</svg>
						</button>
					</div>

					<!-- 照片信息 -->
					<div class="photo-info-bar" v-if="currentPhoto">
						<div class="photo-title">{{ currentPhoto.title || "Unnamed" }}</div>
						<div class="photo-description">
							{{ currentPhoto.description || "No description" }}
						</div>
						<div class="photo-counter">
							{{ currentPhotoIndex + 1 }} / {{ currentAttractionPhotos.length }}
						</div>
						<!-- 删除按钮 -->
						<button @click="deleteCurrentPhoto" class="btn btn-delete-photo">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2">
								<path d="M3 6h18"></path>
								<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
								<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
							</svg>
							Delete Photo
						</button>
					</div>

					<!-- 缩略图列表 -->
					<div class="thumbnail-list" v-if="currentAttractionPhotos.length > 0">
						<div
							v-for="(photo, index) in currentAttractionPhotos"
							:key="photo.id"
							class="thumbnail-item"
							:class="{ active: index === currentPhotoIndex }"
							@click="currentPhotoIndex = index">
							<img
								:src="photo.url"
								:alt="photo.title"
								@error="handleImageError" />
						</div>
					</div>
				</div>

				<div class="modal-actions">
					<button @click="closePhotoGallery" class="btn btn-secondary">
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { indexedDBHelper } from "../utils/indexDB";

const router = useRouter();
const isOnline = ref(navigator.onLine);
const currentUser = ref(null); // 当前用户信息

// 响应式数据
const newItinerary = ref({
	title: "",
	destination: "",
	startDate: "",
	endDate: "",
	notes: "",
});

const newAttraction = ref({
	name: "",
	description: "",
	location: "",
});

const newNote = ref({
	title: "",
	content: "",
});

const newPhoto = ref({
	title: "",
	description: "",
	url: "",
});

const itineraries = ref([]);
const attractions = ref([]);
const photos = ref([]);
const notes = ref([]);

const showItineraryModal = ref(false);
const showDetailModal = ref(false);
const showPhotoModal = ref(false);
const editingItinerary = ref(null);
const currentItinerary = ref(null);
const currentAttractionId = ref(null);
const photoInputType = ref("upload"); // 'upload', 'camera', 'gallery'

const editingAttraction = ref(null);
const editingNote = ref(null);
const showAttractionModal = ref(false);
const showNoteModal = ref(false);

// 分页相关
const currentPage = ref(1);
const itemsPerPage = 5;

// 搜索和筛选
const searchTerm = ref("");
const statusFilter = ref("");

// 摄像头相关
const videoRef = ref(null);
const canvasRef = ref(null);
const capturedImage = ref(null);
const isVideoReady = ref(false);
const isCapturing = ref(false);
const currentStream = ref(null); // 保存当前视频流引用
// 视频错误处理
const handleVideoError = (e) => {
	console.error("Video load error", e);
	alert(" Camera video failed to load, please check device permissions");
	isVideoReady.value = false;
};

// 初始化摄像头（单独函数）
const initCamera = async () => {
	try {
		isVideoReady.value = false;

		// 先清理旧的视频流
		if (currentStream.value) {
			currentStream.value.getTracks().forEach((track) => track.stop());
			currentStream.value = null;
		}

		// 检测 iOS 设备
		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

		// 请求摄像头权限
		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				facingMode: "environment",
				width: isIOS ? { ideal: 1920 } : { ideal: 1280 },
				height: isIOS ? { ideal: 1080 } : { ideal: 720 },
			},
		});

		currentStream.value = stream;

		if (videoRef.value) {
			videoRef.value.srcObject = stream;
			// 等待视频元数据加载完成
			await new Promise((resolve, reject) => {
				videoRef.value.onloadedmetadata = () => {
					videoRef.value.play().then(resolve).catch(reject);
				};
				videoRef.value.onerror = reject;
				// 设置超时，防止一直等待
				setTimeout(
					() => reject(new Error("The video loading has timed out.")),
					5000,
				);
			});
			// 额外等待视频帧渲染
			await new Promise((resolve) => setTimeout(resolve, 300));
			// 验证视频尺寸
			if (videoRef.value.videoWidth === 0 || videoRef.value.videoHeight === 0) {
				throw new Error("The video is invalid.");
			}

			isVideoReady.value = true;
		}
	} catch (err) {
		console.error("Camera initialization failed :", err);
		if (err.name === "NotAllowedError") {
			alert("Camera permission denied, please allow camera access in settings");
		} else if (err.name === "NotFoundError") {
			alert("No camera device found");
		} else {
			alert(
				`Camera startup failed：${err.message || "Please check the device permissions."}`,
			);
		}
		isVideoReady.value = false;
	}
};

// 设备检测
const isMobileDevice = () => {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent,
	);
};

const isIOS = () => {
	return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const isAndroid = () => {
	return /Android/i.test(navigator.userAgent);
};

// 检查摄像头支持
const checkCameraSupport = () => {
	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		return {
			supported: false,
			message: "Your browser does not support camera functionality",
		};
	}

	if (
		window.location.protocol !== "https:" &&
		window.location.hostname !== "localhost"
	) {
		return {
			supported: false,
			message: "Camera functionality requires HTTPS environment",
		};
	}

	return { supported: true, message: "" };
};

// 监听照片输入类型变化
watch(photoInputType, async (newType) => {
	if (newType === "camera") {
		// 选择摄像头选项时自动初始化
		await initCamera();
	} else {
		// 切换其他选项时清理摄像头
		if (currentStream.value) {
			currentStream.value.getTracks().forEach((track) => track.stop());
			currentStream.value = null;
		}
		isVideoReady.value = false;
		capturedImage.value = null;
	}
});

// 照片压缩函数
const compressPhoto = (
	dataUrl,
	maxWidth = 1280,
	maxHeight = 960,
	quality = 0.7,
) => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = dataUrl;
		img.onload = () => {
			const canvas = document.createElement("canvas");
			let width = img.width;
			let height = img.height;
			// Scale proportionally
			if (width > maxWidth || height > maxHeight) {
				const ratio = Math.min(maxWidth / width, maxHeight / height);
				width = Math.floor(width * ratio);
				height = Math.floor(height * ratio);
			}
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext("2d");
			context.drawImage(img, 0, 0, width, height);
			// Compress to JPEG format
			const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
			// Calculate file size (in bytes)
			const fileSize = Math.ceil((compressedDataUrl.length * 3) / 4);
			resolve({
				dataUrl: compressedDataUrl,
				width,
				height,
				fileSize,
				fileSizeMB: (fileSize / 1024 / 1024).toFixed(2),
			});
		};
		img.onerror = reject;
	});
};

// 图片预览错误处理
const handleImagePreviewError = (e) => {
	console.error("Image preview error:", e.target.src);
	alert(" Image preview failed, please retake");
	capturedImage.value = null;
};

// 照片浏览相关
const showPhotoGalleryModal = ref(false);
const currentAttractionPhotos = ref([]);
const currentPhotoIndex = ref(0);
const currentPhoto = computed(() => {
	return currentAttractionPhotos.value[currentPhotoIndex.value] || null;
});

// 检查 localStorage 剩余空间
const checkLocalStorageSpace = () => {
	try {
		let total = 0;
		for (let key in localStorage) {
			if (localStorage.hasOwnProperty(key)) {
				total += localStorage[key].length * 2; // UTF-16 编码
			}
		}
		const used = (total / 1024 / 1024).toFixed(2);
		const remaining = (5 - parseFloat(used)).toFixed(2);
		return {
			usedMB: used,
			remainingMB: remaining,
			isLow: parseFloat(remaining) < 1,
		};
	} catch (err) {
		return { usedMB: "Unknown", remainingMB: "Unknown", isLow: false };
	}
};

// 添加存储信息响应式数据
const storageInfo = ref({
	usedMB: "0.00",
	remainingMB: "5.00",
});

// 更新存储信息
const updateStorageInfo = () => {
	const info = checkLocalStorageSpace();
	storageInfo.value = {
		usedMB: info.usedMB,
		remainingMB: info.remainingMB,
	};
};

// 位置信息
const currentPosition = ref({ lat: 0, lng: 0 });

// 计算属性
const totalPages = computed(() => {
	const total = Math.ceil(filteredItineraries.value.length / itemsPerPage);
	return total > 0 ? total : 1;
});

const filteredItineraries = computed(() => {
	let result = [...itineraries.value];

	// 按搜索词过滤
	if (searchTerm.value) {
		result = result.filter((itinerary) =>
			itinerary.destination
				.toLowerCase()
				.includes(searchTerm.value.toLowerCase()),
		);
	}

	// 按状态过滤
	if (statusFilter.value) {
		const today = new Date();
		if (statusFilter.value === "upcoming") {
			// 未出发：开始日期 > 今天
			result = result.filter(
				(itinerary) => new Date(itinerary.startDate) > today,
			);
		} else if (statusFilter.value === "ongoing") {
			// 进行中：开始日期 <= 今天 <= 结束日期
			result = result.filter(
				(itinerary) =>
					new Date(itinerary.startDate) <= today &&
					new Date(itinerary.endDate) >= today,
			);
		} else if (statusFilter.value === "completed") {
			// 已完成：结束日期 < 今天
			result = result.filter(
				(itinerary) => new Date(itinerary.endDate) < today,
			);
		}
	}

	// 分页处理
	const start = (currentPage.value - 1) * itemsPerPage;
	const end = start + itemsPerPage;
	return result.slice(start, end);
});

const attractionsByCurrentItinerary = computed(() => {
	if (!currentItinerary.value) return [];
	return attractions.value.filter(
		(attr) => attr.itineraryId === currentItinerary.value.id,
	);
});

const notesByCurrentItinerary = computed(() => {
	if (!currentItinerary.value) return [];
	return notes.value.filter(
		(note) => note.itineraryId === currentItinerary.value.id,
	);
});

const totalAttractions = computed(() => attractions.value.length);
const totalPhotos = computed(() => photos.value.length);
const totalNotes = computed(() => notes.value.length);

// 检查用户登录状态
const checkUserLogin = () => {
	currentUser.value = indexedDBHelper.getCurrentUser();
	if (!currentUser.value) {
		alert("Please login first");
		router.push("/Travel");
		return false;
	}
	return true;
};

// 从 IndexedDB 加载数据
const loadFromIndexedDB = async () => {
	if (!checkUserLogin()) return;

	const userId = currentUser.value.username;

	try {
		const [itineraryList, attractionList, photoList, noteList] =
			await Promise.all([
				indexedDBHelper.getUserItineraries(userId),
				indexedDBHelper.getUserAttractions(userId),
				indexedDBHelper.getUserPhotos(userId),
				indexedDBHelper.getUserNotes(userId),
			]);

		itineraries.value = itineraryList;
		attractions.value = attractionList;
		photos.value = photoList;
		notes.value = noteList;
	} catch (err) {
		console.error("加载数据失败:", err);
		alert("Failed to load data, please try again");
	}
};

// 从本地存储加载数据
onMounted(async () => {
	await indexedDBHelper.init();

	if (!checkUserLogin()) return;

	// loadFromLocalStorage();
	await loadFromIndexedDB();
	// 初始化位置
	await updateLocation();

	// 监听网络状态变化
	window.addEventListener("online", () => {
		isOnline.value = true;
	});
	window.addEventListener("offline", () => {
		isOnline.value = false;
	});
	window.addEventListener("keydown", handleKeydown);
});

// 在组件卸载时移除事件监听器
onUnmounted(() => {
	window.removeEventListener("keydown", handleKeydown);
	if (currentStream.value) {
		currentStream.value.getTracks().forEach((track) => track.stop());
		currentStream.value = null;
	}
});

// 获取当前地理位置
const updateLocation = async () => {
	try {
		if (navigator.geolocation) {
			const position = await new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 60000,
				});
			});

			currentPosition.value = {
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};

			
			if (showAttractionModal.value && newAttraction.value.name) {
				newAttraction.value.location = `Location information (${position.coords.latitude.toFixed(
					6,
				)}, ${position.coords.longitude.toFixed(6)})`;
			}
		} else {
			console.log("Geolocation is not supported by this browser.");
		}
	} catch (error) {
		console.error("Error getting location:", error);
		alert(
			" Failed to get location info, please check browser location permissions",
		);
	}
};

// 从本地存储加载数据
const loadFromLocalStorage = () => {
	const storedItineraries = localStorage.getItem("tourItineraries");
	const storedAttractions = localStorage.getItem("tourAttractions");
	const storedPhotos = localStorage.getItem("tourPhotos");
	const storedNotes = localStorage.getItem("tourNotes");

	if (storedItineraries) {
		itineraries.value = JSON.parse(storedItineraries);
	}
	if (storedAttractions) {
		attractions.value = JSON.parse(storedAttractions);
	}
	if (storedPhotos) {
		photos.value = JSON.parse(storedPhotos);
	}
	if (storedNotes) {
		notes.value = JSON.parse(storedNotes);
	}
};

// 保存数据到本地存储
const saveToLocalStorage = () => {
	localStorage.setItem("tourItineraries", JSON.stringify(itineraries.value));
	localStorage.setItem("tourAttractions", JSON.stringify(attractions.value));
	localStorage.setItem("tourPhotos", JSON.stringify(photos.value));
	localStorage.setItem("tourNotes", JSON.stringify(notes.value));
};

// 分页控制
const nextPage = () => {
	if (currentPage.value < totalPages.value) {
		currentPage.value++;
	}
};

const prevPage = () => {
	if (currentPage.value > 1) {
		currentPage.value--;
	}
};

// 模态框控制
const openCreateItineraryModal = () => {
	if (!checkUserLogin()) return;
	editingItinerary.value = null;
	newItinerary.value = {
		title: "",
		destination: "",
		startDate: "",
		endDate: "",
		notes: "",
	};
	showItineraryModal.value = true;
};

const closeItineraryModal = () => {
	showItineraryModal.value = false;
	editingItinerary.value = null;
};

const openPhotoModal = (attractionId) => {
	if (!checkUserLogin()) return;

	// 检查摄像头支持
	const cameraCheck = checkCameraSupport();
	if (!cameraCheck.supported) {
		alert(cameraCheck.message);
	}

	updateStorageInfo(); // 更新存储信息

	currentAttractionId.value = attractionId;
	showPhotoModal.value = true;
	photoInputType.value = "upload";
	capturedImage.value = null;
	isVideoReady.value = false;
	isCapturing.value = false;
	newPhoto.value = {
		title: "",
		description: "",
		url: "",
	};
};

const closePhotoModal = () => {
	showPhotoModal.value = false;
	currentAttractionId.value = null;
	capturedImage.value = null;
	isVideoReady.value = false;
	isCapturing.value = false;
	// 清理视频流
	if (currentStream.value) {
		currentStream.value.getTracks().forEach((track) => track.stop());
		currentStream.value = null;
	}
	if (videoRef.value) {
		videoRef.value.srcObject = null;
	}
};

const viewItineraryDetails = (itinerary) => {
	if (!checkUserLogin()) return;
	currentItinerary.value = itinerary;
	showDetailModal.value = true;
};

const closeDetailModal = () => {
	showDetailModal.value = false;
	currentItinerary.value = null;
	newAttraction.value = {
		name: "",
		description: "",
		location: "",
	};
	newNote.value = {
		title: "",
		content: "",
	};
};

// 行程相关操作
const saveItinerary = async () => {
	if (!checkUserLogin()) return;
	if (
		!newItinerary.value.title.trim() ||
		!newItinerary.value.destination.trim()
	)
		return;

	try {
		if (editingItinerary.value) {
			// 验证权限
			if (editingItinerary.value.userId !== currentUser.value.username) {
				alert("No permission to modify this itinerary");
				return;
			}
			await indexedDBHelper.updateItinerary({
				...newItinerary.value,
				id: editingItinerary.value.id,
				userId: currentUser.value.username,
			});

			// 编辑现有行程
			const index = itineraries.value.findIndex(
				(i) => i.id === editingItinerary.value.id,
			);
			if (index !== -1) {
				itineraries.value[index] = {
					...newItinerary.value,
					id: editingItinerary.value.id,
					userId: currentUser.value.username,
				};
			}
		} else {
			// 创建新行程
			const id = await indexedDBHelper.createItinerary({
				userId: currentUser.value.username,
				...newItinerary.value,
			});

			itineraries.value.push({
				id,
				userId: currentUser.value.username,
				...newItinerary.value,
			});
		}
		// saveToLocalStorage();
		closeItineraryModal();
	} catch (err) {
		console.error("Failed to save the itinerary:", err);
		alert("Save failed, please try again");
	}
};

const editItinerary = (item) => {
	if (!checkUserLogin()) return;
	editingItinerary.value = { ...item };
	newItinerary.value = { ...item };
	showItineraryModal.value = true;
};

const deleteItinerary = async (id) => {
	if (!checkUserLogin()) return;
	const itinerary = itineraries.value.find((item) => item.id === id);
	if (!itinerary || itinerary.userId !== currentUser.value.username) {
		alert("No permission to delete this itinerary");
		return;
	}
	if (
		confirm(
			"Are you sure you want to delete this itinerary? This will also delete associated attractions, photos and notes!！",
		)
	) {
		try {
			await indexedDBHelper.deleteItineraryWithRelations(
				id
			);

			itineraries.value = itineraries.value.filter((item) => item.id !== id);
			attractions.value = attractions.value.filter(
				(attr) => attr.itineraryId !== id,
			);
			photos.value = photos.value.filter((photo) => {
				const relatedAttraction = attractions.value.find(
					(attr) => attr.id === photo.attractionId,
				);
				return !relatedAttraction || relatedAttraction.itineraryId !== id;
			});
			notes.value = notes.value.filter((note) => note.itineraryId !== id);

			if (filteredItineraries.value.length === 0 && currentPage.value > 1) {
				currentPage.value--;
			}
		} catch (err) {
			console.error("Failed to delete the itinerary:", err);
			alert("Deletion failed, please try again");
		}
	}
};

// 景点相关操作
// 打开景点模态框（用于创建）
const openAttractionModal = () => {
	if (!checkUserLogin()) return;
	editingAttraction.value = null;
	newAttraction.value = {
		name: "",
		description: "",
		location: "",
	};
	showAttractionModal.value = true;
};

const editAttraction = (attraction) => {
	if (!checkUserLogin()) return;
	editingAttraction.value = { ...attraction };
	newAttraction.value = {
		name: attraction.name,
		description: attraction.description,
		location: attraction.location,
	};
	showAttractionModal.value = true;
};

// 修改 addAttraction 为 saveAttraction，支持创建和编辑
const saveAttraction = async () => {
	if (!checkUserLogin()) return;

	if (!newAttraction.value.name.trim() || !currentItinerary.value) return;

	if (currentItinerary.value.userId !== currentUser.value.username) {
		alert("No permission to operate the attractions of this itinerary");
		return;
	}

	try {
		if (editingAttraction.value) {
			if (editingAttraction.value.userId !== currentUser.value.username) {
				alert("No permission to modify this attraction");
				return;
			}

			await indexedDBHelper.updateAttraction({
				...editingAttraction.value,
				name: newAttraction.value.name,
				description: newAttraction.value.description,
				location: newAttraction.value.location,
			});

			const index = attractions.value.findIndex(
				(a) => a.id === editingAttraction.value.id,
			);
			if (index !== -1) {
				attractions.value[index] = {
					...attractions.value[index],
					name: newAttraction.value.name,
					description: newAttraction.value.description,
					location: newAttraction.value.location,
				};
			}
		} else {
			const id = await indexedDBHelper.createAttraction({
				userId: currentUser.value.username,
				...newAttraction.value,
				itineraryId: currentItinerary.value.id,
				coordinates: { ...currentPosition.value },
				visited: false,
				createdAt: new Date(),
			});

			attractions.value.push({
				id,
				userId: currentUser.value.username,
				...newAttraction.value,
				itineraryId: currentItinerary.value.id,
				coordinates: { ...currentPosition.value },
				visited: false,
				createdAt: new Date(),
			});
		}

		closeAttractionModal();
	} catch (err) {
		console.error("Failed to save the scenic spot:", err);
		alert("Save failed, please try again");
	}
};

// 关闭景点模态框
const closeAttractionModal = () => {
	showAttractionModal.value = false;
	editingAttraction.value = null;
	newAttraction.value = {
		name: "",
		description: "",
		location: "",
	};
};

const deleteAttraction = async (id) => {
	if (!checkUserLogin()) return;
	const attraction = attractions.value.find((attr) => attr.id === id);
	if (!attraction || attraction.userId !== currentUser.value.username) {
		alert("No permission to delete this attraction");
		return;
	}

	if (confirm("Are you sure you want to delete this attraction?")) {
		try {
			await indexedDBHelper.deleteAttraction(id);

			attractions.value = attractions.value.filter((attr) => attr.id !== id);
			photos.value = photos.value.filter((photo) => photo.attractionId !== id);
		} catch (err) {
			console.error("Failed to delete the attraction:", err);
			alert("Deletion failed, please try again");
		}
	}
};

// 切换景点状态
const toggleAttractionStatus = async (id) => {
	if (!checkUserLogin()) return;

	const attraction = attractions.value.find((attr) => attr.id === id);
	if (attraction && attraction.userId === currentUser.value.username) {
		attraction.visited = !attraction.visited;
		try {
			await indexedDBHelper.updateAttraction(attraction);
		} catch (err) {
			console.error("Failed to update the status of the attraction:", err);
			attraction.visited = !attraction.visited;
		}
	}
};

// 笔记相关操作
// 打开笔记模态框（用于创建）
const openNoteModal = () => {
	if (!checkUserLogin()) return;
	editingNote.value = null;
	newNote.value = {
		title: "",
		content: "",
	};
	showNoteModal.value = true;
};

const editNote = (note) => {
	if (!checkUserLogin()) return;
	editingNote.value = { ...note };
	newNote.value = {
		title: note.title,
		content: note.content,
	};
	showNoteModal.value = true;
};

// 修改 addNote 为 saveNote，支持创建和编辑
const saveNote = async () => {
	if (!checkUserLogin()) return;

	if (!newNote.value.title.trim() || !currentItinerary.value) return;

	if (currentItinerary.value.userId !== currentUser.value.username) {
		alert("No permission to operate the notes of this itinerary");
		return;
	}

	try {
		if (editingNote.value) {
			if (editingNote.value.userId !== currentUser.value.username) {
				alert("No permission to modify this note");
				return;
			}

			await indexedDBHelper.updateNote({
				...editingNote.value,
				title: newNote.value.title,
				content: newNote.value.content,
			});

			const index = notes.value.findIndex((n) => n.id === editingNote.value.id);
			if (index !== -1) {
				notes.value[index] = {
					...notes.value[index],
					title: newNote.value.title,
					content: newNote.value.content,
				};
			}
		} else {
			const id = await indexedDBHelper.createNote({
				userId: currentUser.value.username,
				...newNote.value,
				itineraryId: currentItinerary.value.id,
				createdAt: new Date(),
			});

			notes.value.push({
				id,
				userId: currentUser.value.username,
				...newNote.value,
				itineraryId: currentItinerary.value.id,
				createdAt: new Date(),
			});
		}

		closeNoteModal();
	} catch (err) {
		console.error("Failed to save notes:", err);
		alert("Save failed, please try again");
	}
};

// 关闭笔记模态框
const closeNoteModal = () => {
	showNoteModal.value = false;
	editingNote.value = null;
	newNote.value = {
		title: "",
		content: "",
	};
};

const deleteNote = async (id) => {
	if (!checkUserLogin()) return;

	const note = notes.value.find((n) => n.id === id);
	if (!note || note.userId !== currentUser.value.username) {
		alert("No permission to delete this note");
		return;
	}

	if (confirm("Are you sure you want to delete this note?")) {
		try {
			await indexedDBHelper.deleteNote(id);
			notes.value = notes.value.filter((note) => note.id !== id);
		} catch (err) {
			console.error("Failed to delete note:", err);
			alert("Deletion failed, please try again");
		}
	}
};

// 照片相关操作
const addPhoto = async () => {
	if (!checkUserLogin()) return;

	if (!newPhoto.value.url) {
		alert("Please select or take a photo first ");
		return;
	}

	if (!currentAttractionId.value) {
		alert("Attraction not specified");
		return;
	}

	const attraction = attractions.value.find(
		(attr) => attr.id === currentAttractionId.value,
	);
	if (!attraction || attraction.userId !== currentUser.value.username) {
		alert("No permission to add photos for this attraction");
		return;
	}

	try {
		const id = await indexedDBHelper.createPhoto({
			userId: currentUser.value.username,
			...newPhoto.value,
			attractionId: currentAttractionId.value,
		});

		photos.value.push({
			id,
			userId: currentUser.value.username,
			...newPhoto.value,
			attractionId: currentAttractionId.value,
		});

		closePhotoModal();
	} catch (err) {
		console.error("Failed to add photo:", err);
		alert("Addition failed, please try again");
	}
};

const editPhoto = (photo) => {
	// 简化处理，实际项目中可以弹出编辑框
	const index = photos.value.findIndex((p) => p.id === photo.id);
	if (index !== -1) {
		photos.value.splice(index, 1);
		saveToLocalStorage();
	}
};

const deletePhoto = (id) => {
	if (confirm("Are you sure you want to delete this photo?")) {
		photos.value = photos.value.filter((photo) => photo.id !== id);
		saveToLocalStorage();
	}
};

// 删除当前照片
const deleteCurrentPhoto = async () => {
	if (!checkUserLogin()) return;

	if (!currentPhoto.value) return;

	if (currentPhoto.value.userId !== currentUser.value.username) {
		alert("No permission to delete this photo");
		return;
	}

	if (confirm("Are you sure you want to delete this photo?")) {
		try {
			const photoId = currentPhoto.value.id;
			await indexedDBHelper.deletePhoto(photoId);

			photos.value = photos.value.filter((photo) => photo.id !== photoId);
			currentAttractionPhotos.value = currentAttractionPhotos.value.filter(
				(photo) => photo.id !== photoId,
			);
			//更新存储信息提示
			updateStorageInfo();

			if (currentAttractionPhotos.value.length === 0) {
				// 如果没有照片了，关闭模态框
				closePhotoGallery();
			} else if (
				currentPhotoIndex.value >= currentAttractionPhotos.value.length
			) {
				// 如果删除的是最后一张，索引减 1
				currentPhotoIndex.value = currentAttractionPhotos.value.length - 1;
			}
		} catch (err) {
			console.error("Failed to delete photo:", err);
			alert("Deletion failed, please try again");
		}
	}
};

// 打开照片浏览
const openPhotoGallery = async (attractionId) => {
	if (!checkUserLogin()) return;

	const photoList = await indexedDBHelper.getPhotosByAttraction(attractionId);
	if (photoList.length === 0) {
		alert("No photo available for the moment.");
		return;
	}
	currentAttractionPhotos.value = photoList;
	currentPhotoIndex.value = 0;
	showPhotoGalleryModal.value = true;
};

// 关闭照片浏览
const closePhotoGallery = () => {
	showPhotoGalleryModal.value = false;
	currentAttractionPhotos.value = [];
	currentPhotoIndex.value = 0;
};

// 上一张照片
const prevPhoto = () => {
	if (currentPhotoIndex.value > 0) {
		currentPhotoIndex.value--;
	}
};

// 下一张照片
const nextPhoto = () => {
	if (currentPhotoIndex.value < currentAttractionPhotos.value.length - 1) {
		currentPhotoIndex.value++;
	}
};

// 键盘左右键控制
const handleKeydown = (e) => {
	if (!showPhotoGalleryModal.value) return;
	if (e.key === "ArrowLeft") {
		prevPhoto();
	} else if (e.key === "ArrowRight") {
		nextPhoto();
	} else if (e.key === "Escape") {
		closePhotoGallery();
	}
};

// 在 onMounted 中添加键盘事件监听
onMounted(async () => {
	loadFromLocalStorage();
	// window.addEventListener("scroll", handleScroll);
	window.addEventListener("keydown", handleKeydown); // 添加键盘监听
	await updateLocation();
});

// 在 onUnmounted 中移除键盘事件监听
onUnmounted(() => {
	// window.removeEventListener("scroll", handleScroll);
	window.removeEventListener("keydown", handleKeydown); // 移除键盘监听
});

// 文件上传处理
const handleFileUpload = (event) => {
	const file = event.target.files[0];
	if (!file) return;

	// 检查文件大小
	const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
	if (file.size > 5 * 1024 * 1024) {
		alert("Image file size cannot exceed 5MB");
		event.target.value = "";
		return;
	}

	const reader = new FileReader();
	reader.onload = async (e) => {
		try {
			// 压缩图片
			const compressed = await compressPhoto(e.target.result, 1280, 960, 0.7);
			newPhoto.value.url = compressed.dataUrl;
			console.log(
				`Upload photo compression completed：${compressed.fileSizeMB}MB`,
			);
		} catch (err) {
			console.error("Image compression failed:", err);
			newPhoto.value.url = e.target.result; // 使用原始图片
		}
	};
	reader.readAsDataURL(file);
};

// 相册选择处理
const handleGallerySelect = (event) => {
	const files = Array.from(event.target.files);
	if (files.length === 0) return;

	const file = files[0];
	const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);

	if (file.size > 5 * 1024 * 1024) {
		alert("Image file size cannot exceed 5MB");
		event.target.value = "";
		return;
	}

	const reader = new FileReader();
	reader.onload = async (e) => {
		try {
			const compressed = await compressPhoto(e.target.result, 1280, 960, 0.7);
			newPhoto.value.url = compressed.dataUrl;
			console.log(
				`Gallery photo compression completed：${compressed.fileSizeMB}MB`,
			);
		} catch (err) {
			console.error("Image compression failed :", err);
			newPhoto.value.url = e.target.result;
		}
	};
	reader.readAsDataURL(file);
};

// 摄像头功能
const capturePhoto = async () => {
	if (!isVideoReady.value || !videoRef.value) return;

	try {
		isCapturing.value = true;

		const video = videoRef.value;
		const canvas = canvasRef.value;
		const context = canvas.getContext("2d");

		// Detect iOS devices
		const isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

		// Obtain the actual dimensions of the video
		const videoWidth = video.videoWidth;
		const videoHeight = video.videoHeight;

		// iOS The rear camera may need to be rotated for processing
		if (isIOS && videoWidth > videoHeight) {
			// Landscape mode, swap width and height
			canvas.width = videoHeight;
			canvas.height = videoWidth;
			// Rotate canvas
			context.translate(canvas.width / 2, canvas.height / 2);
			context.rotate((90 * Math.PI) / 180);
			context.drawImage(video, -videoWidth / 2, -videoHeight / 2);
		} else {
			canvas.width = videoWidth;
			canvas.height = videoHeight;
			context.drawImage(video, 0, 0, videoWidth, videoHeight);
		}

		// Convert to base64 image (original high quality)
		const originalDataUrl = canvas.toDataURL("image/jpeg", 0.95);

		// 压缩照片
		const compressed = await compressPhoto(originalDataUrl, 1280, 960, 0.7);

		// Check storage space
		const spaceInfo = checkLocalStorageSpace();
		if (spaceInfo.isLow) {
			const confirmSave = confirm(
				`localStorage Insufficient localStorage remaining space (${spaceInfo.remainingMB}MB)\n` +
					`Current photo size：${compressed.fileSizeMB}MB\n` +
					`Continue saving？`,
			);
			if (!confirmSave) {
				throw new Error("User cancelled save");
			}
		}

		// Verify image data
		if (!compressed.dataUrl || compressed.dataUrl.length < 100) {
			throw new Error("The generation of image data failed.");
		}

		capturedImage.value = compressed.dataUrl;
		newPhoto.value.url = compressed.dataUrl;

		// 显示压缩信息
		console.log(
			`photo compression completed：${compressed.width}x${compressed.height}, ${compressed.fileSizeMB}MB`,
		);

		// Stop video streaming
		if (currentStream.value) {
			currentStream.value.getTracks().forEach((track) => track.stop());
			currentStream.value = null;
		}
		isVideoReady.value = false;
	} catch (err) {
		console.error("The photo failed to be taken:", err);
		alert(
			`The photo failed to be taken：${err.message || "Please try again."}`,
		);
	} finally {
		isCapturing.value = false;
	}
};

// 辅助函数
const formatDate = (dateString) => {
	if (!dateString) return "";
	const date = new Date(dateString);
	return date.toLocaleDateString("zh-CN");
};

const getPhotosByAttraction = (attractionId) => {
	return photos.value.filter((photo) => photo.attractionId === attractionId);
};

const getItineraryStatusClass = (itinerary) => {
	const today = new Date();
	const startDate = new Date(itinerary.startDate);
	const endDate = new Date(itinerary.endDate);

	if (today < startDate) return "upcoming";
	if (today > endDate) return "completed";
	return "ongoing";
};

const getItineraryStatusText = (itinerary) => {
	const today = new Date();
	const startDate = new Date(itinerary.startDate);
	const endDate = new Date(itinerary.endDate);

	if (today < startDate) return "Not yet departed";
	if (today > endDate) return "Completed";
	return "In progress";
};

// 图片加载错误处理
const handleImageError = (e) => {
	e.target.src =
		'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23f0f0f0"/><text x="100" y="75" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle">图片无法加载</text></svg>';
};

// 退出登录
const logout = () => {
	if (confirm("Are you sure you want to log out?")) {
		localStorage.removeItem("currentUser");
		router.push("/Travel");
	}
};
</script>

<style scoped>
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family:
		-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
		Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.tour-management {
	min-height: 100vh;
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	padding: 0;
	width: 100%;
	overflow-x: hidden;
}

.main-header {
	background: white;
	padding: 2rem 1rem;
	text-align: center;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	margin-bottom: 2rem;
	position: relative;
	z-index: 10;
}

.main-header h1 {
	font-size: 2.5rem;
	color: #2c3e50;
	margin-bottom: 0.5rem;
	font-weight: 300;
}

.main-header p {
	color: #7f8c8d;
	font-size: 1.1rem;
}

.floating-stats {
	position: static; /* 移除固定定位 */
	width: 100%; /* 匹配父容器宽度 */
	min-width: 1000px; /* 与 main-content 一致 */
	margin: 0 auto 2rem auto; /* 居中并添加底部间距 */
	padding: 0 2rem; /* 与 main-content 内边距一致 */
	z-index: auto; /* 移除层级 */
	transition: none;
}

.floating-stats.scrolled {
	top: 0px;
	/* 滚动后固定在顶部附近 */
}

.empty-state {
	background: white;
	border-radius: 12px;
	padding: 3rem 1.5rem;
	text-align: center;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	width: 100%;
	min-width: 100%;
	min-height: 200px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1rem;
}

.stats-container {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 1rem;
	background: white;
	border-radius: 12px;
	padding: 1.5rem;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	backdrop-filter: blur(10px);
}

.stat-card {
	text-align: center;
	transition: transform 0.2s;
}

.stat-card:hover {
	transform: scale(1.05);
}

.stat-number {
	font-size: 2rem;
	font-weight: bold;
	color: #3498db;
	margin-bottom: 0.5rem;
}

.stat-label {
	color: #7f8c8d;
	font-size: 0.9rem;
}

.main-content {
	width: 100%;
	max-width: 1400px;
	margin: 0 auto;
	padding: 0 2rem;
	padding-top: 2rem;
}

.search-filters {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2rem;
	flex-wrap: wrap;
	gap: 1rem;
}

.filter-section {
	display: flex;
	gap: 1rem;
	align-items: center;
}

.search-input {
	min-width: 250px;
}

.filter-select {
	min-width: 120px;
}

.controls {
	text-align: center;
}

.btn {
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 8px;
	cursor: pointer;
	font-size: 1rem;
	transition: all 0.2s ease;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
}

.btn-primary {
	background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
	color: white;
	font-weight: 500;
}

.btn-primary:hover {
	background: linear-gradient(135deg, #2980b9 0%, #1a2530 100%);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-icon {
	background: transparent;
	border: none;
	color: #7f8c8d;
	padding: 0.5rem;
	border-radius: 50%;
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-icon:hover {
	background: #ecf0f1;
	color: #2c3e50;
}

.btn-secondary {
	background-color: #95a5a6;
	color: white;
}

.btn-secondary:hover {
	background-color: #7f8c8d;
}

.btn-delete {
	background-color: #e74c3c;
	color: white;
}

.btn-delete:hover {
	background-color: #c0392b;
}

.btn-add-photo {
	background-color: #2ecc71;
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	border-radius: 6px;
	cursor: pointer;
	margin: 10px 0;
	font-size: 0.9rem;
}

.btn-add-photo:hover {
	background-color: #27ae60;
}

.btn-pagination {
	background: white;
	color: #2c3e50;
	border: 1px solid #ddd;
	padding: 0.75rem 1.5rem;
	font-weight: 500;
}

.btn-pagination:disabled {
	background: #ecf0f1;
	color: #bdc3c7;
	cursor: not-allowed;
	border-color: #ecf0f1;
}

.page-info {
	margin: 0 1rem;
	color: #2c3e50;
	font-weight: 500;
}

.itinerary-list {
	margin-bottom: 2rem;
	width: 100%; /* 确保占满父容器 */
	min-width: 100%;
}

.itinerary-row {
	background: white;
	border-radius: 12px;
	margin-bottom: 1rem;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	cursor: pointer;
	transition: all 0.2s ease;
	overflow: hidden;
}

.itinerary-row:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.row-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.25rem 1.5rem;
	flex-wrap: wrap;
	gap: 1rem;
}

.itinerary-title {
	font-weight: 600;
	color: #2c3e50;
	font-size: 1.1rem;
	flex: 1;
	min-width: 150px;
}

.itinerary-date {
	color: #3498db;
	font-weight: 500;
	white-space: nowrap;
	margin: 0 1rem;
}

.itinerary-location {
	color: #7f8c8d;
	flex: 1;
	min-width: 120px;
	margin: 0 1rem;
}

.itinerary-status {
	padding: 0.25rem 0.75rem;
	border-radius: 20px;
	font-size: 0.85rem;
	font-weight: 500;
}

.itinerary-status.upcoming {
	background-color: #fff3cd;
	color: #856404;
}

.itinerary-status.completed {
	background-color: #d4edda;
	color: #155724;
}

.itinerary-status.ongoing {
	background-color: #cce5ff;
	color: #004085;
}

.itinerary-actions {
	display: flex;
	gap: 0.5rem;
}

.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 2rem;
	gap: 1rem;
}

/* 存储信息样式 */
.storage-info {
	font-size: 0.75rem;
	color: #7f8c8d;
	text-align: center;
	margin-top: 0.25rem;
}

.storage-info span {
	background: #f8f9fa;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
}

/* 照片信息提示 */
.photo-size-info {
	font-size: 0.8rem;
	color: #3498db;
	margin-top: 0.5rem;
	text-align: center;
}

.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.7);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
	backdrop-filter: blur(4px);
}

.modal-content {
	background: white;
	border-radius: 16px;
	width: 90%;
	max-width: 600px;
	max-height: 90vh;
	overflow-y: auto;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
	animation: modalSlideIn 0.3s ease-out;
}

.detail-modal {
	max-width: 800px;
	max-height: 90vh;
}

@keyframes modalSlideIn {
	from {
		opacity: 0;
		transform: scale(0.9) translateY(20px);
	}

	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem 1.5rem 0;
	border-bottom: 1px solid #eee;
	margin-bottom: 1rem;
}

.modal-header h3 {
	margin: 0;
	color: #2c3e50;
	font-weight: 600;
}

.close-btn {
	background: none;
	border: none;
	font-size: 2rem;
	cursor: pointer;
	color: #7f8c8d;
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: background 0.2s;
}

.close-btn:hover {
	background: #ecf0f1;
	color: #2c3e50;
}

.detail-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 1.5rem;
	margin-bottom: 1rem;
}

.detail-header h3 {
	margin: 0 0 0.5rem 0;
	color: #2c3e50;
	font-size: 1.5rem;
	text-align: center;
}

.detail-header > div:first-child {
	flex: 1;
	text-align: center;
}

/* 关闭按钮保持独立 */
.detail-header .close-btn {
	flex-shrink: 0;
	margin-left: 1rem;
}

.itinerary-dates {
	color: #3498db;
	font-weight: 500;
	text-align: center;
	margin-bottom: 0.25rem;
}

.itinerary-destination {
	color: #7f8c8d;
	font-size: 1rem;
	text-align: center;
}

.itinerary-notes {
	padding: 0 1.5rem;
	color: #555;
	line-height: 1.6;
	margin-bottom: 1.5rem;
	font-style: normal;
	width: 100%;
	box-sizing: border-box;
	word-break: break-all;
	/* 长文本自动换行 */
}

.itinerary-notes strong {
	color: #2c3e50;
	font-weight: 600;
	margin-right: 0.5rem;
}

.form-section {
	padding: 0 1.5rem;
	margin-bottom: 1.5rem;
}

.date-group {
	display: flex;
	gap: 1rem;
	align-items: center;
}

.date-separator {
	color: #7f8c8d;
	font-weight: 500;
}

.sub-form {
	background: #f8f9fa;
	padding: 1.5rem;
	border-radius: 12px;
	margin: 0 1.5rem 1.5rem;
	display: flex;
	justify-content: space-between;
	/* 两端对齐 */
	align-items: center;
	gap: 1rem;
	/* 按钮间距 */
	flex-wrap: wrap;
	/* 移动端自动换行 */
}

.input-field {
	display: block;
	width: 100%;
	margin-bottom: 1rem;
	padding: 0.75rem;
	border: 1px solid #ddd;
	border-radius: 8px;
	font-size: 1rem;
	transition: border-color 0.2s;
}

.input-field:focus {
	outline: none;
	border-color: #3498db;
	box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.modal-actions {
	padding: 0 1.5rem 1.5rem;
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
}

/* 表格容器 - 支持横向滚动 */
.attractions-list {
	padding: 0 1.5rem 1.5rem;
}

.table-container {
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 表格样式 */
.attraction-table {
	width: 100%;
	min-width: 600px;
	/* 最小宽度，确保内容完整显示 */
	border-collapse: collapse;
	background: white;
	border-radius: 8px;
	overflow: hidden;
}

.attraction-table th {
	background: #f5f7fa;
	padding: 1rem;
	text-align: left;
	font-weight: 600;
	color: #2c3e50;
	border-bottom: 2px solid #e0e0e0;
	border-right: 1px solid #e0e0e0;
	white-space: nowrap;
}

.attraction-table td {
	padding: 1rem;
	border-bottom: 1px solid #e0e0e0;
	border-right: 1px solid #e0e0e0;
	color: #555;
	vertical-align: middle;
	white-space: nowrap;
}

.attraction-table tbody tr:hover {
	background: #f8f9fa;
}

.attraction-table tbody tr:last-child td {
	border-bottom: none;
}

/* 照片单元格样式 */
.photo-cell {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.photo-count {
	color: #7f8c8d;
	font-size: 0.9rem;
	cursor: pointer;
	transition: color 0.2s;
}

.photo-count.has-photos {
	color: #3498db;
	font-weight: 500;
}

.photo-count.has-photos:hover {
	color: #2980b9;
	text-decoration: underline;
}

/* 照片浏览模态框 */
.photo-gallery-modal {
	max-width: 900px;
	width: 95%;
}

.gallery-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.5rem 1.5rem 0;
	border-bottom: 1px solid #eee;
	margin-bottom: 1rem;
}

.gallery-header h3 {
	margin: 0;
	color: #2c3e50;
	font-weight: 600;
}

.gallery-content {
	padding: 0 1.5rem;
}

/* 照片显示区域 */
.photo-display {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	margin-bottom: 1.5rem;
	min-height: 400px;
	background: #f8f9fa;
	border-radius: 12px;
	padding: 1rem;
}

.photo-wrapper {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	max-height: 400px;
	overflow: hidden;
}

.gallery-image {
	max-width: 100%;
	max-height: 400px;
	object-fit: contain;
	border-radius: 8px;
}

.no-photo {
	color: #7f8c8d;
	font-size: 1.2rem;
}

/* 导航按钮 */
.gallery-nav {
	background: white;
	border: 1px solid #ddd;
	border-radius: 50%;
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
	color: #2c3e50;
	flex-shrink: 0;
}

.gallery-nav:hover:not(:disabled) {
	background: #3498db;
	border-color: #3498db;
	color: white;
	transform: scale(1.1);
}

.gallery-nav:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

/* 照片信息栏 */
.photo-info-bar {
	background: #f8f9fa;
	padding: 1rem;
	border-radius: 8px;
	margin-bottom: 1rem;
	text-align: center;
}

.photo-title {
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 0.5rem;
}

.photo-description {
	color: #7f8c8d;
	font-size: 0.9rem;
	margin-bottom: 0.5rem;
}

.photo-counter {
	color: #3498db;
	font-weight: 500;
	font-size: 0.9rem;
}

/* 缩略图列表 */
.thumbnail-list {
	display: flex;
	gap: 0.5rem;
	overflow-x: auto;
	padding: 0.5rem 0;
	margin-bottom: 1rem;
}

.thumbnail-item {
	width: 80px;
	height: 80px;
	border-radius: 8px;
	overflow: hidden;
	cursor: pointer;
	border: 2px solid transparent;
	transition: border-color 0.2s;
	flex-shrink: 0;
}

.thumbnail-item.active {
	border-color: #3498db;
}

.thumbnail-item:hover {
	border-color: #2980b9;
}

.thumbnail-item img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.btn-add-photo-icon {
	background: #2ecc71;
	color: white;
	width: 32px;
	height: 32px;
	padding: 0;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.btn-add-photo-icon:hover {
	background: #27ae60;
	transform: scale(1.1);
}

/* 操作按钮 */
.action-buttons {
	display: flex;
	gap: 0.5rem;
	justify-content: flex-start;
}

.action-cell {
	padding: 1rem;
	border-bottom: 1px solid #e0e0e0;
	border-right: 1px solid #e0e0e0;
	vertical-align: middle;
}

.action-buttons .btn-icon {
	padding: 0.4rem;
	width: 32px;
	height: 32px;
}

/* 状态标签 */
.status-tag {
	padding: 0.25rem 0.75rem;
	border-radius: 20px;
	font-size: 0.85rem;
	font-weight: 500;
	cursor: pointer;
}

.status-tag.visited {
	background-color: #d4edda;
	color: #155724;
}

.status-tag.not-visited {
	background-color: #f8d7da;
	color: #721c24;
}

.status-tag {
	padding: 0.25rem 0.75rem;
	border-radius: 20px;
	font-size: 0.85rem;
	font-weight: 500;
	cursor: pointer;
}

.status-tag.visited {
	background-color: #d4edda;
	color: #155724;
}

.status-tag.not-visited {
	background-color: #f8d7da;
	color: #721c24;
}

.attraction-description {
	color: #555;
	line-height: 1.5;
	margin: 0.5rem 0;
}

.attraction-location {
	color: #7f8c8d;
	margin: 0.5rem 0;
}

.attraction-coordinates {
	color: #7f8c8d;
	margin: 0.5rem 0;
	font-size: 0.9rem;
}

.photos-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	gap: 1rem;
	margin-top: 1rem;
}

.photo-item {
	background: white;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.photo-preview {
	width: 100%;
	height: 100px;
	object-fit: cover;
	display: block;
}

.photo-info {
	padding: 0.75rem;
}

.photo-info h5 {
	margin: 0 0 0.25rem 0;
	color: #2c3e50;
	font-size: 0.9rem;
}

.photo-info p {
	margin: 0.25rem 0;
	font-size: 0.8rem;
	color: #7f8c8d;
}

.photo-actions {
	margin-top: 0.5rem;
	display: flex;
	gap: 0.25rem;
}

.notes-list {
	padding: 0 1.5rem 1.5rem;
}

/* 笔记表格容器 - 支持横向滚动 */
.notes-list .table-container {
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 笔记表格样式 */
.note-table {
	width: 100%;
	min-width: 600px;
	border-collapse: collapse;
	background: white;
	border-radius: 8px;
	overflow: hidden;
}

/* 表头样式 - 浅灰色背景，竖线分隔 */
.note-table th {
	background: #f5f7fa;
	padding: 1rem;
	text-align: left;
	font-weight: 600;
	color: #2c3e50;
	border-bottom: 2px solid #e0e0e0;
	border-right: 1px solid #e0e0e0;
	white-space: nowrap;
}

.note-table th:last-child {
	border-right: none;
}

/* 单元格样式 - 竖线分隔 */
.note-table td {
	padding: 1rem;
	border-bottom: 1px solid #e0e0e0;
	border-right: 1px solid #e0e0e0;
	color: #555;
	vertical-align: middle;
}

.note-table td:last-child {
	border-right: none;
}

/* 笔记内容单元格 */
.note-content-cell {
	max-width: 300px;
	white-space: normal;
	word-break: break-all;
}

/* 表格行悬停效果 */
.note-table tbody tr:hover {
	background: #f8f9fa;
}

.note-table tbody tr:last-child td {
	border-bottom: none;
}

/* 操作按钮 */
.notes-list .action-buttons {
	display: flex;
	gap: 0.5rem;
	justify-content: flex-start;
}

.notes-list .action-buttons .btn-icon {
	padding: 0.4rem;
	width: 32px;
	height: 32px;
}

.note-item {
	background: #f8f9fa;
	border-radius: 12px;
	padding: 1.25rem;
	margin: 1rem 0;
	border-left: 4px solid #9b59b6;
}

.note-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.75rem;
}

.note-title {
	font-weight: 600;
	color: #2c3e50;
	font-size: 1.1rem;
}

.note-content {
	color: #555;
	line-height: 1.5;
	margin: 0.5rem 0;
}

.note-date {
	color: #7f8c8d;
	font-size: 0.9rem;
	margin: 0.5rem 0;
}

.radio-label {
	display: inline-flex;
	align-items: center;
	margin-right: 1.5rem;
	margin-bottom: 1rem;
	cursor: pointer;
	font-size: 0.9rem;
}

.radio-label input {
	margin-right: 0.5rem;
}

.camera-container {
	text-align: center;
	margin: 1.5rem 0;
}

.camera-preview {
	width: 100%;
	max-width: 300px;
	height: 225px;
	border: 2px solid #3498db;
	border-radius: 8px;
	background: #000;
	object-fit: cover;
}

.captured-preview {
	width: 100%;
	max-width: 300px;
	height: 225px;
	object-fit: cover;
	border: 2px solid #2ecc71;
	border-radius: 8px;
	margin-top: 1rem;
	background: #f8f9fa;
}

.btn:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.btn-primary:disabled {
	background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
}

.photo-input-options {
	margin: 1.5rem 0;
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}

.location-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	margin: 1rem 0;
	padding: 1rem;
	background: #e3f2fd;
	border-radius: 8px;
}

.location-info .location-text {
	color: #0d47a1;
	font-size: 0.9rem;
	flex: 1;
	min-width: 0;
	word-break: break-all;
}

.location-info .btn-secondary {
	flex-shrink: 0;
	white-space: nowrap;
}

/* 删除照片按钮 */
.btn-delete-photo {
	background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.85rem;
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	margin-top: 0.5rem;
	transition: all 0.2s;
}

.btn-delete-photo:hover {
	background: linear-gradient(135deg, #c0392b 0%, #96281b 100%);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-delete-photo svg {
	flex-shrink: 0;
}

/* 照片信息栏调整 */
.photo-info-bar {
	background: #f8f9fa;
	padding: 1rem;
	border-radius: 8px;
	margin-bottom: 1rem;
	text-align: center;
	position: relative;
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-width: 1400px;
	margin: 0 auto;
	padding: 0 2rem;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.username {
	color: #2c3e50;
	font-weight: 500;
}

.user-type {
	padding: 0.25rem 0.75rem;
	border-radius: 20px;
	font-size: 0.85rem;
	background: #e3f2fd;
	color: #1976d2;
}

.user-type.guest {
	background: #fff3e0;
	color: #f57c00;
}

.btn-logout {
	padding: 0.5rem 1rem;
	background: #f5f5f5;
	color: #666;
	border: 1px solid #ddd;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.2s;
}

.btn-logout:hover {
	background: #e0e0e0;
	color: #333;
}

/* 移动端适配 */
@media (max-width: 768px) {
	.main-header h1 {
		font-size: 2rem;
	}

	.stats-container {
		grid-template-columns: 1fr;
	}

	.floating-stats {
		width: calc(100% - 1rem);
		/* 更窄的边距 */
		top: 110px;
		min-width: 100px;
	}

	.floating-stats.scrolled {
		top: 10px;
	}

	.main-content {
		padding-top: 130px;
		/* 调整为适应移动端 */
	}

	.row-content {
		flex-direction: column;
		align-items: stretch;
		text-align: center;
	}

	.itinerary-date,
	.itinerary-location {
		width: 100%;
		margin: 0.5rem 0;
	}

	.itinerary-actions {
		justify-content: center;
		margin-top: 0.5rem;
	}

	.date-group {
		flex-direction: column;
		gap: 0.5rem;
	}

	.photos-grid {
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.75rem;
	}

	.photo-preview {
		height: 90px;
	}

	.modal-content {
		width: 95%;
		margin: 2.5vh auto;
	}

	.pagination {
		flex-direction: column;
		gap: 0.5rem;
	}

	.btn-pagination {
		width: 100%;
	}

	.modal-actions {
		flex-direction: column;
	}

	.btn {
		width: 100%;
	}

	.search-filters {
		flex-direction: column;
		align-items: stretch;
	}

	.filter-section {
		flex-direction: column;
		align-items: stretch;
	}

	.search-input {
		min-width: auto;
	}

	.attraction-table {
		font-size: 0.85rem;
	}

	.attraction-table th,
	.attraction-table td {
		padding: 0.75rem 0.5rem;
	}

	.action-buttons {
		flex-direction: column;
		gap: 0.25rem;
	}

	.action-buttons .btn {
		padding: 0.4rem;
		font-size: 0.75rem;
	}

	.attractions-list {
		padding: 0 1rem 1rem;
	}

	.table-container {
		border-radius: 6px;
	}

	.attraction-table {
		min-width: 500px;
		font-size: 0.85rem;
	}

	.attraction-table th,
	.attraction-table td {
		padding: 0.75rem 0.5rem;
	}

	.photo-cell {
		gap: 0.25rem;
	}

	.btn-add-photo-icon {
		width: 28px;
		height: 28px;
	}

	.action-buttons .btn-icon {
		width: 28px;
		height: 28px;
	}

	.sub-form {
		flex-direction: column;
		/* 移动端垂直排列 */
		gap: 0.75rem;
	}

	.photo-display {
		flex-direction: column;
		min-height: 300px;
	}

	.gallery-nav {
		width: 40px;
		height: 40px;
	}

	.gallery-image {
		max-height: 300px;
	}

	.thumbnail-item {
		width: 60px;
		height: 60px;
	}

	.photo-gallery-modal {
		width: 98%;
		max-height: 95vh;
	}

	.btn-delete-photo {
		width: 100%;
		justify-content: center;
	}

	.photo-info-bar {
		padding: 0.75rem;
	}

	.itinerary-list {
		width: 100%;
		padding: 0 0.5rem;
	}

	.empty-state {
		padding: 2rem 1rem;
		min-height: 180px;
	}

	.empty-icon {
		font-size: 2.5rem;
	}

	.camera-container {
		margin: 1rem 0;
	}

	.camera-preview {
		width: 100%;
		max-width: 100%;
		height: auto;
		aspect-ratio: 4/3;
		border-radius: 12px;
	}

	.captured-preview {
		width: 100%;
		max-width: 100%;
		height: auto;
		aspect-ratio: 4/3;
		border-radius: 12px;
	}

	.camera-container .btn-primary {
		width: 100%;
		margin-top: 1rem;
		padding: 1rem 2rem;
		font-size: 1.1rem;
	}

	/* 防止 iOS 按钮点击高亮 */
	.btn {
		-webkit-tap-highlight-color: transparent;
	}

	/* 防止 iOS 长按菜单 */
	.camera-preview,
	.captured-preview {
		-webkit-touch-callout: none;
		user-select: none;
	}

	.modal-content {
		max-height: 95vh;
	}

	.camera-preview {
		max-height: 60vh;
	}

	.storage-info {
		font-size: 0.65rem;
	}
}
</style>
