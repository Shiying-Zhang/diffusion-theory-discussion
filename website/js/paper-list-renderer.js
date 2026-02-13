/**
 * paper-list-renderer.js - 论文列表页动态渲染
 * 替代 papers.html 中硬编码的论文卡片
 */

const PaperListRenderer = (() => {
    const statusIcons = {
        'completed': '✅',
        'reading': '🔄',
        'unread': '',
        'review': '🔁'
    };

    function renderPaperCard(paper) {
        const statusIcon = statusIcons[paper.status] || '';
        const topics = (paper.topics || []).map(t => `<span class="tag">${t}</span>`).join('');
        const authorsStr = paper.authors.length > 3
            ? paper.authors.slice(0, 2).join(', ') + ', et al.'
            : paper.authors.join(', ');

        const links = [`<a href="papers/paper.html?id=${paper.id}">View Details</a>`];
        if (paper.arxiv_url) {
            links.push(`<a href="${paper.arxiv_url}" target="_blank">ArXiv</a>`);
        }
        if (paper.notes_file) {
            const notesPath = DataLoader.getNotesPath(paper.notes_file);
            links.push(`<a href="${notesPath}">📝 Notes</a>`);
        }

        return `
            <div class="paper-card">
                <h3>${paper.title} ${statusIcon}</h3>
                <div class="authors">${authorsStr} (${paper.year}) &bull; ${paper.venue || ''}</div>
                <div class="meta">
                    ${topics}
                </div>
                <p style="font-size: 0.9em; color: #666;">${paper.summary || ''}</p>
                <div class="paper-links">
                    ${links.join('')}
                </div>
            </div>
        `;
    }

    async function init() {
        const container = document.getElementById('papers-grid');
        const statsEl = document.getElementById('papers-stats');
        if (!container) return;

        try {
            const papers = await DataLoader.getAllPapers();
            const stats = await DataLoader.getStats();

            // Update stats if element exists
            if (statsEl) {
                statsEl.textContent = `Last Updated: ${(await DataLoader.loadPapers()).last_updated || 'N/A'}`;
            }

            container.innerHTML = papers.map(renderPaperCard).join('');
        } catch (err) {
            console.error('Error loading papers list:', err);
            container.innerHTML = '<p>Error loading papers. Please try refreshing.</p>';
        }
    }

    return { init };
})();
