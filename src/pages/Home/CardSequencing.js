import React from 'react';
import SequencingBatch from './SequencingBatch';
import SequencingDetails from '../../components/SequencingDetails';
import { useNavigate } from "react-router-dom";

const CardSequencing = ({ dnaseq, selectedSequencingBatch, updateSelectedSequencingBatch }) => {

    const navigate = useNavigate();

    return (
        <div className="sequencing-container">                    
            <div className='batch-container'>
                <div className='batch-headers'>
                    <h4>Sequencing Datasets</h4>
                    {dnaseq && dnaseq.batches && dnaseq.batches[0] && dnaseq.batches[0].assemblyExpectedSize && (
                        <div className='batch-expected-size'>
                        <p>
                            The average genome size for your taxonomy is 
                            approximately <b> {Math.round(dnaseq.batches[0].assemblyExpectedSize / 1e6).toLocaleString()} Mbp </b>(Average genome size based on one 
                            NCBI assembly per species among the {dnaseq.batches[0].assemblyExpectedSizeStats.count} species of the 
                            group {dnaseq.batches[0].assemblyExpectedSizeStats.scientific_name}).
                        </p>
                        <p>
                            <b>Optimal sequencing dataset</b> for a full genome assembly should have a sequencing depth around <b>~50-80</b>, which mean between&nbsp; 
                            <b>{Math.round(dnaseq.batches[0].lowerBound / 1e6).toLocaleString()} Mbp</b>
                            &nbsp;and <b>{Math.round(dnaseq.batches[0].upperBound / 1e6).toLocaleString()} Mbp</b> for this taxonomy. See "<b>Step 3 – Sequencing Datasets (NCBI SRA)</b>" for more details.
                        </p>                      
                        </div>
                    )}
                    <table className="sequencing-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Taxonomy</th>
                                <th>Run Count</th>
                                <th>Total Bases (Mbp)</th>
                                <th>Sequencing Depth</th>
                            </tr>
                        </thead>
                        <tbody>                  
                            {dnaseq && dnaseq.batches.map((batch, index) => (
                                <SequencingBatch
                                    key={index}
                                    batch={batch}
                                    handleCheckboxChange={() => updateSelectedSequencingBatch(batch)}
                                    isSelected={selectedSequencingBatch && selectedSequencingBatch.identifier === batch.identifier}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='batch-infos'>
                    <h4>Run Details</h4>
                    {selectedSequencingBatch && selectedSequencingBatch.runs && selectedSequencingBatch.runs.length > 0 && (
                        <SequencingDetails runs={selectedSequencingBatch.runs} displaySpecies={false} />
                    )}
                </div>
            </div>
            <button 
                className="t2_bold" 
                disabled={!selectedSequencingBatch || Object.keys(selectedSequencingBatch).length === 0} 
                onClick={() => navigate('/settings')}>
                Create an annotation using the selected sequencing dataset
            </button>
        </div>
    );
}
export default CardSequencing;
