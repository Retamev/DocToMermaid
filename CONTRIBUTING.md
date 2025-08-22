# 贡献指南

感谢您对 Trama 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告错误
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 开发新功能
- 🧪 编写测试
- 🎨 改进用户界面

## 🚀 快速开始

### 开发环境设置

1. **Fork 项目**
   - 点击 GitHub 页面右上角的 "Fork" 按钮
   - 将项目 Fork 到你的 GitHub 账户

2. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/DocToMermaid.git
   cd DocToMermaid
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 文件，添加你的 API 密钥
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

## 📋 贡献类型

### 🐛 报告错误

如果你发现了错误，请：

1. 检查 [Issues](https://github.com/your-username/DocToMermaid/issues) 确认问题未被报告
2. 创建新的 Issue，包含：
   - 清晰的错误描述
   - 重现步骤
   - 预期行为 vs 实际行为
   - 环境信息（浏览器、操作系统等）
   - 相关截图或错误日志

### 💡 功能建议

提出新功能建议时，请：

1. 检查现有 Issues 避免重复
2. 详细描述功能需求
3. 说明功能的使用场景
4. 如果可能，提供设计草图或原型

### 🔧 代码贡献

#### 代码规范

- **JavaScript/React**：遵循 ESLint 和 Prettier 配置
- **命名规范**：
  - 组件：PascalCase（如 `MermaidRenderer`）
  - 函数：camelCase（如 `generateMermaid`）
  - 常量：UPPER_SNAKE_CASE（如 `MAX_FILE_SIZE`）
  - 文件：kebab-case（如 `progress-bar.jsx`）

- **注释规范**：
  ```javascript
  /**
   * 函数描述
   * @param {string} param1 - 参数描述
   * @param {Object} param2 - 参数描述
   * @returns {Promise<string>} 返回值描述
   */
  function exampleFunction(param1, param2) {
    // 实现逻辑
  }
  ```

#### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型说明：**
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例：**
```
feat(renderer): add SVG export functionality

Implement SVG export feature for Mermaid diagrams
- Add export button to MermaidRenderer component
- Support high-quality vector format export
- Include error handling for export failures

Closes #123
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

### 编写测试

- 为新功能编写单元测试
- 为 React 组件编写组件测试
- 为 API 端点编写集成测试
- 确保测试覆盖率不低于 80%

**测试文件命名：**
- 单元测试：`*.test.js`
- 组件测试：`*.test.jsx`
- 集成测试：`*.integration.test.js`

## 📝 文档贡献

### 文档类型

- **README.md**：项目概述和快速开始
- **API 文档**：接口说明和参数描述
- **组件文档**：React 组件使用说明
- **部署文档**：部署和配置指南

### 文档规范

- 使用清晰的标题结构
- 提供代码示例
- 包含必要的截图
- 保持内容简洁明了
- 及时更新过时信息

## 🔄 Pull Request 流程

### 提交 PR 前检查

- [ ] 代码通过所有测试
- [ ] 遵循代码规范
- [ ] 添加必要的测试
- [ ] 更新相关文档
- [ ] 提交信息符合规范

### PR 描述模板

```markdown
## 变更类型
- [ ] 错误修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 性能优化
- [ ] 代码重构

## 变更描述
简要描述你的变更内容...

## 测试
- [ ] 添加了新的测试
- [ ] 所有测试通过
- [ ] 手动测试通过

## 截图（如适用）
![描述](图片链接)

## 相关 Issue
Closes #123
```

### 代码审查

- 所有 PR 需要至少一个维护者的审查
- 积极响应审查意见
- 根据反馈及时修改代码
- 保持友好和建设性的讨论

## 🏗️ 项目结构

```
DocToMermaid/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── layout.jsx         # 根布局
│   └── page.jsx           # 主页面
├── components/            # React 组件
│   ├── MermaidRenderer.jsx
│   ├── ProgressBar.jsx
│   └── ProcessingHistory.jsx
├── lib/                   # 核心库
│   ├── intelligent-router.js
│   ├── map-reduce-processor.js
│   └── cache-manager.js
├── utils/                 # 工具函数
│   ├── aiToMermaid.js
│   ├── textToMermaid.js
│   └── pdfToImages.js
├── config/                # 配置文件
│   └── index.js
├── public/                # 静态资源
├── tests/                 # 测试文件
└── docs/                  # 文档
```

## 🎯 开发重点领域

### 高优先级
- 🐛 错误修复和稳定性改进
- 🚀 性能优化
- 📱 移动端适配
- 🔒 安全性增强

### 中优先级
- ✨ 新功能开发
- 🎨 UI/UX 改进
- 📊 数据分析和统计
- 🌐 国际化支持

### 低优先级
- 🧹 代码重构
- 📝 文档完善
- 🧪 测试覆盖率提升
- 🔧 开发工具改进

## 💬 沟通渠道

- **GitHub Issues**：错误报告和功能建议
- **GitHub Discussions**：技术讨论和问答
- **Pull Requests**：代码审查和讨论
- **邮箱**：your-email@example.com（紧急问题）

## 🏆 贡献者认可

我们重视每一个贡献，无论大小：

- 贡献者将被添加到 README.md 的致谢部分
- 重要贡献者将获得项目维护者权限
- 定期发布贡献者排行榜
- 在社交媒体上宣传优秀贡献

## 📜 行为准则

### 我们的承诺

为了营造开放和友好的环境，我们承诺：

- 尊重不同观点和经验
- 接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

- 使用性别化语言或图像
- 人身攻击或政治攻击
- 公开或私下骚扰
- 未经许可发布他人私人信息
- 其他不道德或不专业的行为

### 执行

如果遇到不当行为，请联系项目维护者。我们将：

- 认真对待所有投诉
- 保护举报者隐私
- 采取适当的纠正措施
- 必要时禁止违规者参与项目

## 🙋‍♀️ 需要帮助？

如果你在贡献过程中遇到任何问题：

1. 查看现有的 Issues 和 Discussions
2. 阅读项目文档
3. 在 GitHub Discussions 中提问
4. 联系项目维护者

我们很乐意帮助新贡献者入门！

---

再次感谢你对 Trama 项目的贡献！🎉