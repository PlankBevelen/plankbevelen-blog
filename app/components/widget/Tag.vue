<template>
    <BaseCard type="tag" class="tag-cloud-card">
        <template #header>
            <div class="header-content">
                {{ $t('tag.title') }}
            </div>
        </template>
        <div ref="ball" class="cloud-ball">
            <NuxtLink
                v-for="t in visibleTags"
                :key="t.name"
                :to="tagTo(t)"
                custom
            >
                <template #default="{ href, navigate }">
                    <a
                        :href="href"
                        class="cloud-tag"
                        :class="{ 'is-active': t.active }"
                        :title="`${t.name} · ${t.count}`"
                        :aria-current="t.active ? 'true' : undefined"
                        :aria-label="t.active
                            ? $t('tag.clearFilter', { name: t.name })
                            : $t('tag.filterBy', { name: t.name, count: t.count })"
                        @click="navigate"
                    >{{ t.name }}</a>
                </template>
            </NuxtLink>
        </div>
    </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import type { Tag } from '@/types/tag'
import tagService from '~/services/tag.service'

const props = defineProps({
    tags: {
        type: Array as () => Tag[],
        default: () => []
    }
})

const MAX_TAGS = 15

const localePath = useLocalePath()
const route = useRoute()
const tagList = ref<Tag[]>([])

const rawTags = computed(() => {
    return props.tags.length > 0 ? props.tags : tagList.value
})

// 当前 URL 上正在生效的标签筛选，用来给对应标签上选中态
const activeTag = computed(() => String(route.query.q || '').trim())

const visibleTags = computed(() =>
    rawTags.value.slice(0, MAX_TAGS).map((t) => ({
        name: t.name,
        count: t.count || 1,
        active: t.name === activeTag.value
    }))
)

// 已选中的标签再点一次回到无筛选状态。用 to 而不是拦截 click，
// href 保持真实，中键新开和爬虫都正常。
function tagTo(t: { name: string; active: boolean }) {
    return t.active
        ? localePath({ path: '/article' })
        : localePath({ path: '/article', query: { q: t.name } })
}

/* ————————————————— 3D 球面标签云 —————————————————
   直角坐标与球面坐标：
     x = R·sin(φ)·cos(θ)
     y = R·sin(φ)·sin(θ)
     z = R·cos(φ)
   φ 用反余弦均匀取样（k 从 -1 线性扫到 1），θ 用 φ·√(nπ)，
   这样 n 个点沿球面近似等面积分布，不会在两极堆积。
   ———————————————————————————————————————— */

const ball = ref<HTMLElement | null>(null)

type Point = { el: HTMLElement; x: number; y: number; z: number }
let points: Point[] = []

// 焦距取 2.6R 而不是原文的 2R：2R 时最近/最远的字号比是 3:1（8px↔24px），
// 侧栏这么窄会显得炸；2.6R 压到约 1.6:1，仍有纵深但克制。
const BASE_FONT = 12
const PERSPECTIVE = 2.6

// 球半径占容器半宽/半高的比例。标签中心最远只到 radius，文字还要向外
// 伸出半个自己的宽度，剩下的 24% 就是留给它的余量，避免捅出卡片。
const RADIUS_RATIO = 0.76
const MIN_RADIUS = 40

let radius = 60
let fallLength = radius * PERSPECTIVE

// 每帧的自转角度。原文用 30ms 的 setInterval，这里换 rAF（约 16ms），
// 角度相应减半才是同一个转速。
const IDLE_ANGLE_X = -Math.PI / 1200
const IDLE_ANGLE_Y = Math.PI / 900
let angleX = IDLE_ANGLE_X
let angleY = IDLE_ANGLE_Y

let rafId: number | null = null
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let motionQuery: MediaQueryList | null = null

function prefersReducedMotion() {
    return !!motionQuery?.matches
}

function layout() {
    const wrap = ball.value
    if (!wrap) return

    const els = Array.from(
        wrap.querySelectorAll<HTMLElement>('.cloud-tag')
    ).filter((el) => el.offsetParent !== null)

    const n = els.length
    if (!n) {
        points = []
        return
    }

    // 半径按容器实测尺寸取比例，宽高都不超。容器宽度是卡片给的，
    // 高度由 aspect-ratio 跟着宽度走，所以两个方向的余量比例一致。
    const halfW = wrap.clientWidth / 2
    const halfH = wrap.clientHeight / 2
    radius = Math.max(MIN_RADIUS, Math.min(halfW, halfH) * RADIUS_RATIO)
    fallLength = radius * PERSPECTIVE

    points = els.map((el, i) => {
        const k = (2 * (i + 1) - 1) / n - 1
        const phi = Math.acos(k)
        const theta = phi * Math.sqrt(n * Math.PI)
        return {
            el,
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.sin(phi) * Math.sin(theta),
            z: radius * Math.cos(phi)
        }
    })

    points.forEach(move)
}

// z 越大（越靠前）字号越大、越不透明，纵深感就是这么来的。
// 位置用 left/top 50% + translate(-50%) 打底，只在 transform 里叠 x/y 偏移，
// 这样每帧不用读 offsetWidth/offsetHeight，避免强制同步布局。
function move(p: Point) {
    const scale = fallLength / (fallLength - p.z)
    const depth = (p.z + radius) / (2 * radius)
    const el = p.el

    el.style.fontSize = `${(BASE_FONT * scale).toFixed(2)}px`
    el.style.opacity = (0.4 + depth * 0.6).toFixed(3)
    el.style.zIndex = String(Math.round(scale * 100))
    el.style.transform =
        `translate(calc(-50% + ${p.x.toFixed(1)}px), calc(-50% + ${p.y.toFixed(1)}px))`
}

function rotateX(angle: number) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    for (const p of points) {
        const y = p.y * cos - p.z * sin
        const z = p.z * cos + p.y * sin
        p.y = y
        p.z = z
    }
}

function rotateY(angle: number) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    for (const p of points) {
        const x = p.x * cos - p.z * sin
        const z = p.z * cos + p.x * sin
        p.x = x
        p.z = z
    }
}

function frame() {
    rotateX(angleX)
    rotateY(angleY)
    points.forEach(move)
    rafId = requestAnimationFrame(frame)
}

function start() {
    if (rafId !== null || prefersReducedMotion()) return
    rafId = requestAnimationFrame(frame)
}

function stop() {
    if (rafId === null) return
    cancelAnimationFrame(rafId)
    rafId = null
}

// 鼠标在卡片里时，指针相对球心的偏移决定转向和转速，离开后回到匀速自转。
// 监听挂在容器上而不是 document，页面其他地方移动鼠标不会让这里做无用功。
function onPointerMove(e: PointerEvent) {
    const wrap = ball.value
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    angleY = dx * 0.00008
    angleX = -dy * 0.00008
}

function onPointerLeave() {
    angleX = IDLE_ANGLE_X
    angleY = IDLE_ANGLE_Y
}

function onMotionChange() {
    if (prefersReducedMotion()) {
        stop()
        // 停下也要保证球是铺开的静态分布，而不是全叠在中心
        layout()
    } else {
        start()
    }
}

onMounted(async () => {
    if (props.tags.length === 0) {
        try {
            const res: any = await tagService.getTags()
            if (res.status === 200) tagList.value = res.data || []
        } catch (e) {
            console.error('Fetch tags failed:', e)
        }
    }

    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener('change', onMotionChange)

    // 等标签渲染进 DOM 再量尺寸
    await nextTick()
    layout()

    const wrap = ball.value
    if (!wrap) return

    // 容器宽度变化（含跨断点导致隐藏数量变化）后重新铺球。
    // layout() 只写子元素样式、不改容器尺寸，所以不会和 ResizeObserver
    // 形成回调循环。
    resizeObserver = new ResizeObserver(() => layout())
    resizeObserver.observe(wrap)

    // 鼠标进卡片后指针位置控制转向，离开回到匀速自转
    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerleave', onPointerLeave)

    // 卡片滚出视口就停掉 rAF，不白烧 CPU
    intersectionObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) start()
        else stop()
    })
    intersectionObserver.observe(wrap)
})

onBeforeUnmount(() => {
    stop()
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    motionQuery?.removeEventListener('change', onMotionChange)
    ball.value?.removeEventListener('pointermove', onPointerMove)
    ball.value?.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<style scoped lang="less">

.tag-cloud-card {
    overflow: hidden;
}

// 球体容器：子元素全是绝对定位，高度撑不起来，必须自己给。
// 用 aspect-ratio 而不是写死 px —— 高度跟着卡片实际宽度走，
// 侧栏窄、窄屏落到正文下方变宽，球都保持正方形不会被压成椭圆。
// 1/1 之外再夹一个 max-height：正文宽度下卡片能有 800+px，
// 不加上限的话球会高得离谱。
.cloud-ball {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    max-height: 260px;
    // 高度被 max-height 夹住后，宽度方向会多出余量，居中好看一些
    margin: 0 auto;
}

// 窄屏只留前 16 个（第 17 个起隐藏）。
// 断点跟 ThreeColumn 一致：@screen-lg 以下右栏落到正文下方。
@mobile-tag-cutoff: 17;

@media (max-width: @screen-lg) {
    .cloud-ball {
        max-height: 300px;
    }

    .cloud-tag:nth-child(n + @{mobile-tag-cutoff}) {
        display: none;
    }
}

// left/top 50% 是球心，实际位置由 JS 写进 transform 的偏移决定。
// font-size / opacity / z-index 也都由 move() 每帧写，这里只定基础观感。
.cloud-tag {
    position: absolute;
    left: 50%;
    top: 50%;
    white-space: nowrap;
    text-decoration: none;
    line-height: 1;
    color: var(--text-color);
    // 初始 0，等 move() 写入真实值，避免首帧全部叠在球心闪一下
    opacity: 0;
    will-change: transform, font-size, opacity;
    transition: color @transition-fast ease-in-out;

    &:hover {
        color: var(--primary-color);
    }

    // reset.less 全局清了 outline，键盘焦点必须自己补回来
    &:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
        border-radius: @small-border-radius;
    }

    // 正在筛选的标签常亮，鼠标移开也不掉
    &.is-active {
        color: var(--primary-color);
        font-weight: 600;
    }
}

.header-content {
    display: flex;
    align-items: center;
    gap: @space-base;
    font-weight: bold;
}
</style>
