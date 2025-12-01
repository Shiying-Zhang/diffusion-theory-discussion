#!/usr/bin/env python3
"""
生成可视化的阅读进度报告
用法：
  python generate_report.py --output report.html  # 生成HTML报告
  python generate_report.py --output stats.txt  # 生成文本统计
  python generate_report.py  # 控制台输出
"""

import json
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Any
from collections import Counter

def load_papers(database_path: str = "papers/database/papers.json") -> List[Dict[str, Any]]:
    """加载论文数据库"""
    with open(database_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['papers']

def calculate_stats(papers: List[Dict[str, Any]]) -> Dict[str, Any]:
    """计算统计数据"""
    stats = {}

    # 总体统计
    stats['total'] = len(papers)

    # 状态统计
    status_counts = Counter(p.get('status', 'unread') for p in papers)
    stats['status'] = dict(status_counts)

    # 主题统计
    all_topics = []
    for paper in papers:
        all_topics.extend(paper.get('topics', []))
    topic_counts = Counter(all_topics)
    stats['topics'] = dict(topic_counts)

    # 优先级统计
    priority_counts = Counter(p.get('priority', 'medium') for p in papers)
    stats['priority'] = dict(priority_counts)

    # 难度统计
    level_counts = Counter(p.get('level', 'intermediate') for p in papers)
    stats['level'] = dict(level_counts)

    # 年份统计
    year_counts = Counter(p.get('year', 2024) for p in papers)
    stats['years'] = dict(sorted(year_counts.items()))

    # 评分统计
    rated_papers = [p for p in papers if p.get('rating')]
    if rated_papers:
        avg_rating = sum(p['rating'] for p in rated_papers) / len(rated_papers)
        stats['avg_rating'] = round(avg_rating, 2)
        stats['rating_distribution'] = Counter(p['rating'] for p in rated_papers)
    else:
        stats['avg_rating'] = 0
        stats['rating_distribution'] = {}

    # 最近阅读
    completed_papers = [p for p in papers if p.get('status') == 'completed' and p.get('date_read')]
    completed_papers.sort(key=lambda x: x['date_read'], reverse=True)
    stats['recent_reading'] = completed_papers[:5]

    # 待读列表（优先级高 + 未读）
    todo_papers = [
        p for p in papers
        if p.get('status') == 'unread' and p.get('priority') == 'high'
    ]
    stats['todo_high_priority'] = todo_papers

    return stats

def generate_html_report(stats: Dict[str, Any]) -> str:
    """生成HTML报告"""
    status_colors = {
        'completed': '#22c55e',
        'reading': '#3b82f6',
        'unread': '#94a3b8',
        'review': '#f59e0b'
    }

    priority_colors = {
        'high': '#ef4444',
        'medium': '#f59e0b',
        'low': '#94a3b8'
    }

    level_colors = {
        'beginner': '#22c55e',
        'intermediate': '#f59e0b',
        'advanced': '#ef4444'
    }

    html = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paper Reading Progress Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 2.5em;
        }}
        .header p {{
            margin: 10px 0 0 0;
            opacity: 0.9;
        }}
        .section {{
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .section h2 {{
            margin-top: 0;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }}
        .stat-card {{
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }}
        .stat-card h3 {{
            margin: 0;
            font-size: 2.5em;
            color: #667eea;
        }}
        .stat-card p {{
            margin: 5px 0 0 0;
            color: #64748b;
            font-size: 0.9em;
        }}
        .progress-bar-container {{
            margin: 15px 0;
        }}
        .progress-bar-label {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 0.9em;
        }}
        .progress-bar {{
            background: #e2e8f0;
            height: 30px;
            border-radius: 5px;
            overflow: hidden;
        }}
        .progress-fill {{
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.85em;
        }}
        .topic-list {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }}
        .topic-tag {{
            background: #e0e7ff;
            color: #4f46e5;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }}
        .paper-list {{
            list-style: none;
            padding: 0;
        }}
        .paper-item {{
            background: #f8fafc;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 10px;
            border-left: 4px solid #667eea;
        }}
        .paper-item h4 {{
            margin: 0 0 5px 0;
            color: #1e293b;
        }}
        .paper-item p {{
            margin: 0;
            color: #64748b;
            font-size: 0.9em;
        }}
        .rating {{
            color: #fbbf24;
        }}
        .footer {{
            text-align: center;
            color: #64748b;
            margin-top: 30px;
            font-size: 0.9em;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 Paper Reading Report</h1>
        <p>生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
    </div>

    <div class="section">
        <h2>📊 总体统计</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>{stats['total']}</h3>
                <p>总论文数</p>
            </div>
            <div class="stat-card">
                <h3>{stats['status'].get('completed', 0)}</h3>
                <p>已读</p>
            </div>
            <div class="stat-card">
                <h3>{stats['status'].get('reading', 0)}</h3>
                <p>阅读中</p>
            </div>
            <div class="stat-card">
                <h3>{stats['status'].get('unread', 0)}</h3>
                <p>未读</p>
            </div>
            <div class="stat-card">
                <h3>{stats['avg_rating']}</h3>
                <p>平均评分</p>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>📈 阅读进度</h2>
"""

    # 阅读进度条
    total = stats['total']
    if total > 0:
        for status, count in stats['status'].items():
            percentage = (count / total) * 100
            color = status_colors.get(status, '#94a3b8')
            html += f"""
        <div class="progress-bar-container">
            <div class="progress-bar-label">
                <span><strong>{status.upper()}</strong></span>
                <span>{count} 篇 ({percentage:.1f}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: {percentage}%; background: {color};">
                    {percentage:.1f}%
                </div>
            </div>
        </div>
"""

    # 主题分布
    html += """
    </div>

    <div class="section">
        <h2>🏷️ 主题分布</h2>
        <div class="topic-list">
"""
    for topic, count in sorted(stats['topics'].items(), key=lambda x: x[1], reverse=True):
        html += f'            <span class="topic-tag">{topic} ({count})</span>\n'

    html += """
        </div>
    </div>

    <div class="section">
        <h2>⚡ 优先级分布</h2>
"""

    for priority, count in stats['priority'].items():
        color = priority_colors.get(priority, '#94a3b8')
        html += f"""
        <div class="progress-bar-container">
            <div class="progress-bar-label">
                <span><strong>{priority.upper()}</strong></span>
                <span>{count} 篇</span>
            </div>
        </div>
"""

    html += """
    </div>

    <div class="section">
        <h2>📅 年份分布</h2>
"""

    for year, count in stats['years'].items():
        html += f"""
        <div class="progress-bar-container">
            <div class="progress-bar-label">
                <span><strong>{year}</strong></span>
                <span>{count} 篇</span>
            </div>
        </div>
"""

    # 最近阅读
    if stats['recent_reading']:
        html += """
    </div>

    <div class="section">
        <h2>📖 最近阅读</h2>
        <ul class="paper-list">
"""
        for paper in stats['recent_reading']:
            rating_stars = '⭐' * paper.get('rating', 0) if paper.get('rating') else ''
            html += f"""
            <li class="paper-item">
                <h4>{paper['title']} <span class="rating">{rating_stars}</span></h4>
                <p>{', '.join(paper['authors'][:2])}{'...' if len(paper['authors']) > 2 else ''} • {paper['date_read']}</p>
            </li>
"""

        html += """
        </ul>
    </div>
"""

    # 待读高优先级
    if stats['todo_high_priority']:
        html += """
    <div class="section">
        <h2>🔥 待读高优先级</h2>
        <ul class="paper-list">
"""
        for paper in stats['todo_high_priority']:
            html += f"""
            <li class="paper-item">
                <h4>{paper['title']}</h4>
                <p>{', '.join(paper['authors'][:2])}{'...' if len(paper['authors']) > 2 else ''} • {paper['year']}</p>
            </li>
"""

        html += """
        </ul>
    </div>
"""

    html += f"""
    <div class="footer">
        <p>Generated by Paper Reading List System • {datetime.now().strftime('%Y-%m-%d')}</p>
    </div>
</body>
</html>
"""
    return html

def generate_text_report(stats: Dict[str, Any]) -> str:
    """生成文本报告"""
    report = f"""
{'='*60}
📚 PAPER READING PROGRESS REPORT
{'='*60}

生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}

📊 总体统计
{'-'*60}
  总论文数: {stats['total']}
  已完成: {stats['status'].get('completed', 0)}
  阅读中: {stats['status'].get('reading', 0)}
  未开始: {stats['status'].get('unread', 0)}
  待复阅: {stats['status'].get('review', 0)}
  平均评分: {stats['avg_rating']}/5.0

📈 阅读进度
{'-'*60}
"""

    total = stats['total']
    if total > 0:
        for status, count in stats['status'].items():
            percentage = (count / total) * 100
            bar = '█' * int(percentage / 5) + '░' * (20 - int(percentage / 5))
            report += f"  {status.upper():10} [{bar}] {count:3d} ({percentage:5.1f}%)\n"

    report += f"""
🏷️ 主题分布
{'-'*60}
"""
    for topic, count in sorted(stats['topics'].items(), key=lambda x: x[1], reverse=True):
        report += f"  {topic:25} {count:3d}\n"

    report += f"""
⚡ 优先级分布
{'-'*60}
"""
    for priority, count in stats['priority'].items():
        report += f"  {priority:10} {count:3d}\n"

    report += f"""
📅 年份分布
{'-'*60}
"""
    for year, count in sorted(stats['years'].items()):
        report += f"  {year:10} {count:3d}\n"

    if stats['rating_distribution']:
        report += f"""
⭐ 评分分布
{'-'*60}
"""
        for rating, count in sorted(stats['rating_distribution'].items()):
            stars = '⭐' * rating
            report += f"  {stars:10} {count:3d}\n"

    if stats['recent_reading']:
        report += f"""
📖 最近阅读
{'-'*60}
"""
        for paper in stats['recent_reading']:
            rating = '⭐' * paper.get('rating', 0) if paper.get('rating') else ''
            report += f"  • {paper['title'][:50]}{'...' if len(paper['title']) > 50 else ''}\n"
            report += f"    {', '.join(paper['authors'][:2])}{'...' if len(paper['authors']) > 2 else ''} • {paper['date_read']} {rating}\n\n"

    if stats['todo_high_priority']:
        report += f"""
🔥 待读高优先级
{'-'*60}
"""
        for paper in stats['todo_high_priority']:
            report += f"  • {paper['title'][:50]}{'...' if len(paper['title']) > 50 else ''}\n"
            report += f"    {', '.join(paper['authors'][:2])}{'...' if len(paper['authors']) > 2 else ''} • {paper['year']}\n\n"

    report += f"""
{'='*60}
Generated by Paper Reading List System
{'='*60}
"""
    return report

def main():
    parser = argparse.ArgumentParser(description='生成阅读进度报告')
    parser.add_argument('--output', type=str, help='输出文件 (如 report.html 或 stats.txt)')
    parser.add_argument('--type', type=str, default='auto', help='报告类型 (html/text/auto)')

    args = parser.parse_args()

    papers = load_papers()
    stats = calculate_stats(papers)

    # 确定输出类型
    output_type = args.type
    if output_type == 'auto':
        if args.output:
            if args.output.endswith('.html'):
                output_type = 'html'
            elif args.output.endswith('.txt'):
                output_type = 'text'
        else:
            output_type = 'text'

    # 生成报告
    if output_type == 'html':
        html = generate_html_report(stats)
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"✅ HTML报告已保存到: {args.output}")
        else:
            print(html)
    else:
        text = generate_text_report(stats)
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"✅ 文本报告已保存到: {args.output}")
        else:
            print(text)

if __name__ == '__main__':
    main()
