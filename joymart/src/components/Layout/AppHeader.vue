<template>
    <div class="header">
        <div class="logo">
            <svg-icon iconName="icon" class="logo-icon" />
            <div class="brand">JoyMart</div>
        </div>
        <ul class="nav-menu">
            <li class="nav-item active"><a class="nav-link" href="#">主页</a></li>
            <li class="nav-item"><a class="nav-link" href="#">分类</a></li>
            <li class="nav-item"><a class="nav-link" href="#">今日特惠</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Prime会员</a></li>
            <li class="nav-item"><a class="nav-link" href="#">新品上市</a></li>
        </ul>
        <div class="nav-right">
            <div class="search-box">
                <el-input v-model="searchText" placeholder="搜索商品..." clearable :prefix-icon="Search" />
            </div>
            <div class="action-btn">
                <svg-icon iconName="heart" class="action-icon" />
            </div>
            <div class="action-btn">
                <svg-icon iconName="cart" class="action-icon" />
            </div>
            <div class="action-btn">
                <svg-icon iconName="user" class="action-icon" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const searchText = ref('')

</script>

<style lang="less" scoped>
.header{
    max-width: var(--max-width);
    margin: 0 auto;
    display: flex;
    align-items: center;
    padding: 14px 40px;
    border-bottom: 1px solid var(--light-gray);
    line-height: 1.5;

    .logo {
        display: flex;
        align-items: center;
        margin-right: 50px;

        .logo-icon {
            width: 30px;
            height: 30px;
            margin-right: 10px;
        }

        .brand {
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.5px;
            color: var(--dark);
        }
    }

    .nav-menu {
        display: flex;
        flex: 1;
        list-style: none;

        .nav-item {
            margin-right: 30px;
            position: relative;

            &.active {
                .nav-link {
                    color: var(--primary);
                    &::after {
                        width: 100%;
                    }
                }
            }

            .nav-link {
                color: var(--dark);
                text-decoration: none;
                font-size: 14px;
                font-weight: 450;
                padding: 8px 0;
                position: relative;
                transition: var(--transition);

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: var(--primary);
                    transition: var(--transition);
                }

                &:hover {
                    color: var(--primary);
                    &::after {
                        width: 100%;
                    }
                }
            }
        }
    }

    .nav-right {
        display: flex;
        gap: 20px;
        align-items: center;
        .action-btn {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--dark);
            cursor: pointer;
            transition: var(--transition);
            background: none;
            border: none;
            font-size: 16px;
            &:hover {
                color: var(--primary);
                background: var(--light);
                .action-icon {
                    fill: var(--primary);
                    stroke: var(--primary);
                }
            }
        }
    }
}
</style>
