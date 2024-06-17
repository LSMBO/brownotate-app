import React, { createContext, useState, useContext } from 'react';

const ParametersContext = createContext();

export const ParametersProvider = ({ children }) => {
    const [parameters, setParameters] = useState(null);
    
    return (
        <ParametersContext.Provider value={{ parameters, setParameters }}>
            {children}
        </ParametersContext.Provider>
    );
};

export const useParameters = () => useContext(ParametersContext);
