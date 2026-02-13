/**
 * Diffusion Playground - Interactive 2D Diffusion Visualization
 * Supports DDPM, DDIM, and Flow Matching (Rectified Flow).
 * Pure JS + Canvas, no dependencies.
 */
const DiffusionPlayground = (function () {

    // ══════════════════════════════════════════════════════════
    //  State
    // ══════════════════════════════════════════════════════════
    let canvas, ctx;
    let particles = [];
    let alphaBarArr = [], betaArr = [], alphaArr = [];

    let config = {
        sampler:    'ddpm',        // 'ddpm' | 'ddim' | 'flow'
        source:     'dog',
        target:     'cat',         // used by flow; fixed to gaussian for ddpm/ddim
        numParticles: 200,
        schedule:   'linear',
        betaMin:    0.0001,
        betaMax:    0.02,
        steps:      200,
        eta:        0.0,           // DDIM eta (0 = deterministic, 1 = DDPM)
        direction:  'forward',
        showTrails: true,
        showGrid:   true,
        trailLength: 40,
        speed:      1
    };

    let currentStep = 0;
    let playing = false;
    let animFrameId = null;
    let lastFrameTime = 0;

    // ══════════════════════════════════════════════════════════
    //  Utilities
    // ══════════════════════════════════════════════════════════
    function randn() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    const palette = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
        '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
    ];

    function colorByAngle(x, y) {
        const a = Math.atan2(y, x);
        return Math.floor((a + Math.PI) / (2 * Math.PI) * 8) % 8;
    }

    // ══════════════════════════════════════════════════════════
    //  Geometry helpers (for shape testers)
    // ══════════════════════════════════════════════════════════
    function inEllipse(x, y, cx, cy, rx, ry) {
        return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    }
    function inCircle(x, y, cx, cy, r) {
        return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
    }
    function inRect(x, y, x1, y1, x2, y2) {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }
    function inTriangle(px, py, ax, ay, bx, by, cx, cy) {
        const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
        const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
        const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
        return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    }
    function inPolygon(px, py, verts) {
        let inside = false;
        for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
            const xi = verts[i][0], yi = verts[i][1];
            const xj = verts[j][0], yj = verts[j][1];
            if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi)
                inside = !inside;
        }
        return inside;
    }

    // ══════════════════════════════════════════════════════════
    //  Shape testers  (return true if point inside shape)
    // ══════════════════════════════════════════════════════════

    // ── Dog (side-view silhouette) ──
    function isInsideDog(x, y) {
        // body
        if (inEllipse(x, y, -0.02, 0.05, 0.38, 0.20)) return true;
        // head
        if (inCircle(x, y, 0.32, 0.28, 0.17)) return true;
        // snout
        if (inEllipse(x, y, 0.48, 0.22, 0.09, 0.055)) return true;
        // floppy ear
        if (inEllipse(x, y, 0.22, 0.48, 0.055, 0.10)) return true;
        // tail (curves up-left)
        if (inEllipse(x, y, -0.42, 0.22, 0.055, 0.14)) return true;
        // front legs
        if (inRect(x, y, 0.10, -0.35, 0.18, -0.10)) return true;
        if (inRect(x, y, 0.22, -0.35, 0.30, -0.10)) return true;
        // back legs
        if (inRect(x, y, -0.25, -0.32, -0.17, -0.10)) return true;
        if (inRect(x, y, -0.12, -0.32, -0.04, -0.10)) return true;
        return false;
    }

    // ── Cat (sitting, front-view) ──
    function isInsideCat(x, y) {
        // body (vertical ellipse, sitting)
        if (inEllipse(x, y, 0, -0.10, 0.24, 0.32)) return true;
        // head
        if (inCircle(x, y, 0, 0.30, 0.18)) return true;
        // left ear (pointed triangle)
        if (inTriangle(x, y, -0.14, 0.42, -0.22, 0.64, -0.02, 0.46)) return true;
        // right ear
        if (inTriangle(x, y, 0.14, 0.42, 0.22, 0.64, 0.02, 0.46)) return true;
        // tail (curves right)
        if (inEllipse(x, y, 0.34, -0.18, 0.12, 0.055)) return true;
        if (inEllipse(x, y, 0.42, -0.08, 0.055, 0.10)) return true;
        return false;
    }

    // ── Heart  (implicit equation: (x^2+y^2-1)^3 - x^2*y^3 < 0) ──
    function isInsideHeart(x, y) {
        const sx = x / 0.58;
        const sy = (y - 0.05) / 0.58;
        const a = sx * sx + sy * sy - 1;
        return a * a * a - sx * sx * sy * sy * sy < 0;
    }

    // ── Star (5-pointed) ──
    let _starVerts = null;
    function starVerts() {
        if (_starVerts) return _starVerts;
        _starVerts = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI / 5) - Math.PI / 2;
            const r = i % 2 === 0 ? 0.65 : 0.28;
            _starVerts.push([r * Math.cos(angle), r * Math.sin(angle)]);
        }
        return _starVerts;
    }
    function isInsideStar(x, y) {
        return inPolygon(x, y, starVerts());
    }

    // ── Butterfly ──
    function isInsideButterfly(x, y) {
        // left wing
        if (inEllipse(x, y, -0.35, 0.12, 0.28, 0.35)) return true;
        if (inEllipse(x, y, -0.28, -0.22, 0.20, 0.22)) return true;
        // right wing
        if (inEllipse(x, y, 0.35, 0.12, 0.28, 0.35)) return true;
        if (inEllipse(x, y, 0.28, -0.22, 0.20, 0.22)) return true;
        // body
        if (inEllipse(x, y, 0, 0, 0.04, 0.38)) return true;
        return false;
    }

    // ══════════════════════════════════════════════════════════
    //  Distribution generators
    // ══════════════════════════════════════════════════════════

    // Generic rejection sampler for shape-test functions
    function sampleShape(testFn, n, xmin, xmax, ymin, ymax) {
        const pts = [];
        let tries = 0;
        while (pts.length < n && tries < n * 200) {
            const x = xmin + Math.random() * (xmax - xmin);
            const y = ymin + Math.random() * (ymax - ymin);
            if (testFn(x, y)) {
                pts.push({ x, y, colorIdx: colorByAngle(x, y) });
            }
            tries++;
        }
        return pts;
    }

    function dog(n)       { return sampleShape(isInsideDog, n, -0.55, 0.60, -0.40, 0.60); }
    function cat(n)       { return sampleShape(isInsideCat, n, -0.50, 0.55, -0.45, 0.70); }
    function heart(n)     { return sampleShape(isInsideHeart, n, -0.70, 0.70, -0.60, 0.70); }
    function star(n)      { return sampleShape(isInsideStar, n, -0.70, 0.70, -0.70, 0.70); }
    function butterfly(n) { return sampleShape(isInsideButterfly, n, -0.70, 0.70, -0.45, 0.55); }

    function checkerboard(n) {
        const pts = [], gridSize = 8, cells = [];
        for (let r = 0; r < gridSize; r++)
            for (let c = 0; c < gridSize; c++)
                if ((r + c) % 2 === 0) cells.push([r, c]);
        for (let i = 0; i < n; i++) {
            const cell = cells[Math.floor(Math.random() * cells.length)];
            const x = (cell[1] + Math.random()) / gridSize * 2 - 1;
            const y = (cell[0] + Math.random()) / gridSize * 2 - 1;
            pts.push({ x, y, colorIdx: (Math.floor(cell[0] / 2) * 4 + Math.floor(cell[1] / 2)) % 8 });
        }
        return pts;
    }

    function swissRoll(n) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const t = 1.5 * Math.PI * (1 + 2 * Math.random());
            const x = t * Math.cos(t) / (4.5 * Math.PI);
            const y = t * Math.sin(t) / (4.5 * Math.PI);
            pts.push({ x, y, colorIdx: Math.min(Math.floor((t - 1.5 * Math.PI) / (3 * Math.PI) * 8), 7) });
        }
        return pts;
    }

    function twoMoons(n) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const top = i < n / 2;
            const angle = Math.PI * Math.random();
            let x = top ? Math.cos(angle) * 0.5 : 0.5 - Math.cos(angle) * 0.5;
            let y = top ? Math.sin(angle) * 0.5 - 0.1 : -Math.sin(angle) * 0.5 + 0.1;
            x += randn() * 0.04; y += randn() * 0.04;
            pts.push({ x, y, colorIdx: top ? 0 : 4 });
        }
        return pts;
    }

    function gaussianMix(n) {
        const pts = [], k = 8;
        for (let i = 0; i < n; i++) {
            const ci = Math.floor(Math.random() * k);
            const a = (2 * Math.PI * ci) / k;
            pts.push({ x: 0.55 * Math.cos(a) + randn() * 0.07, y: 0.55 * Math.sin(a) + randn() * 0.07, colorIdx: ci });
        }
        return pts;
    }

    function gaussian(n) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            const x = randn() * 0.30, y = randn() * 0.30;
            pts.push({ x, y, colorIdx: colorByAngle(x, y) });
        }
        return pts;
    }

    const distributions = {
        dog, cat, heart, star, butterfly,
        checkerboard, swissRoll, twoMoons, gaussianMix, gaussian
    };

    // ══════════════════════════════════════════════════════════
    //  Pairing (for Flow Matching: source <-> target)
    // ══════════════════════════════════════════════════════════
    function pairByCoord(srcPts, tgtPts) {
        // Sort both by x+y, pair in order -> approximates OT
        const si = srcPts.map((p, i) => i).sort((a, b) => (srcPts[a].x + srcPts[a].y) - (srcPts[b].x + srcPts[b].y));
        const ti = tgtPts.map((p, i) => i).sort((a, b) => (tgtPts[a].x + tgtPts[a].y) - (tgtPts[b].x + tgtPts[b].y));
        const pairs = [];
        for (let k = 0; k < si.length; k++) {
            pairs.push({ src: srcPts[si[k]], tgt: tgtPts[ti[k]] });
        }
        return pairs;
    }

    // ══════════════════════════════════════════════════════════
    //  Noise schedule (DDPM / DDIM only)
    // ══════════════════════════════════════════════════════════
    function computeSchedule() {
        const T = config.steps;
        betaArr = new Array(T);
        alphaArr = new Array(T);
        alphaBarArr = new Array(T);
        for (let t = 0; t < T; t++) {
            if (config.schedule === 'cosine') {
                betaArr[t] = config.betaMin + (config.betaMax - config.betaMin) * (1 - Math.cos(Math.PI * t / T)) / 2;
            } else {
                betaArr[t] = config.betaMin + (t / T) * (config.betaMax - config.betaMin);
            }
            alphaArr[t] = 1 - betaArr[t];
            alphaBarArr[t] = t === 0 ? alphaArr[0] : alphaBarArr[t - 1] * alphaArr[t];
        }
    }

    // ══════════════════════════════════════════════════════════
    //  Particle generation
    // ══════════════════════════════════════════════════════════
    function generateParticles() {
        const srcFn = distributions[config.source] || dog;
        const srcPts = srcFn(config.numParticles);

        if (config.sampler === 'flow') {
            const tgtFn = distributions[config.target] || gaussian;
            const tgtPts = tgtFn(config.numParticles);
            const pairs = pairByCoord(srcPts, tgtPts);
            particles = pairs.map(pr => ({
                x0: pr.src.x, y0: pr.src.y,
                x1: pr.tgt.x, y1: pr.tgt.y,
                xt: pr.src.x, yt: pr.src.y,
                eps_x: 0, eps_y: 0,
                color: palette[pr.src.colorIdx % 8],
                trail: [{ x: pr.src.x, y: pr.src.y }]
            }));
        } else {
            // DDPM / DDIM: target is always gaussian noise
            particles = srcPts.map(p => ({
                x0: p.x, y0: p.y,
                x1: 0, y1: 0,
                xt: p.x, yt: p.y,
                eps_x: randn(), eps_y: randn(),
                color: palette[p.colorIdx % 8],
                trail: [{ x: p.x, y: p.y }]
            }));
        }
    }

    // ══════════════════════════════════════════════════════════
    //  Forward / reverse processes
    // ══════════════════════════════════════════════════════════

    // ── DDPM / DDIM forward (closed-form) ──
    function diffusionForwardTo(t) {
        if (t < 0) t = 0;
        if (t >= config.steps) t = config.steps - 1;
        const abar = alphaBarArr[t];
        const sa = Math.sqrt(abar), sb = Math.sqrt(1 - abar);
        particles.forEach(p => {
            p.xt = sa * p.x0 + sb * p.eps_x;
            p.yt = sa * p.y0 + sb * p.eps_y;
        });
    }

    // ── DDPM reverse step (t -> t-1) ──
    function ddpmReverseStep(t) {
        if (t <= 0) return;
        const beta = betaArr[t], alpha = alphaArr[t], abar = alphaBarArr[t];
        const sa = Math.sqrt(alpha), sb = Math.sqrt(1 - abar), sigma = Math.sqrt(beta);
        particles.forEach(p => {
            const mu_x = (1 / sa) * (p.xt - (beta / sb) * p.eps_x);
            const mu_y = (1 / sa) * (p.yt - (beta / sb) * p.eps_y);
            if (t > 1) {
                p.xt = mu_x + sigma * randn();
                p.yt = mu_y + sigma * randn();
            } else {
                p.xt = mu_x; p.yt = mu_y;
            }
        });
    }

    // ── DDIM reverse step (t -> t-1) ──
    function ddimReverseStep(t) {
        if (t <= 0) return;
        const abar_t = alphaBarArr[t];
        const abar_prev = t >= 2 ? alphaBarArr[t - 2] : 1.0;  // ᾱ_{t-1}
        const beta_t = betaArr[t];
        const sqrtAbar_t = Math.sqrt(abar_t);
        const sqrtOneMinusAbar_t = Math.sqrt(1 - abar_t);
        const sqrtAbar_prev = Math.sqrt(abar_prev);

        // sigma_t = eta * sqrt((1-abar_prev)/(1-abar_t)) * sqrt(beta_t)
        const sigma_t = config.eta * Math.sqrt((1 - abar_prev) / (1 - abar_t)) * Math.sqrt(beta_t);
        const dirCoeff = Math.sqrt(Math.max(0, 1 - abar_prev - sigma_t * sigma_t));

        particles.forEach(p => {
            // predicted x0
            const pred_x0_x = (p.xt - sqrtOneMinusAbar_t * p.eps_x) / sqrtAbar_t;
            const pred_x0_y = (p.yt - sqrtOneMinusAbar_t * p.eps_y) / sqrtAbar_t;
            // direction pointing to xt
            p.xt = sqrtAbar_prev * pred_x0_x + dirCoeff * p.eps_x + sigma_t * randn();
            p.yt = sqrtAbar_prev * pred_x0_y + dirCoeff * p.eps_y + sigma_t * randn();
        });
    }

    // ── Flow Matching: interpolation (closed-form at any t) ──
    function flowTo(step) {
        const frac = clamp(step / config.steps, 0, 1);
        particles.forEach(p => {
            p.xt = (1 - frac) * p.x0 + frac * p.x1;
            p.yt = (1 - frac) * p.y0 + frac * p.y1;
        });
    }

    // ══════════════════════════════════════════════════════════
    //  Stepping logic
    // ══════════════════════════════════════════════════════════
    function recordTrail() {
        particles.forEach(p => {
            p.trail.push({ x: p.xt, y: p.yt });
            if (p.trail.length > config.trailLength + 10)
                p.trail = p.trail.slice(p.trail.length - config.trailLength);
        });
    }

    function applyPosition() {
        // Set particle positions for current step
        if (config.sampler === 'flow') {
            flowTo(currentStep);
        } else {
            if (currentStep === 0) {
                particles.forEach(p => { p.xt = p.x0; p.yt = p.y0; });
            } else {
                diffusionForwardTo(currentStep - 1);
            }
        }
    }

    function stepForward() {
        if (config.direction === 'forward') {
            if (currentStep >= config.steps) return false;
            currentStep++;
            if (config.sampler === 'flow') {
                flowTo(currentStep);
            } else {
                diffusionForwardTo(currentStep - 1);
            }
        } else {
            // Reverse: step toward 0
            if (currentStep <= 0) return false;
            if (config.sampler === 'flow') {
                currentStep--;
                flowTo(currentStep);
            } else if (config.sampler === 'ddim') {
                ddimReverseStep(currentStep);
                currentStep--;
            } else {
                ddpmReverseStep(currentStep);
                currentStep--;
            }
        }
        recordTrail();
        return true;
    }

    function stepBackward() {
        if (config.direction === 'forward') {
            if (currentStep <= 0) return false;
            currentStep--;
            applyPosition();
        } else {
            if (currentStep >= config.steps) return false;
            currentStep++;
            applyPosition();
        }
        recordTrail();
        return true;
    }

    function jumpTo(t) {
        currentStep = clamp(t, 0, config.steps);
        applyPosition();
        particles.forEach(p => { p.trail = [{ x: p.xt, y: p.yt }]; });
        render(); updateTimeline(); updateFormula();
    }

    // ══════════════════════════════════════════════════════════
    //  Canvas rendering
    // ══════════════════════════════════════════════════════════
    function worldToCanvas(wx, wy) {
        const pad = 40;
        const w = canvas.width - 2 * pad, h = canvas.height - 2 * pad;
        const scale = Math.min(w, h) / 2.4;
        return { cx: canvas.width / 2 + wx * scale, cy: canvas.height / 2 - wy * scale };
    }

    function drawGrid() {
        if (!config.showGrid) return;
        ctx.save();
        ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = 1;
        const gs = 8;
        for (let i = 0; i <= gs; i++) {
            const v = (i / gs) * 2 - 1;
            const a = worldToCanvas(-1, v), b = worldToCanvas(1, v);
            ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy); ctx.stroke();
            const c = worldToCanvas(v, -1), d = worldToCanvas(v, 1);
            ctx.beginPath(); ctx.moveTo(c.cx, c.cy); ctx.lineTo(d.cx, d.cy); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(0,0,0,0.015)';
        for (let r = 0; r < gs; r++)
            for (let c = 0; c < gs; c++)
                if ((r + c) % 2 === 0) {
                    const tl = worldToCanvas(-1 + c * 2 / gs, 1 - r * 2 / gs);
                    const br = worldToCanvas(-1 + (c + 1) * 2 / gs, 1 - (r + 1) * 2 / gs);
                    ctx.fillRect(tl.cx, tl.cy, br.cx - tl.cx, br.cy - tl.cy);
                }
        ctx.restore();
    }

    function drawTrails() {
        if (!config.showTrails) return;
        ctx.save();
        particles.forEach(p => {
            const trail = p.trail;
            if (trail.length < 2) return;
            const start = Math.max(0, trail.length - config.trailLength);
            for (let i = start + 1; i < trail.length; i++) {
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = (i - start) / (trail.length - start) * 0.4;
                ctx.lineWidth = 1;
                const a = worldToCanvas(trail[i - 1].x, trail[i - 1].y);
                const b = worldToCanvas(trail[i].x, trail[i].y);
                ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy); ctx.stroke();
            }
        });
        ctx.restore();
    }

    function drawParticles() {
        ctx.save();
        particles.forEach(p => {
            const { cx, cy } = worldToCanvas(p.xt, p.yt);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.85;
            ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 2 * Math.PI); ctx.fill();
        });
        ctx.restore();
    }

    function render() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawTrails();
        drawParticles();
    }

    // ══════════════════════════════════════════════════════════
    //  Formula panel
    // ══════════════════════════════════════════════════════════
    function abarSpan() {
        return '<span style="text-decoration:overline">&alpha;</span>';
    }

    function updateFormula() {
        const el = document.getElementById('formula-panel');
        if (!el) return;
        const t = currentStep, T = config.steps;

        if (t <= 0 && config.sampler !== 'flow') {
            el.innerHTML = '<span class="formula-label">t = 0</span> &mdash; Source distribution';
            return;
        }

        if (config.sampler === 'flow') {
            const frac = (t / T).toFixed(3);
            if (config.direction === 'forward') {
                el.innerHTML =
                    '<span class="formula-label">Flow Matching (forward):</span> ' +
                    'x<sub>t</sub> = (1&minus;t)&middot;x<sub>0</sub> + t&middot;x<sub>1</sub>' +
                    ' &nbsp; | &nbsp; v = x<sub>1</sub> &minus; x<sub>0</sub>' +
                    '<br><span class="formula-values">' +
                    't = ' + frac + ' &nbsp; step ' + t + ' / ' + T +
                    '</span>';
            } else {
                el.innerHTML =
                    '<span class="formula-label">Flow Matching (reverse):</span> ' +
                    'x<sub>t</sub> = (1&minus;t)&middot;x<sub>0</sub> + t&middot;x<sub>1</sub>' +
                    ' &nbsp; | &nbsp; v = x<sub>0</sub> &minus; x<sub>1</sub>' +
                    '<br><span class="formula-values">' +
                    't = ' + frac + ' &nbsp; step ' + t + ' / ' + T +
                    '</span>';
            }
            return;
        }

        // DDPM / DDIM
        const idx = clamp(t - 1, 0, T - 1);
        const beta = betaArr[idx], abar = alphaBarArr[idx], sigma = Math.sqrt(beta);

        if (config.direction === 'forward') {
            el.innerHTML =
                '<span class="formula-label">Forward (' + config.sampler.toUpperCase() + '):</span> ' +
                'x<sub>t</sub> = &radic;' + abarSpan() + '<sub>t</sub>&middot;x<sub>0</sub>' +
                ' + &radic;(1&minus;' + abarSpan() + '<sub>t</sub>)&middot;&epsilon;' +
                '<br><span class="formula-values">' +
                '&beta;<sub>t</sub>=' + beta.toFixed(5) +
                ' &nbsp; ' + abarSpan() + '<sub>t</sub>=' + abar.toFixed(5) +
                ' &nbsp; t=' + t + '/' + T +
                '</span>';
        } else if (config.sampler === 'ddim') {
            const abar_prev = t >= 2 ? alphaBarArr[t - 2] : 1.0;
            const sig = config.eta * Math.sqrt((1 - abar_prev) / (1 - abar)) * Math.sqrt(beta);
            el.innerHTML =
                '<span class="formula-label">Reverse (DDIM):</span> ' +
                '&#x0078;&#x0302;<sub>0</sub> = (x<sub>t</sub> &minus; &radic;(1&minus;' + abarSpan() + '<sub>t</sub>)&middot;&epsilon;) / &radic;' + abarSpan() + '<sub>t</sub>' +
                '<br>x<sub>t&minus;1</sub> = &radic;' + abarSpan() + '<sub>t&minus;1</sub>&middot;&#x0078;&#x0302;<sub>0</sub>' +
                ' + &radic;(1&minus;' + abarSpan() + '<sub>t&minus;1</sub>&minus;&sigma;&sup2;)&middot;&epsilon; + &sigma;&middot;z' +
                '<br><span class="formula-values">' +
                '&eta;=' + config.eta.toFixed(2) +
                ' &nbsp; &sigma;<sub>t</sub>=' + sig.toFixed(5) +
                ' &nbsp; ' + abarSpan() + '<sub>t</sub>=' + abar.toFixed(5) +
                ' &nbsp; t=' + t + '/' + T +
                '</span>';
        } else {
            el.innerHTML =
                '<span class="formula-label">Reverse (DDPM):</span> ' +
                '&mu;<sub>t</sub> = (1/&radic;&alpha;<sub>t</sub>)(x<sub>t</sub> &minus; &beta;<sub>t</sub>/&radic;(1&minus;' + abarSpan() + '<sub>t</sub>)&middot;&epsilon;)' +
                '<br>x<sub>t&minus;1</sub> = &mu;<sub>t</sub> + &sigma;<sub>t</sub>&middot;z' +
                '<br><span class="formula-values">' +
                '&beta;<sub>t</sub>=' + beta.toFixed(5) +
                ' &nbsp; ' + abarSpan() + '<sub>t</sub>=' + abar.toFixed(5) +
                ' &nbsp; &sigma;<sub>t</sub>=' + sigma.toFixed(5) +
                ' &nbsp; t=' + t + '/' + T +
                '</span>';
        }
    }

    // ══════════════════════════════════════════════════════════
    //  Timeline
    // ══════════════════════════════════════════════════════════
    function updateTimeline() {
        const slider = document.getElementById('timeline-slider');
        const label = document.getElementById('timeline-label');
        if (slider) { slider.max = config.steps; slider.value = currentStep; }
        if (label) label.textContent = 't = ' + currentStep + ' / ' + config.steps;
    }

    // ══════════════════════════════════════════════════════════
    //  Animation loop
    // ══════════════════════════════════════════════════════════
    function animationLoop(timestamp) {
        if (!playing) return;
        const interval = 1000 / (30 * config.speed);
        if (timestamp - lastFrameTime >= interval) {
            lastFrameTime = timestamp;
            if (!stepForward()) { playing = false; updatePlayButton(); return; }
            render(); updateTimeline(); updateFormula();
        }
        animFrameId = requestAnimationFrame(animationLoop);
    }

    function updatePlayButton() {
        const btn = document.getElementById('btn-play');
        if (btn) btn.textContent = playing ? '\u275A\u275A' : '\u25B6';
    }

    // ══════════════════════════════════════════════════════════
    //  Reset
    // ══════════════════════════════════════════════════════════
    function resetSimulation() {
        playing = false;
        updatePlayButton();
        if (animFrameId) cancelAnimationFrame(animFrameId);
        currentStep = 0;

        if (config.sampler !== 'flow') computeSchedule();
        generateParticles();

        if (config.direction === 'reverse') {
            currentStep = config.steps;
            applyPosition();
            particles.forEach(p => { p.trail = [{ x: p.xt, y: p.yt }]; });
        }

        render(); updateTimeline(); updateFormula();
    }

    // ══════════════════════════════════════════════════════════
    //  Resize
    // ══════════════════════════════════════════════════════════
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        render();
    }

    // ══════════════════════════════════════════════════════════
    //  Control visibility (show/hide based on sampler)
    // ══════════════════════════════════════════════════════════
    function updateControlVisibility() {
        document.querySelectorAll('[data-show]').forEach(el => {
            const allowed = el.dataset.show.split(' ');
            el.style.display = allowed.includes(config.sampler) ? '' : 'none';
        });
    }

    // ══════════════════════════════════════════════════════════
    //  Wire controls
    // ══════════════════════════════════════════════════════════
    function wireControls() {

        // Sampler
        bind('ctrl-sampler', 'change', function () {
            config.sampler = this.value;
            updateControlVisibility();
            resetSimulation();
        });

        // Source distribution
        bind('ctrl-source', 'change', function () { config.source = this.value; resetSimulation(); });

        // Target distribution (flow only)
        bind('ctrl-target', 'change', function () { config.target = this.value; resetSimulation(); });

        // Particles
        bindSlider('ctrl-particles', 'val-particles', function (v) {
            config.numParticles = parseInt(v); resetSimulation();
        });

        // Schedule
        bind('ctrl-schedule', 'change', function () { config.schedule = this.value; resetSimulation(); });

        // Beta min / max
        bindSlider('ctrl-beta-min', 'val-beta-min', function (v) {
            config.betaMin = parseFloat(v);
            document.getElementById('val-beta-min').textContent = parseFloat(v).toFixed(4);
            resetSimulation();
        }, true);
        bindSlider('ctrl-beta-max', 'val-beta-max', function (v) {
            config.betaMax = parseFloat(v);
            document.getElementById('val-beta-max').textContent = parseFloat(v).toFixed(2);
            resetSimulation();
        }, true);

        // Steps
        bindSlider('ctrl-steps', 'val-steps', function (v) {
            config.steps = parseInt(v); resetSimulation();
        });

        // Eta (DDIM)
        bindSlider('ctrl-eta', 'val-eta', function (v) {
            config.eta = parseFloat(v);
            document.getElementById('val-eta').textContent = parseFloat(v).toFixed(2);
            resetSimulation();
        }, true);

        // Direction
        bind('ctrl-direction', 'click', function () {
            config.direction = config.direction === 'forward' ? 'reverse' : 'forward';
            this.textContent = config.direction === 'forward' ? 'Forward \u2192' : '\u2190 Reverse';
            resetSimulation();
        });

        // Display toggles
        bind('ctrl-trails', 'change', function () { config.showTrails = this.checked; render(); });
        bind('ctrl-grid', 'change', function () { config.showGrid = this.checked; render(); });
        bindSlider('ctrl-trail-length', 'val-trail-length', function (v) {
            config.trailLength = parseInt(v); render();
        });

        // ── Playback buttons ──
        bind('btn-reset', 'click', resetSimulation);
        bind('btn-step-back', 'click', function () {
            playing = false; updatePlayButton();
            stepBackward(); render(); updateTimeline(); updateFormula();
        });
        bind('btn-play', 'click', function () {
            playing = !playing; updatePlayButton();
            if (playing) { lastFrameTime = 0; animFrameId = requestAnimationFrame(animationLoop); }
        });
        bind('btn-step-fwd', 'click', function () {
            playing = false; updatePlayButton();
            stepForward(); render(); updateTimeline(); updateFormula();
        });
        bind('btn-end', 'click', function () {
            playing = false; updatePlayButton();
            jumpTo(config.direction === 'forward' ? config.steps : 0);
        });

        // Timeline
        bind('timeline-slider', 'input', function () {
            playing = false; updatePlayButton();
            jumpTo(parseInt(this.value));
        });

        // Speed
        bindSlider('ctrl-speed', 'val-speed', function (v) {
            config.speed = parseInt(v);
            document.getElementById('val-speed').textContent = v + 'x';
        }, true);

        window.addEventListener('resize', resizeCanvas);
    }

    // Helpers to reduce boilerplate
    function bind(id, evt, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(evt, fn);
    }
    function bindSlider(sliderId, valId, fn, skipValUpdate) {
        const slider = document.getElementById(sliderId);
        const valEl = document.getElementById(valId);
        if (slider) slider.addEventListener('input', function () {
            if (valEl && !skipValUpdate) valEl.textContent = this.value;
            fn(this.value);
        });
    }

    // ══════════════════════════════════════════════════════════
    //  Public init
    // ══════════════════════════════════════════════════════════
    function init(userConfig) {
        if (userConfig) Object.assign(config, userConfig);
        canvas = document.getElementById('pg-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resizeCanvas();
        wireControls();
        updateControlVisibility();
        resetSimulation();
    }

    return { init };
})();
