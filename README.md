# DocToMermaid 智能文档解析引擎

🚀 基于 Next.js 构建的智能文档解析与图表生成引擎，能够将复杂的PDF文档转换为结构化的Mermaid流程图代码。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Mermaid](https://img.shields.io/badge/Mermaid-10.6.1-ff6b6b)](https://mermaid.js.org/)

## ✨ 核心特性

### 🧠 智能路由系统
- **页面级复杂度分析**：自动检测文档页面的复杂程度
- **策略自动选择**：根据内容复杂度选择最佳解析策略
- **多因素评估**：综合文本密度、图像数量、表格数量等因素

### 🔄 Map-Reduce 大文档处理
- **分块处理**：将大文档智能分割成可处理的小块
- **并行处理**：支持多块并行处理，提升效率
- **结果合并**：将各块处理结果智能合并为最终Mermaid代码
- **上下文突破**：解决大模型上下文长度限制问题

### 👁️ 多模态增强
- **图文结合**：结合PDF文本和页面图像进行分析
- **智能采样**：自动选择关键页面进行图像解析
- **视觉理解**：利用多模态大模型理解复杂布局和图表

### ⚡ 缓存优化
- **多层缓存**：PDF解析、图像渲染、LLM调用结果缓存
- **性能提升**：避免重复计算，显著提升响应速度
- **智能过期**：自动清理过期缓存，保持系统性能

### 🎨 可视化渲染
- **实时预览**：自动渲染Mermaid代码为可视化图表
- **多格式导出**：支持PNG和SVG格式的高质量图片导出
- **交互控制**：重新渲染、复制代码、导出图片等操作

### 📊 智能进度条
- **历史学习**：基于历史处理数据智能预估处理时间
- **准确率显示**：显示预估可信度和历史准确率
- **阶段跟踪**：实时显示当前处理阶段和剩余时间

### 🛡️ 自动降级
- **多层回退**：AI失败时自动回退到规则解析
- **错误恢复**：图像渲染失败时回退到纯文本处理
- **可用性保障**：确保在各种情况下都能产出结果

## 🏗️ 系统架构

```mermaid
graph TD
    A[输入层] --> B{智能路由器}
    B --> C[快速解析引擎]
    B --> D[多模态解析引擎]
    B --> E[Map-Reduce处理器]
    
    C --> F[结果融合模块]
    D --> F
    E --> F
    
    F --> G[LLM调用模块]
    G --> H[Mermaid生成]
    H --> I[可视化渲染]
    
    J[缓存管理器] <--> C
    J <--> D
    J <--> E
    J <--> G
    
    K[进度管理器] --> L[历史数据学习]
    L --> M[智能预估]
```

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- 火山引擎豆包大模型 API Key

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/Retamev/DocToMermaid.git
cd DocToMermaid
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **环境配置**

复制环境变量模板：
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```env
# 火山引擎API密钥（必需）
VOLC_API_KEY=your_api_key_here

# 可选配置
DEFAULT_LLM_MODEL=doubao-seed-1-6-thinking-250715
MAX_PDF_PAGES=100
MAX_FILE_SIZE_MB=50
CACHE_ENABLED=true
```

4. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

5. **访问应用**

打开浏览器访问 `http://localhost:3000`

## 📖 使用指南

### 基本使用

1. **上传PDF文件**（支持最大50MB，100页）
2. **选择Mermaid图表方向**（纵向TB/横向LR）
3. **配置处理选项**：
   - **多模态**：启用图像+文本联合解析
   - **Map-Reduce**：选择大文档处理策略
4. **点击生成**，观看智能进度条
5. **查看结果**：自动渲染的可视化图表
6. **导出图片**：支持PNG/SVG格式导出

### 处理策略说明

#### 智能路由
- **快速解析**：适用于纯文本、结构简单的文档
- **多模态解析**：适用于包含图表、复杂布局的文档

#### Map-Reduce选项
- **自动**：文档>10k字符或>20页时自动启用
- **强制启用**：始终使用分块处理
- **禁用**：使用传统单次处理

## 🔧 技术栈

### 前端技术
- **Next.js 14**：React全栈框架
- **React 18**：用户界面库
- **Mermaid.js**：图表渲染引擎
- **html2canvas**：图片导出功能

### 后端技术
- **Node.js**：服务器运行时
- **pdf-parse**：PDF文本解析
- **pdf2pic**：PDF图像渲染
- **OpenAI SDK**：AI模型调用

### AI模型
- **火山引擎豆包**：doubao-seed-1-6-thinking-250715
- **多模态能力**：文本+图像联合理解
- **OpenAI兼容接口**：标准化API调用

## 📊 性能特性

### 处理能力
- 支持PDF文件最大50MB
- 支持最多100页文档
- 智能分块处理，突破上下文限制

### 缓存优化
- PDF解析结果缓存2小时
- 图像渲染结果缓存1小时
- LLM调用结果缓存30分钟
- 智能预估历史数据本地存储

### 错误处理
- 多层降级机制
- 自动重试（最多3次）
- 详细错误日志
- 用户友好的错误提示

## 🚀 部署指南

### Vercel 部署（推荐）

1. **连接GitHub仓库**
   - 在Vercel控制台导入GitHub项目

2. **配置环境变量**
   - `VOLC_API_KEY`：火山引擎API密钥
   - 其他可选配置变量

3. **自动部署**
   - Vercel会自动构建和部署项目

### Docker 部署

```dockerfile
# Dockerfile 示例
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 本地生产环境

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📈 监控与统计

系统提供详细的处理统计信息：

- **文档信息**：页数、词数、文件大小
- **处理策略**：使用的解析策略和路由决策
- **性能指标**：处理时间、缓存命中率
- **准确率统计**：预估时间准确率和历史记录
- **复杂度分析**：文档复杂度评分和影响因素

## 🔍 故障排除

### 常见问题

**1. API调用失败**
- 检查`VOLC_API_KEY`是否正确配置
- 确认API密钥有效且有足够配额
- 检查网络连接和防火墙设置

**2. 图像渲染失败**
- 系统会自动回退到纯文本处理
- 检查`pdf2pic`依赖是否正确安装
- 确认系统有GraphicsMagick或ImageMagick

**3. 大文档处理超时**
- 启用Map-Reduce模式
- 考虑减少文档大小或页数
- 检查服务器内存和CPU资源

**4. 内存不足**
- 启用缓存以减少重复计算
- 使用Map-Reduce分块处理
- 增加服务器内存配置

**5. Mermaid渲染错误**
- 检查生成的Mermaid语法
- 查看浏览器控制台错误信息
- 尝试重新渲染或刷新页面

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发环境设置

1. **Fork项目**到你的GitHub账户
2. **克隆Fork的仓库**到本地
3. **创建功能分支**：`git checkout -b feature/amazing-feature`
4. **安装依赖**：`npm install`
5. **启动开发服务器**：`npm run dev`
6. **进行开发和测试**
7. **提交更改**：`git commit -m 'Add amazing feature'`
8. **推送分支**：`git push origin feature/amazing-feature`
9. **创建Pull Request**

### 代码规范

- 使用ESLint和Prettier进行代码格式化
- 遵循React和Next.js最佳实践
- 添加适当的注释和文档
- 确保所有测试通过

### 提交规范

使用[Conventional Commits](https://www.conventionalcommits.org/)规范：

- `feat:` 新功能
- `fix:` 错误修复
- `docs:` 文档更新
- `style:` 代码格式化
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

## 🙏 致谢

- [火山引擎](https://www.volcengine.com/)：提供强大的AI模型支持
- [Next.js](https://nextjs.org/)：优秀的React全栈框架
- [Mermaid.js](https://mermaid.js.org/)：强大的图表渲染引擎
- [Vercel](https://vercel.com/)：优秀的部署平台
- 所有贡献者和用户的支持

## Contact

- **GitHub Issues**：[提交问题或建议](https://github.com/Retamev/DocToMermaid/issues)
- **讨论区**：[GitHub Discussions](https://github.com/Retamev/DocToMermaid/discussions)
- **邮箱**：your-email@example.com

## 🗺️ 路线图

### 近期计划
- [ ] 支持更多文档格式（Word、PowerPoint等）
- [ ] 增加更多Mermaid图表类型支持
- [ ] 优化移动端体验
- [ ] 添加批量处理功能

### 长期规划
- [ ] 支持自定义AI模型
- [ ] 增加协作功能
- [ ] 开发桌面应用版本
- [ ] 支持更多语言

---

⭐ 如果这个项目对你有帮助，请给我们一个Star！

🚀 让我们一起让文档解析变得更智能、更高效