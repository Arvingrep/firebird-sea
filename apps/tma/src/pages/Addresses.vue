<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import { fb, i18n } from '../services';
import { validateAddress } from '../lib/checkout.js';

interface Address { id: string; person: string; tel: string; address: string }
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
async function save() {
  errors.value = validateAddress(form.value);
  if (Object.keys(errors.value).length) return;
  try {
    await fb.post('waimai', 'operAddress', { id: form.value.id, person: form.value.person, tel: form.value.tel, address: form.value.address, street: form.value.address });
    editing.value = false;
    await load();
  } catch (e: any) { showToast(e?.message || 'Error'); }
}
async function remove(a: Address) {
  try {
    await showConfirmDialog({ message: t('address.deleteConfirm') });
    await fb.post('waimai', 'delAddress', { id: a.id });
    await load();
  } catch (e: any) { if (e && e.message) showToast(e.message); }
}
const err = (k: string) => (errors.value[k] === 'REQUIRED' ? t('address.required') : errors.value[k] ? t('address.invalid') : '');
onMounted(load);
</script>

<template>
  <div class="page">
    <van-loading v-if="loading" vertical>{{ t('common.loading') }}</van-loading>
    <template v-else>
      <van-empty v-if="list.length === 0" :description="t('address.empty')" />
      <van-cell v-for="a in list" :key="a.id" :title="`${a.person} ${a.tel}`" :label="a.address">
        <template #right-icon>
          <van-button size="mini" @click="openForm(a)">{{ t('address.edit') }}</van-button>
          <van-button size="mini" type="danger" @click="remove(a)">{{ t('address.delete') }}</van-button>
        </template>
      </van-cell>
      <van-button block type="primary" @click="openForm()">{{ t('address.add') }}</van-button>
    </template>
    <van-popup v-model:show="editing" position="bottom" round>
      <van-cell-group>
        <van-field v-model="form.person" :label="t('address.person')" :error-message="err('person')" maxlength="50" />
        <van-field v-model="form.tel" :label="t('address.tel')" :error-message="err('tel')" maxlength="20" />
        <van-field v-model="form.address" :label="t('address.detail')" :error-message="err('address')" maxlength="200" />
      </van-cell-group>
      <van-button block type="primary" @click="save">{{ t('address.save') }}</van-button>
    </van-popup>
  </div>
</template>
