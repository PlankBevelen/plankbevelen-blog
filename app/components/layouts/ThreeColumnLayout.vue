<template>
    <div class="three-column-layout">
        <div class="content">
            <div class="left">
                <slot name="left" v-if="!loading"></slot>
                <div class="skeleton-group" v-else>
                    <div class="skeleton block"></div>
                    <div class="skeleton block"></div>
                </div>
            </div>
            <div class="middle">
                <slot name="middle" v-if="!loading"></slot>
                <div class="skeleton-group" v-else>
                    <div class="skeleton block large"></div>
                    <div class="skeleton block"></div>
                    <div class="skeleton block"></div>
                </div>
            </div>
            <div class="right">
                <slot name="right" v-if="!loading"></slot>
                <div class="skeleton-group" v-else>
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
.left > * {
    animation: fly-in-from-top-left 0.3s ease-in-out;    
}
.middle > * {
    animation: fly-in-from-center 0.3s ease-in-out;
}
.right > * {
    animation: fly-in-from-top-right 0.3s ease-in-out;
}
.left, .middle, .right {
    display: flex;
    flex-direction: column;
    gap: @base-gap;
}

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
.skeleton.block.large { height: 220px; }
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
</style>
