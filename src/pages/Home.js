import SpeciesInput from "../components/SpeciesInput"
import CardRun from "../components/CardRun"
import Run from "../classes/Run"
import DatabaseSearch from "../classes/DatabaseSearch"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUploadProgress } from '../UploadProgressContext';
import axios from 'axios';
import CardDatabaseSearch from "../components/CardDatabaseSearch"
import { handleClickDownload } from '../utils/Download';


export default function Home() {
    //state
    const location = useLocation();
    const navigate = useNavigate();
    const { parameters, setParameters, uploadProgress } = useUploadProgress();
    const [dbsearch, setDbsearch] = useState({})
    const [dbsearchStatus, setDbsearchStatus] = useState("NULL")
    const [runs, setRuns] = useState([]);
    const [inputSpecies, setInputSpecies] = useState("")
    const [inputSpeciesOK, setInputSpeciesOK] = useState("")

    useEffect(() => {
        if (uploadProgress.totalFiles > 0 && uploadProgress.uploadedFiles === uploadProgress.totalFiles) {
            console.log('Upload completed');
        }
    }, [uploadProgress]);
   
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

    const handleClickSettings = (selectedData) => {
        console.log(selectedData)
        navigate('/settings', {state: { parameters }});
    }


    //affichage
    return (
    <div id="page">
        <SpeciesInput handleSetInputSpecies={handleSetInputSpecies} isError={inputSpeciesOK}/>
        <div className="startButtonContainer">
            <button className="t1_bold" onClick={handleClickDBS} disabled={!inputSpecies}>Database Search</button>
            <button className="t1_bold" onClick={handleClickSettings}>Custom Input</button>
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



