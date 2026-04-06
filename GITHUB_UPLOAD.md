# GitHub 上传指南 / GitHub Upload Guide

## 方法一：命令行上传（推荐）

### 1. 在 GitHub 创建仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 **+** → **New repository**
3. 填写：
   - **Repository name**: `ai-book-compiler`
   - **Description**: `将多个 AI 回复整理为条理清晰的书册，一键导出精美 PDF`
   - 选择 **Public**（开源）
   - 点击 **Create repository**

### 2. 本地执行命令

在项目目录打开终端，按顺序执行：

```powershell
# 初始化 Git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: initial release - AI Book Compiler"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/ai-book-compiler.git

# 推送
git branch -M main
git push -u origin main
```

---

## 方法二：使用 GitHub Desktop

1. 下载 [GitHub Desktop](https://desktop.github.com/)
2. 点击 **File** → **Add Local Repository**
3. 选择项目文件夹
4. 点击 **Publish repository**
5. 填写仓库名称和描述
6. 选择 **Public** 后发布

---

## 方法三：使用 VS Code

1. 安装 VS Code 的 GitHub 扩展
2. 点击左侧 **Source Control** 图标
3. 点击 **Publish to GitHub**
4. 选择 **Public** 仓库
5. 确认发布

---

## 发布后推荐操作

- [ ] 添加 Topics：在仓库页面右侧添加 `nextjs`, `react`, `pdf`, `markdown`, `typescript`
- [ ] 创建 Release：点击 **Create a new release** 添加版本号
- [ ] 添加徽章：可以在 README 中添加 GitHub stars 徽章
