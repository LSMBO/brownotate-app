import React from 'react';
import AssemblyProteinsUnit from './AssemblyProteinsUnit';
import './CardDatabaseSearch.css';

const CardAssembly = ({ assembly, noProteinsFound, selectedAssembly, updateSelectedAssembly }) => {

    const ensemblEmpty = Object.keys(assembly.ensembl).length === 0;
    const refseqEmpty = Object.keys(assembly.refseq).length === 0;
    const genbankEmpty = Object.keys(assembly.genbank).length === 0;
    let recommendedAssembly = '';
    if (noProteinsFound && !ensemblEmpty) {
        recommendedAssembly = 'ENSEMBL';
    } else if (noProteinsFound && !refseqEmpty) {
        recommendedAssembly = 'RefSeq';
    } else if (noProteinsFound && !genbankEmpty) {
        recommendedAssembly = 'Genbank';
    }

    return (
        <div className="card-assembly">
            <div className='card-header'>
                <h3>Assembly</h3>
            </div>
            {ensemblEmpty && refseqEmpty && genbankEmpty && <p>No assembly found</p>}
            <ul>
                <AssemblyProteinsUnit 
                    isEmpty={ensemblEmpty}
                    data={assembly.ensembl} 
                    selectedData={selectedAssembly} 
                    updateSelectedData={updateSelectedAssembly} 
                    recommendedData={recommendedAssembly} 
                    label="ENSEMBL" 
                />
                <AssemblyProteinsUnit 
                    isEmpty={refseqEmpty}
                    data={assembly.refseq} 
                    selectedData={selectedAssembly} 
                    updateSelectedData={updateSelectedAssembly} 
                    recommendedData={recommendedAssembly} 
                    label="RefSeq" 
                />	
                <AssemblyProteinsUnit 
                    isEmpty={genbankEmpty}
                    data={assembly.genbank} 
                    selectedData={selectedAssembly} 
                    updateSelectedData={updateSelectedAssembly} 
                    recommendedData={recommendedAssembly} 
                    label="Genbank" 
                />	
            </ul>
        </div>
    );
};

export default CardAssembly;
