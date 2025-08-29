import React from 'react';

const AssemblyUnit = ({ data, isSelected, handleCheckboxChange, label }) => {
    return (
        <tr className={`assemblies ${isSelected ? 'selected' : ''}`}> 
            <td>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(data)}
                />
            </td>
            <td>{data.scientific_name} [TaxID: {data.taxid}]</td>
            <td className={data.database.toLowerCase()}>{data.database}</td>
            <td>{data.assembly_level}</td>
            <td>{!isNaN(parseInt(data.assembly_length)) ? `${Math.round(data.assembly_length / 1e6).toLocaleString()} Mbp` : ''}</td>
            <td>
                <a href={data.url} target="_blank" rel="noopener noreferrer">{label}</a>
            </td>
        </tr>
    );
};

export default AssemblyUnit;
