import React, { createContext, useState, useContext } from 'react';

const DBSearchContext = createContext();

export const DBSearchProvider = ({ children }) => {
    const [dbs, setDBS] = useState(null);
    const [dbsStatus, setDBSStatus] = useState(null);
    const [selectedData, setSelectedData] = useState(null);

    const resetDBS = () => {
        setDBSStatus(null);
        setDBS(null);  
    };       
        
    return (
        <DBSearchContext.Provider value={{ dbs, setDBS, dbsStatus, setDBSStatus, selectedData, setSelectedData, resetDBS }}>
            {children}
        </DBSearchContext.Provider>
    );
};

export const useDBSearch = () => useContext(DBSearchContext);
