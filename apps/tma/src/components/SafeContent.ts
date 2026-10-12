import { defineComponent, h, type VNode, type PropType } from 'vue';
import { openExternal } from '../telegram';

interface SafeNode { tag?: string; text?: string; attrs?: Record<string, string>; children?: SafeNode[] }

// 把 sanitizeHtml 产出的受限节点树渲染为 VNode；外链统一经 Telegram openLink，不使用 v-html。
function render(n: SafeNode, key: number): VNode | string {
  if (n.text !== undefined) return n.text;
  const kids = (n.children || []).map((c, i) => render(c, i));
  if (n.tag === 'a') {
    const href = n.attrs?.href;
    return h('a', { key, href: href || undefined, onClick: (e: Event) => { e.preventDefault(); if (href) openExternal(href); } }, kids);
  }
  if (n.tag === 'img') return h('img', { key, src: n.attrs?.src, alt: n.attrs?.alt || '', style: 'max-width:100%;height:auto', loading: 'lazy', referrerpolicy: 'no-referrer' });
  return h(n.tag || 'span', { key }, kids);
}

export default defineComponent({
  props: { nodes: { type: Array as PropType<SafeNode[]>, required: true } },
  setup(props) {
    return () => h('div', { class: 'safe-content' }, props.nodes.map((n, i) => render(n, i)));
  },
});
