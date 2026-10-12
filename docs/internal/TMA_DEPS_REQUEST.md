# apps/tma 依赖批准申请（待 Arvin 登记到 `.agents/approved-deps.txt`）

Zero-Dep 门禁只读 base 分支上的 `.agents/approved-deps.txt`，且仅 Arvin 可改；Agent 分支无法自行登记。
Epic T4（外卖前端）脚手架需要下列依赖，已在 brief 中确认技术栈（Vite + Vue 3 + TS + Vue Router(hash) + Pinia + Telegram SDK + Vant 4）。

版本为 2026-10-12 查询到的最新稳定版，登记时须与 `apps/tma/package.json` 完全一致（精确版本）：

```
vue 3.5.43 # Arvin · apps/tma · TMA 前端框架（brief 已确认）
vue-router 5.4.0 # Arvin · apps/tma · hash 路由，适配 startapp 深链
pinia 4.0.3 # Arvin · apps/tma · 状态管理
vant 4.10.2 # Arvin · apps/tma · 移动端 UI 组件库
@telegram-apps/sdk 3.11.8 # Arvin · apps/tma · Telegram WebApp SDK 封装（约束 3）
@vitejs/plugin-vue 6.0.10 # Arvin · apps/tma · Vite 的 Vue 插件（devDependency）
typescript 7.0.2 # Arvin · apps/tma · 类型检查（devDependency）
```

说明：
- `vite ^6.2.0` 为 `apps/tma/package.json` 既有依赖，不在本次申请内（如需一并登记请在流程中说明）。
- 版本较新，若偏好保守版本（如 vue-router 4.x、typescript 5.x），请在登记前告知，我据此调整并同步前端代码。
- 登记走单独 PR，合并后再提使用这些依赖的脚手架 PR。
