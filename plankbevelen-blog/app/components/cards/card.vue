<template>
    <div :class="['card', type, { animation }]">
        <div class="card-content">
            <slot></slot>
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    animation: {
        type: Boolean,
        default: false
    }
})

</script>

<style scoped lang="less">
.card {
    border-radius: @small-border-radius;
    border: 1px solid var(--border-color);
    background-color: var(--card-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
    padding: 20px;
    position: relative;
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.125);
    }

    &.animation {
        &.blogger::before,
        &.blogger::after {
            content: '';
            position: absolute;
            background: var(--primary-color);
            z-index: 1;
            pointer-events: none;
            border-radius: @small-border-radius;
        }
    
        &.blogger::before {
            top: 0;
            left: 0;
            width: 2px;
            height: 0;
            animation: lineLeftBottom 10s ease-in-out infinite;
        }
        
        &.blogger::after {
            top: 0;
            left: 0;
            width: 0;
            height: 2px;
            animation: lineTopRight 10s ease-in-out infinite;
        }        
    }    
}

// 左边和下边的动画
@keyframes lineLeftBottom {

    0% {
        top: 0;
        bottom: auto;
        left: 0;
        width: 2px;
        height: 0;
        background: linear-gradient(to bottom, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    12.5% {
        top: 0;
        bottom: auto;
        left: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(to bottom, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    25% {
        top: 100%;
        bottom: auto;
        left: 0;
        width: 2px;
        height: 0;
        background: linear-gradient(to bottom, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    25.01% {
        top: auto;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(to right, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    37.5% {
        top: auto;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    50% {
        top: auto;
        bottom: 0;
        left: 100%;
        width: 0;
        height: 2px;
        background: linear-gradient(to right, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    50.01% {
        top: auto;
        bottom: 0;
        left: 100%;
        right: auto;
        width: 0;
        height: 2px;
        background: linear-gradient(to left, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    62.5% {
        top: auto;
        bottom: 0;
        left: 0;
        right: auto;
        width: 100%;
        height: 2px;
        background: linear-gradient(to left, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    75% {
        top: auto;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(to left, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    75.01% {
        top: 100%;
        bottom: auto;
        left: 0;
        width: 2px;
        height: 0;
        background: linear-gradient(to top, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    87.5% {
        top: 0;
        bottom: auto;
        left: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(to top, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    100% {
        top: 0;
        bottom: auto;
        left: 0;
        width: 2px;
        height: 0;
        background: linear-gradient(to top, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
}
@keyframes lineTopRight {
    0% {
        top: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(to right, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    12.5% {
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    25% {
        top: 0;
        left: 100%;
        width: 0;
        height: 2px;
        background: linear-gradient(to right, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    25.01% {
        top: 0;
        left: auto;
        right: 0;
        width: 2px;
        height: 0;
        background: linear-gradient(to bottom, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    37.5% {
        top: 0;
        left: auto;
        right: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(to bottom, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    50% {
        top: 100%;
        left: auto;
        right: 0;
        width: 2px;
        height: 0;
        background: linear-gradient(to bottom, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    50.01% {
        top: 100%;
        bottom: auto;
        left: auto;
        right: 0;
        width: 2px;
        height: 0;
        background: linear-gradient(to top, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    62.5% {
        top: 0;
        bottom: auto;
        left: auto;
        right: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(to top, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    75% {
        top: 0;
        left: auto;
        right: 0;
        width: 2px;
        height: 0;
        background: linear-gradient(to top, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    75.01% {
        top: 0;
        left: 100%;
        right: auto;
        width: 0;
        height: 2px;
        background: linear-gradient(to left, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    87.5% {
        top: 0;
        left: 0;
        right: auto;
        width: 100%;
        height: 2px;
        background: linear-gradient(to left, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
    100% {
        top: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(to left, var(--primary-color-03), var(--primary-color), var(--primary-color-03));
    }
}
</style>
