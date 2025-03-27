import React from 'react';
import AssemblyUnit from './AssemblyUnit';
import './CardDatabaseSearch.css';

const CardAssembly = ({ assembly, noProteinsFound, selectedAssembly, updateSelectedAssembly }) => {

    const ensemblEmpty = !assembly || Object.keys(assembly.ensembl).length === 0;
    const refseqEmpty = !assembly || Object.keys(assembly.refseq).length === 0;
    const genbankEmpty = !assembly || Object.keys(assembly.genbank).length === 0;

    return (
        <div className="card-assembly">
            <div className='card-header'>
                <h3>Assembly</h3>
            </div>
            {ensemblEmpty && refseqEmpty && genbankEmpty && <p>Loading...</p>}
            <ul>
                {!ensemblEmpty && assembly.ensembl.map((ass, index) => (
                    <AssemblyUnit 
                        key={index}
                        data={ass} 
                        selectedData={selectedAssembly} 
                        updateSelectedData={updateSelectedAssembly} 
                        label="ENSEMBL" 
                    />
                ))}
                {!refseqEmpty && assembly.refseq.map((ass, index) => (
                    <AssemblyUnit 
                        key={index}
                        data={ass} 
                        selectedData={selectedAssembly} 
                        updateSelectedData={updateSelectedAssembly} 
                        label="NCBI RefSeq" 
                    />	
                ))}
                {!genbankEmpty && assembly.genbank.map((ass, index) => (
                    <AssemblyUnit 
                        key={index}
                        data={ass} 
                        selectedData={selectedAssembly} 
                        updateSelectedData={updateSelectedAssembly} 
                        label="NCBI Genbank" 
                    />	
                ))}
            </ul>
        </div>
    );
};

export default CardAssembly;
