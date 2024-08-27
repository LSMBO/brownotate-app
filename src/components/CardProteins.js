import React from 'react';
import AssemblyProteinsUnit from './AssemblyProteinsUnit';
import './CardDatabaseSearch.css';

const CardProteins = ({ proteins, selectedProteins, updateSelectedProteins }) => {

    const ensemblEmpty = Object.keys(proteins.ensembl).length === 0;
	const uniprotProteomeEmpty = Object.keys(proteins.uniprot_proteome).length === 0;
    const uniprotSwissprotEmpty = Object.keys(proteins.uniprot_swissprot).length === 0;
    const uniprotTremblEmpty = Object.keys(proteins.uniprot_trembl).length === 0;
    const refseqEmpty = Object.keys(proteins.refseq).length === 0;
    const genbankEmpty = Object.keys(proteins.genbank).length === 0;
    const sp_label = `Swissprot (${proteins.uniprot_swissprot.count} entries)`;
    const tr_label = `TrEMBL (${proteins.uniprot_trembl.count} entries)`;

    return (
        <div className="card-proteins">
            <div className='card-header'>
                <h3>Proteins</h3>
            </div>
            {ensemblEmpty && uniprotProteomeEmpty && uniprotSwissprotEmpty && uniprotTremblEmpty && refseqEmpty && genbankEmpty && <p>No proteins found</p>}
            <ul>
                {!uniprotSwissprotEmpty && (
                    <AssemblyProteinsUnit
                        isEmpty={uniprotSwissprotEmpty}
                        data={proteins.uniprot_swissprot} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label={sp_label}
                    />
                )}
                {!uniprotTremblEmpty && (
                    <AssemblyProteinsUnit
                        isEmpty={uniprotTremblEmpty}
                        data={proteins.uniprot_trembl} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label={tr_label}
                    />
                )}
                {!uniprotProteomeEmpty && (
                    <AssemblyProteinsUnit 
                        isEmpty={uniprotProteomeEmpty}
                        data={proteins.uniprot_proteome} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label="Uniprot Proteome" 
                    />	
                )}
                {!ensemblEmpty && (
                    <AssemblyProteinsUnit 
                        isEmpty={ensemblEmpty}
                        data={proteins.ensembl} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label="ENSEMBL" 
                    />
                )}
                {!refseqEmpty && (
                    <AssemblyProteinsUnit 
                        isEmpty={refseqEmpty}
                        data={proteins.refseq} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label="RefSeq" 
                    />	
                )}
                {!genbankEmpty && (
                    <AssemblyProteinsUnit 
                        isEmpty={genbankEmpty}
                        data={proteins.genbank} 
                        selectedData={selectedProteins} 
                        updateSelectedData={updateSelectedProteins} 
                        label="Genbank" 
                    />
                )}
            </ul>
        </div>
    );
};

export default CardProteins;
