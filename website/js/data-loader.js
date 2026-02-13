/**
 * data-loader.js - 统一的数据加载模块
 * fetch data/papers.json 并缓存，自动处理子目录路径差异
 */

const DataLoader = (() => {
    let _cache = null;
    let _loading = null;
    let _chartCache = null;
    let _chartLoading = null;

    /**
     * 根据当前页面位置确定 data/ 目录的基础路径
     */
    function getDataBasePath() {
        const path = window.location.pathname;
        if (path.includes('/papers/')) {
            return '../../data/';
        }
        return '../data/';
    }

    /**
     * 加载并缓存 papers.json
     * @returns {Promise<Object>} papers.json 的完整数据
     */
    async function loadPapers() {
        if (_cache) return _cache;
        if (_loading) return _loading;

        _loading = (async () => {
            const url = getDataBasePath() + 'papers.json';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load papers data: ${response.status}`);
            }
            _cache = await response.json();
            _loading = null;
            return _cache;
        })();

        return _loading;
    }

    /**
     * 加载并缓存 chart.json
     * @returns {Promise<Object>} chart.json 的完整数据
     */
    async function loadChart() {
        if (_chartCache) return _chartCache;
        if (_chartLoading) return _chartLoading;

        _chartLoading = (async () => {
            const url = getDataBasePath() + 'chart.json';
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load chart data: ${response.status}`);
            }
            _chartCache = await response.json();
            _chartLoading = null;
            return _chartCache;
        })();

        return _chartLoading;
    }

    /**
     * 获取所有论文列表
     * @returns {Promise<Array>}
     */
    async function getAllPapers() {
        const data = await loadPapers();
        return data.papers || [];
    }

    /**
     * 根据 ID 获取单篇论文
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    async function getPaperById(id) {
        const papers = await getAllPapers();
        return papers.find(p => p.id === id) || null;
    }

    /**
     * 获取统计数据
     * @returns {Promise<Object>}
     */
    async function getStats() {
        const papers = await getAllPapers();
        const total = papers.length;
        const completed = papers.filter(p => p.status === 'completed').length;
        const reading = papers.filter(p => p.status === 'reading').length;
        const unread = papers.filter(p => p.status === 'unread').length;
        return { total, completed, reading, unread };
    }

    /**
     * 获取 notes 文件的正确路径（相对于当前页面）
     */
    function getNotesPath(notesFile) {
        if (!notesFile) return null;
        const path = window.location.pathname;
        if (path.includes('/papers/')) {
            return '../../' + notesFile;
        }
        return '../' + notesFile;
    }

    return {
        loadPapers,
        loadChart,
        getAllPapers,
        getPaperById,
        getStats,
        getNotesPath,
    };
})();
