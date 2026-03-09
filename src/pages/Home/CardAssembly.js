import { useState } from 'react';
import AssemblyUnit from './AssemblyUnit';
import './DBSTabs.css';
import { useNavigate } from "react-router-dom";


const CardAssembly = ({ dbs, dbsOptions, availableSources, selectedAssembly, updateSelectedAssembly, dbSearchInProgress }) => {
    const [selectedDBs, setSelectedDBs] = useState(['']);
    const navigate = useNavigate();

    const ensemblAssemblies = dbs?.ensembl?.assemblies || [];
    const refseqAssemblies = dbs?.refseq?.assemblies || [];
    const genbankAssemblies = dbs?.genbank?.assemblies || [];

    // Check if source is available (completed or from cache)
    const ensemblAvailable = availableSources?.ensembl !== false;
    const refseqAvailable = availableSources?.refseq !== false;
    const genbankAvailable = availableSources?.genbank !== false;

    // Check if data exists (has assemblies)
    const hasEnsemblData = ensemblAssemblies && ensemblAssemblies.length > 0;
    const hasRefseqData = refseqAssemblies && refseqAssemblies.length > 0;
    const hasGenbankData = genbankAssemblies && genbankAssemblies.length > 0;

    const toggleDB = (e, dbName, isAvailable, hasData) => {
        e.preventDefault();
        if (!isAvailable || !hasData) return; // Can't toggle if not available or no data
        
        setSelectedDBs(prev => {
            if (prev.includes(dbName)) {
                return prev.filter(db => db !== dbName);
            } else {
                return [...prev, dbName];
            }
        });
    };

    // Collect all assemblies to display based on selected DBs
    const allAssemblies = [];
    
    if (selectedDBs.includes('Ensembl')) {
        ensemblAssemblies.forEach(ass => {
            allAssemblies.push({ data: ass, label: ass.accession });
        });
    }
    
    if (selectedDBs.includes('RefSeq')) {
        refseqAssemblies.forEach(ass => {
            allAssemblies.push({ data: ass, label: `RefSeq: ${ass.accession}` });
        });
    }
    
    if (selectedDBs.includes('Genbank')) {
        genbankAssemblies.forEach(ass => {
            allAssemblies.push({ data: ass, label: `Genbank: ${ass.accession}` });
        });
    }

    return (
        <div className="dbs-subtabs-container">
            <div className="dbs-subtabs-header">
                <div 
                    className={`btn-tab-style ${selectedDBs.includes('Ensembl') ? 'active' : ''} ${!ensemblAvailable || !hasEnsemblData ? 'disabled' : ''}`}
                    onClick={(e) => toggleDB(e, 'Ensembl', ensemblAvailable, hasEnsemblData)}
                >
                    Ensembl
                </div>
                <div 
                    className={`btn-tab-style ${selectedDBs.includes('RefSeq') ? 'active' : ''} ${!refseqAvailable || !hasRefseqData ? 'disabled' : ''}`}
                    onClick={(e) => toggleDB(e, 'RefSeq', refseqAvailable, hasRefseqData)}
                >
                    RefSeq
                </div>
                <div 
                    className={`btn-tab-style ${selectedDBs.includes('Genbank') ? 'active' : ''} ${!genbankAvailable || !hasGenbankData ? 'disabled' : ''}`}
                    onClick={(e) => toggleDB(e, 'Genbank', genbankAvailable, hasGenbankData)}
                >
                    GenBank
                </div>
            </div>

            <div className="dbs-subtab-content">
                {allAssemblies.length > 0 ? (
                    <>
                        <table className="dbs-results-table">
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
                                {allAssemblies.map((item, index) => (
                                    <AssemblyUnit 
                                        key={index}
                                        data={item.data} 
                                        isSelected={selectedAssembly && selectedAssembly.accession === item.data.accession} 
                                        handleCheckboxChange={updateSelectedAssembly} 
                                        label={item.label}
                                    />
                                ))}
                            </tbody>
                        </table>
                        <button 
                            className="t2_bold btn-tab-style" 
                            disabled={!selectedAssembly || selectedAssembly.length===0} 
                            onClick={() => {
                                if (dbSearchInProgress) {
                                    alert('The database search is still in progress, please try again once it is completed.');
                                } else {
                                    navigate('/settings')
                                }
                            }}>
                            Create an annotation using the selected assembly dataset
                        </button>
                    </>
                ) : (
                    <p>Please select at least one database</p>
                )}
            </div>
        </div>
    );
};

export default CardAssembly;