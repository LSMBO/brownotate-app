import { createContext, useState, useContext } from 'react';
import { defaultParameters } from './utils/defaultParameters';

const UploadProgressContext = createContext();

export const useUploadProgress = () => useContext(UploadProgressContext);

export const UploadProgressProvider = ({ children }) => {

    const [parameters, setParameters] = useState(defaultParameters);    
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
