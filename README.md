# 🎬 Kino - AI-Driven Document Lifecycle System

<div align="center">

**为香港中小企和 Freelancer 打造的智能文档管理工具**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术栈](#-技术栈) • [项目结构](#-项目结构) • [开发指南](#-开发指南)

</div>

---

## 📖 项目简介

Kino 是一个专为香港市场设计的文档生命周期管理系统，通过 AI 技术简化报价单、合同、发票、收据的创建和管理流程。

### 核心优势

- 🤖 **AI 智能生成**: 自然语言描述即可生成专业文档
- 🔄 **完整生命周期**: Quotation → Contract/Invoice → Receipt 流转管理
- 🌏 **本地化支持**: 繁体中文/英文双语，适配香港商业环境
- 🎨 **品牌定制**: 支持 Logo、电子签名、公司印章
- 💰 **支付追踪**: 手动标记支付，自动生成收据，10秒撤销保护
- 📱 **响应式设计**: 完美适配桌面端和移动端

---

## ✨ 功能特性

### 已实现功能 ✅

#### Dashboard (仪表板)
- 📊 文档统计和数据可视化
- ⚡ 快速创建 4 种文档类型
- 📝 草稿管理和历史记录
- 💳 订阅状态展示

#### Editor (智能编辑器)
- 📄 支持 4 种文档类型
  - Quotation (报价单)
  - Contract (服务协议)
  - Invoice (发票)
  - Receipt (收据)
- 🎨 实时预览 (1:1 专业排版)
- 🤖 AI 智能填充
- ✍️ 电子签名和印章
- 💱 双语文档 (中英对照)
- 💰 支付状态管理

#### AI Agent (智能助手)
- 💬 自然语言输入
- 🧠 智能内容生成
- 💡 专业术语建议
- 💵 合理定价推荐

### 开发中功能 🚧

- 🗄️ 数据持久化 (Firebase/Supabase)
- 👤 用户认证系统
- 📥 PDF 导出
- 🔗 文档关联系统
- ⚙️ 公司设置页面
- 💳 订阅和支付集成
- 📧 邮件发送功能

---

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- pnpm 8.0+ (推荐) / npm / yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd kino-saa-s-platform
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local`:
```env
# AI 配置
OPENAI_API_KEY=your_openai_key
# 或使用 Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key

# Firebase 配置 (待实现)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# Stripe 配置 (待实现)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

4. **启动开发服务器**
```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
pnpm build
pnpm start
```

---

## 🛠️ 技术栈

### 前端框架
- **Next.js 16** - React 框架 (App Router)
- **React 19** - UI 库
- **TypeScript 5** - 类型安全

### UI 组件
- **Radix UI** - 无障碍组件库
- **Tailwind CSS 4** - 样式框架
- **Lucide Icons** - 图标库
- **Framer Motion** - 动画库 (计划中)

### AI 集成
- **Vercel AI SDK** - AI 集成框架
- **Google Gemini 2.0** - 大语言模型

### 工具库
- **React Hook Form** - 表单管理
- **Zod** - 数据验证
- **date-fns** - 日期处理
- **jsPDF** - PDF 生成
- **html2canvas** - HTML 转图片

### 后端服务 (计划中)
- **Firebase** - 认证、数据库、存储
- **Stripe** - 支付处理

---

## 📁 项目结构

```
kino-saa-s-platform/
├── app/                      # Next.js App Router
│   ├── editor/              # 编辑器页面
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── page.tsx             # Dashboard 主页
│   ├── layout.tsx           # 全局布局
│   └── globals.css          # 全局样式
│
├── components/              # React 组件
│   ├── dashboard/          # Dashboard 组件
│   │   ├── dashboard-header.tsx
│   │   ├── document-stats.tsx
│   │   ├── quick-actions.tsx
│   │   ├── draft-documents.tsx
│   │   ├── recent-activity.tsx
│   │   └── subscription-card.tsx
│   │
│   ├── editor/             # Editor 组件
│   │   ├── editor-layout.tsx
│   │   ├── editor-header.tsx
│   │   ├── editor-tabs.tsx
│   │   ├── editor-form.tsx
│   │   ├── document-preview.tsx
│   │   ├── ai-agent-sidebar.tsx
│   │   ├── payment-status-ui.tsx
│   │   └── signature-pad-modal.tsx
│   │
│   └── ui/                 # 通用 UI 组件 (Radix UI)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
│
├── lib/                    # 工具函数和逻辑
│   ├── ai-client.ts       # AI 生成逻辑
│   ├── payment-utils.ts   # 支付状态管理
│   ├── document-storage.ts # 文档存储 (待实现)
│   ├── pdf-export.ts      # PDF 导出 (待实现)
│   ├── types.ts           # TypeScript 类型定义
│   └── utils.ts           # 通用工具函数
│
├── public/                 # 静态资源
│   ├── icon.svg
│   └── placeholder-*.png
│
├── scripts/                # 数据库脚本
│   └── 01-create-documents-schema.sql
│
├── PRD.md                  # 产品需求文档
├── ROADMAP.md              # 开发路线图
├── README.md               # 项目说明 (本文件)
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## 👨‍💻 开发指南

### 开发流程

1. **查阅文档**
   - 开发前先阅读 `PRD.md` 了解产品需求
   - 查看 `ROADMAP.md` 确认当前优先级

2. **创建分支**
```bash
git checkout -b feature/your-feature-name
```

3. **开发和测试**
```bash
pnpm dev          # 启动开发服务器
pnpm lint         # 代码检查
pnpm build        # 构建测试
```

4. **提交代码**
```bash
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

5. **更新文档**
   - 完成功能后更新 `ROADMAP.md` 进度
   - 重大变更需更新 `PRD.md`

### Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: 新功能
fix: Bug 修复
docs: 文档更新
style: 代码格式化 (不影响功能)
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建工具或依赖更新
```

示例:
```bash
git commit -m "feat: add PDF export functionality"
git commit -m "fix: resolve payment status undo issue"
git commit -m "docs: update API documentation"
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式写法
- 优先使用组合而非继承
- 保持组件单一职责

### 组件开发规范

```tsx
// ✅ 推荐写法
"use client" // 客户端组件需声明

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false)
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  )
}
```

### 样式规范

使用 Tailwind CSS 实用类:

```tsx
// ✅ 推荐
<div className="flex items-center gap-4 p-6 bg-card border border-border rounded-lg">

// ❌ 避免
<div style={{ display: 'flex', padding: '24px' }}>
```

---

## 🎨 UI/UX 设计原则

### 设计系统

#### 颜色系统 (待完善)
```css
/* Primary Colors */
--primary: ...
--primary-foreground: ...

/* Accent Colors */
--accent: ...
--accent-foreground: ...

/* Semantic Colors */
--success: ...
--warning: ...
--error: ...
```

#### 间距系统
遵循 Tailwind 默认间距: 4px 基准

#### 字体系统
- 标题: font-bold
- 正文: font-normal
- 小字: text-sm
- 微小: text-xs

### 响应式断点
```
sm: 640px   # 手机横屏
md: 768px   # 平板
lg: 1024px  # 桌面
xl: 1280px  # 大屏
```

---

## 📚 API 文档

### AI Generation API

```typescript
// 生成文档内容
const content = await generateDocumentWithAI({
  documentType: 'quotation',
  description: 'Website development service...',
  includeTerms: true
})

// 生成合同条款
const terms = await generateContractWithAI(
  'Website development',
  'Acme Corp',
  'My Company'
)
```

### Document Storage API (待实现)

```typescript
// CRUD 操作
const doc = await createDocument(data)
const docs = await listDocuments({ type: 'quotation' })
const doc = await getDocument(id)
await updateDocument(id, data)
await deleteDocument(id)
```

---

## 🧪 测试

### 运行测试 (待实现)

```bash
pnpm test              # 单元测试
pnpm test:e2e          # E2E 测试
pnpm test:coverage     # 测试覆盖率
```

---

## 🚀 部署

### Vercel 部署 (推荐)

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### 手动部署

```bash
pnpm build
pnpm start
```

---

## 📊 项目状态

### 当前阶段
**Phase 2: 核心功能完善**

### 完成度
- ✅ MVP 原型: 100%
- 🚧 UI/UX 优化: 0%
- 🚧 数据持久化: 0%
- 🚧 用户认证: 0%
- 📅 订阅系统: 未开始

详见 [ROADMAP.md](./ROADMAP.md)

---

## 🤝 贡献指南

欢迎贡献! 请遵循以下步骤:

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- **项目负责人**: Johnson
- **邮箱**: [your-email@example.com]
- **问题反馈**: [GitHub Issues](../../issues)

---

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Radix UI](https://www.radix-ui.com/) - 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Vercel](https://vercel.com/) - 部署平台
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI 模型

---

<div align="center">

**Made with ❤️ for Hong Kong SMEs**

[⬆ 回到顶部](#-kino---ai-driven-document-lifecycle-system)

</div>

