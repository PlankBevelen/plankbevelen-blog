<!-- src/components/AboutCard.vue -->
<template>
  <div class="about-card">
    <div class="card-header">
      <img :src="item.avatar" alt="头像" class="avatar">
      <div class="box">
        <span class="nickname">{{ item.nickname }}</span>
        <span class="date">{{ item.date }}</span>
      </div>
      
    </div>
    <div class="card-content">
      <p>{{ item.content }}</p>
      <div v-if="item.imgs.length" class="image-grid">
        <img 
          v-for="(img, index) in item.imgs" 
          :key="index" 
          v-lazy="img" 
          alt="说说图片"
          @click="openImage(img)"
        >
      </div>
    </div>
    <div class="card-footer">
      <span class="date">浏览{{ item.views }}次</span>
      <div class="stats">
        <span class="stats-item">
            <svg-icon name="like" size="1rem"/>
            {{ item.likes }}
        </span>
        <span class="stats-item">
            <svg-icon name="comment" size="1rem"/>
            {{ item.comments }}
        </span> 
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  item: {
    id: number;
    avatar: string;
    nickname: string;
    content: string;
    imgs: string[];
    date: string;
    views: number;
    comments: number;
    likes: number;
  }
}>();

const openImage = (imgUrl: string) => {
  window.open(imgUrl, '_blank');
};
</script>

<style lang="less" src="@/assets/styles/components/about/AboutCard.less"/>