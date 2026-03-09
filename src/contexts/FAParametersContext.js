import { createContext, useContext, useState } from 'react';

const FAParametersContext = createContext();

const defaultFAParameters = {
    run_id: null,
    type: 'functional',
    species: {
        scientificName: "",
        taxonID: null,
        lineage: [],
        is_bacteria: false,
        imageUrl: "user_download/image_not_found.png"
    },
    proteinFile: null,
    proteinFileAccession: null,
    proteinFileOnServer: null,
    brownamingSection: {
        skip: false,
        excludedTaxoList: [],
        lastTaxid: null,
        excludeTrembl: false
    },
    cpus: null
};

export const FAParametersProvider = ({ children }) => {
    const [faParameters, setFAParameters] = useState(defaultFAParameters);

    const resetFAParameters = () => {
        setFAParameters(JSON.parse(JSON.stringify(defaultFAParameters)));
        return JSON.parse(JSON.stringify(defaultFAParameters));
    };

    const updateFAParameters = (updates) => {
        setFAParameters(prevParams => {
            const newParams = { ...prevParams };
            
            Object.keys(updates).forEach(key => {
                // Don't spread File objects or Arrays - assign them directly
                if (typeof updates[key] === 'object' 
                    && updates[key] !== null 
                    && !Array.isArray(updates[key])
                    && !(updates[key] instanceof File)) {
                    newParams[key] = {
                        ...newParams[key],
                        ...updates[key]
                    };
                } else {
                    newParams[key] = updates[key];
                }
            });
            return newParams;
        });
    };



    return (
        <FAParametersContext.Provider value={{
            faParameters, 
            updateFAParameters, 
            resetFAParameters
        }}>
            {children}
        </FAParametersContext.Provider>
    );
};

export const useFAParameters = () => useContext(FAParametersContext);