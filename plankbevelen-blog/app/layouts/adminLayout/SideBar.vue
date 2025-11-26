<template>
    <div class="sideBar">
        <div class="sideBarWrapper">
            <el-menu
                :collapse="isCollapsed"
                default-active="1"
                class="sideBarMenu"
            >
                <el-menu-item index="1" @click="navigateTo('/admim')">
                    <nuxt-icon name="admin/sidebar/dashboard"></nuxt-icon>仪表盘
                </el-menu-item>
                <el-sub-menu index="2">
                    <template #title>
                        <nuxt-icon name="admin/sidebar/content"></nuxt-icon>内容管理
                    </template>
                    <el-menu-item index="2-1" @click="navigateTo('/admin/content/article')">
                        文章管理
                    </el-menu-item>
                    <el-menu-item index="2-2" @click="navigateTo('/admin/content/category')">
                        分类管理
                    </el-menu-item>
                </el-sub-menu>
                <el-menu-item index="3" @click="navigateTo('/admin/statistics')">
                    <nuxt-icon name="admin/sidebar/stastics"></nuxt-icon>数据统计
                </el-menu-item>
            </el-menu>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{ isCollapsed: boolean }>()
</script>

<style scoped lang="less">
.sideBar {
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    height: 100%;
    background-color: var(--card-color);
    transition: all 0.3s ease-in-out;
    padding: 20px 20px;
    position: sticky;
    .sideBarWrapper {
        width: 100%;
        height: 100%;
        margin: 0 auto;
        border-radius: @extra-large-border-radius;
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--border-color);
        padding: 20px;
        .sideBarMenu {
            width: 100%;
            height: 100%;
            line-height: normal !important;
            .nuxt-icon {
                margin-right: 12px;
            }
            :deep(.el-menu-item, .el-sub-menu__title) {
                height: 50px;
                font-size: 16px;
                border-radius: @base-border-radius;
                &.is-active {
                    background-color: var(--shallow-active-bg-color);
                    color: var(--primary-color) ;
                    &::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        height: 100%;
                        width: 6px;
                        background-color: var(--primary-color);
                        border-radius: @base-border-radius 0 0 @base-border-radius;
                    }
                }
                &:hover {
                    background-color: var(--shallow-hover-bg-color);
                    transform: translateX(4px);
                    color: var(--primary-color);
                }
                &:not(:last-child) {
                    margin-bottom: 12px;
                }
            }
            :deep(.el-sub-menu) {
                border-radius: @base-border-radius;   
                margin-bottom: 12px;
                &__title {
                    height: 50px;
                    font-size: 16px;
                    border-radius: @base-border-radius;
                    margin-bottom: 6px;
                    &:hover {
                        transition: all 0.3s ease-in-out;
                        background-color: var(--shallow-hover-bg-color);
                        transform: translateX(3px);
                        color: var(--primary-color);
                    }
                }
                .el-menu-item {
                    height: 40px;
                    font-size: 14px;
                    position: relative;
                    &:hover {
                        transition: all 0.3s ease-in-out;
                        background-color: var(--deep-hover-bg-color);
                        transform: translateX(3px);
                        color: var(--primary-color);
                        &::before {
                            content: '▸';
                            position: absolute;
                            top: 50%;
                            left: 10%;
                            transform: translate(-50%, -50%);
                            font-size: 24px;
                            color: var(--primary-color);
                        }
                    }
                    &.is-active {
                        background-color: var(--shallow-active-bg-color);
                        color: var(--primary-color) ;
                        &::before {
                            content: '';
                            position: absolute;
                            left: 0;
                            height: 100%;
                            width: 6px;
                            background-color: var(--primary-color);
                            border-radius: @base-border-radius 0 0 @base-border-radius;
                        }
                    }
                }
            }
        }
    }
}

</style>
