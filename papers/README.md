# Paper Reading List 系统 📚

## 项目架构

这个paper reading list系统旨在帮助您高效地管理和追踪扩散模型相关的学术论文。

### 目录结构

```
papers/
├── database/           # 论文数据库
│   ├── papers.json    # 主要论文数据库
│   └── schema.json    # 数据结构定义
├── by_topic/          # 按主题分类的论文列表
│   ├── foundations/   # 理论基础
│   ├── methods/       # 方法改进
│   ├── applications/  # 应用场景
│   └── surveys/       # 综述论文
├── by_status/         # 按阅读状态分类
│   ├── unread/        # 未读
│   ├── reading/       # 进行中
│   ├── completed/     # 已读
│   └── review/        # 需要重读
├── search/            # 搜索索引和脚本
│   ├── search.py      # 搜索脚本
│   └── filters.py     # 筛选脚本
└── visualization/     # 可视化生成
    └── progress.py    # 进度追踪脚本
```

### 论文分类体系

#### 1. 按主题分类 (Topic)
- **foundations**: 扩散模型理论基础
  - score-based models
  - denoising diffusion
  - mathematical foundations
- **methods**: 方法改进
  - improved_sampling: 采样加速
  - training_stability: 训练稳定性
  - architecture: 网络结构改进
  - conditional: 条件生成
- **applications**: 应用场景
  - image_generation: 图像生成
  - video_generation: 视频生成
  - 3d_generation: 3D生成
  - multimodal: 多模态生成
- **surveys**: 综述论文
  - theory_survey: 理论综述
  - application_survey: 应用综述

#### 2. 按难度分类 (Level)
- **beginner**: 入门级（适合初学者）
- **intermediate**: 中级（需要一定基础）
- **advanced**: 高级（专业研究）

#### 3. 按阅读状态分类 (Status)
- **unread**: 未读
- **reading**: 正在阅读
- **completed**: 已完成
- **review**: 需要重新阅读

#### 4. 按优先级分类 (Priority)
- **high**: 高优先级（必读）
- **medium**: 中优先级（推荐）
- **low**: 低优先级（可选）

### 论文元数据结构

每个论文条目包含以下信息：

```json
{
  "id": "unique_identifier",
  "title": "论文标题",
  "authors": ["作者1", "作者2"],
  "venue": "发表会议/期刊",
  "year": 2020,
  "topics": ["foundations", "score-based"],
  "level": "intermediate",
  "priority": "high",
  "status": "unread",
  "arxiv_url": "https://arxiv.org/abs/xxxx.xxxxx",
  "pdf_url": "https://arxiv.org/pdf/xxxx.xxxxx.pdf",
  "code_url": "https://github.com/...",
  "tags": ["score_matching", "sde"],
  "notes_file": "path/to/notes.md",
  "date_added": "2024-01-01",
  "date_read": null,
  "rating": null,
  "summary": "简要总结",
  "key_contributions": ["贡献1", "贡献2"],
  "related_papers": ["paper_id1", "paper_id2"]
}
```

## 使用方法

### 1. 添加新论文
```bash
python scripts/add_paper.py --title "..." --authors "..." --arxiv "..."
```

### 2. 搜索论文
```bash
python scripts/search.py --query "score matching"
python scripts/search.py --topic "foundations"
python scripts/search.py --status "unread"
```

### 3. 更新阅读状态
```bash
python scripts/update_status.py --id "paper_id" --status "completed"
```

### 4. 生成进度报告
```bash
python scripts/progress.py --output report.html
```

## 下一步计划
- [ ] 创建schema.json定义数据结构
- [ ] 迁移现有Notes中的论文
- [ ] 实现搜索和筛选功能
- [ ] 添加可视化进度追踪
