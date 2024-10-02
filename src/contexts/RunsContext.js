import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import CONFIG from "../config";

const RunsContext = createContext();

export const useRunsContext = () => useContext(RunsContext);

export const RunsProvider = ({ children }) => {
    const [runs, setRuns] = useState([]);
    const [runMonitoring, setRunMonitoring] = useState(false);
    const [totalCPUs, setTotalCPUs] = useState(0);
    const [usedCPUs, setUsedCPUs] = useState(0);
    const [freeCPUs, setFreeCPUs] = useState(14)

    const fetchCPUs = async () => {
        console.log(`fetchCPUs ...`);
        try {
            const response = await axios.get(`${CONFIG.API_BASE_URL}/get_cpus`);
            const data = response.data;
            setTotalCPUs(data.total_cpus);
            setUsedCPUs(data.total_cpus_used);
            setFreeCPUs(data.total_cpus - data.total_cpus_used - 1)
        } catch (error) {
            console.error("Error fetching CPUs:", error);
        }
    };

    const fetchUserRuns = async (user) => {
        console.log(`fetchUserRuns (${user})...`);
        try {
            const response = await axios.post(`${CONFIG.API_BASE_URL}/get_user_runs`, { user });
            setRuns(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Execute fetchRun every 5 seconds for the first minute after Brownotate run is executed
    const startRunMonitoring = (user) => {
        console.log(`startRunMonitoring (${user})...`);
        setRunMonitoring(true);
        fetchUserRuns(user);

        const intervalId = setInterval(() => {
            fetchUserRuns(user);
            fetchCPUs();
        }, 5000);

        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            setRunMonitoring(false);
        }, 30000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
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
        <RunsContext.Provider value={{ runs, totalCPUs, usedCPUs, freeCPUs, fetchCPUs, addRun, fetchUserRuns, startRunMonitoring }}>
            {children}
        </RunsContext.Provider>
    );
};

export const useRuns = () => useContext(RunsContext);
