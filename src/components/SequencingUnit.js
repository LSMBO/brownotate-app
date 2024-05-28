import React from 'react';
import './CardDatabaseSearch.css';

const SequencingUnit = ({ run, handleCheckboxChange, convertBaseInSize, isSelected }) => {
    return (
        <div className='sequencing-unit'>
            <input
                type="checkbox"
                value={run.accession}
                checked={isSelected}
                onChange={() => handleCheckboxChange(run.accession)}
            />
			<div className={`infos ${isSelected ? 'selected' : ''}`}>
                <a href={`https://www.ncbi.nlm.nih.gov/sra/?term=${run.accession}`} target='_blank' rel="noopener noreferrer">
                    <p>{run.accession} (≈{convertBaseInSize(run.totalBases)})</p>
                </a>    
                <p>{run.platform} {run.library_type}-end</p>
                <p>{run.scientific_name}</p>
			</div>
        </div>
    );
};

export default SequencingUnit;
