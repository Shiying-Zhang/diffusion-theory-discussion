# 🚀 GitHub Pages 部署说明

## ✅ 已完成的工作

1. **修复连线问题** - interactive chart中的论文连线现在精确连接圆圈边缘
2. **GitHub Actions自动部署** - 代码已推送到GitHub，工作流将自动运行
3. **完整文档** - 创建了部署指南和说明文档

## 📋 下一步操作（手动完成）

由于GitHub Pages需要在仓库设置中启用，请按以下步骤操作：

### 第一步：启用GitHub Pages

1. 打开您的GitHub仓库：https://github.com/Shiying-Zhang/diffusion-theory-discussion
2. 点击顶部的 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 "Source" 部分，选择 **"GitHub Actions"**
   - 注意：不是选择 "Deploy from a branch"，而是选择 "GitHub Actions"

### 第二步：等待部署完成

1. 前往 **Actions** 标签页
2. 应该能看到一个名为 "Deploy to GitHub Pages" 的工作流正在运行或已完成
3. 等待工作流完成（通常需要1-2分钟）

### 第三步：访问网站

部署完成后，网站将在以下地址可用：
**https://shiying-zhang.github.io/diffusion-theory-discussion/**

## 📊 网站结构

部署后的网站将包含：

### 主页面
- **Interactive Theory Chart** - 交互式论文网络图
  - 上半部分：论文关系网络（8篇核心论文）
  - 下半部分：Diffusion理论变量定义
  - 悬停高亮效果

### 其他页面
- **Papers**: https://shiying-zhang.github.io/diffusion-theory-discussion/papers.html
- **Issues**: https://shiying-zhang.github.io/diffusion-theory-discussion/issues.html
- **Notes**: 通过导航链接访问

## 🔧 故障排除

### 如果GitHub Pages没有启用

1. 确保在Settings > Pages中选择了"GitHub Actions"而不是"Deploy from a branch"
2. 等待几分钟让更改生效
3. 尝试访问网站 URL

### 如果部署失败

1. 检查 **Actions** 标签页查看错误信息
2. 常见错误：
   - 文件路径问题 - 确保所有文件在 `website/` 目录中
   - HTML语法错误 - 检查文件是否有语法错误

### 如果页面显示404

1. 确保URL完整：https://shiying-zhang.github.io/diffusion-theory-discussion/index.html
2. 等待最多10分钟让部署完全生效
3. 清除浏览器缓存并硬刷新 (Ctrl+F5 或 Cmd+Shift+R)

## 📝 网站功能

### 1. 交互式理论图表
- 鼠标悬停查看论文关系
- 颜色编码显示论文类型
- 变量定义区域显示8个关键概念

### 2. 论文阅读列表
- 11篇核心论文的卡片式展示
- 3条推荐阅读路径
- 状态追踪（已完成/阅读中/未读）

### 3. Issues可视化
- 实时显示GitHub仓库Issues
- 按类型过滤
- 一键跳转到GitHub

### 4. Notes集成
- 链接到DDPM和Score-based SDE笔记
- 所有页面都有快速访问链接

## 🔄 后续更新

以后要更新网站内容时：

1. 编辑 `website/` 目录中的文件
2. 提交并推送到 `main` 分支
3. GitHub Actions会自动部署更新
4. 等待1-2分钟让更改生效

## 📞 需要帮助？

如果遇到问题：

1. 查看 **GITHUB_PAGES.md** 获取详细指南
2. 查看仓库的 **Actions** 标签页查看部署日志
3. 在GitHub上创建Issue讨论问题

---

**部署完成后，请访问：https://shiying-zhang.github.io/diffusion-theory-discussion/**

🎉 享受您的交互式扩散模型理论网站！
