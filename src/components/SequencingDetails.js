import React from 'react'
import { useParameters } from '../contexts/ParametersContext';

const SequencingDetails = ({runs, displaySpecies}) => {
        
    const { parameters, updateParameters } = useParameters();
    
    const handleRemoveRun = (accession) => {
        const newSequencingRunList = parameters.startSection.sequencingRunList.filter(run => run.accession !== accession);
        updateParameters({startSection: {sequencingRunList: newSequencingRunList}})
    };
    
    return (
        <ul>
            {runs.map((run, index) => (
                <div key={index} className="run-infos" style={{position: 'relative'}}>
                    {displaySpecies && (
                        <button 
                            className="delete-btn remove-run-btn"
                            onClick={() => handleRemoveRun(run.accession)}
                            title={`Remove ${run.accession}`}
                        >
                            X
                        </button>
                    )}
                    <div className="run-unit">
                        <label>Accession:&nbsp;</label>
                        <a
                            href={`https://www.ncbi.nlm.nih.gov/sra/?term=${run.accession}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {run.accession} (≈{Math.round(run.size)} Gb)
                        </a>
                    </div>
                    <div className='run-unit'>
                        <label>Total Bases (Mbp)</label>
                        <p>{Math.round(run.totalBases / 1e6).toLocaleString()} Mbp</p>
                    </div>
                    <div className="run-unit">
                        <label>Platform:&nbsp;</label>
                        <p className={!run.optimalPlatform ? "non-opti" : "green"}>{run.platform} ({run.experimentInstrumentModel})</p>
                    </div>
                    <div className="run-unit">
                        <label>Layout:&nbsp;</label>
                        <p>{run.layout}</p>
                    </div>
                    <div className="run-unit">
                        <label>Strategy:&nbsp;</label>
                        <p className={!run.optimalStrategy ? "non-opti" : "green"}>{run.strategy}</p>
                    </div>
                    <div className="run-unit">
                        <label>Selection:&nbsp;</label>
                        <p className={!run.optimalSelection ? "non-opti" : "green"}>{run.selection}</p>
                    </div>
                    {displaySpecies && (
                        <div className="run-unit">
                            <label>Species:&nbsp;</label>
                            <p>{run.scientificName}</p>
                        </div>
                    )}
                    {displaySpecies && parameters.species.scientificName !== run.scientificName && (
                        <div className="run-unit">
                            <label></label>
                            <p className='non-opti'><i>Warning: The sequenced organism differs from {parameters.species.scientificName}</i></p>
                        </div>
                    )}
                </div>
            ))}
        </ul>
    );
}

export default SequencingDetails