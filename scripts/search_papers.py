#!/usr/bin/env python3
"""
搜索和筛选论文列表
用法：
  python search_papers.py --query "score"  # 全文搜索
  python search_papers.py --topic "foundations"  # 按主题筛选
  python search_papers.py --status "unread"  # 按状态筛选
  python search_papers.py --year 2020  # 按年份筛选
  python search_papers.py --author "Ho"  # 按作者筛选
"""

import json
import argparse
import re
from typing import List, Dict, Any
from datetime import datetime

from constants import DB_PATH

def load_papers(database_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """加载论文数据库"""
    with open(database_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['papers']

def search_by_query(papers: List[Dict], query: str) -> List[Dict]:
    """全文搜索"""
    query = query.lower()
    results = []

    for paper in papers:
        # 搜索标题、作者、摘要、标签
        searchable_text = ' '.join([
            paper.get('title', ''),
            ' '.join(paper.get('authors', [])),
            paper.get('summary', ''),
            ' '.join(paper.get('tags', [])),
            ' '.join(paper.get('key_contributions', []))
        ]).lower()

        if query in searchable_text:
            results.append(paper)

    return results

def filter_by_field(papers: List[Dict], field: str, value: Any) -> List[Dict]:
    """按字段筛选"""
    results = []

    for paper in papers:
        if field == 'topic':
            # 主题可以匹配多个
            if value in paper.get('topics', []):
                results.append(paper)
        elif field in paper and paper[field] == value:
            results.append(paper)

    return results

def sort_papers(papers: List[Dict], sort_by: str = 'year') -> List[Dict]:
    """排序论文"""
    reverse = sort_by != 'title'

    if sort_by == 'priority':
        # 自定义优先级排序
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        return sorted(papers, key=lambda x: priority_order.get(x.get('priority', 'low'), 3), reverse=False)
    elif sort_by == 'status':
        # 自定义状态排序
        status_order = {'unread': 0, 'reading': 1, 'completed': 2, 'review': 3}
        return sorted(papers, key=lambda x: status_order.get(x.get('status', 'unread'), 4), reverse=False)

    return sorted(papers, key=lambda x: x.get(sort_by, 0), reverse=reverse)

def format_paper(paper: Dict) -> str:
    """格式化论文信息"""
    status_emoji = {
        'unread': '⬜️',
        'reading': '🔄',
        'completed': '✅',
        'review': '🔁'
    }

    priority_emoji = {
        'high': '🔥',
        'medium': '⭐',
        'low': '💡'
    }

    status = paper.get('status', 'unread')
    priority = paper.get('priority', 'low')
    rating = paper.get('rating', '')
    rating_str = f" [{'⭐' * rating}]" if rating else ""

    line1 = f"{status_emoji.get(status, '❓')} {priority_emoji.get(priority, '  ')} {paper['title']}"
    line2 = f"   Authors: {', '.join(paper['authors'][:3])}{'...' if len(paper['authors']) > 3 else ''}"
    line3 = f"   Venue: {paper['venue']} {paper['year']} | Topics: {', '.join(paper['topics'])}"
    line4 = f"   URL: {paper.get('arxiv_url', 'N/A')}{rating_str}"

    return '\n'.join([line1, line2, line3, line4])

def main():
    parser = argparse.ArgumentParser(description='搜索和筛选论文列表')
    parser.add_argument('--query', type=str, help='全文搜索关键词')
    parser.add_argument('--topic', type=str, help='按主题筛选 (foundations, methods, applications, surveys)')
    parser.add_argument('--status', type=str, help='按阅读状态筛选 (unread, reading, completed, review)')
    parser.add_argument('--level', type=str, help='按难度筛选 (beginner, intermediate, advanced)')
    parser.add_argument('--priority', type=str, help='按优先级筛选 (high, medium, low)')
    parser.add_argument('--year', type=int, help='按年份筛选')
    parser.add_argument('--author', type=str, help='按作者名筛选')
    parser.add_argument('--sort', type=str, default='year', help='排序字段 (year, title, priority, status)')
    parser.add_argument('--limit', type=int, help='限制结果数量')
    parser.add_argument('--stats', action='store_true', help='显示统计信息')

    args = parser.parse_args()

    papers = load_papers()

    # 应用筛选条件
    if args.query:
        papers = search_by_query(papers, args.query)

    if args.topic:
        papers = filter_by_field(papers, 'topic', args.topic)

    if args.status:
        papers = filter_by_field(papers, 'status', args.status)

    if args.level:
        papers = filter_by_field(papers, 'level', args.level)

    if args.priority:
        papers = filter_by_field(papers, 'priority', args.priority)

    if args.year:
        papers = filter_by_field(papers, 'year', args.year)

    if args.author:
        papers = [p for p in papers if args.author.lower() in ' '.join(p.get('authors', [])).lower()]

    # 排序
    papers = sort_papers(papers, args.sort)

    # 限制结果数量
    if args.limit:
        papers = papers[:args.limit]

    # 显示统计信息
    if args.stats:
        total = len(papers)
        status_count = {}
        topic_count = {}
        for paper in papers:
            status = paper.get('status', 'unread')
            status_count[status] = status_count.get(status, 0) + 1
            for topic in paper.get('topics', []):
                topic_count[topic] = topic_count.get(topic, 0) + 1

        print("\n📊 统计信息")
        print(f"   总数: {total}")
        print(f"   状态分布: {', '.join([f'{k}: {v}' for k, v in status_count.items()])}")
        print(f"   主题分布: {', '.join([f'{k}: {v}' for k, v in sorted(topic_count.items())])}")
        print()

    # 显示结果
    if papers:
        print(f"\n🔍 找到 {len(papers)} 篇论文:\n")
        for i, paper in enumerate(papers, 1):
            print(f"[{i}] {format_paper(paper)}\n")
    else:
        print("\n❌ 没有找到匹配的论文\n")

if __name__ == '__main__':
    main()
