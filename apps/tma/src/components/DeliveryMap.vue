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
        <!-- 骑手轨迹 -->
        <polyline v-if="view.polyline" :points="view.polyline" class="dmap__trail" />
        <!-- 商家 -->
        <circle v-if="view.marks.shop" :cx="view.marks.shop.x" :cy="view.marks.shop.y" r="6.5" class="dmap__shop" />
        <!-- 收货点 -->
        <circle v-if="view.marks.dest" :cx="view.marks.dest.x" :cy="view.marks.dest.y" r="6" class="dmap__dest" />
        <!-- 骑手：外圈脉冲 + 内点 -->
        <g v-if="view.marks.courier">
          <circle :cx="view.marks.courier.x" :cy="view.marks.courier.y" r="12" class="dmap__pulse" />
          <circle :cx="view.marks.courier.x" :cy="view.marks.courier.y" r="5.5" class="dmap__courier" />
        </g>
      </svg>
      <p v-if="!view.tracking && live" class="dmap__hint">{{ t('order.map.waiting') }}</p>
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

    <p class="dmap__dist">
      <template v-if="view.arrived">{{ t('order.map.arrived') }}</template>
      <template v-else-if="view.distanceText">
        {{ view.isRemaining ? t('order.map.remaining', { v: view.distanceText }) : t('order.map.total', { v: view.distanceText }) }}
      </template>
      <template v-else>{{ t('order.map.unknown') }}</template>
    </p>
  </section>
</template>

<style scoped>
.dmap { padding: 14px 14px 12px; }
.dmap__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.chip--live::before { animation: blink 1.6s ease-in-out infinite; }
@keyframes blink { 50% { opacity: 0.25; } }

.dmap__canvas {
  position: relative;
  background: var(--map-bg);
  border-radius: var(--r-md);
  overflow: hidden;
}
.dmap__canvas svg { display: block; width: 100%; height: auto; }

.dmap__route { stroke: var(--ink-3); stroke-width: 1.6; stroke-dasharray: 5 5; opacity: 0.55; }
.dmap__trail { fill: none; stroke: var(--brand); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; opacity: 0.9; }
.dmap__shop { fill: var(--ink); stroke: #fff; stroke-width: 2; }
.dmap__dest { fill: var(--success); stroke: #fff; stroke-width: 2; }
.dmap__courier { fill: var(--brand); stroke: #fff; stroke-width: 2; }
.dmap__pulse { fill: var(--brand); opacity: 0.22; transform-box: fill-box; transform-origin: center; animation: pulse 2s ease-out infinite; }
@keyframes pulse { 0% { transform: scale(0.5); opacity: 0.3; } 70% { transform: scale(1.35); opacity: 0; } 100% { opacity: 0; } }

.dmap__hint {
  position: absolute; left: 0; right: 0; bottom: 8px; margin: 0;
  text-align: center; font-size: 11.5px; color: var(--ink-2);
}

.dmap__foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; }
.dmap__legend { display: flex; flex-wrap: wrap; gap: 12px; min-width: 0; }
.lg { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: var(--ink-2); }
.dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.dot--shop { background: var(--ink); }
.dot--dest { background: var(--success); }
.dot--courier { background: var(--brand); }

.dmap__nav {
  display: inline-flex; align-items: center; gap: 4px; flex: none;
  height: 30px; padding: 0 12px; border-radius: 999px;
  background: var(--brand-soft); color: var(--brand);
  font-size: 12.5px; font-weight: 700; text-decoration: none;
}
.dmap__nav:active { transform: scale(0.96); }

.dmap__dist { margin: 8px 0 0; font-size: 13px; font-weight: 600; color: var(--ink); }
</style>
