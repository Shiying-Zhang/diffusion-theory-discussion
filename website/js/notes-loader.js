/**
 * NotesLoader - Auto-discovers notes. Zero configuration.
 *
 * Strategy (local-first):
 *   1. Try fetching ../notes/ directory listing from the local dev server
 *      (python -m http.server, Live Server, etc. all return an HTML index)
 *   2. If that fails (e.g. on GitHub Pages), fall back to GitHub API
 *
 * Result: locally you see new .md files instantly without pushing;
 *         in production it auto-syncs via GitHub API.
 */
const NotesLoader = (function () {

    const REPO = 'Shiying-Zhang/diffusion-theory-discussion';
    const NOTES_DIR = 'notes';
    const LOCAL_NOTES_PATH = '../notes/';
    const CACHE_KEY = 'notes-list-v2';
    const CACHE_TTL = 5 * 60 * 1000; // 5 min

    const ACRONYMS = new Set([
        'ddpm', 'ddim', 'sde', 'ode', 'vae', 'gan', 'edm', 'ncsn',
        'smld', 'cfg', 'elbo', 'kl', 'vpsde', 'vesde', 'nfe', 'ema',
        'dit', 'ldm', 'unet', 'adm', 'cm', 'fm', 'ot', 'si'
    ]);

    /** ddpm.md -> "DDPM",  score-based-sde.md -> "Score Based SDE" */
    function formatName(filename) {
        return filename
            .replace(/\.md$/i, '')
            .split(/[-_]/)
            .map(function (w) {
                return ACRONYMS.has(w.toLowerCase())
                    ? w.toUpperCase()
                    : w.charAt(0).toUpperCase() + w.slice(1);
            })
            .join(' ');
    }

    // ── Local directory listing ────────────────────────────
    // Most dev servers return an HTML page with <a href="file.md"> links
    // when you request a directory path.

    async function tryLocal() {
        var resp = await fetch(LOCAL_NOTES_PATH);
        if (!resp.ok) throw new Error('no local listing');
        var html = await resp.text();
        // Extract .md filenames from href attributes
        var regex = /href="([^"]*\.md)"/gi;
        var match, names = [];
        while ((match = regex.exec(html)) !== null) {
            // href might be just "ddpm.md" or a full path; extract filename
            var parts = match[1].split('/');
            var name = parts[parts.length - 1];
            if (name && name.endsWith('.md')) names.push(name);
        }
        if (names.length === 0) throw new Error('no .md files found in listing');
        return names.map(function (name) {
            return {
                name: name,
                displayName: formatName(name),
                rawUrl: LOCAL_NOTES_PATH + name,
                path: NOTES_DIR + '/' + name,
                local: true
            };
        }).sort(function (a, b) { return a.displayName.localeCompare(b.displayName); });
    }

    // ── GitHub API ─────────────────────────────────────────

    async function tryGitHub() {
        var resp = await fetch(
            'https://api.github.com/repos/' + REPO + '/contents/' + NOTES_DIR
        );
        if (!resp.ok) throw new Error('GitHub API ' + resp.status);
        var files = await resp.json();
        return files
            .filter(function (f) { return f.name.endsWith('.md'); })
            .map(function (f) {
                return {
                    name: f.name,
                    displayName: formatName(f.name),
                    rawUrl: f.download_url,
                    path: f.path,
                    local: false
                };
            })
            .sort(function (a, b) { return a.displayName.localeCompare(b.displayName); });
    }

    // ── Main listing (with cache) ──────────────────────────

    async function listNotes() {
        // Check cache
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (raw) {
                var cached = JSON.parse(raw);
                if (Date.now() - cached.time < CACHE_TTL) return cached.data;
            }
        } catch (e) { /* ignore */ }

        var notes;
        try {
            // 1) Try local dev server directory listing
            notes = await tryLocal();
        } catch (e) {
            // 2) Fall back to GitHub API
            notes = await tryGitHub();
        }

        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: notes }));
        return notes;
    }

    // ── Sidebar population ─────────────────────────────────

    async function loadSidebar(containerId, viewerPage) {
        var el = document.getElementById(containerId);
        if (!el) return;
        var page = viewerPage || 'notes.html';

        try {
            var notes = await listNotes();
            if (notes.length === 0) {
                el.innerHTML = '<li style="color:#999;">No notes yet</li>';
                return;
            }
            el.innerHTML = notes.map(function (n) {
                return '<li><a href="' + page + '?file=' +
                    encodeURIComponent(n.name) + '">' +
                    n.displayName + '</a></li>';
            }).join('');
        } catch (e) {
            el.innerHTML =
                '<li><a href="https://github.com/' + REPO +
                '/tree/main/' + NOTES_DIR +
                '" target="_blank">View notes on GitHub</a></li>';
        }
    }

    // ── Single note fetching ───────────────────────────────

    async function loadNote(filename) {
        var notes = await listNotes();
        var note = notes.find(function (n) { return n.name === filename; });

        // Even if note wasn't in the cached list, try local path directly
        if (!note) {
            note = {
                name: filename,
                displayName: formatName(filename),
                rawUrl: LOCAL_NOTES_PATH + filename,
                path: NOTES_DIR + '/' + filename,
                local: true
            };
        }

        // Try local path first (faster, works offline)
        try {
            var resp = await fetch(LOCAL_NOTES_PATH + filename);
            if (resp.ok) {
                return { content: await resp.text(), meta: note };
            }
        } catch (e) { /* try remote */ }

        // Fall back to remote URL
        if (note.rawUrl && !note.local) {
            var resp2 = await fetch(note.rawUrl);
            if (resp2.ok) {
                return { content: await resp2.text(), meta: note };
            }
        }

        throw new Error('Could not load ' + filename);
    }

    return { listNotes: listNotes, loadSidebar: loadSidebar, loadNote: loadNote, formatName: formatName };
})();
