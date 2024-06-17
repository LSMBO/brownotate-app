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

const socket = io("http://134.158.151.129:80");


export default function Home() {
    //state
    const navigate = useNavigate();
    const { parameters, setParameters } = useParameters();
    const { user } = useUser();
    const { dbsearch, setDBSearch, dbsearchStatus, setDBSearchStatus } = useDBSearch();
    const [inputSpecies, setInputSpecies] = useState("Naja naja")
    const [speciesNotFound, setSpeciesNotFound] = useState("")
    const { runs, fetchUserRuns } = useRuns();

    //comportement    
    useEffect(() => {
        socket.on('runs_updated', (data) => {
            fetchUserRuns(user);
        });
        return () => {
            socket.off('runs_updated');
        };
    }, []);

    useEffect(() => {
        fetchUserRuns(user);
    }, []);
    
    const speciesExists = async (inputValue) => {
        try {
            if (inputValue==='') {
                setSpeciesNotFound(" ");
                setDBSearchStatus('taxoNotFound');
            }
            else {
                const response = await axios.post('http://134.158.151.129:80/run_species_exists', { species: inputValue });
                const lastLine = response.data.split('\n').slice(-2)[0];
                if (lastLine === `Taxo \"${inputValue}\" not found.`) {
                    setSpeciesNotFound(inputValue);
                    setDBSearchStatus('taxoNotFound');
                    return false;
                } else {
                    setSpeciesNotFound("");
                    return lastLine.split(';');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    };

      const handleClickDBS = async () => {
        setDBSearchStatus("loading");
        console.log(`Database search with ${inputSpecies}`);
        const newDbsearch = new DatabaseSearch(new Date().getTime(), inputSpecies);
        const speciesFound = await speciesExists(inputSpecies);
        if (speciesFound) {
            newDbsearch.setTaxonID(speciesFound[1])
            try {
                const response = await axios.post('http://134.158.151.129:80/run_script_dbs', { species: inputSpecies, user: user });
                setDBSearchStatus('completed');
                newDbsearch.updateData(response.data);
            } catch (error) {
                console.error('Error:', error);
                setDBSearchStatus('failed');
            } finally {
                setDBSearch(newDbsearch);
            }
        }
    };
    
    const handleSetInputSpecies = (input) => {
        setInputSpecies(input);
    }

    const handleClickSettings = async (selectedData) => {
        const newParameters = getDefaultParameters();
        if (dbsearch) {
            newParameters.species.scientificName = dbsearch.inputSpecies;
            newParameters.species.taxonID = dbsearch.taxonID;
        } else {
            const speciesFound = await speciesExists(inputSpecies)
            if (speciesFound) {
                newParameters.species.scientificName = speciesFound[0];
                newParameters.species.taxonID = speciesFound[1];
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
                newParameters.startSection.genomeFileList = [{
                    'name': `${selectedData[0].accession}.fasta`,
                    'url': selectedData[0].downloadURL}];
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
        <SpeciesInput handleSetInputSpecies={handleSetInputSpecies} speciesNotFound={speciesNotFound}/>
        <div className="startButtonContainer">
            <button className="t2_bold" onClick={handleClickDBS} disabled={!inputSpecies}>Database Search</button>
            <button className="t2_bold" onClick={handleClickSettings}>Custom Input</button>
        </div>
        {dbsearchStatus === "completed" ? 
        (<CardDatabaseSearch species={inputSpecies} data={dbsearch} handleClickSettings={handleClickSettings} handleClickDownload={handleClickDownload}/>)
        : dbsearchStatus === "failed" ? 
            (<p>A problem occurred during the search</p>)
        : dbsearchStatus === "loading" ?
        (<div className="window loading"><span></span></div>)
        : (<p></p>)}
        <div className="run-list">
            {runs.map((run, index) => (
            <CardRun id={run.id} data={run} status={run.status} parameters={run.parameters} />
            ))}
        </div>
    </div>
    )
}