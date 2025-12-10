<template>
    <div class="three-column-layout">
        <div class="content">
            <div class="left">
                <div class="slot-wrapper" v-show="!loading">
                    <slot name="left"></slot>
                </div>
                <div class="skeleton-group" v-show="loading">
                    <div class="skeleton block"></div>
                    <div class="skeleton block"></div>
                </div>
            </div>
            <div class="middle">
                <div class="slot-wrapper" v-show="!loading">
                    <slot name="middle"></slot>
                </div>
                <div class="skeleton-group" v-show="loading">
                    <div class="skeleton block large"></div>
                    <div class="skeleton block"></div>
                    <div class="skeleton block"></div>
                </div>
            </div>
            <div class="right">
                <div class="slot-wrapper" v-show="!loading">
                    <slot name="right"></slot>
                </div>
                <div class="skeleton-group" v-show="loading">
                    <div class="skeleton block"></div>
                    <div class="skeleton block"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="less" scoped>
.three-column-layout {
    height: auto;
}

.content {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-gap: 20px;
    height: auto;
}

.left, .middle, .right {
    display: flex;
    flex-direction: column;
    gap: @base-gap;
    min-width: 0;
}

/* Slot wrapper 用于保持插槽内容的布局结构 */
.slot-wrapper {
    display: flex;
    flex-direction: column;
    gap: @base-gap;
}

/* 动画效果应用到 slot-wrapper 的直接子元素 */
.left .slot-wrapper > * {
    animation: fly-in-from-top-left 0.3s ease-in-out;    
}

.middle .slot-wrapper > * {
    animation: fly-in-from-center 0.3s ease-in-out;
}

.right .slot-wrapper > * {
    animation: fly-in-from-top-right 0.3s ease-in-out;
}

/* 骨架屏样式 */
.skeleton-group {
    display: flex;
    flex-direction: column;
    gap: @base-gap;
}

.skeleton.block {
    position: relative;
    height: 140px;
    border-radius: @small-border-radius;
    background-color: var(--mute-bg-color);
    overflow: hidden;
}

.skeleton.block.large { 
    height: 220px; 
}

.skeleton.block::after {
    content: '';
    position: absolute;
    top: 0;
    left: -40%;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
    0% { left: -40%; }
    100% { left: 100%; }
}

@media (max-width: 1024px) {
    .content {
        grid-template-columns: 1fr;
        
        .left, .right {
            order: 2;
        }
        
        .middle {
            order: 1;
        }
    }
}
</style>