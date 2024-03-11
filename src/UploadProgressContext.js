import { createContext, useState, useContext } from 'react';

const UploadProgressContext = createContext();

export const useUploadProgress = () => useContext(UploadProgressContext);

export const UploadProgressProvider = ({ children }) => {
    const [uploadProgress, setUploadProgress] = useState({
        totalFiles: 0,
        uploadedFiles: 0
    });

    return (
        <UploadProgressContext.Provider value={{ uploadProgress, setUploadProgress }}>
            {children}
        </UploadProgressContext.Provider>
    );
};
