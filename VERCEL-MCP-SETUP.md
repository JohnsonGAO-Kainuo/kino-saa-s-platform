# 🚀 Vercel MCP 集成方案

## 📋 目标

通过 MCP 连接 Vercel，实现：
- ✅ 直接通过 AI 查看部署状态
- ✅ 实时获取部署日志
- ✅ 监控错误和警告
- ✅ 触发重新部署
- ✅ 管理环境变量

## 🔍 当前状态

经过调研，**Vercel 官方目前还没有提供现成的 MCP 服务器**。但是有两种解决方案：

### 方案 1: 使用 Vercel API + 自定义 MCP 服务器（推荐）

我们可以创建一个自定义的 MCP 服务器，通过 Vercel API 来实现所有功能。

### 方案 2: 使用 Vercel CLI + GitHub MCP（当前方案）

通过 GitHub 自动部署 + Vercel 控制台查看日志。

---

## 🛠️ 方案 1: 自定义 Vercel MCP 服务器

### 第一步：创建 Vercel API Token

1. 访问 [Vercel Dashboard](https://vercel.com/account/tokens)
2. 点击 "Create Token"
3. 命名为 `MCP Integration Token`
4. 选择权限：
   - ✅ Read Deployments
   - ✅ Read Logs
   - ✅ Write Deployments
5. 复制生成的 Token（只显示一次！）

### 第二步：创建 MCP 服务器

我会为你创建一个简单的 Vercel MCP 服务器，支持以下功能：

```typescript
// vercel-mcp-server/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_API = 'https://api.vercel.com';

// 工具 1: 获取项目列表
async function listProjects() {
  const response = await fetch(`${VERCEL_API}/v9/projects`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  return await response.json();
}

// 工具 2: 获取部署列表
async function listDeployments(projectId: string) {
  const response = await fetch(`${VERCEL_API}/v6/deployments?projectId=${projectId}`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  return await response.json();
}

// 工具 3: 获取部署日志
async function getDeploymentLogs(deploymentId: string) {
  const response = await fetch(`${VERCEL_API}/v2/deployments/${deploymentId}/events`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
  });
  return await response.json();
}

// 工具 4: 触发重新部署
async function redeployProject(deploymentId: string) {
  const response = await fetch(`${VERCEL_API}/v13/deployments`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ deploymentId, target: 'production' })
  });
  return await response.json();
}
```

### 第三步：配置 MCP

将以下配置添加到 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "vercel": {
      "command": "node",
      "args": ["/path/to/vercel-mcp-server/dist/index.js"],
      "env": {
        "VERCEL_TOKEN": "your-vercel-token-here"
      }
    },
    "supabase": {
      "url": "https://mcp.supabase.com/mcp"
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token"
      }
    }
  }
}
```

---

## 🎯 方案 2: 当前推荐方案（简单快速）

由于创建自定义 MCP 服务器需要一些开发工作，我推荐先使用以下工作流：

### 自动化部署流程

1. **代码推送** → GitHub（通过 GitHub MCP）
2. **自动触发** → Vercel 部署（GitHub 集成）
3. **查看日志** → Vercel 控制台或通过 Vercel CLI

### 配置 Vercel CLI

安装 Vercel CLI 以便在终端查看日志：

```bash
npm install -g vercel

# 登录
vercel login

# 链接项目
cd /Users/johnson/Desktop/开发/Web/kino-saa-s-platform
vercel link

# 查看部署列表
vercel ls

# 查看最新部署日志
vercel logs

# 查看特定部署的日志
vercel logs [deployment-url]

# 实时查看日志
vercel logs --follow
```

### 在 Cursor 中使用

配置完成后，你可以对我说：

```
"运行 vercel logs 查看最新的部署日志"
"检查 Vercel 部署状态"
"查看生产环境的错误日志"
```

我会通过终端命令帮你执行并分析结果。

---

## 📊 功能对比

| 功能 | 自定义 MCP 服务器 | Vercel CLI | Vercel 控制台 |
|------|------------------|------------|--------------|
| 查看部署列表 | ✅ 自动 | ✅ 命令行 | ✅ 网页 |
| 查看实时日志 | ✅ 自动 | ✅ `--follow` | ✅ 实时 |
| 错误分析 | ✅ AI 分析 | ⚠️ 手动 | ⚠️ 手动 |
| 触发部署 | ✅ 自动 | ✅ 命令行 | ✅ 按钮 |
| 管理环境变量 | ✅ 自动 | ✅ 命令行 | ✅ 网页 |
| 设置难度 | 🔴 中等 | 🟢 简单 | 🟢 简单 |

---

## 🚀 推荐实施步骤

### 阶段 1: 快速启动（现在）

1. ✅ 使用 GitHub MCP（已配置）
2. ✅ 使用 Supabase MCP（已配置）
3. ⬜ 安装 Vercel CLI
4. ⬜ 配置 Vercel GitHub 集成

### 阶段 2: 增强体验（可选）

1. ⬜ 创建自定义 Vercel MCP 服务器
2. ⬜ 实现自动日志分析
3. ⬜ 添加部署通知

---

## 💡 立即可用的工作流

即使没有 Vercel MCP，你现在就可以这样操作：

### 示例 1: 部署新版本

```
你: "把最新的代码推送到 GitHub 并部署"
AI: [通过 GitHub MCP 推送代码]
AI: "代码已推送，Vercel 会自动部署。运行 vercel logs --follow 查看实时日志"
```

### 示例 2: 检查部署状态

```
你: "检查 Vercel 部署状态"
AI: [运行 vercel ls]
AI: "最新部署：https://kino-platform-xxx.vercel.app (Ready)"
```

### 示例 3: 查看错误日志

```
你: "查看最新的部署日志，有什么错误吗？"
AI: [运行 vercel logs]
AI: "发现错误：Module not found: '@/components/...' 
     建议：检查导入路径是否正确"
```

---

## 🔧 下一步操作

你希望我：

### 选项 A: 快速方案（推荐）
- 帮你安装和配置 Vercel CLI
- 设置 Vercel GitHub 集成
- 测试自动部署流程

### 选项 B: 完整方案
- 创建自定义 Vercel MCP 服务器
- 实现所有 Vercel API 功能
- 配置到 Cursor MCP

**请告诉我你想选择哪个方案？** 🤔

---

## 📚 参考资源

- [Vercel API 文档](https://vercel.com/docs/rest-api)
- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [Model Context Protocol 规范](https://modelcontextprotocol.io/)
- [创建自定义 MCP 服务器](https://modelcontextprotocol.io/docs/tools/building)



