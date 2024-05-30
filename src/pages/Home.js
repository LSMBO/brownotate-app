import SpeciesInput from "../components/SpeciesInput"
import Run from "../classes/Run"
import DatabaseSearch from "../classes/DatabaseSearch"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useUploadProgress } from '../UploadProgressContext';
import { getDefaultParameters } from '../utils/defaultParameters';
import axios from 'axios';
import CardDatabaseSearch from "../components/CardDatabaseSearch"
import { handleClickDownload } from '../utils/Download';
import "../components/Loading.css"

export default function Home() {
    //state
    const navigate = useNavigate();
    //const { setParameters } = useUploadProgress();
    const [dbsearch, setDbsearch] = useState({})
    const [dbsearchStatus, setDbsearchStatus] = useState("NULL")
    const [runs, setRuns] = useState([]);
    const [inputSpecies, setInputSpecies] = useState("")
    const [inputSpeciesOK, setInputSpeciesOK] = useState("")

    // useEffect(() => {
    //     if (uploadProgress.totalFiles > 0 && uploadProgress.uploadedFiles === uploadProgress.totalFiles) {
    //         console.log('Upload completed');
    //     }
    // }, [uploadProgress]);
   
    //comportement    
      const handleClickDBS = () => {
        setDbsearchStatus("loading");
        console.log(`Database search with ${inputSpecies}`);
        const newDbsearch = new DatabaseSearch(new Date().getTime(), inputSpecies);
    
        axios.post('http://localhost:5000/run_script_dbs', { argument: inputSpecies })
        .then(response => {
            const lastLine = response.data.split('\n').slice(-2)[0];
            if (lastLine === `Taxo \"${inputSpecies}\" not found.`) {
                setInputSpeciesOK(inputSpecies);
                setDbsearchStatus('taxoNotFound');
            } else {
                setInputSpeciesOK("");
                setDbsearchStatus('completed');
                const jsonString = response.data.substring(response.data.indexOf("{"));
                const response_data = JSON.parse(jsonString);
                newDbsearch.updateData(response_data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setDbsearchStatus('failed');
            setInputSpeciesOK("");
        })
        .finally(() => {
            setDbsearch(newDbsearch);
        });
    };
    

    const handleSetInputSpecies = (input) => {
        setInputSpecies(input);
    }

    const handleClickSettings = async (selectedData) => {
        const newParameters = getDefaultParameters();
        newParameters.species.scientificName = inputSpecies;
    
        if (selectedData) {
            if (Array.isArray(selectedData) && typeof selectedData[0] === 'string') {
                // Sequencing data
                newParameters.startSection.sequencing = true;
                newParameters.startSection.sequencingAccessions = true;
                newParameters.startSection.sequencingAccessionsList = selectedData;
            } else if (Array.isArray(selectedData) && typeof selectedData[0] === 'object') {
                // Assembly data
                newParameters.startSection.genome = true;
                newParameters.startSection.genomeFile = true;
                newParameters.startSection.genomeFileList = [{
                    'name': `${selectedData[0].accession}.fasta`,
                    'url': selectedData[0].downloadURL}];
            }
        }
        console.log(newParameters);
        navigate('/settings', { state: { newParameters } });
    };

    //affichage
    return (
    <div id="page">
        <SpeciesInput handleSetInputSpecies={handleSetInputSpecies} isError={inputSpeciesOK}/>
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
            <cardrun id={run.id} data={run.data} status={run.status} parameters={run.parameters} />
            ))}
        </div>
    </div>
    )
}