import React from 'react';
import ProteinsUnit from './ProteinsUnit';

const CardProteins = ({ proteins, selectedProteins, updateSelectedProteins, convertForDownload }) => {

    const ensemblEmpty = !proteins || Object.keys(proteins.ensembl || {}).length === 0;
    const uniprotProteomeEmpty = !proteins || Object.keys(proteins.uniprot_proteomes || []).length === 0;
    const uniprotSwissprotEmpty = !proteins || Object.keys(proteins.uniprot_swissprot || {}).length === 0;
    const uniprotTremblEmpty = !proteins || Object.keys(proteins.uniprot_trembl || {}).length === 0;
    const refseqEmpty = !proteins || Object.keys(proteins.refseq || {}).length === 0;
    const genbankEmpty = !proteins || Object.keys(proteins.genbank || {}).length === 0;
    const sp_label = proteins ? `Swissprot (${proteins.uniprot_swissprot?.count || 0} entries)` : '';
    const tr_label = proteins ? `TrEMBL (${proteins.uniprot_trembl?.count || 0} entries)` : '';

    return (
        <div>
            {ensemblEmpty && uniprotProteomeEmpty && uniprotSwissprotEmpty && uniprotTremblEmpty && refseqEmpty && genbankEmpty && <p>Loading...</p>}
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Taxonomy</th>
                        <th>Database</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {!uniprotSwissprotEmpty && (
                        <ProteinsUnit
                            data={proteins.uniprot_swissprot} 
                            isSelected={selectedProteins && selectedProteins.some(p => p.accession === proteins.uniprot_swissprot.accession)}
                            handleCheckboxChange={updateSelectedProteins} 
                            label={sp_label}
                        />
                    )}
                    {!uniprotTremblEmpty && (
                        <ProteinsUnit
                            data={proteins.uniprot_trembl} 
                            isSelected={selectedProteins && selectedProteins.some(p => p.accession === proteins.uniprot_trembl.accession)}
                            handleCheckboxChange={updateSelectedProteins} 
                            label={tr_label}
                        />
                    )}
                    {!uniprotProteomeEmpty && proteins.uniprot_proteomes.map((proteome, index) => (
                        <ProteinsUnit 
                            key={index}
                            data={proteome}
                            isSelected={selectedProteins && selectedProteins.some(p => p.accession === proteome.accession)}
                            handleCheckboxChange={updateSelectedProteins} 
                            label={`Uniprot Proteome: ${proteome.accession}`}
                        />
                    ))}
                    {!ensemblEmpty && proteins.ensembl.map((annotation, index) => (
                        <ProteinsUnit 
                            key={index}
                            data={annotation} 
                            isSelected={selectedProteins && selectedProteins.some(p => p.accession === annotation.accession)}
                            handleCheckboxChange={updateSelectedProteins} 
                            label={annotation.accession}
                        />
                    ))}
                    {!refseqEmpty && proteins.refseq.map((annotation, index) => (
                        <ProteinsUnit 
                            key={index}
                            data={annotation} 
                            isSelected={selectedProteins && selectedProteins.some(p => p.accession === annotation.accession)}
                            handleCheckboxChange={updateSelectedProteins} 
                            label={`RefSeq: ${annotation.accession}`}
                        />
                    ))}
                    {!genbankEmpty && proteins.genbank.map((annotation, index) => (
                        <ProteinsUnit 
                            key={index}
                            data={annotation} 
                            isSelected={selectedProteins && selectedProteins.some(p => p.accession === annotation.accession)}
                            handleCheckboxChange={updateSelectedProteins} 
                            label={`Genbank: ${annotation.accession}`}
                        />
                    ))}
                </tbody>
            </table>
            <button 
                className="t2_bold" 
                disabled={!selectedProteins || selectedProteins.length === 0} 
                onClick={() => convertForDownload(selectedProteins)}>
                Download (merge if many selected)
            </button>
        </div>
    );
};

export default CardProteins;
