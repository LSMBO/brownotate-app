import React from 'react';

const AssemblyProteinsUnit = ({ data, selectedData, updateSelectedData, label }) => {
    const handleCheckboxChange = (newData) => {
        updateSelectedData(selectedData && newData.accession === selectedData.accession ? null : newData);
    };

    const isSelected = selectedData && selectedData.accession === data.accession;

    return (
        <div className='assembly-proteins-unit'>
            {data && (
                <>
                    <input
                        type="checkbox"
                        value={data.accession}
                        checked={!!isSelected}
                        onChange={() => handleCheckboxChange(data)}
                    />
                    <div className={isSelected ? 'infos selected' : 'infos'}>
                        <a href={data.userURL} target="_blank" rel="noopener noreferrer">
                            <p>
                            {data.accession !== 'swissprot' && data.accession !== 'trembl' ? `${label}: ${data.accession}` : label}
                            </p>
                        </a>
                        <p><i>{data.scientific_name}</i></p>
                    </div>
                </>
            )}
        </div>
    );
};

export default AssemblyProteinsUnit;
