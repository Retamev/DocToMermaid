# Vercel 部署维护 SOP

## 📋 标准操作程序 (Standard Operating Procedure)

本文档记录了 PDF → Mermaid 项目在 Vercel 平台的部署维护流程，基于实际部署问题的解决经验总结。

---

## 🎯 适用范围

- **项目类型**：Next.js 13+ App Router 应用
- **部署平台**：Vercel
- **维护人员**：项目开发者和运维人员
- **更新频率**：代码更新后的部署维护

---

## 🚀 标准部署流程

### 1. 部署前检查清单

#### ✅ 代码质量检查
```bash
# 1. 本地构建测试
npm run build

# 2. 本地运行测试
npm start

# 3. 访问测试
curl http://localhost:3000
```

#### ✅ 必要文件检查
- [ ] `package.json` - 包含正确的构建脚本
- [ ] `next.config.js` - Next.js 配置文件
- [ ] `vercel.json` - Vercel 部署配置
- [ ] `public/` - 静态资源目录（必须存在）
- [ ] `app/layout.jsx` - 根布局文件
- [ ] `app/page.jsx` - 主页面文件

#### ✅ 环境变量检查
- [ ] `VOLC_API_KEY` - 火山引擎 API 密钥
- [ ] `NODE_ENV=production` - 生产环境标识

### 2. 标准部署命令

```bash
# 1. 确保代码最新
git status
git add .
git commit -m "部署前代码提交"
git push origin main

# 2. 执行部署
vercel --prod

# 3. 验证部署
curl -I [部署URL]
```

---

## 🔧 常见问题及解决方案

### 问题 1: "No Output Directory named 'public' found"

**症状：**
```
Error: No Output Directory named "public" found after the Build completed.
```

**根本原因：**
Vercel 期望找到 `public` 目录，但 Next.js 13+ 项目可能没有创建该目录。

**解决方案：**
```bash
# 创建 public 目录
mkdir -p public
echo '# Static assets directory for Vercel deployment' > public/README.md

# 提交更改
git add public/
git commit -m "fix: 添加public目录以满足Vercel部署要求"
git push origin main
```

**预防措施：**
- 项目初始化时就创建 `public` 目录
- 在 `.gitignore` 中确保 `public` 目录被跟踪

### 问题 2: 部署成功但返回 404

**症状：**
```
HTTP/2 404
x-vercel-error: NOT_FOUND
```

**根本原因：**
Vercel 没有正确识别 Next.js 项目或构建配置不当。

**解决方案：**

1. **创建正确的 vercel.json 配置：**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ]
}
```

2. **提交并重新部署：**
```bash
git add vercel.json
git commit -m "fix: 添加Vercel Next.js构建配置"
git push origin main
vercel --prod
```

**预防措施：**
- 项目初始化时就配置正确的 `vercel.json`
- 定期检查 Vercel 官方文档的最新配置要求

### 问题 3: JSON 解析错误

**症状：**
```
Error: Couldn't parse JSON file /path/to/vercel.json
```

**解决方案：**
```bash
# 验证 JSON 格式
cat vercel.json | jq .

# 如果格式错误，重新创建文件
rm vercel.json
# 重新创建正确的配置文件
```

---

## 📁 标准项目结构

```
mermaidRule/
├── app/
│   ├── api/
│   │   └── convert/
│   │       └── route.js
│   ├── guide/
│   │   └── page.jsx
│   ├── layout.jsx          # ✅ 必需
│   └── page.jsx            # ✅ 必需
├── components/
├── contexts/
├── lib/
├── public/                 # ✅ 必需（Vercel要求）
│   └── README.md
├── styles/
├── utils/
├── next.config.js          # ✅ 必需
├── package.json            # ✅ 必需
├── vercel.json             # ✅ 必需
└── README.md
```

---

## ⚙️ 标准配置文件

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "next.config.js",
      "use": "@vercel/next"
    }
  ]
}
```

### package.json (关键脚本)
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  }
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdf2pic', 'gm'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'supports-color': 'commonjs supports-color',
        'debug': 'commonjs debug',
        'gm': 'commonjs gm',
        'pdf2pic': 'commonjs pdf2pic',
      });
    }
    return config;
  },
};

module.exports = nextConfig;
```

---

## 🔍 部署验证流程

### 1. 自动化验证脚本

```bash
#!/bin/bash
# deploy-verify.sh

DEPLOY_URL=$1

if [ -z "$DEPLOY_URL" ]; then
    echo "❌ 请提供部署URL"
    exit 1
fi

echo "🔍 开始验证部署: $DEPLOY_URL"

# 1. 检查主页
echo "📄 检查主页..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")
if [ "$STATUS" = "200" ]; then
    echo "✅ 主页正常 (200)"
else
    echo "❌ 主页异常 ($STATUS)"
    exit 1
fi

# 2. 检查使用指南页面
echo "📚 检查使用指南页面..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/guide")
if [ "$STATUS" = "200" ]; then
    echo "✅ 使用指南页面正常 (200)"
else
    echo "❌ 使用指南页面异常 ($STATUS)"
fi

# 3. 检查API接口
echo "🔧 检查API接口..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/convert")
if [ "$STATUS" = "405" ] || [ "$STATUS" = "200" ]; then
    echo "✅ API接口正常 ($STATUS)"
else
    echo "❌ API接口异常 ($STATUS)"
fi

echo "🎉 部署验证完成！"
```

### 2. 手动验证清单

- [ ] **主页访问** - 确认主页正常加载
- [ ] **使用指南页面** - 确认 `/guide` 路由正常
- [ ] **主题切换** - 测试明暗模式切换
- [ ] **响应式设计** - 在移动端测试界面
- [ ] **PDF上传** - 测试文件上传功能
- [ ] **图表生成** - 验证 Mermaid 代码生成
- [ ] **导出功能** - 测试 PNG/SVG 导出
- [ ] **API接口** - 确认 `/api/convert` 接口响应

---

## 📊 监控和维护

### 1. 定期检查项目

**每周检查：**
- [ ] 访问生产环境URL，确认网站正常
- [ ] 检查 Vercel 控制台的部署状态
- [ ] 查看错误日志和性能指标

**每月检查：**
- [ ] 更新依赖包版本
- [ ] 检查安全漏洞
- [ ] 备份重要配置文件

### 2. 性能监控指标

```bash
# 检查网站响应时间
curl -w "@curl-format.txt" -o /dev/null -s "$DEPLOY_URL"

# curl-format.txt 内容：
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                     ----------\n
#           time_total:  %{time_total}\n
```

**正常指标范围：**
- 首次加载时间：< 3秒
- API响应时间：< 2秒
- 缓存命中率：> 80%

---

## 🚨 应急处理流程

### 1. 网站完全无法访问

**立即行动：**
1. 检查 Vercel 控制台部署状态
2. 查看最近的部署日志
3. 回滚到上一个可用版本：
   ```bash
   vercel rollback [DEPLOYMENT_URL]
   ```

### 2. 功能异常但网站可访问

**排查步骤：**
1. 检查浏览器控制台错误
2. 查看 Vercel 函数日志
3. 验证环境变量配置
4. 测试 API 接口响应

### 3. 部署失败

**排查顺序：**
1. 检查构建日志中的错误信息
2. 验证 `vercel.json` 配置
3. 确认 `public` 目录存在
4. 检查依赖包版本兼容性
5. 清理缓存重新部署：
   ```bash
   rm -rf .next
   npm run build
   vercel --prod --force
   ```

---

## 📞 联系信息

**技术支持：**
- 📧 邮箱：reta@cumt.edu.cn
- 💬 微信：Soph0cless
- 🔗 GitHub：https://github.com/Retamev/DocToMermaid

**Vercel 官方资源：**
- 📚 文档：https://vercel.com/docs
- 🆘 支持：https://vercel.com/support
- 📖 Next.js 指南：https://vercel.com/docs/frameworks/nextjs

---

## 📝 更新日志

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2024-08-22 | v1.0 | 初始版本，基于部署问题解决经验 | 开发团队 |

---

## 📋 附录

### A. 常用命令速查

```bash
# 部署相关
vercel --prod                    # 生产环境部署
vercel ls                        # 查看部署列表
vercel logs [URL]               # 查看部署日志
vercel rollback [URL]           # 回滚部署

# 本地开发
npm run dev                     # 启动开发服务器
npm run build                   # 构建生产版本
npm start                       # 启动生产服务器

# 调试相关
curl -I [URL]                   # 检查HTTP头部
curl -w "%{http_code}" [URL]     # 获取状态码
```

### B. 错误代码对照表

| HTTP状态码 | 含义 | 可能原因 | 解决方案 |
|------------|------|----------|----------|
| 200 | 成功 | 正常响应 | 无需处理 |
| 404 | 未找到 | 路由配置错误 | 检查vercel.json配置 |
| 500 | 服务器错误 | 代码运行时错误 | 查看函数日志 |
| 502 | 网关错误 | 构建或部署失败 | 检查构建日志 |

---

*本SOP文档将根据实际维护经验持续更新和完善。*