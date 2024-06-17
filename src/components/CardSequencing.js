import React, { useEffect } from 'react';
import './CardDatabaseSearch.css';
import SequencingUnit from './SequencingUnit';

const CardSequencing = ({ dnaseq, noAssemblyFound, noProteinsFound, selectedSequencing, updateSelectedSequencing, sequencingSize, setSequencingSize }) => {

    const base_size_conversion_factor = {
        'large': 0.000000000344,
        'low': 0.000000000224
    };

    const convertBaseInSize = (bases) => {
        let size = 0
        if (bases > 50000000000) {
            size = bases * base_size_conversion_factor['large'];
        } else {
            size = bases * base_size_conversion_factor['low'];
        }
        return `${Math.round(size * 10) / 10}Gb`;
    }

    const handleCheckboxChange = (runAccession) => {
        // Update the list
        let updatedSequencingList = [];
        if (selectedSequencing.includes(runAccession)) {
            updatedSequencingList = selectedSequencing.filter(run => run !== runAccession);
        } 
        else {
            updatedSequencingList = [...selectedSequencing, runAccession];
        }
        updateSelectedSequencing(updatedSequencingList);
        
        // Recalculate the size
        const total = updatedSequencingList.reduce((acc, accession) => {
            const selectedRun = dnaseq.runs.find(run => run.accession === accession);
            if (selectedRun) {
                return acc + parseInt(selectedRun.totalBases, 10);
            }
            return acc;
        }, 0);
        setSequencingSize(convertBaseInSize(total));
    };

    return (
        <div className="card-sequencing">
            <div className='card-header'>
                <h3>Sequencing</h3>
            </div>
            <ul>
                {dnaseq.runs.map((run, index) => (
                    <SequencingUnit
                        key={index}
                        run={run}
                        handleCheckboxChange={handleCheckboxChange}
                        convertBaseInSize={convertBaseInSize}
                        isSelected={selectedSequencing.includes(run.accession)}
                    />
                ))}
            </ul>
            <div className='card-footer'>
                <label className='centered'>{selectedSequencing.length} selected</label>
                <label className='centered'>(Estimated size ~{sequencingSize})</label>
            </div>
        </div>
    );
};

export default CardSequencing;
