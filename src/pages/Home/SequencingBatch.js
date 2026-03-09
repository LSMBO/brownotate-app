const SequencingBatch = ({ batch, handleCheckboxChange, isSelected }) => {
    return (
        <tr className={`sequencing-batch${isSelected ? ' selected' : ''}`}>
            <td>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(batch)}
                />
            </td>
            <td>{batch.scientificName} [TaxID: {batch.taxid}]</td>
            <td>{batch.runs.length} runs</td>
            <td>
                {Math.round(batch.totalBases / 1e6).toLocaleString()} Mbp
            </td>
            <td>
                {batch.depth.toFixed(1)}
            </td>
        </tr>
    );
};

export default SequencingBatch;
