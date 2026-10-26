<script setup lang="ts">
import { computed } from 'vue';
import { t } from '../services';

// 配送轨迹图。不用 Google Static Maps（项目未开通该 API、且要按次计费），
// 自己把经纬度投影到 SVG 上画：零依赖、无配额、离线可渲染。
// 投影逻辑全在 lib/geo.js + lib/delivery.js（纯函数，有单测），这里只负责画。
const props = defineProps<{ view: any; live?: boolean }>();

const showRoute = computed(() => {
  const m = props.view?.marks || {};
  return !props.view?.polyline && m.shop && m.dest;
});

// 地图针：一条完整的水滴路径，尖端落在坐标点上（经典 pin 画法，无拼接缝）。
// 用形状而不是文字做标注，i18n 文案再长也不会把 SVG 撑变形。
//   M 尖端 → 贝塞尔上收到头圆左侧 → 大弧扫过头顶 → 贝塞尔收回尖端
function pin(x: number, y: number, r = 6) {
  const cx = x;
  const cy = y - r * 1.8;   // 头圆圆心
  const hr = r * 1.05;      // 头圆半径
  const body = [
    `M${x} ${y}`,
    `C ${x} ${y - r * 0.62} ${cx - hr} ${cy + hr * 0.72} ${cx - hr} ${cy}`,
    `A ${hr} ${hr} 0 1 1 ${cx + hr} ${cy}`,
    `C ${cx + hr} ${cy + hr * 0.72} ${x} ${y - r * 0.62} ${x} ${y}`,
    'Z',
  ].join(' ');
  return { body, dot: { cx, cy, r: hr * 0.42 } };
}
const destPin = computed(() => {
  const d = props.view?.marks?.dest;
  return d ? pin(d.x, d.y) : null;
});

// 画布内浮层：一句说清「还有多远」。没有骑手位置时退回全程，都没有就说明状态。
const pill = computed(() => {
  const v = props.view || {};
  if (v.arrived) return { text: t('order.map.arrived'), tone: 'arrived' };
  if (v.distanceText) {
    return {
      text: v.isRemaining
        ? t('order.map.remaining', { v: v.distanceText })
        : t('order.map.total', { v: v.distanceText }),
      tone: v.isRemaining ? 'live' : 'idle',
    };
  }
  return { text: props.live ? t('order.map.waiting') : t('order.map.unknown'), tone: 'idle' };
});
</script>

<template>
  <section v-if="view && view.visible" class="dmap card">
    <div class="dmap__head">
      <span class="h2">{{ t('order.map.title') }}</span>
      <span v-if="live" class="chip chip--live">{{ t('order.map.live') }}</span>
    </div>

    <div class="dmap__canvas">
      <svg
        :viewBox="`0 0 ${view.width} ${view.height}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        :aria-label="t('order.map.title')"
      >
        <!-- 商家 → 收货点：还没有骑手轨迹时给一条虚线示意路线 -->
        <line
          v-if="showRoute"
          :x1="view.marks.shop.x"
          :y1="view.marks.shop.y"
          :x2="view.marks.dest.x"
          :y2="view.marks.dest.y"
          class="dmap__route"
        />

        <!-- 骑手轨迹：底层加粗半透明做发光，上层实线 -->
        <template v-if="view.polyline">
          <polyline :points="view.polyline" class="dmap__trail-glow" />
          <polyline :points="view.polyline" class="dmap__trail" />
        </template>

        <!-- 商家：圆角方块，视觉上与「点」区分开 -->
        <rect
          v-if="view.marks.shop"
          :x="view.marks.shop.x - 5.5"
          :y="view.marks.shop.y - 5.5"
          width="11"
          height="11"
          rx="3.2"
          class="dmap__shop"
        />

        <!-- 收货点：地图针（尖端对准坐标） -->
        <g v-if="destPin">
          <path :d="destPin.body" class="dmap__dest" />
          <circle :cx="destPin.dot.cx" :cy="destPin.dot.cy" :r="destPin.dot.r" class="dmap__dest-dot" />
        </g>

        <!-- 骑手：外圈脉冲 + 内点 -->
        <g v-if="view.marks.courier">
          <circle :cx="view.marks.courier.x" :cy="view.marks.courier.y" r="13" class="dmap__pulse" />
          <circle :cx="view.marks.courier.x" :cy="view.marks.courier.y" r="6" class="dmap__courier" />
          <circle :cx="view.marks.courier.x" :cy="view.marks.courier.y" r="2.1" class="dmap__courier-dot" />
        </g>
      </svg>

      <span class="dmap__pill" :class="`dmap__pill--${pill.tone}`">{{ pill.text }}</span>
    </div>

    <div class="dmap__foot">
      <div class="dmap__legend">
        <span class="lg"><i class="dot dot--shop" />{{ t('order.map.shop') }}</span>
        <span class="lg"><i class="dot dot--dest" />{{ t('order.map.dest') }}</span>
        <span v-if="view.tracking" class="lg"><i class="dot dot--courier" />{{ t('order.map.courier') }}</span>
      </div>
      <a v-if="view.navUrl" class="dmap__nav" :href="view.navUrl" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.4 3.6 3.9 10.2l6.6 2.6 2.6 6.6 7.3-15.8Z" />
        </svg>
        {{ t('order.map.nav') }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.dmap { padding: 14px 14px 12px; }
.dmap__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.chip--live::before { animation: blink 1.6s ease-in-out infinite; }
@keyframes blink { 50% { opacity: 0.25; } }

.dmap__canvas {
  position: relative;
  border-radius: var(--r-md);
  overflow: hidden;
  background:
    repeating-linear-gradient(0deg, var(--map-grid) 0 1px, transparent 1px 24px),
    repeating-linear-gradient(90deg, var(--map-grid) 0 1px, transparent 1px 24px),
    var(--map-bg);
}
.dmap__canvas svg { display: block; width: 100%; height: auto; }

.dmap__route { stroke: var(--ink-3); stroke-width: 1.6; stroke-dasharray: 5 5; opacity: 0.5; }
.dmap__trail-glow {
  fill: none; stroke: var(--brand); stroke-width: 9;
  stroke-linecap: round; stroke-linejoin: round; opacity: 0.14;
}
.dmap__trail {
  fill: none; stroke: var(--brand); stroke-width: 3.2;
  stroke-linecap: round; stroke-linejoin: round;
}

.dmap__shop { fill: var(--ink); stroke: var(--surface); stroke-width: 2; }
.dmap__dest { fill: var(--success); stroke: var(--surface); stroke-width: 2; stroke-linejoin: round; }
.dmap__dest-dot { fill: var(--surface); }
.dmap__courier { fill: var(--brand); stroke: var(--surface); stroke-width: 2.4; }
.dmap__courier-dot { fill: var(--surface); opacity: 0.9; }
.dmap__pulse {
  fill: var(--brand); opacity: 0.2;
  transform-box: fill-box; transform-origin: center;
  animation: pulse 2s ease-out infinite;
}
@keyframes pulse {
  0% { transform: scale(0.45); opacity: 0.28; }
  70% { transform: scale(1.3); opacity: 0; }
  100% { opacity: 0; }
}

/* 画布内的距离浮层：进页面第一眼要看到的那个数字 */
.dmap__pill {
  position: absolute; left: 9px; bottom: 9px; max-width: calc(100% - 18px);
  padding: 4px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 700; line-height: 1.5;
  background: var(--map-pill-bg);
  box-shadow: 0 2px 8px -2px rgba(17, 19, 24, 0.28);
  backdrop-filter: blur(6px);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dmap__pill--live { color: var(--brand-deep); }
.dmap__pill--arrived { color: #0e9f5d; }
.dmap__pill--idle { color: var(--ink-2); font-weight: 600; }

.dmap__foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; }
.dmap__legend { display: flex; flex-wrap: wrap; gap: 12px; min-width: 0; }
.lg { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--ink-2); }
.dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.dot--shop { background: var(--ink); border-radius: 2px; }
.dot--dest { background: var(--success); }
.dot--courier { background: var(--brand); }

.dmap__nav {
  display: inline-flex; align-items: center; gap: 4px; flex: none;
  height: 30px; padding: 0 12px; border-radius: 999px;
  background: var(--brand-soft); color: var(--brand);
  font-size: 12.5px; font-weight: 700; text-decoration: none;
}
.dmap__nav:active { transform: scale(0.96); }
</style>
