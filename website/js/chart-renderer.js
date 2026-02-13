/**
 * chart-renderer.js - D3 v7 force-directed graph rendering engine
 * Replaces hardcoded SVG in interactive.html and index.html
 * Reads data from data/chart.json via DataLoader
 */

const ChartRenderer = (() => {
    const EDGE_STYLES = {
        inspires: { dasharray: null, opacity: 0.6 },
        extends: { dasharray: '8,4', opacity: 0.6 },
        generalizes: { dasharray: '4,4', opacity: 0.5 },
        applies: { dasharray: '2,4', opacity: 0.5 }
    };

    let _simulation = null;
    let _svg = null;
    let _config = {};

    async function init(config) {
        _config = Object.assign({
            container: '#chart-container',
            showVariables: true,
            enableDrag: true,
            enableZoom: true,
            showTooltip: true,
            sidebarDetails: true,
            width: null,
            height: null
        }, config);

        const chartData = await DataLoader.loadChart();
        const container = document.querySelector(_config.container);
        if (!container) {
            console.error('ChartRenderer: container not found:', _config.container);
            return;
        }

        const rect = container.getBoundingClientRect();
        const width = _config.width || rect.width || 1000;
        const baseHeight = _config.showVariables ? 900 : 700;
        const height = _config.height || Math.max(rect.height, baseHeight);

        render(container, chartData, width, height);

        if (_config.sidebarDetails) {
            buildSidebarNav(chartData);
        }
    }

    function render(container, data, width, height) {
        const { categories, nodes, edges, variables } = data;

        container.innerHTML = '';

        const margin = { top: 80, right: 40, bottom: 40, left: 40 };
        const chartHeight = _config.showVariables ? height * 0.65 : height - margin.top - margin.bottom;
        const varSectionY = chartHeight + margin.top + 20;

        _svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('class', 'chart-svg');

        // Defs: arrowhead markers
        const defs = _svg.append('defs');
        defs.append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 7)
            .attr('refX', 10)
            .attr('refY', 3.5)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3.5, 0 7')
            .attr('fill', '#94a3b8');

        defs.append('marker')
            .attr('id', 'arrowhead-active')
            .attr('markerWidth', 10)
            .attr('markerHeight', 7)
            .attr('refX', 10)
            .attr('refY', 3.5)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3.5, 0 7')
            .attr('fill', '#667eea');

        // Main group for zoom/pan
        const g = _svg.append('g').attr('class', 'chart-main');

        // Zoom behavior
        if (_config.enableZoom) {
            const zoom = d3.zoom()
                .scaleExtent([0.3, 3])
                .on('zoom', (event) => {
                    g.attr('transform', event.transform);
                });
            _svg.call(zoom);
            // Store zoom for external access
            _svg.node().__zoom_behavior = zoom;
        }

        // Title
        g.append('text')
            .attr('x', width / 2)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('font-size', 22)
            .attr('font-weight', 'bold')
            .attr('fill', '#1e293b')
            .attr('font-family', 'Georgia, serif')
            .text('Diffusion Model Papers Network');

        g.append('text')
            .attr('x', width / 2)
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .attr('font-size', 13)
            .attr('fill', '#64748b')
            .attr('font-family', 'Georgia, serif')
            .text('Hover over papers to explore theoretical connections');

        // Year scale: maps year to Y position
        const years = nodes.map(n => n.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const yScale = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([margin.top + 60, margin.top + chartHeight - 60]);

        // Importance to radius
        function nodeRadius(importance) {
            return d3.scaleLinear().domain([1, 5]).range([25, 55])(importance);
        }

        // Prepare node data with initial positions
        const nodeData = nodes.map(n => ({
            ...n,
            r: nodeRadius(n.importance),
            fill: categories[n.category].fill,
            stroke: categories[n.category].stroke,
            x: width / 2 + (Math.random() - 0.5) * 300,
            y: yScale(n.year)
        }));

        const nodeMap = {};
        nodeData.forEach(n => { nodeMap[n.id] = n; });

        // Prepare edge data
        const edgeData = edges
            .filter(e => nodeMap[e.from] && nodeMap[e.to])
            .map(e => ({
                source: nodeMap[e.from],
                target: nodeMap[e.to],
                type: e.type
            }));

        // Force simulation
        _simulation = d3.forceSimulation(nodeData)
            .force('link', d3.forceLink(edgeData)
                .id(d => d.id)
                .distance(d => {
                    const r1 = d.source.r || 35;
                    const r2 = d.target.r || 35;
                    return r1 + r2 + 60;
                })
                .strength(0.4))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('x', d3.forceX(width / 2).strength(0.08))
            .force('y', d3.forceY(d => yScale(d.year)).strength(0.5))
            .force('collide', d3.forceCollide(d => d.r + 10).strength(0.8))
            .alphaDecay(0.02);

        // Draw edges
        const linkGroup = g.append('g').attr('class', 'edges');
        const links = linkGroup.selectAll('line')
            .data(edgeData)
            .join('line')
            .attr('class', 'connection-line')
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 2)
            .attr('opacity', d => (EDGE_STYLES[d.type] || EDGE_STYLES.inspires).opacity)
            .attr('stroke-dasharray', d => (EDGE_STYLES[d.type] || EDGE_STYLES.inspires).dasharray)
            .attr('marker-end', 'url(#arrowhead)')
            .attr('data-from', d => d.source.id)
            .attr('data-to', d => d.target.id);

        // Draw nodes
        const nodeGroup = g.append('g').attr('class', 'nodes');
        const nodeElements = nodeGroup.selectAll('g')
            .data(nodeData)
            .join('g')
            .attr('class', 'paper-node')
            .attr('data-id', d => d.id)
            .style('cursor', 'pointer');

        // Node circles
        nodeElements.append('circle')
            .attr('r', d => d.r)
            .attr('fill', d => d.fill)
            .attr('stroke', d => d.stroke)
            .attr('stroke-width', d => d.importance >= 5 ? 4 : d.importance >= 4 ? 3 : 2);

        // Node labels (multi-line via short_label)
        nodeElements.each(function(d) {
            const el = d3.select(this);
            const lines = (d.short_label || d.label).split('\n');
            const lineHeight = 13;
            const startY = -(lines.length - 1) * lineHeight / 2;

            lines.forEach((line, i) => {
                el.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', startY + i * lineHeight)
                    .attr('font-size', d.r > 40 ? 13 : 11)
                    .attr('font-weight', 'bold')
                    .attr('fill', '#1e293b')
                    .attr('pointer-events', 'none')
                    .attr('font-family', 'Georgia, serif')
                    .text(line);
            });

            // Year label below
            el.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', startY + lines.length * lineHeight)
                .attr('font-size', 10)
                .attr('fill', '#888')
                .attr('pointer-events', 'none')
                .attr('font-family', 'Georgia, serif')
                .text(d.year);
        });

        // Drag behavior
        if (_config.enableDrag) {
            const drag = d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) _simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) _simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                });
            nodeElements.call(drag);
        }

        // Build adjacency map for hover highlighting
        const adjacency = {};
        nodeData.forEach(n => { adjacency[n.id] = new Set(); });
        edgeData.forEach(e => {
            const sId = typeof e.source === 'object' ? e.source.id : e.source;
            const tId = typeof e.target === 'object' ? e.target.id : e.target;
            adjacency[sId].add(tId);
            adjacency[tId].add(sId);
        });

        // Tooltip
        let tooltip = null;
        if (_config.showTooltip) {
            tooltip = d3.select(container)
                .append('div')
                .attr('class', 'chart-tooltip')
                .style('position', 'absolute')
                .style('pointer-events', 'none')
                .style('background', 'rgba(255,255,255,0.95)')
                .style('border', '1px solid #cbd5e1')
                .style('border-radius', '8px')
                .style('padding', '10px 14px')
                .style('font-size', '13px')
                .style('font-family', 'Georgia, serif')
                .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
                .style('opacity', 0)
                .style('z-index', 100);
        }

        // Hover interaction
        nodeElements
            .on('mouseenter', function(event, d) {
                const neighbors = adjacency[d.id] || new Set();

                // Highlight current node
                nodeElements.each(function(nd) {
                    const el = d3.select(this);
                    if (nd.id === d.id) {
                        el.select('circle')
                            .attr('stroke', '#667eea')
                            .attr('stroke-width', 4);
                        el.style('opacity', 1);
                    } else if (neighbors.has(nd.id)) {
                        el.style('opacity', 1);
                        el.select('circle')
                            .attr('stroke-width', 3);
                    } else {
                        el.style('opacity', 0.15);
                    }
                });

                // Highlight connected edges
                links.each(function(e) {
                    const sId = typeof e.source === 'object' ? e.source.id : e.source;
                    const tId = typeof e.target === 'object' ? e.target.id : e.target;
                    const el = d3.select(this);
                    if (sId === d.id || tId === d.id) {
                        el.attr('stroke', '#667eea')
                            .attr('stroke-width', 3)
                            .attr('opacity', 1)
                            .attr('marker-end', 'url(#arrowhead-active)');
                    } else {
                        el.attr('opacity', 0.08);
                    }
                });

                // Tooltip
                if (tooltip) {
                    tooltip
                        .html(`<strong>${d.label}</strong><br>
                               <span style="color:#666">${d.authors} (${d.year})</span><br>
                               <span style="color:#475569;font-size:12px">${d.description || ''}</span>`)
                        .style('opacity', 1)
                        .style('left', (event.offsetX + 15) + 'px')
                        .style('top', (event.offsetY - 10) + 'px');
                }

                // Sidebar highlight
                highlightSidebarItem(d.id, true);
            })
            .on('mousemove', function(event) {
                if (tooltip) {
                    tooltip
                        .style('left', (event.offsetX + 15) + 'px')
                        .style('top', (event.offsetY - 10) + 'px');
                }
            })
            .on('mouseleave', function() {
                // Reset all
                nodeElements.style('opacity', 1)
                    .each(function(nd) {
                        d3.select(this).select('circle')
                            .attr('stroke', nd.stroke)
                            .attr('stroke-width', nd.importance >= 5 ? 4 : nd.importance >= 4 ? 3 : 2);
                    });

                links.each(function(e) {
                    const style = EDGE_STYLES[e.type] || EDGE_STYLES.inspires;
                    d3.select(this)
                        .attr('stroke', '#cbd5e1')
                        .attr('stroke-width', 2)
                        .attr('opacity', style.opacity)
                        .attr('marker-end', 'url(#arrowhead)');
                });

                if (tooltip) {
                    tooltip.style('opacity', 0);
                }

                highlightSidebarItem(null, false);
            });

        // Click interaction
        nodeElements.on('click', function(event, d) {
            if (_config.sidebarDetails) {
                showSidebarDetails(d);
            } else if (d.paper_id) {
                window.location.href = 'papers/paper.html?id=' + d.paper_id;
            }
        });

        // Tick: update positions
        _simulation.on('tick', () => {
            // Constrain nodes within bounds
            nodeData.forEach(n => {
                n.x = Math.max(n.r + margin.left, Math.min(width - n.r - margin.right, n.x));
                n.y = Math.max(n.r + margin.top + 40, Math.min(margin.top + chartHeight - n.r, n.y));
            });

            links
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist === 0) return d.target.x;
                    return d.target.x - (dx / dist) * d.target.r;
                })
                .attr('y2', d => {
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist === 0) return d.target.y;
                    return d.target.y - (dy / dist) * d.target.r;
                });

            nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // Variables section
        if (_config.showVariables && variables && variables.length > 0) {
            renderVariables(g, variables, width, varSectionY);
        }
    }

    function renderVariables(g, variables, width, startY) {
        const varGroup = g.append('g').attr('class', 'variables-section');

        // Section background
        varGroup.append('rect')
            .attr('x', 0)
            .attr('y', startY - 20)
            .attr('width', width)
            .attr('height', 220)
            .attr('fill', '#f8f9fa')
            .attr('stroke', '#667eea')
            .attr('stroke-width', 2);

        varGroup.append('text')
            .attr('x', width / 2)
            .attr('y', startY + 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', 18)
            .attr('font-weight', 'bold')
            .attr('fill', '#1e293b')
            .attr('font-family', 'Georgia, serif')
            .text('Diffusion Theory: Key Variables & Definitions');

        // Build variable relationship map
        const varRelMap = {};
        variables.forEach(v => { varRelMap[v.id] = v.related_vars || []; });

        const cols = 4;
        const boxW = 250;
        const boxH = 65;
        const gapX = 30;
        const gapY = 15;
        const totalRowW = cols * boxW + (cols - 1) * gapX;
        const offsetX = (width - totalRowW) / 2;
        const baseY = startY + 30;

        const varItems = varGroup.selectAll('g.var-item')
            .data(variables)
            .join('g')
            .attr('class', 'var-item')
            .attr('data-var', d => d.id)
            .style('cursor', 'pointer')
            .attr('transform', (d, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = offsetX + col * (boxW + gapX);
                const y = baseY + row * (boxH + gapY);
                return `translate(${x},${y})`;
            });

        varItems.append('rect')
            .attr('width', boxW)
            .attr('height', boxH)
            .attr('rx', 8)
            .attr('fill', 'white')
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 2);

        varItems.append('text')
            .attr('x', boxW / 2)
            .attr('y', 28)
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill', '#1e293b')
            .attr('font-family', 'Georgia, serif')
            .text(d => d.latex);

        varItems.append('text')
            .attr('x', boxW / 2)
            .attr('y', 48)
            .attr('text-anchor', 'middle')
            .attr('font-size', 11)
            .attr('fill', '#475569')
            .attr('font-family', 'Georgia, serif')
            .text(d => d.definition);

        // Variable hover: highlight related
        varItems
            .on('mouseenter', function(event, d) {
                const related = new Set(d.related_vars || []);
                related.add(d.id);

                varItems.each(function(vd) {
                    const el = d3.select(this);
                    if (vd.id === d.id) {
                        el.select('rect')
                            .attr('fill', '#e0e7ff')
                            .attr('stroke', '#667eea')
                            .attr('stroke-width', 3);
                    } else if (related.has(vd.id)) {
                        el.select('rect')
                            .attr('fill', '#dcfce7');
                    }
                });
            })
            .on('mouseleave', function() {
                varItems.each(function() {
                    d3.select(this).select('rect')
                        .attr('fill', 'white')
                        .attr('stroke', '#cbd5e1')
                        .attr('stroke-width', 2);
                });
            });
    }

    function buildSidebarNav(data) {
        const navContainer = document.getElementById('nav-list');
        if (!navContainer) return;

        const { categories, nodes } = data;

        // Group nodes by category
        const groups = {};
        Object.keys(categories).forEach(k => { groups[k] = []; });
        nodes.forEach(n => {
            if (groups[n.category]) {
                groups[n.category].push(n);
            }
        });

        let html = '';
        Object.entries(categories).forEach(([key, cat]) => {
            const items = groups[key] || [];
            if (items.length === 0) return;

            html += `<div style="margin-bottom: 12px;">`;
            html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">`;
            html += `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${cat.fill};border:2px solid ${cat.stroke};"></span>`;
            html += `<strong style="font-size:12px;">${cat.label}</strong>`;
            html += `</div>`;

            items.sort((a, b) => a.year - b.year);
            items.forEach(n => {
                html += `<div class="nav-item" data-node-id="${n.id}"
                    style="padding:4px 8px 4px 20px;font-size:12px;cursor:pointer;border-radius:4px;transition:background 0.2s;"
                    onmouseenter="this.style.background='#e0e7ff';ChartRenderer.highlightNode('${n.id}')"
                    onmouseleave="this.style.background='';ChartRenderer.unhighlightNode()"
                    onclick="ChartRenderer.clickNode('${n.id}')">
                    ${n.label} <span style="color:#888">(${n.year})</span>
                </div>`;
            });

            html += `</div>`;
        });

        navContainer.innerHTML = html;
    }

    function showSidebarDetails(node) {
        const detailPanel = document.getElementById('paper-detail');
        if (!detailPanel) return;

        let html = `
            <div style="padding:15px;">
                <h3 style="margin:0 0 8px 0;font-family:Georgia,serif;">${node.label}</h3>
                <p style="color:#666;font-size:13px;margin:4px 0;">${node.authors} (${node.year})</p>
                <p style="font-size:13px;margin:8px 0;">${node.description || ''}</p>`;

        if (node.paper_id) {
            html += `<a href="papers/paper.html?id=${node.paper_id}"
                style="display:inline-block;margin-top:10px;padding:8px 16px;background:#667eea;color:white;border-radius:5px;text-decoration:none;font-size:13px;">
                View Paper Details
            </a>`;
        }

        html += `</div>`;
        detailPanel.innerHTML = html;
        detailPanel.style.display = 'block';
    }

    function highlightSidebarItem(nodeId, active) {
        document.querySelectorAll('.nav-item').forEach(el => {
            if (active && el.dataset.nodeId === nodeId) {
                el.style.background = '#e0e7ff';
            } else {
                el.style.background = '';
            }
        });
    }

    // Public API for sidebar hover → chart highlight
    function highlightNode(nodeId) {
        if (!_svg) return;
        const nodeElements = _svg.selectAll('.paper-node');
        const links = _svg.selectAll('.connection-line');

        // Build adjacency
        const neighbors = new Set();
        links.each(function(e) {
            const sId = typeof e.source === 'object' ? e.source.id : e.source;
            const tId = typeof e.target === 'object' ? e.target.id : e.target;
            if (sId === nodeId) neighbors.add(tId);
            if (tId === nodeId) neighbors.add(sId);
        });

        nodeElements.each(function(nd) {
            const el = d3.select(this);
            if (nd.id === nodeId) {
                el.select('circle')
                    .attr('stroke', '#667eea')
                    .attr('stroke-width', 4);
                el.style('opacity', 1);
            } else if (neighbors.has(nd.id)) {
                el.style('opacity', 1);
            } else {
                el.style('opacity', 0.15);
            }
        });

        links.each(function(e) {
            const sId = typeof e.source === 'object' ? e.source.id : e.source;
            const tId = typeof e.target === 'object' ? e.target.id : e.target;
            const el = d3.select(this);
            if (sId === nodeId || tId === nodeId) {
                el.attr('stroke', '#667eea')
                    .attr('stroke-width', 3)
                    .attr('opacity', 1)
                    .attr('marker-end', 'url(#arrowhead-active)');
            } else {
                el.attr('opacity', 0.08);
            }
        });
    }

    function unhighlightNode() {
        if (!_svg) return;
        const nodeElements = _svg.selectAll('.paper-node');
        const links = _svg.selectAll('.connection-line');

        nodeElements.style('opacity', 1)
            .each(function(nd) {
                d3.select(this).select('circle')
                    .attr('stroke', nd.stroke)
                    .attr('stroke-width', nd.importance >= 5 ? 4 : nd.importance >= 4 ? 3 : 2);
            });

        links.each(function(e) {
            const style = EDGE_STYLES[e.type] || EDGE_STYLES.inspires;
            d3.select(this)
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 2)
                .attr('opacity', style.opacity)
                .attr('marker-end', 'url(#arrowhead)');
        });
    }

    function clickNode(nodeId) {
        if (!_svg) return;
        const nodeElements = _svg.selectAll('.paper-node');
        nodeElements.each(function(d) {
            if (d.id === nodeId) {
                if (_config.sidebarDetails) {
                    showSidebarDetails(d);
                } else if (d.paper_id) {
                    window.location.href = 'papers/paper.html?id=' + d.paper_id;
                }
            }
        });
    }

    // Zoom API for external buttons
    function zoomIn() {
        if (!_svg) return;
        const zoomBehavior = _svg.node().__zoom_behavior;
        if (zoomBehavior) {
            _svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
        }
    }

    function zoomOut() {
        if (!_svg) return;
        const zoomBehavior = _svg.node().__zoom_behavior;
        if (zoomBehavior) {
            _svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
        }
    }

    function resetZoom() {
        if (!_svg) return;
        const zoomBehavior = _svg.node().__zoom_behavior;
        if (zoomBehavior) {
            _svg.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity);
        }
    }

    return {
        init,
        highlightNode,
        unhighlightNode,
        clickNode,
        zoomIn,
        zoomOut,
        resetZoom
    };
})();
