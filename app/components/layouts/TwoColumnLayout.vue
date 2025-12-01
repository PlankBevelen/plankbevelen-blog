<template>
    <div class="two-column-layout">
        <div class="content" :class="[type]">
            <div class="left">
                <slot name="left" v-if="!loading"></slot>
                <div class="skeleton-group" v-else>
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
    type: {
        type: String,
        default: 'rightbigger'
    },
    loading: {
        type: Boolean,
        default: false
    }
})
</script>

<style lang="less" scoped>
.two-column-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.content {
    display: grid;
    grid-gap: 20px;
    width: 100%;
    &.leftbigger {        
        grid-template-columns: 2fr 1fr;
    }
    &.rightbigger {
        grid-template-columns: 1fr 2.5fr;
    }
    &.equal {
        grid-template-columns: 1fr 1fr;
    }
}
.left, .right {
    display: flex;
    flex-direction: column;
    gap: @base-gap;
}
.left > * {
    animation: fly-in-from-left-top 0.3s ease-in-out;
}
.right > * {
    animation: fly-in-from-top-right 0.3s ease-in-out;
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
