import React from 'react';
import AssemblyProteinsUnit from './AssemblyProteinsUnit';
import './CardDatabaseSearch.css';

const CardProteins = ({ proteins, selectedProteins, updateSelectedProteins }) => {

    const ensemblEmpty = Object.keys(proteins.ensembl).length === 0;
	const uniprotEmpty = Object.keys(proteins.uniprot).length === 0;
    const refseqEmpty = Object.keys(proteins.refseq).length === 0;
    const genbankEmpty = Object.keys(proteins.genbank).length === 0;
    let recommendedProteins = '';
    if (!ensemblEmpty) {
        recommendedProteins = 'ENSEMBL';
	} else if (!uniprotEmpty) {
        recommendedProteins = 'Uniprot';	
    } else if (!refseqEmpty) {
        recommendedProteins = 'RefSeq';
    } else if (!genbankEmpty) {
        recommendedProteins = 'Genbank';
    }

    return (
        <div className="card-proteins">
            <div className='card-header'>
                <h3>Proteins</h3>
            </div>
            {ensemblEmpty && uniprotEmpty && refseqEmpty && genbankEmpty && <p>No proteins found</p>}
            <ul>
                <AssemblyProteinsUnit 
                    isEmpty={ensemblEmpty}
                    data={proteins.ensembl} 
                    selectedData={selectedProteins} 
                    updateSelectedData={updateSelectedProteins} 
                    recommendedData={recommendedProteins} 
                    label="ENSEMBL" 
                />
                <AssemblyProteinsUnit 
                    isEmpty={uniprotEmpty}
                    data={proteins.uniprot} 
                    selectedData={selectedProteins} 
                    updateSelectedData={updateSelectedProteins} 
                    recommendedData={recommendedProteins} 
                    label="UniprotKB" 
                />
                <AssemblyProteinsUnit 
                    isEmpty={refseqEmpty}
                    data={proteins.refseq} 
                    selectedData={selectedProteins} 
                    updateSelectedData={updateSelectedProteins} 
                    recommendedData={recommendedProteins} 
                    label="RefSeq" 
                />	
                <AssemblyProteinsUnit 
                    isEmpty={genbankEmpty}
                    data={proteins.genbank} 
                    selectedData={selectedProteins} 
                    updateSelectedData={updateSelectedProteins} 
                    recommendedData={recommendedProteins} 
                    label="Genbank" 
                />	
            </ul>
        </div>
    );
};

export default CardProteins;
