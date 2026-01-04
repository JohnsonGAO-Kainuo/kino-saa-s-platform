# 🚀 Kino 部署指南

## 前置条件
- ✅ GitHub 仓库已创建：https://github.com/JohnsonGAO-Kainuo/kino-saa-s-platform
- ✅ 代码已推送到 main 分支
- ⏳ 需要配置 Supabase 数据库
- ⏳ 需要部署到 Vercel

---

## 步骤 1：配置 Supabase（5分钟）

### 1.1 创建 Supabase 项目
1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 点击 **New Project**
3. 填写信息：
   - Name: `kino-platform`
   - Database Password: (设置一个强密码并保存)
   - Region: 选择离香港最近的区域（建议：Singapore）
4. 等待项目创建完成（约2分钟）

### 1.2 创建数据库表
1. 进入项目后，点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 打开本地文件：
   ```
   /Users/johnson/Desktop/开发/Web/kino-saa-s-platform/scripts/01-create-documents-schema.sql
   ```
4. 复制全部内容粘贴到 SQL Editor
5. 点击 **Run** 执行

### 1.3 获取 API 密钥
1. 点击左侧 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.4 配置本地环境变量
在项目根目录编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**重要**：替换上面的值为你从 Supabase 复制的真实值！

---

## 步骤 2：部署到 Vercel（3分钟）

### 2.1 连接 GitHub 仓库
1. 访问 [https://vercel.com/new](https://vercel.com/new)
2. 如果未登录，使用 GitHub 账号登录
3. 点击 **Import Git Repository**
4. 搜索并选择 `kino-saa-s-platform`
5. 点击 **Import**

### 2.2 配置环境变量
在 **Configure Project** 页面：

1. 展开 **Environment Variables**
2. 添加以下变量：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon key |

3. 点击 **Deploy**

### 2.3 等待部署完成
- 部署通常需要 2-3 分钟
- 完成后会显示你的生产环境 URL，例如：
  ```
  https://kino-saa-s-platform.vercel.app
  ```

---

## 步骤 3：测试应用

### 3.1 本地测试
```bash
cd /Users/johnson/Desktop/开发/Web/kino-saa-s-platform
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 3.2 生产环境测试
访问你的 Vercel URL（部署完成后会显示）

### 3.3 功能测试清单
- [ ] 打开登录页面 `/login`
- [ ] 注册新账号（使用真实邮箱）
- [ ] 检查邮箱确认链接（Supabase 默认需要邮箱验证）
- [ ] 登录后查看 Dashboard
- [ ] 创建一份 Quotation
- [ ] 点击 Save 保存到数据库
- [ ] 刷新页面，确认数据持久化
- [ ] 导出 PDF

---

## 常见问题

### Q1: 本地开发时看不到登录页面？
**A**: 确保 `.env.local` 文件已创建并包含正确的 Supabase 凭据。

### Q2: 登录后显示 "Invalid credentials"？
**A**: 检查：
1. Supabase 项目是否正确创建
2. SQL 脚本是否成功执行
3. 环境变量是否正确配置

### Q3: Vercel 部署失败？
**A**: 检查：
1. 环境变量是否正确添加
2. GitHub 仓库是否有最新代码
3. 查看 Vercel 部署日志获取详细错误信息

### Q4: 注册后收不到确认邮件？
**A**: Supabase 默认启用邮箱验证。你可以：
- 选项1：在 Supabase Dashboard → Authentication → Settings 中禁用 "Email Confirmations"
- 选项2：配置自定义 SMTP 服务器

---

## 后续优化

### 自动部署
Vercel 已自动配置 CI/CD：
- 每次推送到 `main` 分支会自动部署到生产环境
- 每次创建 Pull Request 会自动生成预览环境

### 自定义域名
1. 在 Vercel 项目设置中点击 **Domains**
2. 添加你的自定义域名
3. 按照指引配置 DNS 记录

### 监控和分析
- Vercel Analytics 已集成（代码中已包含）
- 可在 Vercel Dashboard 查看访问统计

---

## 技术支持

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查浏览器控制台错误
3. 查看 Supabase 日志（Dashboard → Logs）

---

**预计总时间**: 10-15 分钟
**难度**: ⭐⭐☆☆☆

完成后，你将拥有一个完全可用的生产环境 SaaS 应用！


