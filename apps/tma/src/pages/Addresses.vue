<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { showConfirmDialog, showToast, showLoadingToast, closeToast } from 'vant';
import { fb, authClient, i18n } from '../services';
import { getTgUser, getStartParam, openExternal } from '../telegram';

interface Address { id: string; person: string; tel: string; street?: string; address: string; lat?: string; lng?: string; areaCode?: string; default?: number }
interface Form {
  id?: string; street: string; extra: string; note: string;
  tel?: string; default?: number; lat?: string; lng?: string;
}

const t = (k: string, v?: Record<string, unknown>) => i18n.t(k, v);
const route = useRoute();
const list = ref<Address[]>([]);
const loading = ref(true);
const editing = ref(false);
const form = ref<Form>({ street: '', extra: '', note: '' });
const errors = ref<Record<string, string>>({});
const sheet = ref(false);
const current = ref<Address | null>(null);
const sharing = ref(false);

// 收货人 = 当前 Telegram 身份，不再让用户手填（上游 person 仍为必填，值由 TG 资料自动生成）
const tgUser = getTgUser();
const selfName = computed(() => {
  const n = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(' ').trim();
  return n || (tgUser?.username ? '@' + tgUser.username : t('address.me'));
});
const selfHandle = computed(() => (tgUser?.username ? '@' + tgUser.username : ''));
const avatar = computed(() => tgUser?.photo_url || '');

// 美国区号：上游 areaCode 缺省会写死 86（中国），与本站实际地区不符
const AREA_CODE = '1';

async function load() {
  loading.value = true;
  try {
    const info = await fb.get('waimai', 'getMemberAddress', {});
    list.value = Array.isArray(info?.list) ? info.list : [];
  } catch { list.value = []; } finally { loading.value = false; }
}

// street 存主地址、address 存「主地址 + 补充项」——展示与编辑时按前缀拆分
function splitExtra(street?: string, address?: string): string {
  const s = String(street || '').trim();
  const a = String(address || '').trim();
  if (!a || a === s) return '';
  if (s && a.startsWith(s)) return a.slice(s.length).replace(/^[，,·\s]+/, '');
  return s ? a : '';
}
const mainLine = (a: Address) => String(a.street || a.address || '').trim();
const extraLine = (a: Address) => splitExtra(a.street, a.address);

function openForm(a?: Address) {
  errors.value = {};
  form.value = a
    ? { id: a.id, street: mainLine(a), extra: splitExtra(a.street, a.address), note: '', tel: /^[0-9+\- ]{6,20}$/.test(String(a.tel || '')) ? a.tel : '', default: a.default, lat: a.lat, lng: a.lng }
    : { street: '', extra: '', note: '', tel: '', default: list.value.length === 0 ? 1 : 0 };
  editing.value = true;
}

// 上游 waimai.class.php 强制 person / tel / street / lat / lng；tel 允许用 Telegram 身份占位
function contactValue(): string {
  const typed = String(form.value.tel || '').trim();
  if (typed) return typed;
  if (tgUser?.username) return '@' + tgUser.username;
  if (tgUser?.id) return 'tg:' + tgUser.id;
  return '';
}

async function save() {
  const e: Record<string, string> = {};
  if (!String(form.value.street || '').trim()) e.street = 'REQUIRED';
  const typed = String(form.value.tel || '').trim();
  if (typed && !/^[0-9+\- ]{6,20}$/.test(typed)) e.tel = 'INVALID';
  if (!contactValue()) e.tel = 'REQUIRED';
  errors.value = e;
  if (Object.keys(e).length) return;
  // 坐标不再由前端强制提供：没选中联想项时服务端会按地址文本反查（waimai::operAddress）。
  // 旧逻辑在这里 return，导致「前端没拿到 Maps key → 永远存不了地址」（2026-10-26 线上事故）。
  const street = String(form.value.street).trim();
  const tail = [form.value.extra, form.value.note].map((s) => String(s || '').trim()).filter(Boolean).join('；');
  const address = tail ? `${street}，${tail}` : street;
  try {
    await fb.post('waimai', 'operAddress', {
      id: form.value.id,
      person: selfName.value,
      tel: contactValue(),
      street,
      address,
      lat: form.value.lat,
      lng: form.value.lng,
      areaCode: AREA_CODE,
      default: form.value.default ? 1 : 0,
    });
    editing.value = false;
    await load();
    showToast(t('address.saved'));
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (/reopen/i.test(msg)) showToast(t('auth.reopen'));
    else if (/地址解析|地图坐标/.test(msg)) showToast(t('address.locateFailed'));
    else showToast(msg || 'Error');
  }
}

function openSheet(a: Address) { current.value = a; sheet.value = true; }

async function remove(a: Address) {
  sheet.value = false;
  try {
    await showConfirmDialog({ message: t('address.deleteConfirm') });
    await fb.post('waimai', 'delAddress', { id: a.id });
    await load();
  } catch (err: any) { if (err && err.message) showToast(/reopen/i.test(err.message) ? t('auth.reopen') : err.message); }
}

// —— 分享：只分享「位置」，不含姓名/电话（接收方用自己的 Telegram 身份下单）——
async function share(a: Address) {
  sheet.value = false;
  if (sharing.value) return;
  sharing.value = true;
  showLoadingToast({ message: t('address.sharing'), forbidClick: true, duration: 0 });
  try {
    const r = await authClient.request('/addr/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        street: mainLine(a),
        address: a.address,
        lat: a.lat,
        lng: a.lng,
        areaCode: a.areaCode || AREA_CODE,
      }),
    });
    const data = await r.json();
    if (!r.ok || !data?.success) throw new Error(data?.error?.message || 'share failed');
    // 深链优先（接收方点开直达小程序）；bot 用户名未就绪时退化为「地址文本 + 本站链接」。
    // 文本里带完整地址（含门牌/补充），即使对方打不开深链也能照着填。
    const url = data.data.url || location.origin + '/tma/';
    const full = [mainLine(a), extraLine(a)].filter(Boolean).join('，');
    const text = t('address.shareText', { addr: full });
    openExternal(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
  } catch (err: any) {
    showToast(/reopen/i.test(err?.message || '') ? t('auth.reopen') : t('address.shareFail'));
  } finally {
    closeToast();
    sharing.value = false;
  }
}

// —— 收到别人分享的地址 ——
// 深链进入时 router 会带上 ?share=<token>（见 lib/startParam.js 白名单）；直接落在本页时再看 start_param 兜底。
async function consumeSharedAddress() {
  const fromQuery = String(route.query.share || '');
  const fromParam = /^addr_([0-9a-f]{32})$/.exec(String(getStartParam() || ''));
  const token = /^[0-9a-f]{32}$/.test(fromQuery) ? fromQuery : (fromParam ? fromParam[1] : '');
  if (!token) return;
  const seenKey = 'fbs_addr_share_seen';
  // 同一条分享链接只询问一次：用户拒绝后再次切页/刷新不再打扰
  try { if (sessionStorage.getItem(seenKey) === token) return; sessionStorage.setItem(seenKey, token); } catch { /* 隐私模式无 storage */ }
  try {
    const r = await authClient.request(`/addr/shared/${token}`);
    if (!r.ok) return;
    const data = await r.json();
    const a = data?.data;
    if (!a) return;
    try { await showConfirmDialog({ title: t('address.sharedTitle'), message: t('address.sharedAsk', { addr: mainLine(a) }) }); } catch { return; }
    // 只接受「位置」，收货人与联系方式一律用接收方自己的 Telegram 身份，避免采信对方上传的内容
    await fb.post('waimai', 'operAddress', {
      person: selfName.value,
      tel: contactValue(),
      street: a.street,
      address: a.address,
      lat: a.lat,
      lng: a.lng,
      areaCode: a.areaCode || AREA_CODE,
      default: 0,
    });
    await load();
    showToast(t('address.sharedSaved'));
  } catch { /* 链接过期或网络异常：静默忽略，不打断主流程 */ }
}

const errText = (k: string) => (errors.value[k] === 'REQUIRED' ? t('address.required') : errors.value[k] ? t('address.invalid') : '');

// —— Google Places 地址联想（可选能力）：key 未注入或脚本加载失败时静默降级为纯手输 ——
const MAPS_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const addrInputEl = ref<HTMLInputElement | null>(null);
let autocomplete: any = null;
let mapsListener: any = null;

function loadMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) return resolve();
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&language=zh-CN&region=US`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('maps script failed'));
    document.head.appendChild(s);
  });
}

async function attachAutocomplete() {
  if (!MAPS_KEY) return;
  const el = addrInputEl.value;
  if (!el) return;
  try {
    await loadMapsScript();
    // 弹窗每次打开都重建 input，旧实例绑定的 DOM 已销毁——先清监听与残留下拉 DOM 再重建
    if (autocomplete) {
      if (mapsListener) mapsListener.remove();
      try { (window as any).google.maps.event.clearInstanceListeners(autocomplete); } catch { /* 老实例已失效 */ }
      autocomplete = null;
      document.querySelectorAll('.pac-container').forEach((n) => n.remove());
    }
    autocomplete = new (window as any).google.maps.places.Autocomplete(el, {
      fields: ['formatted_address', 'geometry'],
    });
    mapsListener = autocomplete.addListener('place_changed', () => {
      const p = autocomplete.getPlace();
      if (!p?.geometry) return;
      form.value.street = p.formatted_address || form.value.street;
      form.value.lat = String(p.geometry.location.lat());
      form.value.lng = String(p.geometry.location.lng());
    });
  } catch { /* 无 key / 加载失败：保持纯手输，不阻塞主流程 */ }
}

// 手动改写主地址 → 坐标已与文本不符，必须清空（上游按坐标反查分站）
function onStreetInput(e: Event) {
  form.value.street = (e.target as HTMLInputElement).value;
  if (form.value.lat !== undefined || form.value.lng !== undefined) { delete form.value.lat; delete form.value.lng; }
}
function onPopupOpened() { attachAutocomplete(); }
onBeforeUnmount(() => { if (mapsListener) mapsListener.remove(); });
onMounted(async () => { await load(); consumeSharedAddress(); });
</script>

<template>
  <div class="page">
    <van-loading v-if="loading" vertical>{{ t('common.loading') }}</van-loading>
    <template v-else>
      <van-empty v-if="list.length === 0" :description="t('address.empty')" />
      <div v-for="a in list" :key="a.id" class="fbs-card addr-card">
        <div class="icon" aria-hidden="true">📍</div>
        <div class="addr-main">
          <div class="addr-line1">
            <span class="addr-who">{{ a.person === selfName ? t('address.me') : a.person }}</span>
            <span v-if="a.default" class="addr-def">{{ t('address.defaultTag') }}</span>
          </div>
          <div class="addr-line2">{{ mainLine(a) }}</div>
          <div v-if="extraLine(a)" class="addr-line3">{{ extraLine(a) }}</div>
          <div class="addr-line4">
            <span v-if="/^[0-9+\- ]{6,20}$/.test(String(a.tel || ''))">📞 {{ a.tel }}</span>
            <span v-else>💬 {{ t('address.viaTelegram') }}</span>
          </div>
        </div>
        <button class="addr-more" :aria-label="t('address.more')" @click="openSheet(a)">⋯</button>
      </div>
      <van-button block round type="primary" class="addr-add" @click="openForm()">＋ {{ t('address.add') }}</van-button>
    </template>

    <!-- 表单 -->
    <van-popup v-model:show="editing" position="bottom" round :style="{ maxHeight: '92vh' }" @opened="onPopupOpened">
      <div class="addr-sheet">
        <div class="sheet-head">
          <span class="sheet-title">{{ form.id ? t('address.editTitle') : t('address.addTitle') }}</span>
          <button class="sheet-x" :aria-label="t('common.cancel')" @click="editing = false">✕</button>
        </div>

        <div class="sheet-body">
          <!-- 送到哪里 -->
          <div class="fld">
            <div class="fld-label">
              {{ t('address.whereLabel') }}
              <span v-if="form.lat && form.lng" class="fld-pin">✓ {{ t('address.pinned') }}</span>
            </div>
            <div class="fld-search" :class="{ 'is-error': errors.street }">
              <span class="fld-ico" aria-hidden="true">🔍</span>
              <input
                ref="addrInputEl"
                class="fld-input"
                :value="form.street"
                :placeholder="t('address.searchPh')"
                autocomplete="off"
                @input="onStreetInput"
              />
            </div>
            <div v-if="errors.street" class="fld-err">{{ errText('street') }}</div>
            <div class="fld-hint">{{ MAPS_KEY ? t('address.mapsTip') : t('address.needMapNoKey') }}</div>
          </div>

          <div class="fld">
            <div class="fld-label">{{ t('address.extraLabel') }}</div>
            <input v-model="form.extra" class="fld-input fld-plain" :placeholder="t('address.extraPh')" maxlength="120" />
          </div>

          <div class="fld">
            <div class="fld-label">{{ t('address.noteLabel') }}</div>
            <input v-model="form.note" class="fld-input fld-plain" :placeholder="t('address.notePh')" maxlength="100" />
          </div>

          <!-- 你是谁 / 怎么联系 -->
          <div class="fld">
            <div class="fld-label">{{ t('address.whoLabel') }}</div>
            <div class="who-card">
              <img v-if="avatar" class="who-avatar" :src="avatar" alt="" />
              <div v-else class="who-avatar who-avatar-ph" aria-hidden="true">👤</div>
              <div class="who-info">
                <div class="who-name">{{ selfName }}</div>
                <div class="who-sub">{{ selfHandle || t('address.me') }} · {{ t('address.viaTelegram') }}</div>
              </div>
              <span class="who-ok" aria-hidden="true">✓</span>
            </div>
            <div class="fld-hint">{{ t('address.viaTelegramHint') }}</div>
          </div>

          <div class="fld">
            <div class="fld-label">{{ t('address.backupPhone') }}</div>
            <input v-model="form.tel" class="fld-input fld-plain" inputmode="tel" :placeholder="t('address.backupPhonePh')" maxlength="20" />
            <div v-if="errors.tel" class="fld-err">{{ errText('tel') }}</div>
          </div>

          <label class="fld-switch">
            <span>{{ t('address.setDefault') }}</span>
            <van-switch :model-value="!!form.default" size="22px" @update:model-value="(v: boolean) => (form.default = v ? 1 : 0)" />
          </label>
        </div>

        <div class="sheet-foot">
          <van-button block round type="primary" @click="save">{{ t('address.save') }}</van-button>
        </div>
      </div>
    </van-popup>

    <van-action-sheet
      v-model:show="sheet"
      :actions="[
        { name: t('address.share'), key: 'share', icon: 'share-o' },
        { name: t('address.edit'), key: 'edit', icon: 'edit' },
        { name: t('address.delete'), key: 'delete', icon: 'delete-o', color: '#ee4d4d' },
      ]"
      :cancel-text="t('common.cancel')"
      close-on-click-action
      @select="(act: any) => { if (!current) return; if (act.key === 'share') share(current); else if (act.key === 'edit') { sheet = false; openForm(current); } else remove(current); }"
    />
  </div>
</template>

<style scoped>
.addr-sheet { display: flex; flex-direction: column; max-height: 92vh; }
.sheet-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 18px 8px; }
.sheet-title { font-size: 17px; font-weight: 600; }
.sheet-x { border: 0; background: transparent; font-size: 16px; color: var(--tg-hint); padding: 4px 6px; }
.sheet-body { flex: 1; overflow-y: auto; padding: 4px 18px 8px; }
.sheet-foot { padding: 10px 18px calc(14px + env(safe-area-inset-bottom)); }

.fld { margin-top: 16px; }
.fld-label { font-size: 13px; color: var(--tg-hint); margin-bottom: 7px; display: flex; align-items: center; gap: 8px; }
.fld-pin { font-size: 11px; color: var(--fbs-success); background: rgba(46, 189, 133, 0.12); padding: 1px 7px; border-radius: 20px; }
.fld-search { display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 14px; border-radius: 14px; background: var(--tg-secondary-bg); border: 1px solid transparent; }
.fld-search.is-error { border-color: #ee4d4d; }
.fld-ico { font-size: 15px; opacity: 0.7; }
.fld-input { flex: 1; min-width: 0; height: 100%; border: 0; background: transparent; color: var(--tg-text); font-size: 15px; outline: none; }
.fld-plain { height: 46px; padding: 0 14px; border-radius: 14px; background: var(--tg-secondary-bg); border: 1px solid transparent; }
.fld-plain:focus { border-color: var(--fbs-brand); }
.fld-hint { font-size: 12px; color: var(--tg-hint); margin-top: 7px; line-height: 1.45; }
.fld-err { font-size: 12px; color: #ee4d4d; margin-top: 6px; }
.fld-switch { display: flex; align-items: center; justify-content: space-between; margin-top: 22px; font-size: 15px; }

.who-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; background: var(--tg-secondary-bg); border: 1px solid rgba(46, 189, 133, 0.35); }
.who-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex: none; }
.who-avatar-ph { display: flex; align-items: center; justify-content: center; font-size: 19px; background: var(--fbs-line); }
.who-info { flex: 1; min-width: 0; }
.who-name { font-size: 15px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.who-sub { font-size: 12px; color: var(--tg-hint); margin-top: 2px; }
.who-ok { color: var(--fbs-success); font-size: 15px; font-weight: 700; }

.addr-add { margin-top: 4px; }
.addr-more { flex: none; border: 0; background: transparent; color: var(--tg-hint); font-size: 20px; line-height: 1; padding: 4px 2px 10px 8px; }
.addr-line3 { font-size: 13px; color: var(--tg-text); margin-top: 3px; opacity: 0.9; }
.addr-line4 { font-size: 12px; color: var(--tg-hint); margin-top: 5px; }
.addr-who { font-size: 14px; font-weight: 600; }
</style>
