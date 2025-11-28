<template>
    <div class="two-column-layout">
        <div class="content" :class="[type]">
            <div class="left">
                <slot name="left"></slot>
            </div>
            <div class="right">
                <slot name="right"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    type: {
        type: String,
        default: 'rightbigger'
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
    &.leftbigger {        
        grid-template-columns: 3fr 1fr;
    }
    &.rightbigger {
        grid-template-columns: 1fr 3fr;
    }
    &.equal {
        grid-template-columns: 1fr 1fr;
    }
}
.left > * {
    animation: fly-in-from-left-top 0.3s ease-in-out;
}
.right > * {
    animation: fly-in-from-top-right 0.3s ease-in-out;
}
</style>