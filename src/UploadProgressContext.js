import { createContext, useState, useContext } from 'react';

const UploadProgressContext = createContext();

export const useUploadProgress = () => useContext(UploadProgressContext);

export const UploadProgressProvider = ({ children }) => {

    const [parameters, setParameters] = useState(
        {
            id: null,
            species: {
                scientificName: "Cannabis sativa",
                taxonID: null
            },
            ready: false,
            startSection: {
                auto: true,
                genome: false,
                sequencing: false,
            },
            dataSection: {
                auto: true,
                illuminaOnly : false,
                excludedSRA : false,
                excludedSRAList : [],
                genomeFile: false,
                genomeFileList: [],
                sequencingFiles : false,
                sequencingFilesList : [],
                sequencingAccessions : false,
                sequencingAccessionsList : []
            },
            assemblySection: {
                skipFastp: false,
                skipPhix: false,
            },
            annotationSection: {
                evidenceAuto: true,
                evidenceFile: false,
                evidenceFileList: [],
                removeStrict: true,
                removeSoft: false,
            },
            brownamingSection: {
                skip: false,
                excludedSpeciesList: [],
                highestRank: "Suborder",
            },
            buscoSection: {
                assembly: true,
                annotation: true
            }
        }
    );
    
    const [uploadProgress, setUploadProgress] = useState({
        totalFiles: 0,
        uploadedFiles: 0
    });

    return (
        <UploadProgressContext.Provider value={{ parameters, setParameters, uploadProgress, setUploadProgress }}>
            {children}
        </UploadProgressContext.Provider>
    );
};
