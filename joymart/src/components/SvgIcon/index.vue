<template>
    <svg :class="svgClassName" aria-hidden="true" @click="handleClick">
        <use :xlink:href="svgIcon"></use>
    </svg>
</template>

<script>
import { ref, computed } from "vue"
export default {
    name: 'SvgIcon',
    props: {
        iconName: {
            type: String,
            default: ""
        },
        className: {
            type: String,
            default: ""
        },
    },
    setup(props) {
        const svgClassName = computed(() => {
            if(props.className){
                return `svg_class ${props.className}`
            }
            return "svg_class"
        })
        const svgIcon = computed(() => `#icon-${props.iconName}`)

        return { svgClassName, svgIcon }
    }
};
</script>

<style lang="less" scoped>
.svg_class{
    width: 1em;
    height: 1em;
    fill: currentColor;
    overflow: hidden;
    vertical-align: middle;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>