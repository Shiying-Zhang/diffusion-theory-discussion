#!/usr/bin/env python3
"""
添加新论文到reading list
用法：
  python add_paper.py --title "论文标题" --authors "作者1,作者2" --year 2023 --arxiv "链接"
"""

import json
import argparse
import uuid
from datetime import datetime
from typing import List, Dict, Any

from constants import (
    VALID_TOPICS, VALID_LEVELS, VALID_PRIORITIES, VALID_STATUS, VALID_VENUES,
    DB_PATH,
)

def load_papers(database_path: str = DB_PATH) -> Dict[str, Any]:
    """加载论文数据库"""
    with open(database_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def generate_paper_id(title: str, authors: List[str]) -> str:
    """生成论文ID"""
    # 使用标题前几个词和年份生成简洁ID
    title_words = title.lower().replace(':', '').replace('-', ' ').split()
    short_title = '_'.join(title_words[:3])[:30]

    # 简化作者名
    author_last = authors[0].split()[-1] if authors else 'unknown'

    return f"{short_title}_{author_last}"

def validate_topic(topic: str) -> bool:
    """验证主题是否有效"""
    return topic in VALID_TOPICS

def save_papers(data: Dict[str, Any], database_path: str = DB_PATH):
    """保存论文数据库"""
    data['last_updated'] = datetime.now().strftime('%Y-%m-%d')

    with open(database_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def interactive_mode():
    """交互式添加论文"""
    print("\n📝 添加新论文到 Reading List\n")

    # 标题
    title = input("论文标题: ").strip()
    if not title:
        print("❌ 标题不能为空")
        return

    # 作者
    authors_str = input("作者 (用逗号分隔): ").strip()
    authors = [a.strip() for a in authors_str.split(',') if a.strip()]

    # 年份
    year_input = input("发表年份 (默认: 2024): ").strip()
    year = int(year_input) if year_input else 2024

    # 会议/期刊
    print(f"\n可选会议/期刊: {', '.join(VALID_VENUES)}")
    venue = input(f"发表会议/期刊 (默认: ArXiv): ").strip()
    if not venue:
        venue = "ArXiv"
    elif venue not in VALID_VENUES:
        venue = "Other"

    # ArXiv链接
    arxiv = input("ArXiv链接 (可选): ").strip()

    # 主题
    print(f"\n可选主题: {', '.join(VALID_TOPICS)}")
    topics_str = input("主题 (用逗号分隔): ").strip()
    topics = [t.strip() for t in topics_str.split(',') if t.strip()]
    if not topics:
        print("❌ 至少需要一个主题")
        return

    # 验证主题
    for topic in topics:
        if not validate_topic(topic):
            print(f"❌ 无效主题: {topic}")
            return

    # 难度
    print(f"\n可选难度: {', '.join(VALID_LEVELS)}")
    level = input("难度 (默认: intermediate): ").strip()
    if not level:
        level = "intermediate"
    elif level not in VALID_LEVELS:
        print(f"❌ 无效难度: {level}")
        return

    # 优先级
    print(f"\n可选优先级: {', '.join(VALID_PRIORITIES)}")
    priority = input("优先级 (默认: medium): ").strip()
    if not priority:
        priority = "medium"
    elif priority not in VALID_PRIORITIES:
        print(f"❌ 无效优先级: {priority}")
        return

    # 状态
    print(f"\n可选状态: {', '.join(VALID_STATUS)}")
    status = input("阅读状态 (默认: unread): ").strip()
    if not status:
        status = "unread"
    elif status not in VALID_STATUS:
        print(f"❌ 无效状态: {status}")
        return

    # 确认
    print("\n📋 论文信息预览:")
    print(f"   标题: {title}")
    print(f"   作者: {', '.join(authors)}")
    print(f"   年份: {year}")
    print(f"   会议/期刊: {venue}")
    print(f"   ArXiv: {arxiv if arxiv else 'N/A'}")
    print(f"   主题: {', '.join(topics)}")
    print(f"   难度: {level}")
    print(f"   优先级: {priority}")
    print(f"   状态: {status}")

    confirm = input("\n✅ 确认添加? (y/N): ").strip().lower()
    if confirm != 'y':
        print("❌ 已取消")
        return

    # 创建论文条目
    paper_id = generate_paper_id(title, authors)

    new_paper = {
        "id": paper_id,
        "title": title,
        "authors": authors,
        "venue": venue,
        "year": year,
        "topics": topics,
        "level": level,
        "priority": priority,
        "status": status,
        "arxiv_url": arxiv if arxiv else None,
        "pdf_url": arxiv.replace("abs", "pdf") if arxiv else None,
        "code_url": None,
        "tags": [],
        "notes_file": None,
        "date_added": datetime.now().strftime('%Y-%m-%d'),
        "date_read": None,
        "rating": None,
        "summary": "",
        "key_contributions": [],
        "related_papers": []
    }

    # 保存
    data = load_papers()
    data['papers'].append(new_paper)
    save_papers(data)

    print(f"\n✅ 成功添加论文!")
    print(f"   ID: {paper_id}")
    print(f"   可使用 python scripts/update_status.py --id {paper_id} --status completed 更新状态")

def main():
    parser = argparse.ArgumentParser(description='添加新论文到reading list')
    parser.add_argument('--title', type=str, help='论文标题')
    parser.add_argument('--authors', type=str, help='作者 (逗号分隔)')
    parser.add_argument('--year', type=int, default=2024, help='发表年份')
    parser.add_argument('--venue', type=str, default='ArXiv', help='会议/期刊')
    parser.add_argument('--arxiv', type=str, help='ArXiv链接')
    parser.add_argument('--topics', type=str, help='主题 (逗号分隔)')
    parser.add_argument('--level', type=str, default='intermediate', help='难度 (beginner/intermediate/advanced)')
    parser.add_argument('--priority', type=str, default='medium', help='优先级 (high/medium/low)')
    parser.add_argument('--status', type=str, default='unread', help='阅读状态 (unread/reading/completed/review)')
    parser.add_argument('--interactive', action='store_true', help='交互式模式')

    args = parser.parse_args()

    # 如果没有提供参数或指定了交互模式，使用交互式模式
    if args.interactive or not any([args.title, args.authors]):
        interactive_mode()
        return

    # 验证必填参数
    if not args.title:
        print("❌ 缺少标题 (--title)")
        return
    if not args.authors:
        print("❌ 缺少作者 (--authors)")
        return

    authors = [a.strip() for a in args.authors.split(',') if a.strip()]
    topics = [t.strip() for t in args.topics.split(',')] if args.topics else []

    # 验证
    if not authors:
        print("❌ 作者列表不能为空")
        return

    if not topics:
        print("❌ 至少需要一个主题 (--topics)")
        return

    for topic in topics:
        if not validate_topic(topic):
            print(f"❌ 无效主题: {topic}")
            print(f"   可用主题: {', '.join(VALID_TOPICS)}")
            return

    if args.level not in VALID_LEVELS:
        print(f"❌ 无效难度: {args.level}")
        return

    if args.priority not in VALID_PRIORITIES:
        print(f"❌ 无效优先级: {args.priority}")
        return

    if args.status not in VALID_STATUS:
        print(f"❌ 无效状态: {args.status}")
        return

    # 创建论文条目
    paper_id = generate_paper_id(args.title, authors)

    new_paper = {
        "id": paper_id,
        "title": args.title,
        "authors": authors,
        "venue": args.venue,
        "year": args.year,
        "topics": topics,
        "level": args.level,
        "priority": args.priority,
        "status": args.status,
        "arxiv_url": args.arxiv,
        "pdf_url": args.arxiv.replace("abs", "pdf") if args.arxiv else None,
        "code_url": None,
        "tags": [],
        "notes_file": None,
        "date_added": datetime.now().strftime('%Y-%m-%d'),
        "date_read": None,
        "rating": None,
        "summary": "",
        "key_contributions": [],
        "related_papers": []
    }

    # 保存
    data = load_papers()
    data['papers'].append(new_paper)
    save_papers(data)

    print(f"\n✅ 成功添加论文!")
    print(f"   ID: {paper_id}")
    print(f"   标题: {args.title}")
    print(f"   作者: {', '.join(authors)}")

if __name__ == '__main__':
    main()
