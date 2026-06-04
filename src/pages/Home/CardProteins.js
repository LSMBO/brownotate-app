import { useState } from 'react';
import ProteinsUnit from './ProteinsUnit';
import './DBSTabs.css';

const CardProteins = ({ dbs, availableSources, selectedProteins, updateSelectedProteins, convertForDownload }) => {
    const [selectedDBs, setSelectedDBs] = useState(['']);

    const getProteinSelectionKey = (protein) => [
        protein?.database || '',
        protein?.accession || '',
        protein?.taxid || '',
        protein?.download_url || '',
        Array.isArray(protein?.download_command) ? protein.download_command.join(' ') : ''
    ].join('|');

    const uniprotProteome = dbs?.uniprot?.proteome || [];
    const ensembl = dbs?.ensembl?.proteins || [];
    const refseq = dbs?.refseq?.proteins || [];
    const genbank = dbs?.genbank?.proteins || [];
    const uniprotSwissprot = dbs?.uniprot?.swissprot;
    const uniprotTrembl = dbs?.uniprot?.trembl;

    // Check if source is available (completed or from cache)
    const ensemblAvailable = availableSources?.ensembl !== false;
    const refseqAvailable = availableSources?.refseq  !== false;
    const genbankAvailable = availableSources?.genbank !== false;

    // Check if data exists (has proteins)
    const hasEnsemblData = ensembl && ensembl.length > 0;
    const hasRefseqData = refseq && refseq.length > 0;
    const hasGenbankData = genbank && genbank.length > 0;

    const sp_label = uniprotSwissprot ? `Swissprot (${uniprotSwissprot?.count || 0} entries)` : '';
    const tr_label = uniprotTrembl ? `TrEMBL (${uniprotTrembl?.count || 0} entries)` : '';

    const toggleDB = (e, dbName, isAvailable) => {
        e.preventDefault();
        if (!isAvailable) return;

        const target = e.currentTarget;
        if (!target || typeof target.getBoundingClientRect !== 'function') {
            return;
        }
        const beforeTop = target.getBoundingClientRect().top;
        setSelectedDBs(prev => {
            if (prev.includes(dbName)) {
                return prev.filter(db => db !== dbName);
            } else {
                return [...prev, dbName];
            }
        });
        requestAnimationFrame(() => {
            if (!target.isConnected || typeof target.getBoundingClientRect !== 'function') {
                return;
            }
            const afterTop = target.getBoundingClientRect().top;
            window.scrollBy(0, afterTop - beforeTop);
        });
    };

    // Collect all proteins to display based on selected DBs
    const allProteins = [];
    
    if (selectedDBs.includes('UniprotKB')) {
        if (uniprotSwissprot) {
            allProteins.push({ data: uniprotSwissprot, label: sp_label });
        }
        if (uniprotTrembl) {
            allProteins.push({ data: uniprotTrembl, label: tr_label });
        }
        uniprotProteome.forEach(proteome => {
            allProteins.push({ data: proteome, label: `Uniprot Proteome: ${proteome.accession}` });
        });
    }
    
    if (selectedDBs.includes('Ensembl')) {
        ensembl.forEach(annotation => {
            allProteins.push({ data: annotation, label: annotation.accession });
        });
    }
    
    if (selectedDBs.includes('RefSeq')) {
        refseq.forEach(annotation => {
            allProteins.push({ data: annotation, label: `RefSeq: ${annotation.accession}` });
        });
    }
    
    if (selectedDBs.includes('Genbank')) {
        genbank.forEach(annotation => {
            allProteins.push({ data: annotation, label: `Genbank: ${annotation.accession}` });
        });
    }

    return (
        <div>
            <div className="dbs-subtabs-header">
                <div 
                    className={`btn-tab-style ${selectedDBs.includes('UniprotKB') ? 'active' : ''} ${!(uniprotSwissprot || uniprotTrembl) ? 'disabled' : ''}`}
                    onClick={(e) => toggleDB(e, 'UniprotKB', true)}
                >
                    UniprotKB
                </div>
                <div 
                    className={`btn-tab-style ${selectedDBs.includes('Ensembl') ? 'active' : ''} ${!ensemblAvailable || !hasEnsemblData ? 'disabled' : ''}`}
                    onClick={(e) => toggleDB(e, 'Ensembl', ensemblAvailable)}
                >
                    Ensembl
                </div>
                <div 
                    className={`btn-tab-style ${selectedDBs.includes('RefSeq') ? 'active' : ''} ${!refseqAvailable || !hasRefseqData ? 'disabled' : ''}`}
                    onClick={(e) => toggleDB(e, 'RefSeq', refseqAvailable)}
                >
                    RefSeq
                </div>
                <div 
                    className={`btn-tab-style ${selectedDBs.includes('Genbank') ? 'active' : ''} ${!genbankAvailable || !hasGenbankData ? 'disabled' : ''}`}
                    onClick={(e) => toggleDB(e, 'Genbank', genbankAvailable)}
                >
                    GenBank
                </div>
            </div>

            <div className="dbs-subtab-content">
                {allProteins.length > 0 ? (
                    <>
                        <table className="dbs-results-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Taxonomy</th>
                                    <th>Database</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProteins.map((item, index) => (
                                    <ProteinsUnit 
                                        key={index}
                                        data={item.data}
                                        isSelected={selectedProteins && selectedProteins.some(p => getProteinSelectionKey(p) === getProteinSelectionKey(item.data))}
                                        handleCheckboxChange={updateSelectedProteins} 
                                        label={item.label}
                                    />
                                ))}
                            </tbody>
                        </table>
                        <button 
                            className="t2_bold btn-tab-style" 
                            disabled={!selectedProteins || selectedProteins.length === 0} 
                            onClick={() => convertForDownload(selectedProteins)}>
                            Download (merge if many selected)
                        </button>
                    </>
                ) : (
                    <p>Please select at least one database</p>
                )}
            </div>
        </div>
    );
};

export default CardProteins;
