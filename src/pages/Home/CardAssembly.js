import React from 'react';
import AssemblyUnit from './AssemblyUnit';
import { useNavigate } from "react-router-dom";


const CardAssembly = ({ assembly, selectedAssembly, updateSelectedAssembly }) => {

    const navigate = useNavigate();
    const ensemblEmpty = !assembly || Object.keys(assembly.ensembl).length === 0;
    const refseqEmpty = !assembly || Object.keys(assembly.refseq).length === 0;
    const genbankEmpty = !assembly || Object.keys(assembly.genbank).length === 0;

    return (
        <div>
            {ensemblEmpty && refseqEmpty && genbankEmpty && <p>Loading...</p>}
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Taxonomy</th>
                        <th>Database</th>
                        <th>Level</th>
                        <th>Length (Mbp)</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {!ensemblEmpty && assembly.ensembl.map((ass, index) => (
                        <AssemblyUnit 
                            key={index}
                            data={ass} 
                            isSelected={selectedAssembly && selectedAssembly.accession === ass.accession} 
                            handleCheckboxChange={updateSelectedAssembly} 
                            label={ass.accession}
                        />
                    ))}
                    {!refseqEmpty && assembly.refseq.map((ass, index) => (
                        <AssemblyUnit 
                            key={index}
                            data={ass} 
                            isSelected={selectedAssembly && selectedAssembly.accession === ass.accession} 
                            handleCheckboxChange={updateSelectedAssembly} 
                            label={`RefSeq: ${ass.accession}`}
                        />	
                    ))}
                    {!genbankEmpty && assembly.genbank.map((ass, index) => (
                        <AssemblyUnit 
                            key={index}
                            data={ass} 
                            isSelected={selectedAssembly && selectedAssembly.accession === ass.accession} 
                            handleCheckboxChange={updateSelectedAssembly} 
                            label={`Genbank: ${ass.accession}`}
                        />	
                    ))}
                </tbody>
            </table>
            <button 
                className="t2_bold" 
                disabled={!selectedAssembly || selectedAssembly.length===0} 
                onClick={() => navigate('/settings')}>
                Create an annotation using the selected assembly dataset
            </button>
        </div>
    );
};

export default CardAssembly;
