# Interactive Paper Reading Website

这个交互式网站提供了扩散模型论文的可视化阅读体验，灵感来自 [William & Mary Mathematics Distribution Reference](https://www.math.wm.edu/~leemis/chart/UDR/UDR.html)。

## 网站结构

```
website/
├── index.html              # 主页面 - 交互式论文图表
├── style.css               # 样式文件
├── diffusion-theory-chart.svg  # 论文关系图表
├── papers/
│   └── paper.html          # 论文详情页面
└── README.md               # 本文件
```

## 功能特性

### 1. 交互式图表
- 点击SVG图表中的任何论文框查看详情
- 支持缩放（+/-按钮）
- 自动调整点击区域

### 2. 论文详情页
每个论文页面包含：
- 📖 阅读理由
- 📝 论文摘要
- 🔑 关键概念标签
- 💡 主要贡献
- 📚 笔记链接（如有）
- 🛠️ 管理工具

### 3. 阅读进度追踪
- 已读论文数量
- 正在阅读论文
- 未读论文数量
- 快速链接到搜索脚本

## 使用方法

### 打开主页面
直接在浏览器中打开 `website/index.html`

### 浏览论文
1. 在主页面中点击任意论文框
2. 进入论文详情页面查看信息
3. 点击"Back to Chart"返回

### 管理论文阅读状态
在论文详情页面中：
```bash
# 更新状态
python ../scripts/update_status.py --id ddpm_2020 --status completed

# 添加评分
python ../scripts/update_status.py --id ddpm_2020 --rating 5

# 添加笔记
python ../scripts/update_status.py --id ddpm_2020 --notes_file "Notes/my_notes.md"
```

### 搜索论文
```bash
# 搜索特定论文
python ../scripts/search_papers.py --query "diffusion"

# 按主题筛选
python ../scripts/search_papers.py --topic "foundations"

# 查看统计信息
python ../scripts/search_papers.py --stats
```

### 生成报告
```bash
# 生成HTML报告
python ../scripts/generate_report.py --output report.html

# 生成文本统计
python ../scripts/generate_report.py --output stats.txt
```

## 论文数据库

论文数据存储在 `../papers/database/papers.json`，包含：
- 标题、作者、年份
- ArXiv链接、代码链接
- 阅读状态、评分
- 关键概念、贡献
- 相关论文

## 技术细节

### 响应式设计
- 固定布局，适配不同屏幕尺寸
- 左侧导航栏（26%宽度）
- 右侧图表区域（74%宽度）

### 交互功能
- SVG图像映射（usemap）实现点击
- 动态调整坐标以响应缩放
- JavaScript动态加载论文详情

### 样式
- Georgia 衬线字体
- 简洁的学术风格
- 颜色编码（状态、优先级等）

## 扩展指南

### 添加新论文
1. 在 `papers/database/papers.json` 中添加论文条目
2. 在 `paper.html` 的 `PAPERS` 对象中添加详细信息
3. 在 `index.html` 的 `<map>` 区域添加可点击区域

### 自定义样式
编辑 `style.css` 修改：
- 颜色主题
- 字体
- 布局
- 动画效果

### 添加新功能
- 筛选器
- 搜索框
- 阅读路线推荐
- 笔记编辑器

## 故障排除

### SVG图表不显示
- 检查 `diffusion-theory-chart.svg` 是否存在
- 检查浏览器控制台错误

### 点击区域不准确
- 刷新页面
- 检查缩放级别

### 论文详情不显示
- 检查 `paper.html` 中的 `PAPERS` 对象
- 验证URL参数

## 贡献

欢迎提交改进建议：
1. Fork 仓库
2. 创建特性分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License - 详见项目根目录 LICENSE 文件

## 致谢

- 设计灵感：William & Mary Mathematics Distribution Reference
- 图表设计：参考扩散模型理论框架
- 项目维护：Diego & Shiying Zhang
