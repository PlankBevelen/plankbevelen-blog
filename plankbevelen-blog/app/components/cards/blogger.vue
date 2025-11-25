<template>    
    <Card type="blogger" animation>
        <template #content>
            <div class="blogger-avatar">
                <img :src="avatar" alt="">
            </div>
            <div class="blogger-name">
                {{ name }}
            </div>
            <div class="blogger-profession">
                <nuxt-icon name="blogger/profession" />{{ t('cards.blogger.profession') }}
            </div>
            <div class="blogger-location">
                <nuxt-icon name="blogger/location" />{{ t('cards.blogger.location') }}
            </div>
            <div class="blogger-article">
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-statistic :title="t('cards.blogger.stats.articles')" :value="articleCountOutput"></el-statistic>
                    </el-col>
                    <el-col :span="8">
                        <el-statistic :title="t('cards.blogger.stats.categories')" :value="followCountOutput"></el-statistic>
                    </el-col>
                    <el-col :span="8">
                        <el-statistic :title="t('cards.blogger.stats.tags')" :value="tagCountOutput"></el-statistic>
                    </el-col>
                </el-row>
            </div>
        </template>
    </Card>    
</template>

<script setup lang="ts">
import Card from './card.vue'
import { ref, onMounted } from 'vue'
import { useTransition } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import cardsLang from './cardsLang.json'

const name = 'PlankBevelen'
const avatar = '/img/avatar.jpg'

const { t } = useI18n({ useScope: 'local', messages: cardsLang as any })

const articleCount = ref(0)
const followCount = ref(0)
const tagCount = ref(0)
const articleCountOutput = useTransition(articleCount, { duration: 1000 })
const followCountOutput = useTransition(followCount, { duration: 1000 })
const tagCountOutput = useTransition(tagCount, { duration: 1000 })
onMounted(() => {
    articleCount.value = 1000
    followCount.value = 100
    tagCount.value = 100
})

</script>

<style scoped lang="less">
.blogger {
    text-align: center;
    .blogger-avatar {
        width: 60%;
        height: auto;
        margin: 0 auto;
        margin-bottom: 12px;
        overflow: hidden;
        border-radius: @base-border-radius;
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
    .blogger-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
    }
    .blogger-profession {
        font-size: 14px;
        margin-bottom: 12px;        
        .nuxt-icon {
            margin-right: 4px;
            font-size: 18px;
        }
    }
    .blogger-location {
        font-size: 14px;
        margin-bottom: 12px;
        .nuxt-icon {
            margin-right: 4px;
            font-size: 18px;
        }
    }
    .blogger-article {
        :deep(.el-statistic__content) {
            font-size: 18px;
        }
        :deep(.el-statistic__head) {
            color: var(--secondary-color) ;
        }
        margin-bottom: 12px;
    }
}
</style>
