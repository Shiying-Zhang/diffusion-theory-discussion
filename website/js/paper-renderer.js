/**
 * paper-renderer.js - 论文详情页渲染
 * 替代 paper.html 中硬编码的 PAPERS 对象，从 papers.json 动态加载
 */

const PaperRenderer = (() => {
    function getPaperId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id') || 'ddpm_2020';
    }

    function renderPaper(paper, paperId) {
        if (!paper) {
            document.getElementById('paper-content').innerHTML = '<h2>Paper not found</h2>';
            return;
        }

        const statusText = {
            'completed': '✅ Completed',
            'reading': '🔄 Reading',
            'unread': '⬜️ Unread',
            'review': '🔁 Review'
        }[paper.status] || paper.status;

        const statusClass = 'status-' + paper.status;

        const tags = (paper.tags || []).map(t => `<span class="concept-tag">${t}</span>`).join('');

        const links = [];
        if (paper.arxiv_url) {
            links.push(`<a href="${paper.arxiv_url}" target="_blank">📄 ArXiv</a>`);
        }
        if (paper.pdf_url) {
            links.push(`<a href="${paper.pdf_url}" target="_blank">📑 PDF</a>`);
        }
        if (paper.code_url) {
            links.push(`<a href="${paper.code_url}" target="_blank">💻 Code</a>`);
        }
        if (paper.notes_file) {
            const notesPath = DataLoader.getNotesPath(paper.notes_file);
            links.push(`<a href="${notesPath}">📝 Notes</a>`);
        }

        const contributions = (paper.key_contributions || []).map(c => `<li>${c}</li>`).join('');

        const rating = paper.rating ? '⭐'.repeat(paper.rating) : 'Not rated';

        document.title = `${paper.title} - Diffusion Models`;
        document.getElementById('paper-content').innerHTML = `
            <div class="back-link">
                <a href="../index.html">\u2190 Back to Chart</a>
            </div>

            <div class="paper-header">
                <h1>${paper.title}</h1>
                <div class="authors">
                    ${paper.authors.join(', ')}
                </div>
                <div class="meta">
                    <span><strong>Venue:</strong> ${paper.venue || 'N/A'}</span>
                    <span><strong>Year:</strong> ${paper.year}</span>
                    <span><strong>Priority:</strong> ${paper.priority}</span>
                    <span><strong>Difficulty:</strong> ${paper.level}</span>
                </div>
                <div style="margin-top: 15px;">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <span style="margin-left: 15px;"><strong>Rating:</strong> ${rating}</span>
                </div>
            </div>

            <div class="paper-links">
                ${links.join('')}
            </div>

            <div class="paper-section">
                <h2>📝 Summary</h2>
                <p style="line-height: 1.8;">${paper.summary || 'No summary available.'}</p>
            </div>

            <div class="paper-section">
                <h2>🔑 Tags & Topics</h2>
                <div class="key-concepts">
                    ${(paper.topics || []).map(t => `<span class="concept-tag">${t}</span>`).join('')}
                    ${tags}
                </div>
            </div>

            ${contributions ? `
            <div class="paper-section">
                <h2>💡 Key Contributions</h2>
                <ul style="line-height: 2;">
                    ${contributions}
                </ul>
            </div>
            ` : ''}

            ${paper.notes_file ? `
            <div class="notes-section">
                <h2>📚 Reading Notes</h2>
                <p>This paper has been read and annotated. Check out the detailed notes:</p>
                <p><a href="${DataLoader.getNotesPath(paper.notes_file)}" style="color: #f59e0b; font-weight: bold;">\u2192 View Reading Notes</a></p>
            </div>
            ` : ''}

            <div class="paper-section" style="background: #f9fafb; border: 1px solid #e5e7eb;">
                <h2>🛠️ Tools & Resources</h2>
                <p>To manage this paper in your reading list:</p>
                <ul style="line-height: 2;">
                    <li><strong>Update status:</strong> <code>python scripts/update_status.py --id ${paperId} --status completed</code></li>
                    <li><strong>Add rating:</strong> <code>python scripts/update_status.py --id ${paperId} --rating 5</code></li>
                    <li><strong>Search similar:</strong> <code>python scripts/search_papers.py --query "${paper.title.split(' ').slice(0, 3).join(' ')}"</code></li>
                </ul>
            </div>

            <div class="paper-section">
                <h2>📖 More Papers</h2>
                <p><a href="../papers.html" style="color: #667eea; font-weight: bold;">\u2192 View All Papers</a></p>
            </div>

            <div class="paper-section">
                <h2>💬 Join the Discussion</h2>
                <p><a href="../issues.html" style="color: #667eea; font-weight: bold;">\u2192 View Discussion Board</a></p>
            </div>
        `;
    }

    async function init() {
        const paperId = getPaperId();
        try {
            const paper = await DataLoader.getPaperById(paperId);
            renderPaper(paper, paperId);
        } catch (err) {
            console.error('Error loading paper:', err);
            document.getElementById('paper-content').innerHTML =
                '<h2>Error loading paper data</h2><p>' + err.message + '</p>';
        }
    }

    return { init };
})();
