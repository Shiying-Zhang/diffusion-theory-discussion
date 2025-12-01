# Paper Reading List 使用指南 📖

## 快速开始

### 1. 查看所有论文

```bash
# 列出所有论文
python scripts/search_papers.py

# 显示统计信息
python scripts/search_papers.py --stats
```

### 2. 搜索和筛选论文

```bash
# 全文搜索
python scripts/search_papers.py --query "score matching"

# 按主题筛选
python scripts/search_papers.py --topic "foundations"

# 按阅读状态筛选
python scripts/search_papers.py --status "unread"

# 按年份筛选
python scripts/search_papers.py --year 2020

# 按作者筛选
python scripts/search_papers.py --author "Ho"

# 组合筛选
python scripts/search_papers.py --topic "foundations" --priority "high" --status "unread"

# 按优先级排序
python scripts/search_papers.py --sort "priority"

# 限制结果数量
python scripts/search_papers.py --limit 10
```

### 3. 添加新论文

#### 交互式模式 (推荐)

```bash
python scripts/add_paper.py --interactive
```

#### 命令行模式

```bash
python scripts/add_paper.py \
  --title "Denoising Diffusion Probabilistic Models" \
  --authors "Jonathan Ho,Ajay Jain,Pieter Abbeel" \
  --year 2020 \
  --venue "NeurIPS" \
  --arxiv "https://arxiv.org/abs/2006.11239" \
  --topics "foundations,denoising_diffusion" \
  --level "intermediate" \
  --priority "high" \
  --status "unread"
```

### 4. 更新论文信息

```bash
# 更新阅读状态
python scripts/update_status.py --id ddpm_2020 --status completed --rating 5

# 更新笔记文件
python scripts/update_status.py --id ddpm_2020 --notes_file "Notes/my_ddpm_notes.md"

# 添加标签
python scripts/update_status.py --id ddpm_2020 --tags "ddpm,noise_prediction,markov"

# 更新优先级
python scripts/update_status.py --id ddpm_2020 --priority high

# 添加总结
python scripts/update_status.py --id ddpm_2020 --summary "提出了去噪扩散概率模型..."

# 添加主要贡献
python scripts/update_status.py --id ddpm_2020 --contributions "提出基于马尔可夫链的扩散过程;推导变分下界作为训练目标"

# 列出所有论文ID
python scripts/update_status.py --list
```

### 5. 生成进度报告

```bash
# 控制台输出文本报告
python scripts/generate_report.py

# 生成HTML可视化报告
python scripts/generate_report.py --output report.html

# 生成文本报告文件
python scripts/generate_report.py --output stats.txt
```

## 完整示例

### 场景1: 添加一篇新论文并标记为阅读中

```bash
# 1. 添加论文
python scripts/add_paper.py --interactive
# 按提示输入: 标题、作者、年份、ArXiv链接、主题等

# 2. 更新为阅读中状态
python scripts/update_status.py --id <生成的论文ID> --status reading

# 3. 搜索查看
python scripts/search_papers.py --status reading
```

### 场景2: 完成阅读并添加笔记

```bash
# 1. 查找未读论文
python scripts/search_papers.py --status unread --priority high

# 2. 开始阅读并更新状态
python scripts/update_status.py --id ddpm_2020 --status reading

# 3. 完成阅读
python scripts/update_status.py --id ddpm_2020 \
  --status completed \
  --rating 5 \
  --notes_file "Notes/ddpm_reading_notes.md" \
  --summary "建立了扩散模型的数学基础..." \
  --contributions "提出噪声预测网络;变分下界优化目标"
```

### 场景3: 生成阅读进度报告

```bash
# 生成HTML报告
python scripts/generate_report.py --output reading_progress.html

# 生成文本统计
python scripts/generate_report.py --output stats.txt

# 快速查看统计信息
python scripts/search_papers.py --stats
```

## 分类体系

### 主题分类 (topics)

- **foundations**: 扩散模型理论基础
  - score_based_models: 基于分数的模型
  - denoising_diffusion: 去噪扩散模型
- **methods**: 方法改进
  - improved_sampling: 采样加速
  - training_stability: 训练稳定性
  - architecture: 网络结构改进
  - conditional_generation: 条件生成
- **applications**: 应用场景
  - image_generation: 图像生成
  - video_generation: 视频生成
  - 3d_generation: 3D生成
  - multimodal: 多模态生成
- **surveys**: 综述论文
  - theory_survey: 理论综述
  - application_survey: 应用综述

### 难度等级 (level)

- **beginner**: 入门级（适合初学者理解扩散模型概念）
- **intermediate**: 中级（需要一定的数学基础）
- **advanced**: 高级（涉及复杂数学推导和理论）

### 优先级 (priority)

- **high**: 高优先级（推荐必读的核心论文）
- **medium**: 中优先级（有用的补充论文）
- **low**: 低优先级（可选阅读）

### 阅读状态 (status)

- **unread**: 未读
- **reading**: 正在阅读
- **completed**: 已完成
- **review**: 需要重新阅读

## 常用查询示例

### 查看所有高优先级未读论文

```bash
python scripts/search_papers.py --priority high --status unread --sort priority
```

### 查找特定作者的所有论文

```bash
python scripts/search_papers.py --author "Ho" --sort year
```

### 按主题查看理论基础论文

```bash
python scripts/search_papers.py --topic foundations --sort year
```

### 查看今年的论文

```bash
python scripts/search_papers.py --year 2024 --sort year
```

### 查看已读论文的平均评分

```bash
python scripts/search_papers.py --status completed --stats
```

## 数据结构

每篇论文包含以下信息：

- **id**: 唯一标识符
- **title**: 论文标题
- **authors**: 作者列表
- **venue**: 发表会议/期刊
- **year**: 发表年份
- **topics**: 主题标签列表
- **level**: 难度等级
- **priority**: 优先级
- **status**: 阅读状态
- **arxiv_url**: ArXiv链接
- **pdf_url**: PDF链接
- **code_url**: 代码链接
- **tags**: 关键词标签
- **notes_file**: 笔记文件路径
- **date_added**: 添加日期
- **date_read**: 完成阅读日期
- **rating**: 个人评分 (1-5)
- **summary**: 论文总结
- **key_contributions**: 主要贡献列表
- **related_papers**: 相关论文ID列表

## 提示和最佳实践

1. **定期更新阅读状态**: 完成阅读后及时更新状态和评分
2. **添加详细笔记**: 将笔记文件路径保存在 `notes_file` 字段中
3. **标注主要贡献**: 使用 `--contributions` 参数记录论文的核心贡献
4. **定期生成报告**: 使用 `--stats` 查看阅读统计，或生成HTML报告
5. **使用优先级排序**: 结合 `--sort priority` 和 `--status unread` 找到待读的高优先级论文
6. **搜索标签**: 在 `--query` 搜索中包含关键词如 "score matching"、"SDE" 等
7. **按主题阅读**: 使用 `--topic foundations` 先阅读理论基础，再阅读应用

## 故障排除

### Q: 如何查找论文的ID？

```bash
python scripts/update_status.py --list
```

### Q: 如何批量更新多篇论文的状态？

可以使用脚本循环更新，或直接编辑 `papers/database/papers.json` 文件。

### Q: 如何备份数据？

```bash
cp papers/database/papers.json papers/database/papers_backup.json
```

### Q: 如何恢复数据？

```bash
cp papers/database/papers_backup.json papers/database/papers.json
```

## 更多帮助

- 查看所有论文: `python scripts/search_papers.py --help`
- 添加论文帮助: `python scripts/add_paper.py --help`
- 更新论文帮助: `python scripts/update_status.py --help`
- 生成报告帮助: `python scripts/generate_report.py --help`
