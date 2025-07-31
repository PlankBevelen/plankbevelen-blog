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
            {{ commentCount }}
        </span> 
      </div>
      <div class="comment-list" v-show="isComment">
        <div class="comment-item" v-for="comment in comments" :key="comment.id">
          <div class="comment-header">
            <el-image :src="comment.user.avatar" alt="头像" class="avatar" fit="cover" />
            <div class="box">
              <span class="nickname">{{ comment.user.nickname }}</span>
              <span class="date">{{ smartFormatTime(comment.created_at) }}</span>
            </div>
          </div>
          <div class="comment-content">
            <p>
              <span v-if="comment.reply_to_user" class="reply-to">
                回复 @{{ comment.reply_to_user.nickname }}：
              </span>
              {{ comment.content }}
            </p>
          </div>
          <div class="comment-actions">
            <el-button 
              type="text" 
              size="small" 
              @click="showReplyInput(comment.id, comment.user.id, comment.user.nickname)"
            >
              回复
            </el-button>
          </div>
          
          <!-- 回复列表 -->
          <div class="reply-list" v-if="comment.replies && comment.replies.length > 0">
            <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
              <div class="reply-header">
                <el-image :src="reply.user.avatar" alt="头像" class="avatar" fit="cover" />
                <div class="box">
                  <span class="nickname">{{ reply.user.nickname }}</span>
                  <span class="date">{{ smartFormatTime(reply.created_at) }}</span>
                </div>
              </div>
              <div class="reply-content">
                <p>
                  <span v-if="reply.reply_to_user" class="reply-to">
                    回复 @{{ reply.reply_to_user.nickname }}：
                  </span>
                  {{ reply.content }}
                </p>
              </div>
              <div class="reply-actions">
                <el-button 
                  type="text" 
                  size="small" 
                  @click="showReplyInput(comment.id, reply.user.id, reply.user.nickname)"
                >
                  回复
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 回复输入框 -->
          <div class="reply-editor" v-if="replyState.parentId === comment.id">
            <el-input
              v-model="replyState.content"
              type="textarea"
              :placeholder="`回复 @${replyState.replyToUserNickname}`"
              maxlength="100"
              show-word-limit
              autosize="{ minRows: 1, maxRows: 2 }"
            />
            <div class="reply-buttons">
              <el-button size="small" @click="cancelReply">取消</el-button>
              <el-button type="primary" size="small" @click="submitReply">回复</el-button>
            </div>
          </div>
        </div>
      </div>
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

// 回复状态
const replyState = ref({
  parentId: null as number | null,
  replyToUserId: null as number | null,
  replyToUserNickname: '',
  content: ''
});

// 从store获取点赞状态
const likeState = computed(() => likeStore.getLikeState(props.item.id));

// 点赞数量：优先使用store中的数据，如果store中没有该说说的状态则使用props中的数据
const likeCount = computed(() => {
  // 检查store中是否存在该说说的状态
  const hasStoreState = likeStore.likeStates[props.item.id] !== undefined;
  return hasStoreState ? likeState.value.count : (props.item.like_count || 0);
});

// 评论数量：优先使用store中的数据，如果store中没有该说说的状态则使用props中的数据
const commentCount = computed(() => {
  return commentStore.getCommentState(props.item.id).count || props.item.comment_count;
});

// 评论列表
const comments = computed(() => {
  return commentStore.getCommentList(props.item.id);
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
  
  // 如果打开评论区且还没有加载评论，则加载评论列表
  if (isComment.value && comments.value.length === 0) {
    await commentStore.fetchCommentList(props.item.id);
  }
}

// 显示回复输入框
const showReplyInput = (parentId: number, replyToUserId: number, replyToUserNickname: string) => {
  replyState.value = {
    parentId,
    replyToUserId,
    replyToUserNickname,
    content: ''
  };
};

// 取消回复
const cancelReply = () => {
  replyState.value = {
    parentId: null,
    replyToUserId: null,
    replyToUserNickname: '',
    content: ''
  };
};

// 提交回复
const submitReply = async () => {
  if (!replyState.value.content) {
    ElMessage({
      message: '请输入回复内容',
      type: 'warning',
    });
    return;
  }
  
  const result = await commentStore.addComment(
    props.item.id, 
    replyState.value.content,
    replyState.value.parentId!,
    replyState.value.replyToUserId!
  );
  
  if (result && result.success) {
    cancelReply();
    // 重新加载评论列表以显示新回复
    await commentStore.fetchCommentList(props.item.id);
  }
};

// 评论
const submitComment = async () => {
  if (!commentContent.value) {
    ElMessage({
      message: '请输入评论内容',
      type: 'warning',
    });
    return;
  }
  
  const result = await commentStore.addComment(props.item.id, commentContent.value);
  console.log(result);
  if (result && result.success) {
    commentContent.value = '';
    // 重新加载评论列表以显示新评论
    await commentStore.fetchCommentList(props.item.id);
  }
}

const openImage = (imgUrl: string) => {
  openImagePreview(imgUrl);
};

</script>

<style lang="less" src="@/assets/styles/components/about/AboutCard.less"/>