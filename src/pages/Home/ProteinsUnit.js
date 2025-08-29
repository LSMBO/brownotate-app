import React from 'react';

const ProteinsUnit = ({ data, isSelected, handleCheckboxChange, label }) => {

    return (
        <tr className={`proteins ${isSelected ? 'selected' : ''}`}> 
            <td>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(data)}
                />
            </td>
            <td>{data.scientific_name} [TaxID: {data.taxid}]</td>
            <td className={data.database.toLowerCase()}>{data.database}</td>
            <td>
                <a href={data.url} target="_blank" rel="noopener noreferrer">{label}</a>
            </td>
        </tr>
    );
};

export default ProteinsUnit;