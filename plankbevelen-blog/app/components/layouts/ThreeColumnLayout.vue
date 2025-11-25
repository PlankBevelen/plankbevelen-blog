<template>
    <div class="three-column-layout">
        <div class="content">
            <div class="left">
                <slot name="left"></slot>
            </div>
            <div class="middle">
                <slot name="middle"></slot>
            </div>
            <div class="right">
                <slot name="right"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style lang="less" scoped>
.three-column-layout {
    height: 100%;
}
.content {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-gap: 20px;
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
</style>