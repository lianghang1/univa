# @univa/core

> 🚀 开箱即用的 uni-app Vite 插件集，以「约定优于配置」理念整合 uni-app 生态最佳实践。

[![NPM version](https://img.shields.io/npm/v/@univa/core?color=92DCD2&labelColor=18181B&label=npm)](https://www.npmjs.com/package/@univa/core)
[![License](https://img.shields.io/github/license/libre1103/univa?color=92DCD2&labelColor=18181B&label=license)](./LICENSE)

## 为什么选择 Univa？

在 uni-app + Vite 生态中，一个完整项目通常需要集成 5~7 个插件：`@dcloudio/vite-plugin-uni`、`unplugin-auto-import`、`@uni-helper/vite-plugin-uni-components`、`@uni-helper/vite-plugin-uni-pages`、`@uni-helper/vite-plugin-uni-layouts`、`@uni-ku/root`、`unocss/vite`……每个插件都有自己的配置项，分散在 `vite.config.ts` 中，维护成本高、心智负担重。

Univa 将这些插件整合为**单一入口** `Univa()`，通过一份 `univa.config.ts` 声明工程约定，其余全部自动装配。

### 核心特性

- **零参数入口**：`vite.config.ts` 只需 `plugins: [...Univa()]`，无需传任何配置
- **约定式目录**：`pages/`、`layouts/`、`components/` 等目录自动识别
- **统一自动导入**：`imports.apis` 一个字段同时管理预设导入与目录扫描
- **应用级配置**：`pages.json` 的 `globalStyle`/`tabBar` 等直接写在 `univa.config.ts`
- **逃生口设计**：`overrides` 字段可直接覆盖任意底层插件选项
- **自动产物集中**：所有生成文件统一输出到 `.univa/` 目录，便于 `.gitignore`

## 安装

```bash
# pnpm
pnpm add -D @univa/core

# yarn
yarn add -D @univa/core

# npm
npm install -D @univa/core
```

> 前置依赖：项目需已安装 `vite` 与 `@dcloudio/uni-app` 相关依赖。

## 快速开始

### 1. 配置 `vite.config.ts`

```ts
// vite.config.ts
import { Univa } from '@univa/core'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // 零参数，所有约定走 univa.config.ts
    ...Univa(),
  ],
})
```

### 2. 创建 `univa.config.ts`

在项目根目录创建 `univa.config.ts`（或 `univa.config.mts`）：

```ts
// univa.config.ts
import { defineConfig } from '@univa/core'

export default defineConfig({
  // 应用级 pages.json 配置
  pages: {
    globalStyle: {
      navigationBarTitleText: '我的应用',
    },
  },
})
```

### 3. 开始开发

```bash
pnpm dev
```

Univa 会自动：
- 扫描 `src/pages/` 生成 `pages.json`
- 扫描 `src/pages-sub/*/` 生成分包配置
- 自动导入 `vue`、`uni-app` 及 `src/composables/`、`src/hooks/`、`src/stores/` 等目录的导出
- 自动注册 `src/components/` 下的组件
- 生成虚拟根组件 `src/App.ku.vue`（若不存在）
- 输出类型声明到 `.univa/` 目录

## 目录约定

默认目录结构（均相对 `srcDir`，默认 `src`）：

```
src/
├── pages/              # 主包页面（自动扫描）
├── pages-sub/          # 分包根目录（默认扫描 pages-sub/* 下第一层）
│   └── demo/
├── layouts/            # 布局组件
├── components/         # 全局组件（自动注册）
├── components-biz/      # 业务组件（自动注册）
├── composables/        # 组合式 API（自动导入）
├── hooks/              # 自定义 Hooks（自动导入）
├── stores/             # 状态管理（自动导入）
├── constants/          # 常量（自动导入）
└── App.ku.vue          # 虚拟根组件（自动生成）
```

自定义目录约定：

```ts
// univa.config.ts
import { defineConfig } from '@univa/core'

export default defineConfig({
  dirs: {
    pages: 'views',                    // 主包页面目录
    subPackages: ['subpkgs/*'],        // 分包目录
    layouts: 'layouts',                // 布局目录
  },
})
```

## 自动导入

### `imports.apis` 统一字段

`apis` 支持三种形式，Univa 内部自动区分：

| 形式 | 示例 | 说明 |
|------|------|------|
| 预设名 | `'vue'`、`'uni-app'`、`'pinia'` | 识别为 unplugin-auto-import 预设 |
| 目录 glob | `'composables/**'`、`'hooks/**'` | 识别为目录扫描（相对 srcDir） |
| inline preset | `{ from: 'wot-design-uni', imports: ['useToast'] }` | 直接传给 unplugin-auto-import |

**识别规则**：含 glob 字符（`*?[{}]`）或路径分隔符（`/`）的字符串 → 目录扫描；否则 → 预设名。scope 包名（如 `@vueuse/core`）也算预设名。

默认值：

```ts
apis: ['vue', 'uni-app', 'composables/**', 'stores/**', 'hooks/**', 'constants/**']
```

自定义示例：

```ts
// univa.config.ts
import { defineConfig } from '@univa/core'

export default defineConfig({
  imports: {
    apis: [
      // 预设名
      'vue',
      'uni-app',
      'pinia',
      '@vueuse/core',
      // 目录扫描（相对 srcDir）
      'composables/**',
      'stores/**',
      // negation 排除
      '!hooks/**/_internal/**',
      // inline preset
      { from: 'wot-design-uni', imports: ['useToast', 'useMessage'] },
      // 命名导入映射
      { '@fun-design/use': ['useState', 'useVModel'] },
    ],
    // 组件自动注册目录（glob，相对 srcDir）
    components: ['components/**', 'components-biz/**'],
  },
})
```

### 类型声明

类型声明文件自动生成到 `.univa/` 目录：

- `.univa/auto-imports.d.ts` — API 自动导入类型
- `.univa/components.d.ts` — 组件自动注册类型
- `.univa/uni-pages.d.ts` — 页面路由类型

在 `tsconfig.json` 中引入：

```json
{
  "include": [".univa/**/*.d.ts"]
}
```

## 应用级配置（pages）

`pages.json` 的应用级内容（`globalStyle`、`tabBar`、`easycom` 等）可直接写在 `univa.config.ts`：

```ts
// univa.config.ts
import { defineConfig } from '@univa/core'

export default defineConfig({
  pages: {
    globalStyle: {
      navigationBarTextStyle: 'black',
      navigationBarTitleText: '我的应用',
      navigationBarBackgroundColor: '#FFFFFF',
      backgroundColor: '#F8F8F8',
    },
    tabBar: {
      color: '#7A7E83',
      selectedColor: '#3CC51F',
      backgroundColor: '#FFFFFF',
      list: [
        { pagePath: 'pages/index/index', text: '首页' },
        { pagePath: 'pages/user/index', text: '我的' },
      ],
    },
  },
})
```

Univa 会读取 `pages` 字段，自动生成 `.univa/pages-config.ts`，供 `@uni-helper/vite-plugin-uni-pages` 消费。

> **注意**：`pages`（页面列表）和 `subPackages`（分包列表）由目录扫描自动填充，请勿在配置中手写。

### 页面内配置（definePage）

在页面文件中使用 `definePage` 宏声明页面级配置：

```vue
<!-- src/pages/about.vue -->
<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '关于',
  },
})
</script>

<template>
  <view>About</view>
</template>
```

## 虚拟根组件（App.ku.vue）

Univa 集成了 `@uni-ku/root` 插件，提供全局共享组件能力（如全局 Toast、ConfigProvider 等）。

若 `src/App.ku.vue` 不存在，Univa 会在首次启动时自动生成最小模板：

```vue
<!-- Auto-generated by @univa/core -->
<!-- UniKuRoot 虚拟根组件，可在此添加全局组件（如 Toast、ConfigProvider 等） -->
<template>
  <KuRootView />
</template>
```

你可以在此基础上添加全局组件：

```vue
<!-- src/App.ku.vue -->
<script setup lang="ts">
import GlobalToast from '@/components/GlobalToast.vue'
</script>

<template>
  <KuRootView />
  <GlobalToast />
</template>
```

自定义根组件文件名（通过 `overrides.root.rootFileName`）：

```ts
// univa.config.ts
import { defineConfig } from '@univa/core'

export default defineConfig({
  overrides: {
    root: {
      rootFileName: 'KuRoot.vue', // 默认 App.ku.vue
    },
  },
})
```

## overrides 逃生口

对于 90% 的场景，使用上层约定（`dirs`、`imports`、`pages`）即可。当需要覆盖底层插件选项时，使用 `overrides`：

```ts
// univa.config.ts
import { defineConfig } from '@univa/core'

export default defineConfig({
  overrides: {
    // 覆盖 @uni-helper/vite-plugin-uni-pages 选项
    pages: {
      exclude: ['**/components/**/*.*'],
    },
    // 覆盖 @uni-helper/vite-plugin-uni-components 选项
    components: {
      globalNamespaces: ['components', 'common'],
      directoryAsNamespace: true,
    },
    // 覆盖 unplugin-auto-import 选项
    autoImport: {
      eslintrc: { enabled: true },
    },
    // 覆盖 @uni-ku/root 选项
    root: {
      enabledGlobalRef: true,
      excludePages: ['components-async/**/*.*'],
    },
    // 覆盖 @uni-helper/vite-plugin-uni-layouts 选项
    layouts: {
      layoutDir: 'src/layouts',
    },
    // 覆盖 unocss/vite 选项
    unocss: {
      presets: [],
    },
  },
})
```

`overrides` 的优先级最高，会与上层约定合并后传给底层插件。

## 自动生成的文件

所有自动生成的文件统一输出到 `.univa/` 目录：

```
.univa/
├── pages-config.ts       # 应用级 pages 配置（来源：univa.config.ts 的 pages 字段）
├── auto-imports.d.ts     # API 自动导入类型声明
├── components.d.ts        # 组件自动注册类型声明
└── uni-pages.d.ts        # 页面路由类型声明
```

建议在 `.gitignore` 中忽略：

```gitignore
.univa/
```

`pages.json` 仍由 `@uni-helper/vite-plugin-uni-pages` 输出到默认位置（`src/pages.json`），保持 uni-app 标准结构。

## 配置文件支持

`univa.config.ts` 支持以下扩展名（自动识别）：

- `univa.config.ts`
- `univa.config.mts`
- `univa.config.js`
- `univa.config.mjs`
- `univa.config.cjs`
- `univa.config.json`

配置文件不存在时使用默认配置。

## 完整配置示例

```ts
// univa.config.ts
import { defineConfig } from '@univa/core'

export default defineConfig({
  // 项目根目录，默认 process.cwd()
  rootDir: '.',

  // 源码目录，相对 rootDir，默认 'src'
  srcDir: 'src',

  // 目录约定
  dirs: {
    pages: 'pages',
    subPackages: ['pages-sub/*'],
    layouts: 'layouts',
  },

  // 自动导入
  imports: {
    apis: [
      'vue',
      'uni-app',
      'pinia',
      '@vueuse/core',
      'composables/**',
      'stores/**',
      'hooks/**',
      'constants/**',
      { from: 'wot-design-uni', imports: ['useToast'] },
    ],
    components: ['components/**', 'components-biz/**'],
  },

  // 应用级 pages.json 配置
  pages: {
    globalStyle: {
      navigationBarTitleText: '我的应用',
      navigationBarBackgroundColor: '#FFFFFF',
    },
    tabBar: {
      list: [
        { pagePath: 'pages/index/index', text: '首页' },
      ],
    },
  },

  // 底层插件逃生口（可选）
  overrides: {
    root: {
      enabledGlobalRef: true,
    },
  },
})
```

## 集成的插件

| 插件 | 说明 | overrides 键 |
|------|------|-------------|
| `@dcloudio/vite-plugin-uni` | uni-app 核心 | — |
| `@uni-helper/vite-plugin-uni-pages` | 文件式路由 | `pages` |
| `@uni-helper/vite-plugin-uni-layouts` | 布局系统 | `layouts` |
| `@uni-helper/vite-plugin-uni-components` | 组件自动注册 | `components` |
| `@uni-ku/root` | 虚拟根组件 | `root` |
| `unplugin-auto-import` | API 自动导入 | `autoImport` |
| `unocss/vite` | 原子化 CSS | `unocss` |

## 设计哲学

Univa 采用**融合约定 + 逃生口**的分层设计：

- **高层字段**（`dirs`/`imports`/`pages`）：面向 90% 用户，降低心智成本，一个字段替代多个底层配置
- **逃生口**（`overrides`）：面向 10% 高级用户，可下沉到底层插件选项，优先级最高

这不是简单的插件包装，而是将底层插件的配置项重新组织为符合工程直觉的高层概念。

## License

[MIT](./LICENSE)
