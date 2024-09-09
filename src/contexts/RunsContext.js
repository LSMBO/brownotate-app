import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import CONFIG from "../config";

const RunsContext = createContext();

export const useRunsContext = () => useContext(RunsContext);

export const RunsProvider = ({ children }) => {
    const [runs, setRuns] = useState([]);

    const fetchUserRuns = async (user) => {
        try {
            const response = await axios.post(`${CONFIG.API_BASE_URL}/get_user_runs`, { user });
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
