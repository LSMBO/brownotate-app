import React, { createContext, useState, useContext } from 'react';

const DBSearchContext = createContext();

export const DBSearchProvider = ({ children }) => {
    const [dbsearch, setDBSearch] = useState(null);
    const [dbsearchStatus, setDBSearchStatus] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    
    return (
        <DBSearchContext.Provider value={{ dbsearch, setDBSearch, dbsearchStatus, setDBSearchStatus, selectedData, setSelectedData }}>
            {children}
        </DBSearchContext.Provider>
    );
};

export const useDBSearch = () => useContext(DBSearchContext);
