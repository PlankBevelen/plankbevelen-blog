<template>
    <div class="error">
        <div class="error-wrapper">
            <NuxtImg 
                src="/img/404.webp"
                format="webp"
                alt="404"
                class="error-img"
                :width="600"
                loading="eager"
                quality="90"
            />
            <div class="error-text">不好意思，您好像走错了~</div>
            <NuxtLink to="/" class="error-btn">点击返回首页</NuxtLink>
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style lang="less" scoped>
.error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-color: var(--bg-color);
    .error-wrapper {
        width: auto;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .error-img {
            margin-bottom: 24px;
            width: 600px;
            height: auto;
            object-fit: cover;
        }
        .error-text {
            font-size: 24px;
            font-weight: 400;
            color: var(--color-text);
        }
        .error-btn {
            margin-top: 24px;
            padding: 12px 24px;
            border-radius: 4px;
            background-color: var(--primary-color);
            font-size: 24px;
            font-weight: 400;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s ease-in-out;
            text-decoration: none;
            &:hover {
                background-color: var(--primary-hover-color);
            }
        }
    }
}
</style>