import React, { createContext, useState, useContext } from 'react';
import { getDefaultParameters } from '../utils/defaultParameters';

const ParametersContext = createContext();

export const ParametersProvider = ({ children }) => {
    const [parameters, setParameters] = useState(() => getDefaultParameters());

    const resetParameters = () => {
        const defaultParams = getDefaultParameters();
        setParameters(defaultParams);
        return defaultParams;
    };    

    const updateParameters = (updates) => {
        setParameters(prevParams => {
            const newParams = { ...prevParams };
            
            Object.keys(updates).forEach(key => {
                if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
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

    // Fonction pour créer des paramètres avec données sélectionnées
    const createParametersWithData = (selectedData, dbsearch = null) => {
        const newParameters = getDefaultParameters();
        
        if (dbsearch) {
            newParameters.species.scientificName = dbsearch.scientific_name;
            newParameters.species.taxonID = dbsearch.taxonID;
            newParameters.species.lineage = dbsearch.lineage;
            newParameters.species.is_bacteria = dbsearch.is_bacteria;
        }
        
        if (selectedData) {
            if (Array.isArray(selectedData) && typeof selectedData[0] === 'string') {
                // Sequencing data
                newParameters.startSection.sequencing = true;
                newParameters.startSection.sequencingRuns = true;
                newParameters.startSection.sequencingRunList = selectedData;
                newParameters.id = new Date().getTime();
                newParameters.ready = true;
                    
            } else if (Array.isArray(selectedData) && typeof selectedData[0] === 'object') {
                // Assembly data
                let selectedAssembly = selectedData[0];
                newParameters.startSection.assembly = true;
                newParameters.startSection.assemblyFile = false;
                newParameters.startSection.assemblyType = selectedAssembly.database;
                newParameters.startSection.assemblyAccession = [selectedAssembly.accession];
                if (selectedAssembly.database === 'ncbi') {
                    newParameters.startSection.assemblyDownload = selectedAssembly.download_command;
                } else {
                    newParameters.startSection.assemblyDownload = selectedAssembly.download_url;
                }
                newParameters.id = new Date().getTime();
                newParameters.ready = true;
            }
        }
        
        setParameters(newParameters);
        return newParameters;
    };



    return (
        <ParametersContext.Provider value={{ 
            parameters, 
            setParameters,
            updateParameters,
            createParametersWithData,
            resetParameters
        }}>
            {children}
        </ParametersContext.Provider>
    );
};

export const useParameters = () => useContext(ParametersContext);
