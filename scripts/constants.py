#!/usr/bin/env python3
"""
从 schema.json 读取枚举值，作为所有脚本的单一来源。
"""

import json
import os

# 脚本相对路径定位项目根目录和数据文件
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
DB_PATH = os.path.join(REPO_ROOT, 'data', 'papers.json')
SCHEMA_PATH = os.path.join(REPO_ROOT, 'data', 'schema.json')


def _load_schema():
    """加载 schema.json 并提取枚举值"""
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema = json.load(f)
    return schema


def _extract_enums(schema):
    """从 schema 中提取所有枚举定义"""
    props = schema.get('definitions', {}).get('paper', {}).get('properties', {})
    enums = {}

    # 直接枚举字段
    for field in ('venue', 'level', 'priority', 'status'):
        if field in props and 'enum' in props[field]:
            enums[field] = props[field]['enum']

    # topics 在 items 中
    topics_items = props.get('topics', {}).get('items', {})
    if 'enum' in topics_items:
        enums['topics'] = topics_items['enum']

    return enums


_schema = _load_schema()
_enums = _extract_enums(_schema)

VALID_TOPICS = _enums.get('topics', [])
VALID_LEVELS = _enums.get('level', [])
VALID_PRIORITIES = _enums.get('priority', [])
VALID_STATUS = _enums.get('status', [])
VALID_VENUES = _enums.get('venue', [])
