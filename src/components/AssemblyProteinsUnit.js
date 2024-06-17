import React from 'react';

const AssemblyProteinsUnit = ({ isEmpty, data, selectedData, updateSelectedData, recommendedData, label }) => {
    const handleCheckboxChange = (newData) => {
        updateSelectedData(selectedData && newData.accession === selectedData.accession ? null : newData);
    };

    const isSelected = selectedData && selectedData.accession === data.accession;

    return (
        <div className='assembly-proteins-unit'>
            {!isEmpty && data && (
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
                                {label}: {data.accession} {recommendedData === label && ' (Recommended)'}
                            </p>
                        </a>
                        <p>Species: {data.scientific_name}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default AssemblyProteinsUnit;
