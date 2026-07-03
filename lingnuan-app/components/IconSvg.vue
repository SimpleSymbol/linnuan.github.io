<template>
  <i class="icon-svg" :class="[`icon-color-${color}`, `icon-size-${size}`]" v-html="iconContent"></i>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { iconData } from '../static/icons.js';

export default defineComponent({
  name: 'IconSvg',
  props: {
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: 'normal'
    }
  },
  setup(props) {
    const iconContent = computed(() => {
      return iconData[props.name] || '';
    });

    return {
      iconContent
    };
  }
});
</script>

<style>
.icon-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0; /* 消除 inline 元素 baseline 偏移，确保垂直居中 */
  flex-shrink: 0;
}

.icon-svg svg {
  width: 100%;
  height: 100%;
  display: block; /* 防止 SVG 底部产生额外间隙 */
}

/* 图标尺寸 */
.icon-size-small {
  width: 16px;
  height: 16px;
}

.icon-size-normal {
  width: 24px;
  height: 24px;
}

.icon-size-medium {
  width: 32px;
  height: 32px;
}

.icon-size-large {
  width: 40px;
  height: 40px;
}

.icon-size-xlarge {
  width: 56px;
  height: 56px;
}

/* 图标颜色 */
.icon-color-primary {
  color: var(--primary-color, #FF8A65);
}

.icon-color-success {
  color: var(--success-color, #19be6b);
}

.icon-color-warning {
  color: var(--warning-color, #FFA000);
}

.icon-color-error {
  color: var(--error-color, #E74C3C);
}

.icon-color-info {
  color: var(--info-color, #909399);
}

.icon-color-white {
  color: #ffffff;
}

.icon-color-black {
  color: #000000;
}

.icon-color-gray {
  color: #909399;
}
</style> 