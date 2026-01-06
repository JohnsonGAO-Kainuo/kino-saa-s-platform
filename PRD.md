# 🚀 Kino: AI-Driven Document Lifecycle System

## 产品定位 (Product Positioning)
为香港中小企 (SME) 和 Freelancer 打造的极简、专业、AI 赋能的文档全生命周期管理工具。

**Version:** 1.0 (Updated: 2026-01-05)  
**Status:** Prototype Phase - Core Features Implemented

---

## 📋 目录 (Table of Contents)
1. [产品概述](#产品概述)
2. [当前实现状态](#当前实现状态)
3. [核心业务流程](#核心业务流程)
4. [功能模块详解](#功能模块详解)
5. [技术架构](#技术架构)
6. [待完善功能](#待完善功能)
7. [UI/UX 改进计划](#uiux-改进计划)

---

## 产品概述

### 核心价值主张
- **AI 智能生成**: 通过自然语言描述自动生成专业文档
- **文档流转管理**: Quotation → Contract/Invoice → Receipt 的完整生命周期
- **本地化支持**: 繁体中文/英文双语，适配香港市场
- **品牌定制**: 支持 Logo、签名、印章上传
- **支付追踪**: 手动标记支付状态，自动生成收据，支持撤销保护

---

## 当前实现状态

### ✅ 已实现功能

#### 1. Dashboard (仪表板)
- **文档统计卡片** (`DocumentStats`): 显示文档数量统计
- **快速操作** (`QuickActions`): 快速创建 4 种文档类型
  - Quotation (报价单)
  - Contract (合同)
  - Invoice (发票)
  - Receipt (收据)
- **草稿管理** (`DraftDocuments`): 展示草稿列表
- **活动记录** (`RecentActivity`): 显示最近操作
- **订阅卡片** (`SubscriptionCard`): 显示 Pro Plan ($5/月)

#### 2. Editor (编辑器)
**布局结构** (`EditorLayout`):
- 顶部导航: 文档类型 Tab 切换 (`EditorTabs`)
- 左侧表单: 数据输入区域 (`EditorForm`)
- 右侧预览: 1:1 实时文档预览 (`DocumentPreview`)
- 右侧边栏: AI Agent 生成助手 (`AIAgentSidebar`)

**表单功能** (`EditorForm`):
- 公司品牌设置
  - Logo 上传
  - 手写签名 (通过 `SignaturePadModal`)
  - 公司印章上传
- 客户信息
  - 姓名、邮箱、地址
- 项目明细 (Line Items)
  - 描述、数量、单价
  - 动态增删行
- 合同专属字段
  - 合同条款 (Contract Terms)
  - 付款条款 (Payment Terms)
  - 交付日期 (Delivery Date)
- 备注 (Notes)

**文档预览** (`DocumentPreview`):
- 专业双语排版 (English | 繁體中文)
- 实时计算总金额
- 支付状态水印 (PAID/VOID)
- 香港本地支付信息展示
  - 银行转账信息
  - FPS (快速支付系统) 信息

**支付状态管理** (`PaymentStatusUI` + `payment-utils.ts`):
- 支付状态流转
  - `unpaid` → `paid` → `voided`
- 10秒撤销窗口 (Undo Window)
- 自动生成收据逻辑
- 状态可视化展示

**AI Agent 侧边栏** (`AIAgentSidebar`):
- 自然语言输入
- AI 生成文档内容
- 预览生成结果
- 一键应用到表单

#### 3. 类型系统 (`lib/types.ts`)
```typescript
DocumentType: "quotation" | "invoice" | "receipt" | "contract"
DocumentStatus: "draft" | "sent" | "accepted" | "rejected" | "paid" | "archived"
RelationshipType: 文档关联类型
Document: 完整文档数据结构
DocumentRelationship: 文档关系追踪
CompanySettings: 公司设置
AIGeneration: AI 生成记录
```

#### 4. AI 集成 (`lib/ai-client.ts`)
- 使用 Gemini 2.0 Flash 模型
- 结构化 JSON 输出
- 支持 4 种文档类型生成
- 专业术语和定价建议

---

## 核心业务流程

### The Kino Flow (文档生命周期)

```
┌─────────────┐
│  Quotation  │ ──────┐
│   (报价单)   │       │
└─────────────┘       │
                      ▼
              ┌──────────────┐
              │   Contract   │
              │  (服务协议)   │
              └──────────────┘
                      │
                      ▼
              ┌──────────────┐
              │    Invoice   │ ────► Mark as Paid ────► ┌──────────┐
              │    (发票)     │                          │ Receipt  │
              └──────────────┘                          │  (收据)   │
                                                        └──────────┘
                                                             │
                                                        Undo (10s)
                                                             │
                                                             ▼
                                                        Status: VOID
```

### 支付流程详解

1. **创建 Invoice**: 状态为 `unpaid`
2. **客户线下支付**: 通过 FPS 或银行转账
3. **手动标记支付**: 点击 "Mark as Paid"
   - 状态变为 `paid`
   - 启动 10 秒撤销窗口
   - 自动生成 Receipt
4. **撤销保护**:
   - 10 秒内可撤销 (Undo)
   - 撤销后 Receipt 状态变为 `voided`
   - 保留财务审计记录

---

## 功能模块详解

### 1. Dashboard Module

**路由**: `/`

**组件树**:
```
DashboardPage
├── DashboardHeader (顶部导航)
├── DocumentStats (统计卡片)
├── SubscriptionCard (订阅信息)
├── QuickActions (快速操作)
├── DraftDocuments (草稿列表)
└── RecentActivity (活动记录)
```

**数据需求**:
- 用户文档统计 (总数、草稿数、已发送数)
- 草稿列表 (当前使用 mock 数据)
- 活动日志
- 订阅状态

### 2. Editor Module

**路由**: `/editor?type={quotation|invoice|receipt|contract}`

**组件树**:
```
EditorPage
└── EditorLayout
    ├── EditorHeader (顶部工具栏)
    ├── EditorTabs (文档类型切换)
    ├── EditorForm (左侧表单)
    │   ├── SignaturePadModal (签名弹窗)
    │   └── PaymentStatusUI (支付状态)
    ├── DocumentPreview (右侧预览)
    └── AIAgentSidebar (AI 助手)
```

**状态管理**:
```typescript
formData: {
  clientName: string
  clientEmail: string
  clientAddress: string
  items: LineItem[]
  notes: string
  logo: File | null
  signature: string | null
  stamp: File | null
  contractTerms: string
  paymentTerms: string
  deliveryDate: string
  paymentStatus: PaymentStatus
}
```

### 3. AI Generation Module

**功能**:
- 自然语言转结构化数据
- 智能定价建议
- 专业术语生成
- 双语内容支持

**API**:
```typescript
generateDocumentWithAI(prompt: DocumentGenerationPrompt): Promise<GeneratedDocumentContent>
generateContractWithAI(description, clientName, companyName): Promise<string>
```

---

## 技术架构

### 前端技术栈
- **框架**: Next.js 16.0.10 (App Router)
- **UI 库**: Radix UI + Tailwind CSS 4.1.9
- **状态管理**: React Hooks (useState)
- **表单**: React Hook Form + Zod
- **AI**: Vercel AI SDK (ai@6.0.6)
- **PDF 导出**: jsPDF + html2canvas

### 目录结构
```
/app
  /editor          # 编辑器页面
  /page.tsx        # Dashboard 主页
  /layout.tsx      # 全局布局

/components
  /dashboard       # Dashboard 组件
  /editor          # Editor 组件
  /ui              # 通用 UI 组件

/lib
  ai-client.ts           # AI 生成逻辑
  payment-utils.ts       # 支付状态管理
  document-storage.ts    # 文档存储 (待实现)
  document-matching.ts   # 文档关联 (待实现)
  pdf-export.ts          # PDF 导出 (待实现)
  types.ts               # 类型定义

/scripts
  01-create-documents-schema.sql  # 数据库 Schema
```

### 数据库设计
- **documents**: 文档主表
- **document_relationships**: 文档关联表
- **company_settings**: 公司设置
- **ai_generations**: AI 生成记录

---

## 待完善功能

### 🔴 高优先级

#### 1. 数据持久化
- [ ] Firebase/Supabase 集成
- [ ] 文档 CRUD 操作
- [ ] 草稿自动保存
- [ ] 文件上传到云存储

#### 2. 文档关联系统
- [ ] Quotation → Invoice 转换
- [ ] Quotation → Contract 转换
- [ ] Invoice → Receipt 自动生成
- [ ] 关联关系可视化

#### 3. PDF 导出
- [ ] 高质量 PDF 生成
- [ ] 保留双语排版
- [ ] 嵌入 Logo/签名/印章
- [ ] 下载和分享功能

#### 4. 用户认证
- [ ] Firebase Auth 集成
- [ ] 登录/注册流程
- [ ] 用户权限管理
- [ ] 多租户隔离

#### 5. 订阅系统
- [ ] 免费额度管理 (前 2 份文档)
- [ ] Stripe 支付集成
- [ ] 订阅状态追踪
- [ ] 升级/降级流程

### 🟡 中优先级

#### 6. 公司设置页面
- [ ] 默认 Logo/签名/印章管理
- [ ] 公司信息预设
- [ ] 默认条款模板
- [ ] 银行账户信息管理

#### 7. 文档搜索和过滤
- [ ] 按类型/状态/客户筛选
- [ ] 全文搜索
- [ ] 日期范围筛选
- [ ] 排序功能

#### 8. 邮件发送
- [ ] 文档发送给客户
- [ ] 自动邮件提醒
- [ ] 邮件模板定制

#### 9. 多语言切换
- [ ] 界面语言切换 (中/英)
- [ ] 文档语言选择
- [ ] 中英双语对照模式

### 🟢 低优先级

#### 10. 高级功能
- [ ] 批量操作
- [ ] 文档模板库
- [ ] 数据分析和报表
- [ ] 移动端适配
- [ ] API 开放

---

## UI/UX 改进计划

### 当前 UI 问题

1. **视觉层次不明确**
   - 卡片间距和阴影需要优化
   - 色彩对比度不够
   - 缺少视觉焦点

2. **交互反馈不足**
   - 按钮 hover 状态不明显
   - 缺少加载动画
   - 表单验证提示不清晰

3. **响应式布局**
   - 移动端适配不完善
   - 编辑器在小屏幕上体验差

4. **品牌识别度低**
   - Logo 设计简陋
   - 缺少品牌色系统
   - 图标使用不统一

### 改进方向

#### 1. 视觉设计升级
- [ ] 设计完整的 Design System
- [ ] 定义品牌色彩系统
- [ ] 优化排版和间距
- [ ] 添加微交互动画

#### 2. Dashboard 优化
- [ ] 数据可视化图表
- [ ] 空状态设计
- [ ] 快速操作卡片重设计
- [ ] 活动时间线优化

#### 3. Editor 体验提升
- [ ] 表单分步骤引导
- [ ] 实时验证和错误提示
- [ ] 预览区域交互优化 (点击编辑)
- [ ] AI 生成加载动画

#### 4. 文档预览美化
- [ ] 更专业的模板设计
- [ ] 可选多种模板风格
- [ ] 自定义颜色主题
- [ ] 打印优化

#### 5. 响应式改进
- [ ] 移动端专属布局
- [ ] 触摸手势支持
- [ ] 平板横竖屏适配

---

## 商业模式

### 定价策略
- **免费版**: 前 2 份文档免费
- **Pro 版**: $5/月
  - 无限文档
  - 自定义品牌
  - 签名和印章
  - 优先 AI 生成
  - 邮件发送

### 目标用户
- 香港中小企业 (SME)
- Freelancer (自由职业者)
- 创业公司
- 个人工作室

### 市场定位
- 简单易用 (vs. 传统 ERP)
- 本地化 (vs. 国际产品)
- AI 赋能 (vs. 纯模板工具)
- 价格亲民 (vs. 企业级方案)

---

## 开发里程碑

### Phase 1: MVP (当前阶段) ✅
- [x] 基础 UI 框架
- [x] 4 种文档类型编辑器
- [x] AI 生成集成
- [x] 支付状态管理
- [x] 双语预览

### Phase 2: 核心功能完善 (进行中)
- [ ] 数据持久化
- [ ] 用户认证
- [ ] PDF 导出
- [ ] 文档关联系统
- [ ] UI/UX 优化

### Phase 3: 商业化准备
- [ ] 订阅系统
- [ ] 支付集成
- [ ] 邮件发送
- [ ] 公司设置
- [ ] 性能优化

### Phase 4: 增长功能
- [ ] 移动端 App
- [ ] 模板市场
- [ ] API 开放
- [ ] 数据分析
- [ ] 多人协作

---

## 技术债务和已知问题

### 代码层面
1. **Mock 数据**: Dashboard 使用硬编码数据
2. **状态管理**: 缺少全局状态管理 (考虑 Zustand/Jotai)
3. **错误处理**: AI 生成失败处理不完善
4. **类型安全**: 部分组件类型定义不严格

### 功能层面
1. **文档编号**: 当前使用固定编号 (#2024-001)
2. **公司信息**: 硬编码在预览组件中
3. **支付方式**: FPS/银行信息写死
4. **文档保存**: 无自动保存功能

### 性能层面
1. **图片处理**: Logo/签名/印章未压缩
2. **预览渲染**: 大量数据时可能卡顿
3. **AI 请求**: 无缓存机制

---

## 参考资料

### 设计灵感
- Stripe Dashboard
- Linear App
- Notion
- Figma

### 竞品分析
- QuickBooks
- FreshBooks
- Wave
- Zoho Invoice

### 技术文档
- [Next.js App Router](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/)

---

## 更新日志

### 2026-01-05
- 创建完整 PRD 文档
- 记录当前实现状态
- 规划待完善功能
- 制定 UI/UX 改进计划

---

**Last Updated**: 2026-01-05  
**Document Owner**: Johnson  
**Status**: Living Document (持续更新)



