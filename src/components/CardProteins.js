import React from 'react';
import ProteinsUnit from './ProteinsUnit';
import './CardDatabaseSearch.css';

const CardProteins = ({ proteins, selectedProteins, updateSelectedProteins }) => {

    const ensemblEmpty = !proteins || Object.keys(proteins.ensembl || {}).length === 0;
    const uniprotProteomeEmpty = !proteins || Object.keys(proteins.uniprot_proteomes || []).length === 0;
    const uniprotSwissprotEmpty = !proteins || Object.keys(proteins.uniprot_swissprot || {}).length === 0;
    const uniprotTremblEmpty = !proteins || Object.keys(proteins.uniprot_trembl || {}).length === 0;
    const refseqEmpty = !proteins || Object.keys(proteins.refseq || {}).length === 0;
    const genbankEmpty = !proteins || Object.keys(proteins.genbank || {}).length === 0;
    const sp_label = proteins ? `Swissprot (${proteins.uniprot_swissprot?.count || 0} entries)` : '';
    const tr_label = proteins ? `TrEMBL (${proteins.uniprot_trembl?.count || 0} entries)` : '';

    return (
        <div className="card-proteins">
            <div className='card-header'>
                <h3>Proteins</h3>
            </div>
            {ensemblEmpty && uniprotProteomeEmpty && uniprotSwissprotEmpty && uniprotTremblEmpty && refseqEmpty && genbankEmpty && <p>Loading...</p>}
            <ul>
                {!uniprotSwissprotEmpty && (
                    <ProteinsUnit
                        isEmpty={uniprotSwissprotEmpty}
                        data={proteins.uniprot_swissprot} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label={sp_label}
                    />
                )}
                {!uniprotTremblEmpty && (
                    <ProteinsUnit
                        isEmpty={uniprotTremblEmpty}
                        data={proteins.uniprot_trembl} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label={tr_label}
                    />
                )}
                {!uniprotProteomeEmpty && proteins.uniprot_proteomes.map((proteome, index) => (
                    <ProteinsUnit 
                        key={index}
                        isEmpty={uniprotProteomeEmpty}
                        data={proteome}
                        selectedData={selectedProteins}
                        updateSelectedData={updateSelectedProteins} 
                        label="Uniprot Proteome" 
                    />
                ))}
                {!ensemblEmpty && proteins.ensembl.map((annotation, index) => (
                    <ProteinsUnit 
                        key={index}
                        isEmpty={ensemblEmpty}
                        data={annotation} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label="ENSEMBL" 
                    />
                ))}
                {!refseqEmpty && proteins.refseq.map((annotation, index) => (
                    <ProteinsUnit 
                        key={index}
                        isEmpty={refseqEmpty}
                        data={annotation} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label="NCBI RefSeq" 
                    />
                ))}
                {!genbankEmpty && proteins.genbank.map((annotation, index) => (
                    <ProteinsUnit 
                        key={index}
                        isEmpty={genbankEmpty}
                        data={annotation} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label="NCBI Genbank" 
                    />
                ))}
            </ul>
        </div>
    );
};

export default CardProteins;
