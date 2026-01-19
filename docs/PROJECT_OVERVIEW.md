# Kino Project — 非技术人员学习手册

目标：帮助不熟悉代码与 infra 的同学快速理解项目结构、主要功能点、运行流程与常见操作。文档用非专业语言说明，并给出示例与定位文件，方便你在需要时查看或复制给开发同事。

---

## 一、项目概要（高层）
- 项目名称：Kino — AI 文档工作空间（多应用共享一个 Supabase 实例）
- 前端：Next.js（React）
- 后端：主要使用 Supabase（Postgres DB + Auth + Storage）和少量 server-side 处理（Next server routes）
- 目的：让用户生成、编辑、管理与导出文档（如报价、发票、合同）并可订阅付费计划

---

## 二、如何理解“前端 / 后端 / 数据库”
- 前端（用户看到的界面）：React + Next.js 页面和组件，位于 `app/` 与 `components/` 文件夹。
  - `app/page.tsx`：网站首页
  - `app/login/page.tsx`：登录/注册页面（包含 Email / Google 登录）
  - `components/`：可复用 UI 组件（侧边栏、卡片、编辑器等）

- 后端（处理数据或与第三方交互）：主要是 Supabase 服务（由我们托管）和少量 `app/api` 或 Server Route（位于 `app/auth/callback/route.ts`）
  - Supabase 提供：用户认证（Auth）、数据库（Postgres）、文件存储（Storage）与实时功能（Realtime）

- 数据库（持久化数据）：Postgres schema 被分成多个 namespace
  - `auth`：Supabase 的用户表（邮箱、第三方登录、会话）
  - `kino`：本项目的业务表（documents、subscriptions、user_assets 等）
  - 其他系统 schema（storage、realtime、supabase_migrations 等）由 Supabase 平台使用

---

## 三、重要概念与目前实现（简明）
- 单 Supabase 多 schema：我们用一个 Supabase 项目来节省成本，用不同的 schema（如 `kino`）来隔离每个应用的数据。
- 身份（Auth）是共享的：所有应用都共用 `auth.users`。为了解决跨应用访问问题，我们实现了 `app_memberships` 机制（`kino.app_memberships`）：
  - 每个用户在注册或登录后，会在 `kino.app_memberships` 里新增一条记录（`user_id`, `app_slug='kino'`）。
  - 数据库使用 RLS（Row-Level Security）策略，只有当 `auth.uid()` 是数据 owner 且用户有对应的 membership 时，才能读取/写入该 schema 下的数据。

- RLS（行级安全策略）：数据库层面的访问控制，保证即便前端拿到 anon key，也只能在授权范围内操作数据。

---

## 四、快速上手（运行和测试）
前提：已安装 Node.js 与 pnpm 并有项目源码（本仓库）。

1. 克隆项目并安装依赖：
```bash
pnpm install
```
2. 本地运行：
```bash
pnpm dev
```
3. 打开浏览器访问：
```
http://localhost:3000
```
4. 登录流程：
- 使用 Email 注册（会发送验证邮件），或使用 Google 登录
- 注册/登录后，应用会自动为你创建 `kino` membership（把你加入到 app）

---

## 五、我可能会关心的核心文件（定位表）
- 登录与 OAuth
  - `app/login/page.tsx`：登录/注册表单与逻辑
  - `app/auth/callback/route.ts`：OAuth 回调处理（Exchange code for session）

- 认证状态
  - `lib/auth-context.tsx`：全局认证上下文，页面用它知道当前用户是谁

- 数据访问
  - `lib/document-storage.ts`、`lib/asset-management.ts`：处理文件与附件的上传/取回

- 数据库/迁移脚本
  - `scripts/06-move-core-tables-to-kino.sql`：把核心表迁移到 `kino` schema 的脚本
  - `scripts/07-move-subscriptions-and-consents-to-kino.sql`：将订阅与同意表迁移到 `kino`
  - `scripts/08-add-app-memberships-and-rls.sql`：添加 membership 表并设 RLS（已经执行）

- 文档说明
  - `docs/MULTI_PROJECT_ISOLATION.md`：多项目隔离设计（已经写）
  - `docs/SECURITY_CHECKLIST.md`：安全建议与操作清单（已经写）
  - `docs/PROJECT_OVERVIEW.md`：你正在查看的学习文档（本文件）

---

## 六、数据库示例（非技术细节，帮助理解）
- `kino.documents`：一行代表一个文档（例如一份报价单）
  - 关键字段：`id`, `user_id`, `title`, `content`, `created_at`。
  - 访问控制：只有 `user_id` 等于当前登录用户的 ID 且该用户属于 `kino` membership 时可读写。

- `kino.app_memberships`：控制哪些用户属于 `kino`
  - 关键字段：`user_id`, `app_slug`, `role`, `created_at`
  - 前端在用户第一次登录时会自动插入一条 membership，以便用户能立即使用应用。

---

## 七、常见问题（FAQ）
Q1：用户 A 在另一个应用 B 注册，能否访问 Kino 的数据？
- A：不能。虽然用户账户是同一份，但数据库里的 RLS 要求用户有 `kino` 的 membership 才能读取 `kino` 数据。

Q2：如果我不想手动在控制台开“泄漏密码保护”，怎么办？
- A：Pro 功能我们无法使用时，推荐在前端增加密码强度检测（例如 zxcvbn）并强制最小长度（建议 12）；并鼓励用户开启 MFA。

Q3：我需要备份/恢复数据吗？如何做？
- A：建议在 Supabase 控制台创建手动备份，或使用 `pg_dump` 导出数据库。具体步骤在 `docs/SECURITY_CHECKLIST.md` 中有说明。

---

## 八、我建议你先学的三件事（按重要性）
1. 在浏览器打开 `http://localhost:3000`，点击登录/注册，亲自体验一遍用户流程。观察邮件验证、OAuth 回调。  
2. 打开 `docs/MULTI_PROJECT_ISOLATION.md` 和 `docs/SECURITY_CHECKLIST.md`，熟悉我们如何控制访问与保障安全。  
3. 学习 `app/login/page.tsx` 的实现（只读即可），看它如何调用 Supabase 的 `auth.signUp`、`signInWithPassword` 和如何处理回调。

---

## 九、如果你要更深入，我可以帮你做（选项）
- A. 把这些文档转成一个 15–20 分钟的入门演示（幻灯片 + 讲稿），你可以在团队会里用；
- B. 为你准备一个更浅显的“字段对照表”，列出每个主要表的字段和它们的含义（Excel/CSV）；
- C. 做一次远程演示（共享屏幕），手把手带你看代码与控制台（需安排时间）。

告诉我你想要哪一种，我立刻准备下一步。