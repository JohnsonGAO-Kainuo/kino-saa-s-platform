# Supabase 安全配置清单

## 必须立即完成的安全配置

### 1. 启用密码泄漏防护（HaveIBeenPwned）⚠️ 必须

**操作步骤：**
1. 打开 Supabase Dashboard: https://supabase.com/dashboard
2. 选择项目（project_ref: dzemdlzaeicaencittkp）
3. 导航至：**Authentication** → **Settings** → **Passwords**
4. 找到 "**Leaked Password Protection**" 或 "**Prevent use of compromised passwords**"
5. **打开开关**（启用）
6. 点击 **Save** 保存

**推荐同时配置：**
- 最小密码长度：12 位
- 密码复杂度：要求大小写字母 + 数字
- TOTP MFA：开启多因素认证（可选，但强烈推荐）

**用户体验处理：**
当用户尝试使用泄漏密码时，前端应显示友好提示：
```
"此密码已出现在数据泄漏中，无法使用。请选择一个更安全的密码。
建议使用密码管理器（如 1Password、Bitwarden）生成强密码。"
```

### 2. 验证 RLS 策略已生效 ✅ 已完成

已为所有 `kino` 表添加 membership 验证的 RLS 策略。验证方法：
```sql
-- 在 Supabase SQL Editor 运行
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'kino';
```

### 3. 检查 API 密钥安全 ⚠️ 重要

**确认以下密钥安全存储：**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` — 可公开
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 可公开（受 RLS 保护）
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` — **绝不**可暴露到前端/Git

**检查清单：**
- [ ] `.env.local` 已加入 `.gitignore`
- [ ] Vercel/生产环境的 service key 已通过环境变量配置
- [ ] GitHub 仓库未提交任何包含 service key 的文件

### 4. Storage 安全策略（如使用文件上传）

如果应用使用 Supabase Storage：
1. 为每个应用创建独立 bucket（如 `kino-assets`）
2. 配置 bucket 的 RLS 策略：
```sql
-- 仅示例，需根据实际调整
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kino-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND kino.is_kino_member()
);
```

### 5. 数据库备份 ✅ 建议

Supabase 自动备份策略：
- **免费版**：每日备份，保留 7 天
- **Pro 版**：每日备份，保留 30 天

**手动备份（可选）：**
```bash
# 使用 pg_dump（需要数据库连接字符串）
PGPASSWORD='<DB_PASSWORD>' pg_dump \
  --format=custom \
  --dbname="<CONN_URI>" \
  -f kino-backup-$(date +%Y%m%d).dump
```

## 定期安全检查清单

### 每月检查
- [ ] 查看 Supabase 安全建议（Dashboard → Reports → Advisors）
- [ ] 检查是否有未修复的 RLS 缺失警告
- [ ] 审计 `auth.users` 表，清理无效/测试账号
- [ ] 检查 `app_memberships` 数据一致性

### 每季度检查
- [ ] 轮换 service role key（如果使用）
- [ ] 审计 OAuth 应用权限（Google/GitHub）
- [ ] 检查数据库性能和查询慢日志
- [ ] 验证备份恢复流程

## 事件响应

### 如果怀疑密钥泄漏
1. 立即在 Supabase Dashboard 重置 service role key
2. 更新所有生产环境的环境变量
3. 检查最近的访问日志（Dashboard → Logs）
4. 如有异常，考虑强制所有用户重新登录

### 如果发现 RLS 绕过漏洞
1. 立即禁用受影响表的公开访问（临时移除 anon 策略）
2. 修复 RLS 策略并测试
3. 审计可能被非法访问的数据
4. 通知受影响用户（如需要）

## 监控和日志

### Supabase Dashboard 监控
- **Auth Logs**：Authentication → Logs（查看登录失败/成功记录）
- **Database Logs**：Database → Logs（查看查询性能和错误）
- **API Logs**：API → Logs（查看 REST/GraphQL 请求）

### 推荐告警设置（Pro 版）
- 失败登录次数超过阈值
- RLS 拦截次数异常增长
- 数据库连接数接近上限

## 合规性

### GDPR / 数据保护
- ✅ 用户可删除自己的账号和数据（通过 `auth.users` 的 CASCADE）
- ✅ 隐私政策和服务条款已集成到注册流程
- ⚠️ 如需导出用户数据，需实现专门的导出功能

### 数据保留政策
建议定期清理：
- 超过 90 天的草稿文档（status='draft'）
- 超过 1 年的已取消订阅记录
- 超过 2 年的 AI 生成历史（可归档）

## 参考资源
- Supabase 安全最佳实践：https://supabase.com/docs/guides/auth/security-best-practices
- RLS 策略指南：https://supabase.com/docs/guides/auth/row-level-security
- HaveIBeenPwned API：https://haveibeenpwned.com/API/v3
