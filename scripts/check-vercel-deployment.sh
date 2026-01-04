#!/bin/bash

# Vercel 部署检查脚本
# 用法: ./scripts/check-vercel-deployment.sh [logs|status|latest]

set -e

echo "🚀 Kino Platform - Vercel 部署检查"
echo "=================================="
echo ""

case "${1:-status}" in
  "status")
    echo "📊 检查部署状态..."
    vercel ls --yes
    ;;
  
  "logs")
    echo "📝 获取最新部署日志..."
    vercel logs --yes
    ;;
  
  "latest")
    echo "🔍 获取最新部署信息..."
    vercel ls --yes | head -n 5
    echo ""
    echo "📝 最新日志（最后 20 行）："
    vercel logs --yes | tail -n 20
    ;;
  
  "follow")
    echo "👀 实时监控部署日志..."
    vercel logs --follow --yes
    ;;
  
  "errors")
    echo "❌ 查找错误日志..."
    vercel logs --yes | grep -i "error\|fail\|exception" || echo "✅ 没有发现错误"
    ;;
  
  *)
    echo "用法: $0 [status|logs|latest|follow|errors]"
    echo ""
    echo "  status  - 查看所有部署状态"
    echo "  logs    - 查看最新部署的完整日志"
    echo "  latest  - 查看最新部署的摘要和日志"
    echo "  follow  - 实时监控部署日志"
    echo "  errors  - 只显示错误日志"
    exit 1
    ;;
esac

echo ""
echo "✅ 完成"


