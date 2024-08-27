import React from 'react';
import AssemblyProteinsUnit from './AssemblyProteinsUnit';
import './CardDatabaseSearch.css';

const CardAssembly = ({ assembly, noProteinsFound, selectedAssembly, updateSelectedAssembly }) => {

    const ensemblEmpty = Object.keys(assembly.ensembl).length === 0;
    const refseqEmpty = Object.keys(assembly.refseq).length === 0;
    const genbankEmpty = Object.keys(assembly.genbank).length === 0;

    return (
        <div className="card-assembly">
            <div className='card-header'>
                <h3>Assembly</h3>
            </div>
            {ensemblEmpty && refseqEmpty && genbankEmpty && <p>No assembly found</p>}
            <ul>
                {!ensemblEmpty && (
                    <AssemblyProteinsUnit 
                        data={assembly.ensembl} 
                        selectedData={selectedAssembly} 
                        updateSelectedData={updateSelectedAssembly} 
                        label="ENSEMBL" 
                    />
                )}
                {!refseqEmpty && (
                    <AssemblyProteinsUnit 
                        data={assembly.refseq} 
                        selectedData={selectedAssembly} 
                        updateSelectedData={updateSelectedAssembly} 
                        label="RefSeq" 
                    />	
                )}
                {!genbankEmpty && (
                    <AssemblyProteinsUnit 
                        data={assembly.genbank} 
                        selectedData={selectedAssembly} 
                        updateSelectedData={updateSelectedAssembly} 
                        label="Genbank" 
                    />	
                )}
            </ul>
        </div>
    );
};

export default CardAssembly;
