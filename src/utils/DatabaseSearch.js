import axios from 'axios';
import CONFIG from '../config';
import SequencingRun from "../classes/SequencingRun";

export async function speciesExists(inputValue) {
    try {
        if (inputValue==='') {
            return false;
        }
        else {
            const response = await axios.post(`${CONFIG.API_BASE_URL}/check_species_exists`, { species: inputValue });
            if (response.data.status === 'success') {
                return response.data.results;
            } else {
                console.error('Error:', response.data.message);
                return false;
            }
        }
    } catch (error) {
        return false;
    }
};

export async function getDBSearch(taxid, cancelToken) {
    try {       
        const response = await axios.post(`${CONFIG.API_BASE_URL}/get_dbsearch`, {
            taxid: taxid
        }, { cancelToken: cancelToken });

        if (response.data.data) {
            const past_dbsearch = response.data.data;
            return {
                success: true,
                data: past_dbsearch
            };
        } else {
            return {
                success: false,
                data: null
            };
        }
    } catch (error) {
        console.error('Error in getDBSearch:', error);
        return {
            success: false,
            data: null,
            error: error
        };
    }
}

export async function executeDBSearchRoute(route, params, cancelToken) {
    try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/${route}`, params, { cancelToken: cancelToken });
        if (response.data) {
            return {
                success: true,
                data: response.data
            };
        } else {
            console.error(`Error in ${route}:`, response.data.message);
            return {
                success: false,
                data: null
            };
        }   
    } catch (error) {
        if (axios.isCancel(error)) {
            console.warn(`Request canceled for ${route}:`, error.message);
            return {
                success: false,
                data: null,
                canceled: true
            };
        } else {
            console.error(`Error in ${route}:`, error);
            return {
                success: false,
                data: null,
                error: error
            };
        }
    }
}

export async function searchSequencingRun(accession) {
    try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/search_sequencing_run`, { accession: accession });
        if (response.data.status === 'success') {
            const sequencing_run = new SequencingRun(response.data.data);
            return {
                success: true,
                data: sequencing_run
            };
        } else {
            console.error('Error in searchSequencingRun:', response.data.message);
            return {
                success: false,
                data: null
            };
        }
    } catch (error) {
        console.error('Error in searchSequencingRun:', error);
        return {
            success: false,
            data: null,
            error: error
        };
    }
}