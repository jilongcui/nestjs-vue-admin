# nestjs-vue-admin

Vue 2.6 admin dashboard — frontend of a NestJS-backed management system (RuoYi-style). Built with Vue CLI 4.

## Project

- **Stack**: Vue 2.6, Element UI 2.15, Vuex 3.6, Vue Router 3.4, Axios, ECharts 4.9, SCSS
- **Entry point**: `src/main.js` → mounts `App.vue` → Layout → router views
- **Backend proxy**: dev server proxies `/dev-api` → `http://localhost:3000/api` (`vue.config.js` proxy table)

## Commands

| Action | Command |
|--------|---------|
| Dev server (port 80) | `npm run dev` |
| Build (production) | `npm run build:prod` |
| Build (staging) | `npm run build:stage` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` (ESLint `.js,.vue` in `src/`) |

## Architecture

| Directory | Role |
|-----------|------|
| `src/api/` | Axios-based API modules — one file per domain (`login.js`, `menu.js`, `order.js`, `system/`, `wallet/`, etc.) |
| `src/store/` | Vuex modules: `app`, `user`, `tagsView`, `permission`, `settings` + `getters.js` |
| `src/router/` | `constantRoutes` (public: login, 404, index) + `dynamicRoutes` (permission-gated: system, monitor, tool); history mode |
| `src/views/` | Page components per folder (`system/`, `monitor/`, `wallet/`, `biz/`, `dashboard/`, `account/`, etc.) |
| `src/layout/` | App shell — Sidebar, Navbar, TagsView, Settings panel, AppMain |
| `src/components/` | Shared UI components (Pagination, FileUpload, ImageUpload, DictTag, Editor, SvgIcon, etc.) |
| `src/utils/` | Utilities: `request.js` (axios interceptor with token, retry, download), `auth.js`, `validate.js`, `ruoyi.js` |
| `src/directive/` | Custom Vue directives |
| `src/plugins/` | Plugin setup (auth, cache, modal, tab, download) |
| `src/permission.js` | Router guard — token check → fetch user info → generate dynamic routes |
| `src/assets/` | Styles (SCSS), icons (SVG sprites) |
| `build/` | Preview server script |

## Conventions

- **API modules**: `src/api/<domain>.js` exports named functions using the wrapped axios instance from `@/utils/request`
- **Vuex**: action names are PascalCase (`GetInfo`, `GenerateRoutes`, `LogOut`); mutations/setters use snake_case
- **Route meta**: uses `title`, `icon`, `affix`, `noCache`, `breadcrumb`, `activeMenu`, `roles`, `permissions` keys
- **Views**: single-file components with `<template>`, `<script>`, `<style lang="scss" scoped>` order
- **Global mixins/prototypes**: utility functions mounted on `Vue.prototype` (parseTime, resetForm, download, etc.) in `main.js`
- **CSS**: SCSS with BEM-like naming; global styles in `src/assets/styles/`
- **Alias**: `@` → `src/`
- **Lint**: ESLint with `plugin:vue/recommended` + `eslint:recommended` (see `.eslintrc.js`)

## Notes

(Add project-specific notes here as they arise.)
