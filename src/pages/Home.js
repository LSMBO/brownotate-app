import Header from "../components/Header"
import SpeciesForm from "../components/SpeciesForm"
import CardDB from "../components/CardDB"
import CardAuto from "../components/CardAuto"
import CardClassic from "../components/CardClassic"
import CardRun from "../components/CardRun"
import Run from "../classes/Run"
import Footer from "../components/Footer"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUploadProgress } from '../UploadProgressContext';
import axios from 'axios';

export default function Home() {
    //state
    const location = useLocation();
    const navigate = useNavigate();
    const { uploadProgress } = useUploadProgress();
    const [parameters, setParameters] = useState(
        {
            id: null,
            species: {
                scientificName: "Cannabis sativa",
                taxonID: null
            },
            ready: false,
            startSection: {
                auto: true,
                genome: false,
                sequencing: false,
            },
            dataSection: {
                auto: true,
                illuminaOnly : false,
                excludedSRA : false,
                excludedSRAList : [],
                genomeFile: false,
                genomeFileList: [],
                sequencingFiles : false,
                sequencingFilesList : [],
                sequencingAccessions : false,
                sequencingAccessionsList : []
            },
            assemblySection: {
                skipFastp: false,
                skipPhix: false,
            },
            annotationSection: {
                evidenceAuto: true,
                evidenceFile: false,
                evidenceFileList: [],
                removeStrict: true,
                removeSoft: false,
            },
            brownamingSection: {
                skip: false,
                excludedSpeciesList: [],
                highestRank: "Suborder",
            },
            buscoSection: {
                assembly: true,
                annotation: true
            }
        }
    );
    const [runs, setRuns] = useState([]);

    useEffect(() => {
        if (uploadProgress.totalFiles > 0 && uploadProgress.uploadedFiles === uploadProgress.totalFiles) {
            console.log('Upload completed');
        }
    }, [uploadProgress]);

    useEffect(() => {
        // Cette fonction sera appelée chaque fois que les paramètres changent
        if (location.state && location.state.newParameters) {
          const newParams = location.state.newParameters;
          setParameters(newParams);
        }
      }, [location.state]);
    
    //comportement

    const handleSetSpecies = (speciesData) => {
        setParameters((prevParameters) => ({
          ...prevParameters,
          species: {
            scientificName: speciesData[0],
            taxonID: speciesData[1],
          },
        }));
      };

    const handleClickDBS = () => {
        console.log(`Database search with ${parameters.species.scientificName} !!`)
        const newRun = new Run(new Date().getTime(), parameters);
        setRuns(prevRuns => [...prevRuns, newRun]);

        axios.post('http://localhost:5000/run_script_dbs', { argument: parameters })
        .then(response => {
            const lines = response.data.split('\n');
            const lastLine = lines[lines.length - 2];
            newRun.updateStatus('completed');
            newRun.updateData(lastLine);
            setRuns(prevRuns => [...prevRuns]);
        })
        .catch(error => {
            console.error('Error:', error);
            newRun.updateStatus('error');
            setRuns(prevRuns => [...prevRuns]);
        });
    }

    const handleClickAuto = () => {
        console.log(`Auto run with ${parameters.species.scientificName}`)
        const newRun = new Run(new Date().getTime(), parameters);
        setRuns(prevRuns => [...prevRuns, newRun]);

        axios.post('http://localhost:5000/run_script_auto', { argument: parameters })
        .then(response => {
            const lines = response.data.split('\n');
            const lastLine = lines[lines.length - 2];
            newRun.updateStatus('completed');
            newRun.updateData(lastLine);
            setRuns(prevRuns => [...prevRuns]);
        })
        .catch(error => {
            console.error('Error:', error);
            newRun.updateStatus('error');
            setRuns(prevRuns => [...prevRuns]);
        });
    }

    const handleClickSettings = () => {
        navigate('/settings', {state: { parameters }});
    }

    const handleClickClassicRun = () => {
        console.log(`Classic run with ${JSON.stringify(parameters, null, 2)} !!`)
        const newRun = new Run(new Date().getTime(), parameters);
        setRuns(prevRuns => [...prevRuns, newRun]);

        axios.post('http://localhost:5000/run_script', { argument: parameters })
        .then(response => {
            const lines = response.data.split('\n');
            const lastLine = lines[lines.length - 2];
            newRun.updateStatus('completed');
            newRun.updateData(lastLine);
            setRuns(prevRuns => [...prevRuns]);
        })
        .catch(error => {
            console.error('Error:', error);
            newRun.updateStatus('error');
            setRuns(prevRuns => [...prevRuns]);
        });
    }

    //affichage
    return (
    <div>
        <Header />
        <SpeciesForm handleSetSpecies={handleSetSpecies}/>
        <div className="cardContainer">
            <CardDB 
                handleClick={handleClickDBS}
                isDisabled={!parameters.species.scientificName}
            />
            <CardAuto
                handleClick={handleClickAuto}
                isDisabled={!parameters.species.scientificName}
            />
            <CardClassic 
                uploadProgress={uploadProgress}
                handleClickSettings={handleClickSettings}
                handleClickRun={handleClickClassicRun}
                isDisabledSettings={!parameters.species.scientificName}
                isReady={parameters.ready}
            />            
        </div>
        {/* <CardContainer parameters={parameters} setParameters={setParameters} setRuns={setRuns}/> */}
        <div className="run-list">
            {runs.map((run, index) => (
            <CardRun id={run.id} data={run.data} status={run.status} parameters={run.parameters} />
            ))}
        </div>
        <Footer />
    </div>
    )
}