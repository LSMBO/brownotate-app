import { useState } from 'react';
import './CardPhylogeny.css';
import DBSLoading from './DBSLoading';

const SOURCES = {
    uniprot_swissprot:  { label: 'UniProt SwissProt', color: '#8e44ad' },
    uniprot_trembl:     { label: 'UniProt trEMBL',     color: '#9b59b6' },
    uniprot_proteome:   { label: 'UniProt proteomes',   color: '#c39bd3' },
    ensembl_proteins:   { label: 'Ensembl proteins',   color: '#e74c3c' },
    ensembl_assemblies: { label: 'Ensembl assemblies', color: '#c0392b' },
    refseq_proteins:    { label: 'RefSeq proteins',    color: '#3498db' },
    refseq_assemblies:  { label: 'RefSeq assemblies',  color: '#2471a3' },
    genbank_proteins:   { label: 'GenBank proteins',   color: '#f39c12' },
    genbank_assemblies: { label: 'GenBank assemblies', color: '#d68910' },
    dnaseq:             { label: 'SRA DNA Sequencing',        color: '#27ae60' },
    rnaseq:             { label: 'SRA RNA Sequencing',        color: '#58d68d' },
};

const CardPhylogeny = ({ phylogeny }) => {
    const [visible, setVisible] = useState(
        Object.fromEntries(Object.keys(SOURCES).map(k => [k, true]))
    );
    const [selectedNode, setSelectedNode] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    if (!phylogeny) return <DBSLoading />;

    const { mainLineage, nodes } = phylogeny;
    const N = mainLineage.length;

    // Filter entries by visible sources and group by taxid
    const filteredNodes = {};
    for (let i = 0; i < N; i++) {
        const nodeEntries = nodes[i] || [];
        const grouped = {};
        
        for (const entry of nodeEntries) {
            if (visible[entry.source]) {
                if (!grouped[entry.taxid]) {
                    grouped[entry.taxid] = {
                        taxid: entry.taxid,
                        scientificName: entry.scientificName,
                        rank: entry.rank,
                        sources: []
                    };
                }
                grouped[entry.taxid].sources.push(entry.source);
            }
        }
        
        filteredNodes[i] = Object.values(grouped);
    }

    // Count per node
    const counts = {};
    for (let i = 0; i < N; i++) {
        counts[i] = filteredNodes[i].length;
    }

    // SVG layout — horizontal timeline
    const margin = 60;
    const parentWidth = 800;
    const svgW = parentWidth;
    const svgH = 120;

    const mx = i => margin + (i / Math.max(1, N - 1)) * (svgW - 2 * margin);

    const handleNodeClick = (i) => {
        setSelectedNode(i === selectedNode ? null : i);
    };

    return (
        <div className="phylogeny-container">
            {/* Source filter checkboxes */}
            <div className="phylogeny-filters">
                {Object.entries(SOURCES).map(([key, { label, color }]) => (
                    <label key={key} className="phylogeny-filter-item">
                        <input
                            type="checkbox"
                            checked={visible[key]}
                            onChange={() => setVisible(p => ({ ...p, [key]: !p[key] }))}
                        />
                        <span style={{ color }}>{label}</span>
                    </label>
                ))}
            </div>

            {/* Two-column layout */}
            <div className="phylogeny-main">
                {/* Left panel: species details */}
                {selectedNode !== null && counts[selectedNode] > 0 && (
                    <div className="phylogeny-details-panel">
                        <div className="phylogeny-details-header">
                            <strong>{mainLineage[selectedNode].scientificName} <i>({mainLineage[selectedNode].rank})</i></strong>
                        </div>
                        <div className="phylogeny-details-count">
                            {counts[selectedNode]} {counts[selectedNode] === 1 ? 'species' : 'species'} found
                        </div>
                        <div className="phylogeny-species-list">
                            {[...filteredNodes[selectedNode]]
                                .sort((a, b) => a.scientificName.localeCompare(b.scientificName))
                                .map((sp, idx) => (
                                    <div key={idx} className="phylogeny-species-item">
                                        <div className="phylogeny-species-name">
                                            {sp.scientificName} [TaxID: {sp.taxid}]
                                            {sp.rank && <span className="phylogeny-species-rank"> ({sp.rank})</span>}
                                        </div>
                                        <div className="phylogeny-species-source">
                                            {sp.sources.map((src, sidx) => (
                                                <span
                                                    key={sidx}
                                                    className="phylogeny-source-tag"
                                                    style={{ color: SOURCES[src]?.color || '#888' }}
                                                >
                                                    {SOURCES[src]?.label || src}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Right panel: SVG tree */}
                <div className="phylogeny-svg-wrapper">
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" height={svgH} preserveAspectRatio="none">
                        {/* Horizontal line */}
                        <line x1={margin} y1={svgH / 2} x2={svgW - margin} y2={svgH / 2}
                            stroke="#2c3e50" strokeWidth={1} vectorEffect="non-scaling-stroke" />

                        {/* Nodes */}
                        {mainLineage.map((node, i) => {
                            const count = counts[i];
                            const hasResults = count > 0;
                            const isSelected = i === selectedNode;
                            const isHovered = i === hoveredNode;
                            const baseR = hasResults ? 8 : 5;
                            const r = isHovered ? baseR + 3 : baseR;
                            const fill = isSelected
                                ? '#8e44ad'
                                : (isHovered && hasResults ? '#1a5276' : (hasResults ? '#3498db' : '#bdc3c7'));
                            const x = mx(i);
                            const y = svgH / 2;

                            return (
                                <g key={i}>
                                    <circle
                                        cx={x} cy={y} r={r}
                                        stroke="#a0aab4"
                                        strokeWidth={1}
                                        vectorEffect="non-scaling-stroke"
                                        style={{
                                            fill,
                                            cursor: hasResults ? 'pointer' : 'default',
                                            transition: 'fill 0.25s ease, r 0.2s ease',
                                        }}
                                        onClick={() => hasResults && handleNodeClick(i)}
                                        onMouseEnter={() => setHoveredNode(i)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                    />
                                    {hasResults && count > 0 && (
                                        <text
                                            x={x}
                                            y={y - 16}
                                            fontSize="12"
                                            fontWeight="600"
                                            fill="#2c3e50"
                                            textAnchor="middle"
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                            onClick={() => handleNodeClick(i)}
                                        >
                                            {count}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Node labels on hover */}
                    {hoveredNode !== null && (
                        <div className="phylogeny-hover-label">
                            {mainLineage[hoveredNode].scientificName}
                            {mainLineage[hoveredNode].rank && ` (${mainLineage[hoveredNode].rank})`}
                            {counts[hoveredNode] > 0 && ` — ${counts[hoveredNode]} results`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CardPhylogeny;