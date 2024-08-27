import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const RunsContext = createContext();

export const useRunsContext = () => useContext(RunsContext);

export const RunsProvider = ({ children }) => {
    const [runs, setRuns] = useState([]);

    const fetchUserRuns = async (user) => {
        try {
            const response = await axios.post('http://134.158.151.129:80/get_user_runs', { user });
            setRuns(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const addRun = async (newRun) => {
        try {
            const updatedRuns = [...runs, newRun];
            setRuns(updatedRuns);
        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <RunsContext.Provider value={{ runs, addRun, fetchUserRuns }}>
            {children}
        </RunsContext.Provider>
    );
};

export const useRuns = () => useContext(RunsContext);
