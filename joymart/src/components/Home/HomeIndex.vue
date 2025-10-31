<template>
    <div class="home">
        <!-- 主视觉区域 -->
        <div class="hero-section">
            <div class="hero-content">
                <div class="hero-preheading">新品限时9折</div>
                <h1 class="hero-heading">简约设计，<br>卓越品质</h1>
                <p class="hero-text">JoyMart精选简约美学和实用功能并重的优质商品，AI算法为您推荐最适合的生活解决方案。</p>
                <a href="#" class="cta-button">立即选购 <Right style="margin-left: 10px; width: 16px; height: 16px;"></Right></a>
            </div>
            <div class="hero-image-container">
                <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80" alt="简约设计产品" class="hero-image"></img>
            </div>
        </div>
        <!-- 热门分类 -->
        <div class="categories-section">
            <div class="section-header">
                <h2>探索热门类别</h2>
                <p>发现我们最受欢迎的购物分类</p>
            </div>
            
            <div class="categories-grid">
                <a href="#" class="category-card">
                    <div class="category-img" style="background-image: url('https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&amp;w=1026&amp;auto=format&amp;fit=crop')"></div>
                    <div class="category-content">
                        <h3>电子产品</h3>
                        <p>智能设备、电脑配件</p>
                    </div>
                </a>
                
                <a href="#" class="category-card">
                    <div class="category-img" style="background-image: url('https://images.unsplash.com/photo-1547005327-ef75a6961556?q=80&amp;w=1074&amp;auto=format&amp;fit=crop')"></div>
                    <div class="category-content">
                        <h3>家具家居</h3>
                        <p>简约设计家具</p>
                    </div>
                </a>
                
                <a href="#" class="category-card">
                    <div class="category-img" style="background-image: url('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&amp;w=1171&amp;auto=format&amp;fit=crop')"></div>
                    <div class="category-content">
                        <h3>时尚服饰</h3>
                        <p>高品质服装与配饰</p>
                    </div>
                </a>
                
                <a href="#" class="category-card">
                    <div class="category-img" style="background-image: url('https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&amp;w=1032&amp;auto=format&amp;fit=crop')"></div>
                    <div class="category-content">
                        <h3>书籍文娱</h3>
                        <p>精选图书与娱乐</p>
                    </div>
                </a>
            </div>
        </div>
        <!-- 核心模块（移动到热门类别下方） -->
        <div class="ai-section">
            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&amp;w=1026&amp;auto=format&amp;fit=crop" alt="AI推荐">
            <div class="ai-content">
                <h2>AI推荐</h2>
                <p>JoyMart的LSTM智能推荐系统分析您的购物偏好，为您精准匹配商品。与传统推荐算法不同，LSTM模型能理解序列数据的长期依赖关系，提供更符合您品位的商品建议，提升购物体验。</p>
                <p>根据您最近的活动，我们预测您可能对这些品类特别感兴趣：</p>
                <h3>您的兴趣分布</h3>
                <!-- 分布图 - echart -->
                 
            </div>
        </div>
        <!-- 赞助品牌（移动到页面底部） -->
        <div class="sponsor-section">
            <div class="sponsor-header">
                <h2>赞助品牌</h2>
                <p>支持我们的合作伙伴，提升服务质量</p>
            </div>
            <div class="sponsor-content">
                <div class="sponsor-logos">
                    <!-- 第一组 -->
                    <div class="sponsor-item" v-for="(b, i) in brands" :key="'a-'+i">
                        <img class="sponsor-logo" :src="b.logo" :alt="b.name" />
                        <div class="sponsor-name">{{ b.name }}</div>
                    </div>
                    <!-- 第二组，用于无缝滚动 -->
                    <div class="sponsor-item" v-for="(b, i) in brands" :key="'b-'+i">
                        <img class="sponsor-logo" :src="b.logo" :alt="b.name" />
                        <div class="sponsor-name">{{ b.name }}</div>
                    </div>
                </div>
            </div> 
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Right } from '@element-plus/icons-vue'

type Brand = { name: string; logo: string }
const brands = ref<Brand[]>([
    { name: 'Apple', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Apple' },
    { name: 'Nike', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Nike' },
    { name: 'Sony', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Sony' },
    { name: 'Adidas', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Adidas' },
    { name: 'Samsung', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Samsung' },
    { name: 'LG', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=LG' },
    { name: 'Microsoft', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Microsoft' },
    { name: 'Google', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Google' },
    { name: 'Amazon', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Amazon' },
    { name: 'Dell', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Dell' },
    { name: 'Lenovo', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Lenovo' },
    { name: 'HP', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=HP' },
    { name: 'Intel', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Intel' },
    { name: 'Puma', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Puma' },
    { name: 'Uniqlo', logo: 'https://dummyimage.com/200x80/ddd/aaa&text=Uniqlo' },
])
</script>

<style lang="less" scoped src="./homeIndex.less"></style>
