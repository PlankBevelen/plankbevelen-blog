<template>
  <div class="message">
    <div class="container" v-if="modal === 'list' ">
        
    </div>
    <div class="message-container" v-else>
        <MessageFullScreen />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MessageFullScreen from '@/components/message/MessageFullScreen.vue';

// full or list
const modal = ref('full')

</script>

<style scoped lang="less" src="@/assets/styles/pages/message.less" />