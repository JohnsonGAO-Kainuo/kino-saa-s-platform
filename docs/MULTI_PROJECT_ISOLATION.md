# 多项目隔离与安全配置指南

## 概览
本项目使用单个 Supabase 项目支持多个应用（降低成本），通过 **schema 隔离 + RLS membership 验证** 实现跨应用数据隔离。

## 架构设计

### 1. Schema 隔离
- 每个应用一个独立 schema（如 `kino`、`app_wedding` 等）
- `auth` schema 全局共享（所有应用共用用户账号系统）
- 通过 `app_memberships` 表控制用户对各应用的访问权限

### 2. Membership 机制
```sql
-- 全局或每个 schema 下都有此表
CREATE TABLE kino.app_memberships (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  app_slug text NOT NULL,  -- 'kino', 'wedding', etc.
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, app_slug)
);
```

### 3. RLS 策略模板
所有业务表的策略都加入 membership 检查：
```sql
CREATE POLICY table_select_self ON kino.table_name
FOR SELECT
USING (auth.uid() = user_id AND kino.is_kino_member());
```

## 应用集成步骤

### 前端集成（必须）
在用户注册/登录成功后，确保创建 membership 记录：

```typescript
// 注册后
const { data: { user } } = await supabase.auth.signUp({ email, password })
if (user) {
  await supabase.from('kino.app_memberships').upsert({
    user_id: user.id,
    app_slug: 'kino',
    role: 'member'
  }, { onConflict: 'user_id,app_slug' })
}

// OAuth callback 后
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  await supabase.from('kino.app_memberships').upsert({
    user_id: user.id,
    app_slug: 'kino',
    role: 'member'
  }, { onConflict: 'user_id,app_slug' })
}
```

已在以下文件自动完成：
- `app/login/page.tsx` — 注册和登录时创建 membership
- `app/auth/callback/route.ts` — OAuth 回调时创建 membership

### 数据库迁移
迁移脚本位于：`scripts/08-add-app-memberships-and-rls.sql`

已包含：
- 创建 `app_memberships` 表
- 为所有 `kino` 表添加 membership 验证的 RLS 策略
- 自动回填现有用户的 membership

### 新应用接入流程
1. 创建新 schema（如 `app_wedding`）
2. 复制 `app_memberships` 表到新 schema（或共用全局表）
3. 复制 `is_<app>_member()` 函数，替换 app_slug
4. 为所有业务表添加相同模式的 RLS 策略
5. 前端在注册/登录时创建对应 app_slug 的 membership

## 安全配置

### 密码泄漏防护（HaveIBeenPwned）
1. 登录 Supabase Dashboard
2. Authentication → Settings → Passwords
3. 开启 "Prevent use of compromised passwords"
4. 建议同时设置：
   - 最小密码长度：12 位
   - 开启 TOTP MFA（可选）

### 错误提示文案
当用户输入泄漏密码时，前端应显示：
```
"此密码已出现在数据泄漏中，请更换一个新密码。建议使用密码管理器生成强密码。"
```

## 测试验证

### 验证 membership 隔离
```sql
-- 以用户 A 的身份登录，验证只能看到自己的数据
SELECT * FROM kino.documents;  -- 应只返回用户 A 的文档

-- 验证 membership 检查
SELECT kino.is_kino_member();  -- 应返回 true（如果有 membership）
```

### 验证跨应用隔离
1. 用相同邮箱在应用 A 和应用 B 注册
2. 登录应用 A，查询应用 B 的数据 → 应返回空或被 RLS 拦截
3. 查看 `app_memberships` 表确认用户在两个应用都有记录

## 注意事项

1. **API 密钥共享**：同一 Supabase 项目的 anon/service key 是共享的，隔离完全依赖 RLS
2. **Storage 隔离**：需要为每个应用创建单独的 bucket，或在 bucket 策略里加入 app_slug 检查
3. **成本节省**：多应用共用一个 Supabase 项目可大幅降低前期成本
4. **扩展性**：当某应用流量大时，可迁移到独立 Supabase 项目，只需导出对应 schema

## 回滚方案
如需移除 membership 验证（回到简单的 user_id 验证）：
```sql
-- 删除 membership 表
DROP TABLE IF EXISTS kino.app_memberships CASCADE;

-- 重新创建不带 membership 检查的策略
CREATE POLICY table_select_self ON kino.table_name
FOR SELECT
USING (auth.uid() = user_id);
```

## 相关文件
- 迁移脚本：`scripts/08-add-app-memberships-and-rls.sql`
- 登录逻辑：`app/login/page.tsx`
- OAuth 回调：`app/auth/callback/route.ts`
- Auth 上下文：`lib/auth-context.tsx`
