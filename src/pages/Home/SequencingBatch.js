import React from 'react';

const SequencingBatch = ({ batch, handleCheckboxChange, isSelected }) => {
    return (
        <tr className={`sequencing-batch${isSelected ? ' selected' : ''} ${batch.isOptimal ? ' greena' : ''}`}>
            <td>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(batch)}
                />
            </td>
            <td>{batch.scientificName} [TaxID: {batch.taxid}]</td>
            <td>{batch.runs.length} runs</td>
            <td className={batch.optimalSize === 0 ? 'red' : batch.optimalSize === 1 ? 'orange' : 'green'}>
                {Math.round(batch.totalBases / 1e6).toLocaleString()} Mbp
            </td>
            <td className={batch.optimalSize === 0 ? 'red' : batch.optimalSize === 1 ? 'orange' : 'green'}>
                {batch.depth}
            </td>
        </tr>
    );
};

export default SequencingBatch;
