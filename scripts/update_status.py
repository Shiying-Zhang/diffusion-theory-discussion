#!/usr/bin/env python3
"""
更新论文的阅读状态、评分等信息
用法：
  python update_status.py --id ddpm_2020 --status completed --rating 5
  python update_status.py --id ddpm_2020 --notes_file "Notes/my_notes.md"
"""

import json
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional

VALID_STATUS = ['unread', 'reading', 'completed', 'review']
VALID_LEVELS = ['beginner', 'intermediate', 'advanced']
VALID_PRIORITIES = ['high', 'medium', 'low']

def load_papers(database_path: str = "papers/database/papers.json") -> Dict[str, Any]:
    """加载论文数据库"""
    with open(database_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def save_papers(data: Dict[str, Any], database_path: str = "papers/database/papers.json"):
    """保存论文数据库"""
    data['last_updated'] = datetime.now().strftime('%Y-%m-%d')

    with open(database_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def find_paper(data: Dict[str, Any], paper_id: str) -> Optional[Dict[str, Any]]:
    """根据ID查找论文"""
    for paper in data['papers']:
        if paper['id'] == paper_id:
            return paper
    return None

def update_paper(paper: Dict[str, Any], **kwargs) -> Dict[str, Any]:
    """更新论文信息"""
    updated = paper.copy()

    # 更新状态
    if 'status' in kwargs:
        status = kwargs['status']
        if status not in VALID_STATUS:
            raise ValueError(f"无效状态: {status}. 可用状态: {', '.join(VALID_STATUS)}")
        updated['status'] = status

        # 如果状态变为completed，自动设置date_read
        if status == 'completed' and not updated.get('date_read'):
            updated['date_read'] = datetime.now().strftime('%Y-%m-%d')

    # 更新评分
    if 'rating' in kwargs:
        rating = kwargs['rating']
        if rating is not None and (rating < 1 or rating > 5):
            raise ValueError("评分必须在1-5之间")
        updated['rating'] = rating

    # 更新笔记文件
    if 'notes_file' in kwargs:
        updated['notes_file'] = kwargs['notes_file']

    # 更新总结
    if 'summary' in kwargs:
        updated['summary'] = kwargs['summary']

    # 更新标签
    if 'tags' in kwargs:
        tags = kwargs['tags']
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(',')]
        updated['tags'] = tags

    # 更新难度
    if 'level' in kwargs:
        level = kwargs['level']
        if level not in VALID_LEVELS:
            raise ValueError(f"无效难度: {level}. 可用难度: {', '.join(VALID_LEVELS)}")
        updated['level'] = level

    # 更新优先级
    if 'priority' in kwargs:
        priority = kwargs['priority']
        if priority not in VALID_PRIORITIES:
            raise ValueError(f"无效优先级: {priority}. 可用优先级: {', '.join(VALID_PRIORITIES)}")
        updated['priority'] = priority

    # 更新贡献
    if 'contributions' in kwargs:
        contributions = kwargs['contributions']
        if isinstance(contributions, str):
            contributions = [c.strip() for c in contributions.split(';')]
        updated['key_contributions'] = contributions

    # 更新ArXiv链接
    if 'arxiv' in kwargs:
        arxiv = kwargs['arxiv']
        updated['arxiv_url'] = arxiv
        if arxiv and not updated.get('pdf_url'):
            updated['pdf_url'] = arxiv.replace("abs", "pdf")

    # 更新代码链接
    if 'code' in kwargs:
        updated['code_url'] = kwargs['code']

    updated['last_updated'] = datetime.now().strftime('%Y-%m-%d')

    return updated

def print_paper_info(paper: Dict[str, Any]):
    """打印论文详细信息"""
    print(f"\n📄 论文信息:")
    print(f"   ID: {paper['id']}")
    print(f"   标题: {paper['title']}")
    print(f"   作者: {', '.join(paper['authors'])}")
    print(f"   年份: {paper['year']} | 会议: {paper['venue']}")
    print(f"   主题: {', '.join(paper['topics'])}")
    print(f"   状态: {paper['status']} | 优先级: {paper['priority']} | 难度: {paper['level']}")
    if paper.get('rating'):
        print(f"   评分: {'⭐' * paper['rating']} ({paper['rating']}/5)")
    if paper.get('date_read'):
        print(f"   阅读日期: {paper['date_read']}")
    if paper.get('notes_file'):
        print(f"   笔记: {paper['notes_file']}")
    if paper.get('summary'):
        print(f"   总结: {paper['summary']}")
    if paper.get('arxiv_url'):
        print(f"   ArXiv: {paper['arxiv_url']}")
    print()

def main():
    parser = argparse.ArgumentParser(description='更新论文信息')
    parser.add_argument('--id', type=str, required=True, help='论文ID')
    parser.add_argument('--status', type=str, help='新状态 (unread/reading/completed/review)')
    parser.add_argument('--rating', type=int, help='评分 (1-5)')
    parser.add_argument('--notes_file', type=str, help='笔记文件路径')
    parser.add_argument('--summary', type=str, help='论文总结')
    parser.add_argument('--tags', type=str, help='标签 (逗号分隔)')
    parser.add_argument('--level', type=str, help='难度 (beginner/intermediate/advanced)')
    parser.add_argument('--priority', type=str, help='优先级 (high/medium/low)')
    parser.add_argument('--contributions', type=str, help='主要贡献 (分号分隔)')
    parser.add_argument('--arxiv', type=str, help='ArXiv链接')
    parser.add_argument('--code', type=str, help='代码链接')
    parser.add_argument('--list', action='store_true', help='列出所有论文ID')

    args = parser.parse_args()

    # 如果指定了--list，列出所有论文
    if args.list:
        data = load_papers()
        print("\n📚 所有论文ID:\n")
        for paper in data['papers']:
            status_emoji = {
                'unread': '⬜️',
                'reading': '🔄',
                'completed': '✅',
                'review': '🔁'
            }
            emoji = status_emoji.get(paper['status'], '❓')
            print(f"{emoji} {paper['id']}: {paper['title'][:50]}{'...' if len(paper['title']) > 50 else ''}")
        print()
        return

    # 加载数据库
    data = load_papers()

    # 查找论文
    paper = find_paper(data, args.id)
    if not paper:
        print(f"\n❌ 未找到ID为 '{args.id}' 的论文")
        print("   使用 --list 查看所有论文ID\n")
        return

    # 显示当前信息
    print("📋 当前信息:")
    print_paper_info(paper)

    # 构建更新参数
    updates = {}
    if args.status:
        updates['status'] = args.status
    if args.rating is not None:
        updates['rating'] = args.rating
    if args.notes_file:
        updates['notes_file'] = args.notes_file
    if args.summary:
        updates['summary'] = args.summary
    if args.tags:
        updates['tags'] = args.tags
    if args.level:
        updates['level'] = args.level
    if args.priority:
        updates['priority'] = args.priority
    if args.contributions:
        updates['contributions'] = args.contributions
    if args.arxiv:
        updates['arxiv'] = args.arxiv
    if args.code:
        updates['code'] = args.code

    if not updates:
        print("❌ 未指定要更新的字段")
        return

    # 确认更新
    print("📝 将要更新的字段:")
    for key, value in updates.items():
        print(f"   {key}: {value}")

    confirm = input("\n✅ 确认更新? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ 已取消")
        return

    # 更新论文
    try:
        updated_paper = update_paper(paper, **updates)

        # 保存更新
        for i, p in enumerate(data['papers']):
            if p['id'] == args.id:
                data['papers'][i] = updated_paper
                break

        save_papers(data)

        print("\n✅ 更新成功!\n")
        print("📋 更新后的信息:")
        print_paper_info(updated_paper)

    except ValueError as e:
        print(f"\n❌ 更新失败: {e}\n")

if __name__ == '__main__':
    main()
