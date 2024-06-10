import SpeciesInput from "../components/SpeciesInput"
import CardRun from "../components/CardRun"
import Run from "../classes/Run"
import DatabaseSearch from "../classes/DatabaseSearch"
import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import { useUploadProgress } from '../UploadProgressContext';
import { getDefaultParameters } from '../utils/defaultParameters';
import axios from 'axios';
import CardDatabaseSearch from "../components/CardDatabaseSearch"
import { handleClickDownload } from '../utils/Download';
import "../components/Loading.css"
import { useParameters } from '../context/ParametersContext';


export default function Home() {
    //state
    const navigate = useNavigate();
    const location = useLocation();
    //const { setParameters } = useUploadProgress();
    const { parameters, setParameters } = useParameters();
    const [dbsearch, setDbsearch] = useState(location.state?.dbsearch ?? {});
    const [dbsearchStatus, setDbsearchStatus] = useState(location.state?.dbsearchStatus ?? "NULL")
    const [runs, setRuns] = useState([]);
    const [inputSpecies, setInputSpecies] = useState("")
    const [speciesNotFound, setSpeciesNotFound] = useState("")

    useEffect(() => {
        if (parameters && parameters.isRun) {
            createRun(parameters);
        }
    }, [parameters]);

    //comportement    
    const speciesExists = async (inputValue) => {
        try {
            if (inputValue==='') {
                setSpeciesNotFound(" ");
                setDbsearchStatus('taxoNotFound');
            }
            else {
                const response = await axios.post('http://localhost:5000/run_species_exists', { argument: inputValue });
                const lastLine = response.data.split('\n').slice(-2)[0];
                if (lastLine === `Taxo \"${inputValue}\" not found.`) {
                    setSpeciesNotFound(inputValue);
                    setDbsearchStatus('taxoNotFound');
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
        setDbsearchStatus("loading");
        console.log(`Database search with ${inputSpecies}`);
        const newDbsearch = new DatabaseSearch(new Date().getTime(), inputSpecies);
        const speciesFound = await speciesExists(inputSpecies);
        if (speciesFound) {
            newDbsearch.setTaxonID(speciesFound[1])
            try {
                const response = await axios.post('http://localhost:5000/run_script_dbs', { argument: inputSpecies });
                setDbsearchStatus('completed');
                const jsonString = response.data.substring(response.data.indexOf("{"));
                const response_data = JSON.parse(jsonString);
                newDbsearch.updateData(response_data);
            } catch (error) {
                console.error('Error:', error);
                setDbsearchStatus('failed');
            } finally {
                setDbsearch(newDbsearch);
            }
        }
    };
    
    const handleSetInputSpecies = (input) => {
        setInputSpecies(input);
    }

    const handleClickSettings = async (selectedData) => {
        const newParameters = getDefaultParameters();
        if (Object.keys(dbsearch).length > 0) {
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
        //navigate('/settings', { state: { newParameters, dbsearch, dbsearchStatus } });      
    };

    const createRun = (parameters) => {
        const newRun = new Run(parameters);
        setRuns(prevRuns => [...prevRuns, newRun]);
    }

    const handleSubmitLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
    
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
    
        const data = await response.json();
        console.log(data.message); // Affiche le message renvoyé par le serveur
    }

    //affichage
    return (
    <div id="page">
        <form onSubmit={handleSubmitLogin}>
            <input type="text" name="email" placeholder="Email" />
            <input type="password" name="password" placeholder="Password" />
            <button type="submit">Login</button>
        </form>
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
            <CardRun id={run.id} data={run.data} status={run.status} parameters={run.parameters} />
            ))}
        </div>
    </div>
    )
}