<!-- src/components/AboutCard.vue -->
<template>
  <div class="about-card">
    <div class="card-header">
      <el-image :src="item.avatar" alt="头像" class="avatar" fit="cover" />
      <div class="box">
        <span class="nickname">{{ item.nickname }}</span>
        <span class="date">{{ smartFormatTime(item.created_at) }}</span>
      </div>
    </div>
    <div class="card-content">
      <p>{{ item.content }}</p>
      <div v-if="item.images && item.images.length" class="image-grid">
        <img 
          v-for="(img, index) in item.images" 
          :key="index" 
          v-lazy="img" 
          alt="说说图片"
          @click="openImage(img)"
        >
      </div>
    </div>
    <div class="card-footer">
      <div class="stats">
        <span class="stats-item like-item" :class="{ liked: isLiked, loading: isLoading }" @click="toggleLike">
            <svg-icon name="like" size="1.35rem" :color="isLiked ? '#409eff' : '#606266'" />
            {{ likeCount }}
        </span>
        <span class="stats-item comment-item" :class="{ active: isComment }" @click="toggleComment">
            <svg-icon name="comment" size="1.18rem" :color="isComment ? '#409eff' : '#606266'"/>
            {{ item.comment_count || 0 }}
        </span> 
      </div>
      <!-- <div class="comment-list" v-show="isComment">
        1
      </div> -->
      <div class="comment-editor" v-show="isComment">
        <el-input
        v-model="commentContent"
        type="textarea"
        placeholder="写评论"
        maxlength="100"
        show-word-limit
        autosize="{ minRows: 1, maxRows: 2 }"
        />
        <el-button type="primary" @click="submitComment">评论</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Talk } from '~/types/talk';
import { openImagePreview } from '~/utils/imageUtils';
import { useLikeStore } from '~/stores/like';
import { useCommentStore } from '~/stores/comment';
import { useUserStore } from '~/stores/user';
import { smartFormatTime } from '~/utils/timeUtils';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  item: Talk;
}>();

const likeStore = useLikeStore();
const commentStore = useCommentStore();
const userStore = useUserStore();

const commentContent = ref('');

const isComment = ref(false);

// 从store获取点赞状态
const likeState = computed(() => likeStore.getLikeState(props.item.id));

// 点赞数量：优先使用store中的数据，如果store中没有该说说的状态则使用props中的数据
const likeCount = computed(() => {
  // 检查store中是否存在该说说的状态
  const hasStoreState = likeStore.likeStates[props.item.id] !== undefined;
  return hasStoreState ? likeState.value.count : (props.item.like_count || 0);
});

// 点赞状态
const isLiked = computed(() => likeState.value.isLiked);
const isLoading = computed(() => likeState.value.loading);

// 切换点赞
const toggleLike = async () => {
  await likeStore.toggleLike(props.item.id);
};

// 切换评论
const toggleComment = async () => {
  isComment.value = !isComment.value;
}

// 评论
const submitComment = async () => {
  if (!commentContent.value) {
    ElMessage({
      message: '请输入评论内容',
      type: 'warning',
    });
    return;
  }
  commentStore.addComment(userStore.userInfo.id, props.item.id, commentContent.value);
  commentContent.value = '';
}

const openImage = (imgUrl: string) => {
  openImagePreview(imgUrl);
};

</script>

<style lang="less" src="@/assets/styles/components/about/AboutCard.less"/>