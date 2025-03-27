import React from 'react';

const ProteinsUnit = ({ data, selectedData, updateSelectedData, label }) => {    
    const handleCheckboxChange = (newData) => {
        updateSelectedData(selectedData && newData.accession === selectedData.accession ? null : newData);
    };

    const isSelected = selectedData.some(item => item.accession === data.accession);

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
                        <a href={data.url} target="_blank" rel="noopener noreferrer">
                            <p>
                            {data.data_type !== 'swissprot' && data.data_type !== 'trembl' ? `${label}: ${data.accession}` : label}
                            </p>
                        </a>
                        <p><i>{data.scientific_name} (taxID: {data.taxid})</i></p>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProteinsUnit;
