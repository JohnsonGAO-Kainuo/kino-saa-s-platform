# Schema Architecture 架构规范

## 概述 Overview

本项目采用 **多 Schema 隔离架构**，在单个 Supabase 实例中通过不同 schema 实现多应用隔离。

This project uses a **multi-schema isolation architecture**, where multiple applications are isolated through different schemas within a single Supabase instance.

## Schema 分类 Schema Classification

### 1. Supabase 系统 Schema (System Schemas)
这些是 Supabase 自带的系统 schema，**不应修改**：

- `auth` - 用户认证（所有应用共享）
- `storage` - 文件存储
- `realtime` - 实时订阅
- `public` - **应保持为通用/共享内容，不应包含特定应用的表**
- `extensions` - PostgreSQL 扩展
- `graphql` / `graphql_public` - GraphQL API

### 2. 应用 Schema (Application Schemas)
每个应用有独立的 schema，**严格隔离**：

- `kino` - Kino 文档生成 SaaS 平台
- `app_wedding` - 婚礼策划应用（示例）
- `app_xxx` - 其他应用...

## 核心原则 Core Principles

### ✅ 正确做法 (Correct Practices)

1. **Schema 隔离**
   - 每个应用的所有表都放在自己的 schema 中
   - Kino 的表：`kino.documents`, `kino.company_settings`, `kino.subscriptions` 等
   - 不要在 `public` schema 中创建应用特定的表

2. **前端查询**
   ```typescript
   // ✅ 正确：显式指定 schema
   const { data } = await supabase
     .schema('kino')
     .from('documents')
     .select('*');
   
   // ❌ 错误：默认查询 public schema
   const { data } = await supabase
     .from('documents')
     .select('*');
   ```

3. **RLS 策略**
   - 使用 `kino.app_memberships` 表检查用户权限
   - 通过函数 `is_kino_member()` 验证成员资格
   - 每个应用维护自己的 membership 记录

4. **共享资源**
   - `auth.users` - 所有应用共享同一用户池
   - 用户可以同时是多个应用的成员
   - 通过 `app_memberships` 表管理应用访问权限

### ❌ 错误做法 (Anti-Patterns)

1. **在 public schema 中创建应用表**
   ```sql
   -- ❌ 错误
   CREATE TABLE documents (...);
   
   -- ✅ 正确
   CREATE TABLE kino.documents (...);
   ```

2. **创建 public 视图暴露 kino 表**
   ```sql
   -- ❌ 错误：破坏隔离
   CREATE VIEW public.documents AS SELECT * FROM kino.documents;
   
   -- ✅ 正确：前端直接使用 .schema('kino')
   ```

3. **跨应用直接查询**
   ```sql
   -- ❌ 错误：app_wedding 查询 kino 的数据
   SELECT * FROM kino.documents;
   
   -- ✅ 正确：每个应用只访问自己的 schema
   ```

## 迁移脚本顺序 Migration Script Order

当前项目的迁移历史：

1. `01-create-documents-schema.sql` - ⚠️ 最初在 public 创建（已废弃）
2. `02-add-language-preference.sql` - 修改 company_settings
3. `03-create-user-assets-table.sql` - ⚠️ 最初在 public 创建（已废弃）
4. `04-add-payment-fields.sql` - 修改 company_settings
5. `05-create-business-profiles.sql` - 在 kino schema 创建
6. **`06-move-core-tables-to-kino.sql`** - ✅ 将核心表移动到 kino
7. **`07-move-subscriptions-and-consents-to-kino.sql`** - ✅ 继续迁移
8. **`08-add-app-memberships-and-rls.sql`** - ✅ 添加隔离机制

**注意**：脚本 01-04 是历史遗留，当时在 public schema 创建表是错误的，已通过 06-08 修正。

## 数据库访问模式 Database Access Patterns

### 前端 Supabase Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 所有 kino 表的查询都必须指定 schema
export const kinoClient = supabase.schema('kino');

// 使用示例
await kinoClient.from('documents').select('*');
await kinoClient.from('company_settings').select('*');
```

### 数据库函数

```sql
-- 检查用户是否是 kino 成员
CREATE OR REPLACE FUNCTION is_kino_member()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM kino.app_memberships 
    WHERE user_id = auth.uid() 
    AND app_name = 'kino'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS 策略使用该函数
CREATE POLICY "Users can only access own documents"
  ON kino.documents
  FOR ALL
  USING (is_kino_member() AND user_id = auth.uid());
```

## Kino Schema 表结构 Table Structure

当前 kino schema 包含的表：

- `kino.documents` - 文档（报价单、合同、发票、收据）
- `kino.document_relationships` - 文档关联关系
- `kino.company_settings` - 公司设置
- `kino.user_assets` - 用户资产（logo、签名、印章）
- `kino.subscriptions` - 订阅信息
- `kino.user_consents` - 用户同意记录
- `kino.ai_generations` - AI 生成历史
- `kino.app_memberships` - 应用成员资格
- `kino.business_profiles` - 商业档案

## 检查清单 Checklist

在开发新功能时，请确认：

- [ ] 新表是否创建在 `kino` schema 中？
- [ ] 前端查询是否使用 `.schema('kino')`？
- [ ] RLS 策略是否使用 `is_kino_member()` 检查？
- [ ] 外键是否正确引用 `auth.users` 或 `kino.*` 表？
- [ ] 是否避免了在 `public` schema 创建应用特定的内容？

## 故障排查 Troubleshooting

### REST API 404 错误

```
PGRST205: Could not find the table 'public.documents' in the schema cache
```

**原因**：前端没有指定 schema，默认查询 public schema

**解决**：
```typescript
// ❌ 错误
supabase.from('documents')

// ✅ 正确
supabase.schema('kino').from('documents')
```

### Permission Denied 错误

**检查**：
1. RLS 策略是否启用？
2. 用户是否在 `kino.app_memberships` 中有记录？
3. `is_kino_member()` 函数是否存在且正常工作？

---

**最后更新**: 2026-01-20
**维护者**: Kino Development Team
