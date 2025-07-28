<template>
    <div class="typewriter">
        <span>{{ displayText }}</span>
        <span class="cursor blink"></span>
    </div>
</template>

<script lang="ts" setup>
import { defineProps, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    textArr: {
        type: Array as () => string[],
        default: () => []
    },
    speed: {
        type: Number,
        default: 120
    },
    interval: {
        type: Number,
        default: 1200
    }
});

let displayText = ref('');
let charIndex = ref(0);
let textIndex = ref(0);
let isTyping = ref(true);
let isDeleting = ref(false);
let timer = ref(null as any);
let cursorBlinkTimer = ref(null as any);
let isCursorVisible = ref(true);

const startTyping = () => {
    if (isDeleting.value) {
        deleteChar();
    } else if (isTyping.value) {
        typeChar();
    }
};

const typeChar = () => {
    if(charIndex.value < props.textArr[textIndex.value].length) {
        displayText.value += props.textArr[textIndex.value][charIndex.value];
        charIndex.value++;
        timer = setTimeout(typeChar, props.speed);
    } else {
        isTyping.value = false;
        timer = setTimeout(() => {
            isDeleting.value = true;
            startTyping();
        }, props.interval);
    }
}

const deleteChar = () => {
    if( displayText.value.length > 0 ) {
        displayText.value = displayText.value.slice(0, -1);
        timer = setTimeout(deleteChar, props.speed);
    } else {
        isDeleting.value = false;
        textIndex.value = (textIndex.value + 1) % props.textArr.length;
        charIndex.value = 0;
        timer = setTimeout(()=>{
            isTyping.value = true;
            startTyping();
        }, props.interval);
    }
}

const startCursorBlink = () => {
    cursorBlinkTimer = setInterval(() => {
        isCursorVisible = !isCursorVisible;
    }, 500);
};

onMounted(() => {
    startTyping();
    startCursorBlink();
});

onUnmounted(() => {
    clearTimeout(timer.value);
    clearInterval(cursorBlinkTimer.value);
});

</script>

<style scoped lang="less">
.typewriter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1.5;
    
    span {
        font-size: 1.25rem;
        color: white;
    }

    .cursor {
        width: 2px;
        height: 1em;
        margin-left: 0.5em;
        background-color: #fff;
        vertical-align: text-bottom;
        animation: none;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }

    .blink {
        animation: blink 1s step-end infinite;
    }
}

</style>