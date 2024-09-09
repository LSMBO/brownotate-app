import "../components/Loading.css"
import SpeciesInput from "../components/SpeciesInput"
import CardRun from "../components/CardRun"
import Run from "../classes/Run"
import DatabaseSearch from "../classes/DatabaseSearch"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useUploadProgress } from '../UploadProgressContext';
import { getDefaultParameters } from '../utils/defaultParameters';
import axios from 'axios';
import CardDatabaseSearch from "../components/CardDatabaseSearch"
import { handleClickDownload } from '../utils/Download';
import { useUser } from '../contexts/UserContext';
import { useDBSearch } from '../contexts/DBSearchContext'
import { useParameters } from '../contexts/ParametersContext';
import { useRuns } from '../contexts/RunsContext';
import io from 'socket.io-client';
import CONFIG from '../config';

const socket = io.connect(CONFIG.API_BASE_URL, {reconnection: false});

export default function Home() {
    //state
    const navigate = useNavigate();
    const { parameters, setParameters } = useParameters();
    const { user } = useUser();
    const { dbsearch, setDBSearch, dbsearchStatus, setDBSearchStatus, dbsStderr, setDbsStderr } = useDBSearch();
    const [inputSpecies, setInputSpecies] = useState("Naja naja")
    const [dbsearchSpecies, setDbsearchSpecies] = useState("")
    const [speciesNotFound, setSpeciesNotFound] = useState("")
    const { runs, fetchUserRuns } = useRuns();

    //comportement    
    useEffect(() => {
        socket.on('runs_updated', (data) => {
            console.log('Socket.on runs_updated:', data);
            fetchUserRuns(user);
        });
    
        return () => {
            socket.off('runs_updated');
        };
    }, [socket]);


    const speciesExists = async (inputValue) => {
        try {
            if (inputValue==='') {
                setSpeciesNotFound(" ");
                setDBSearchStatus('taxoNotFound');
            }
            else {
                const response = await axios.post(`${CONFIG.API_BASE_URL}/check_species_exists`, { species: inputValue });
                setSpeciesNotFound("");
                return response.data.results;
            }
        } catch (error) {
            console.error('Error:', error.response.data.message);
            setSpeciesNotFound(inputValue);
            setDBSearchStatus('taxoNotFound');
            return false;
        }
    };

    const handleClickDBS = async (force_new_search) => {
        setDBSearchStatus("loading");
        const speciesFound = await speciesExists(inputSpecies);
        const newDbsearch = new DatabaseSearch(new Date().getTime(), speciesFound['scientific_name']);
        if (speciesFound) {
            newDbsearch.setTaxonID(speciesFound['taxID'])
            try {
                const response = await axios.post(`${CONFIG.API_BASE_URL}/database_search`, { scientificName: speciesFound['scientific_name'], taxID: speciesFound['taxID'], user: user, force_new_search: force_new_search });
                setDBSearchStatus('completed');
                setDbsearchSpecies(speciesFound["scientific_name"])
                setDbsStderr(null)
                if ('data' in response.data) {
                    newDbsearch.updateData(response.data.data);
                } else {
                    newDbsearch.updateData(response.data);
                }
            } catch (error) {
                console.error('Error:', error);
                setDBSearchStatus('failed');
                setDbsStderr(error.response.data.stderr)
            } finally {
                setDBSearch(newDbsearch);
            }
        }
    };
    
    const handleClickSettings = async (selectedData) => {
        const newParameters = getDefaultParameters();
        if (dbsearch) {
            newParameters.species.scientificName = dbsearch.scientific_name;
            newParameters.species.taxonID = dbsearch.taxonID;
        } else {
            const speciesFound = await speciesExists(inputSpecies)
            if (speciesFound) {
                newParameters.species.scientificName = speciesFound['scientific_name'];
                newParameters.species.taxonID = speciesFound['taxID'];
            } else {
                return ''
            }
        }
        if (selectedData) {
            if (Array.isArray(selectedData) && typeof selectedData[0] === 'string') {
                // Sequencing data
                newParameters.startSection.sequencing = true;
                newParameters.startSection.sequencingAccessions = true;
                newParameters.startSection.sequencingAccessionsList = selectedData;
                newParameters.id = new Date().getTime();
                newParameters.ready = true;
                    
            } else if (Array.isArray(selectedData) && typeof selectedData[0] === 'object') {
                // Assembly data
                newParameters.startSection.genome = true;
                newParameters.startSection.genomeFile = true;
                newParameters.startSection.genomeFileList = [selectedData[0].downloadURL];
                newParameters.startSection.genomeFileIsURL = true;
                newParameters.id = new Date().getTime();
                newParameters.ready = true;
            }
        }
        setParameters(newParameters);
        navigate('/settings');
    };
    

    //affichage
    return (
    <div id="page">
        <SpeciesInput setInputSpecies={setInputSpecies} speciesNotFound={speciesNotFound}/>
        <div className="startButtonContainer">
            <button className="t2_bold" onClick={() => handleClickDBS(false)} disabled={!inputSpecies}>Database Search</button>   
            <button className="t2_bold" onClick={handleClickSettings}>Custom Input</button>
        </div>
        {dbsearchStatus === "completed" ? 
        (<CardDatabaseSearch species={dbsearchSpecies} data={dbsearch} handleClickSettings={handleClickSettings} handleClickDownload={handleClickDownload} rerunDBSearch={handleClickDBS}/>)
        : dbsearchStatus === "failed" ? 
            (<div>
                <pre>A problem occurred during the search</pre>
                <pre>{dbsStderr}</pre>
            </div>)
        : dbsearchStatus === "loading" ?
        (<div className="window loading"><span></span></div>)
        : (<p></p>)}
        <div className="run-list">
            {runs.map((run, index) => (
                run.parameters && run.parameters.id ? (
                    <CardRun key={index} user={user} id={run.id} data={run} status={run.status} parameters={run.parameters} />
                ) : (
                <div key={index}></div>
                )
            ))}
        </div>
    </div>
    )
}