import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import CONFIG from "../config";

const AnnotationsContext = createContext();

export const useAnnotationsContext = () => useContext(AnnotationsContext);

export const AnnotationsProvider = ({ children }) => {
    const [annotations, setAnnotations] = useState([]);
    const [waitingTime, setWaitingTime] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const calculateWaitingTime = async () => {
        let response = await axios.post(`${CONFIG.API_BASE_URL}/waiting_time_annotation`);
        setWaitingTime(response.data.data);
    }

    const fetchCPUs = async () => {
        try {
            const response = await axios.get(`${CONFIG.API_BASE_URL}/get_cpus`);
            const data = response.data;
            return data.total_cpus - data.total_cpus_used;
        } catch (error) {
            console.error("Error fetching CPUs:", error);
            return 0;
        }
    };

    const fetchUserAnnotations = async (user, check_processes) => {
        try {
            if (check_processes) {
                setIsLoading(true);
            }
            const response = await axios.post(`${CONFIG.API_BASE_URL}/get_user_annotations`, { user, check_processes });
            setAnnotations(response.data.data);
            calculateWaitingTime();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateAnnotation = async (user, runId, field, value) => {
        try {
            await axios.post(`${CONFIG.API_BASE_URL}/update_run`, {
                run_id: runId,
                field: field, 
                value: value
            });
            await fetchUserAnnotations(user, false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const addAnnotation = async (newAnnotation) => {
        try {
            const updatedAnnotations = [...annotations, newAnnotation];
            setAnnotations(updatedAnnotations);
        } catch (error) {
            console.error('Error:', error);
        }
    };


    // startRunMonitoring (add to provider value to return it)
    return (
        <AnnotationsContext.Provider value={{ annotations, waitingTime, fetchCPUs, fetchUserAnnotations, updateAnnotation, addAnnotation, isLoading }}> 
            {children}
        </AnnotationsContext.Provider>
    );
};

export const useAnnotations = () => useContext(AnnotationsContext);
