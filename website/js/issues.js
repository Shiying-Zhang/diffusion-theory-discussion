/**
 * issues.js - issues.html GitHub Issues 逻辑
 */

const IssuesPage = (() => {
    let allIssues = [];
    let currentFilter = 'all';

    async function fetchIssues() {
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('error');
        const contentEl = document.getElementById('issues-content');

        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        contentEl.style.display = 'none';

        try {
            const response = await fetch(
                'https://api.github.com/repos/Shiying-Zhang/diffusion-theory-discussion/issues?state=all&per_page=50'
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const issues = await response.json();
            allIssues = issues;

            updateStats(issues);
            renderIssues(issues);
            updateTimestamp();

            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
        } catch (error) {
            console.error('Error fetching issues:', error);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            errorEl.querySelector('#error-message').textContent =
                `Error: ${error.message}. Please check your internet connection and try again.`;
        }
    }

    function updateStats(issues) {
        const total = issues.length;
        const open = issues.filter(i => i.state === 'open').length;
        const closed = issues.filter(i => i.state === 'closed').length;
        const questions = issues.filter(i =>
            i.labels.some(l => l.name.toLowerCase().includes('question'))
        ).length;

        document.getElementById('total-issues').textContent = total;
        document.getElementById('open-issues').textContent = open;
        document.getElementById('closed-issues').textContent = closed;
        document.getElementById('questions-count').textContent = questions;
    }

    function renderIssues(issues) {
        const issuesList = document.getElementById('issues-list');

        let filteredIssues = issues;
        if (currentFilter !== 'all') {
            filteredIssues = issues.filter(issue =>
                issue.labels.some(label =>
                    label.name.toLowerCase().includes(currentFilter)
                )
            );
        }

        if (filteredIssues.length === 0) {
            issuesList.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 40px;">No issues found for this filter.</p>';
            return;
        }

        issuesList.innerHTML = filteredIssues.map(issue => {
            const issueDate = new Date(issue.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            const firstChar = issue.user.login.charAt(0).toUpperCase();
            const body = issue.body || '';
            const truncatedBody = body.length > 200
                ? body.substring(0, 200) + '...'
                : body;

            return `
                <div class="issue-card" onclick="window.open('${issue.html_url}', '_blank')" style="cursor: pointer;">
                    <div class="issue-header">
                        <h3 class="issue-title">${escapeHtml(issue.title)}</h3>
                        <span class="issue-number">#${issue.number}</span>
                    </div>
                    <div class="issue-meta">
                        <span>${issue.state === 'open' ? '🟢' : '🔴'} ${issue.state.toUpperCase()}</span>
                        <span>📅 ${issueDate}</span>
                        <span>💬 ${issue.comments} comments</span>
                    </div>
                    ${issue.labels.length > 0 ? `
                    <div class="issue-labels">
                        ${issue.labels.map(label => `
                            <span class="label ${getLabelClass(label.name)}">${escapeHtml(label.name)}</span>
                        `).join('')}
                    </div>
                    ` : ''}
                    <div class="issue-body">${escapeHtml(truncatedBody)}</div>
                    <div class="issue-footer">
                        <div class="issue-author">
                            <div class="author-avatar">${firstChar}</div>
                            <span>${escapeHtml(issue.user.login)}</span>
                        </div>
                        <div class="issue-actions">
                            <span class="issue-action">👁️ ${issue.views || 0}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function filterIssues(filter) {
        currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        renderIssues(allIssues);
    }

    function getLabelClass(labelName) {
        const name = labelName.toLowerCase();
        if (name.includes('question')) return 'question';
        if (name.includes('discussion')) return 'discussion';
        if (name.includes('theory')) return 'theory';
        if (name.includes('bug')) return 'bug';
        if (name.includes('enhancement') || name.includes('feature')) return 'enhancement';
        return '';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateTimestamp() {
        const now = new Date().toLocaleString();
        document.getElementById('last-updated').textContent = now;
    }

    // Expose to global for onclick handlers
    window.filterIssues = filterIssues;
    window.fetchIssues = fetchIssues;

    return { init: fetchIssues };
})();
