<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import { fb, i18n } from '../services';
import { validateAddress } from '../lib/checkout.js';

interface Address { id: string; person: string; tel: string; address: string; lat?: string; lng?: string }
const t = (k: string) => i18n.t(k);
const list = ref<Address[]>([]);
const loading = ref(true);
const editing = ref(false);
const form = ref<Partial<Address>>({});
const errors = ref<Record<string, string>>({});

async function load() {
  loading.value = true;
  try {
    const info = await fb.get('waimai', 'getMemberAddress', {});
    list.value = Array.isArray(info?.list) ? info.list : [];
  } catch { list.value = []; } finally { loading.value = false; }
}
function openForm(a?: Address) { form.value = a ? { ...a } : {}; errors.value = {}; editing.value = true; }
// 监视地址文本：用户在联想选中后手动改写地址时，坐标已与文本不符，必须清空（QA 147 轮 1 minor）
function watchAddressManualEdit() {
  const el = addressNativeInput();
  if (el && !el.dataset.watch) {
    el.dataset.watch = '1';
    el.addEventListener('input', () => {
      if (form.value.lat !== undefined || form.value.lng !== undefined) { delete form.value.lat; delete form.value.lng; }
    });
  }
}
async function save() {
  errors.value = validateAddress(form.value);
  if (Object.keys(errors.value).length) return;
  try {
    await fb.post('waimai', 'operAddress', { id: form.value.id, person: form.value.person, tel: form.value.tel, address: form.value.address, street: form.value.address, lat: form.value.lat, lng: form.value.lng });
    editing.value = false;
    await load();
  } catch (e: any) { showToast(/reopen/i.test(e?.message || '') ? t('auth.reopen') : (e?.message || 'Error')); }
}
async function remove(a: Address) {
  try {
    await showConfirmDialog({ message: t('address.deleteConfirm') });
    await fb.post('waimai', 'delAddress', { id: a.id });
    await load();
  } catch (e: any) { if (e && e.message) showToast(/reopen/i.test(e.message) ? t('auth.reopen') : e.message); }
}
const err = (k: string) => (errors.value[k] === 'REQUIRED' ? t('address.required') : errors.value[k] ? t('address.invalid') : '');

// —— Google Places 地址联想（可选能力）：key 未注入或脚本加载失败时静默降级为纯手输 ——
const MAPS_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
// van-field 的 ref 是组件实例而非原生 <input>，Google Places 需要原生元素：
// 用弹窗容器 ref + querySelector 定位「详细地址」输入框（第 3 个 field），并在弹窗 @opened 后再绑定
const popupWrap = ref<HTMLElement | null>(null);
let autocomplete: any = null;
let mapsListener: any = null;

function addressNativeInput(): HTMLInputElement | null {
  const inputs = popupWrap.value?.querySelectorAll<HTMLInputElement>('input') ?? [];
  // 弹窗内 field 顺序：联系人 / 电话 / 详细地址
  return inputs.length >= 3 ? inputs[2] : (inputs[inputs.length - 1] ?? null);
}

function loadMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) return resolve();
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&language=zh-CN&region=PH`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('maps script failed'));
    document.head.appendChild(s);
  });
}
async function attachAutocomplete() {
  if (!MAPS_KEY) return;
  const el = addressNativeInput();
  if (!el) return;
  try {
    await loadMapsScript();
    // 弹窗每次打开都会重建 input 元素，旧实例绑定的 DOM 已销毁——先清光旧实例的监听与候选下拉 DOM 再重建（QA 147 轮 3 minor）
    if (autocomplete) {
      if (mapsListener) mapsListener.remove();
      try { (window as any).google.maps.event.clearInstanceListeners(autocomplete); } catch { /* 老实例已失效 */ }
      autocomplete = null;
      document.querySelectorAll('.pac-container').forEach((n) => n.remove());
    }
    autocomplete = new (window as any).google.maps.places.Autocomplete(el, {
      fields: ['formatted_address', 'geometry'],
      // 菲律宾为主营区域，限制过窄会漏掉跨境地址，这里只做偏好不做硬约束
      componentRestrictions: undefined,
    });
    mapsListener = autocomplete.addListener('place_changed', () => {
      const p = autocomplete.getPlace();
      if (!p?.geometry) return;
      form.value.address = p.formatted_address || form.value.address;
      form.value.lat = String(p.geometry.location.lat());
      form.value.lng = String(p.geometry.location.lng());
    });
  } catch { /* 无 key / 加载失败：保持纯手输，不阻塞主流程 */ }
}
// 弹窗打开：先无条件挂坐标一致性监听（不依赖 Maps 是否可用——QA 147 轮 3 minor），再尝试联想
function onPopupOpened() { watchAddressManualEdit(); attachAutocomplete(); }
onBeforeUnmount(() => { if (mapsListener) mapsListener.remove(); });
onMounted(load);
</script>

<template>
  <div class="page">
    <van-loading v-if="loading" vertical>{{ t('common.loading') }}</van-loading>
    <template v-else>
      <van-empty v-if="list.length === 0" :description="t('address.empty')" />
      <div v-for="a in list" :key="a.id" class="fbs-card addr-card">
        <div class="addr-main">
          <div class="addr-line1">{{ a.person }} · {{ a.tel }}</div>
          <div class="addr-line2">{{ a.address }}</div>
        </div>
        <div class="addr-ops">
          <van-button size="small" plain round @click="openForm(a)">{{ t('address.edit') }}</van-button>
          <van-button size="small" plain round type="danger" @click="remove(a)">{{ t('address.delete') }}</van-button>
        </div>
      </div>
      <van-button block round type="primary" @click="openForm()">{{ t('address.add') }}</van-button>
    </template>
    <van-popup v-model:show="editing" position="bottom" round @opened="onPopupOpened">
      <div ref="popupWrap">
        <van-cell-group>
          <van-field v-model="form.person" :label="t('address.person')" :error-message="err('person')" maxlength="50" />
          <van-field v-model="form.tel" :label="t('address.tel')" :error-message="err('tel')" maxlength="20" />
          <van-field v-model="form.address" :label="t('address.detail')" :error-message="err('address')" maxlength="200" />
          <div v-if="MAPS_KEY" class="addr-tip">{{ t('address.mapsTip') }}</div>
        </van-cell-group>
        <van-button block type="primary" @click="save">{{ t('address.save') }}</van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.addr-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin-bottom: 10px; }
.addr-main { flex: 1; min-width: 0; }
.addr-line1 { font-size: 15px; font-weight: 600; }
.addr-line2 { font-size: 13px; color: var(--tg-hint); margin-top: 4px; word-break: break-all; }
.addr-ops { display: flex; flex-direction: column; gap: 6px; }
.addr-tip { font-size: 12px; color: var(--tg-hint); padding: 0 16px 8px; }
</style>
