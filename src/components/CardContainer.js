import Card from "./Card"
import cardContent from "../assets/text/cards.json";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useUploadProgress } from '../UploadProgressContext';
import axios from 'axios';


export default function CardContainer( {parameters, setParameters, setRuns} ) {
    const navigate = useNavigate();
    const { uploadProgress } = useUploadProgress(); // Obtenez uploadProgress du contexte

    useEffect(() => {
        if (uploadProgress.totalFiles > 0 && uploadProgress.uploadedFiles === uploadProgress.totalFiles) {
            console.log('Upload completed');
        }
    }, [uploadProgress]);

    const server = 'http://134.158.151.129/'
    const card1_button = "Search"
    const card2_button = "Run"
    const card3_button = "Settings;Run"

    const downloadFile = (filePath) => {
        window.open(`http://localhost:5000/download_file/${filePath}`);
    };

    const readFile = (filePath) => {
        axios.get(`http://localhost:5000/read_file/${filePath}`)
            .then(response => {
                console.log(response.data); // Affiche le contenu du fichier
            })
            .catch(error => {
                console.error('Erreur lors de la lecture du fichier:', error);
            });
    };

    const requestAutoRun = (argument, run) => {
        axios.post('http://localhost:5000/run_script_auto', { argument: argument })
            .then(response => {
                const lines = response.data.split('\n');
                const lastLine = lines[lines.length - 2];
                console.log(lastLine);
                setRuns(prevRuns => prevRuns.map(run => {
                    if (run.id === run.id) {
                        return { ...run, data: lastLine, status: 'completed' };
                    }
                    return run;
                }));
            })
            .catch(error => {
                console.error('Error during the request in Flask:', error);
                setRuns(prevRuns => prevRuns.map(run => {
                    if (run.id === run.id) {
                        return { ...run, status: 'error' };
                    }
                    return run;
                }));
            });
    };

    const requestClassicRun = (argument, run) => {
        axios.post('http://localhost:5000/run_script', { argument: argument })
            .then(response => {
                const lines = response.data.split('\n');
                const lastLine = lines[lines.length - 2];
                console.log(response.data);
                setRuns(prevRuns => prevRuns.map(run => {
                    if (run.id === run.id) {
                        return { ...run, data: lastLine, status: 'completed' };
                    }
                    return run;
                }));
            })
            .catch(error => {
                console.error('Erreur lors de la requête au backend Flask:', error);
                setRuns(prevRuns => prevRuns.map(run => {
                    if (run.id === run.id) {
                        return { ...run, status: 'error' };
                    }
                    return run;
                }));
            });
    };

    const requestDbsRun = (argument) => {
        axios.post('http://localhost:5000/run_script_dbs', { argument: argument })
            .then(response => {
                // const lines = response.data.split('\n');
                // const lastLine = lines[lines.length - 2];
                console.log(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la requête au backend Flask:', error);
            });
    };

    // const sendRequest = async () => {
    //     const server = 'http://172.16.2.142:3001/api';
    //     try {
    //         const response = await fetch(server);
    //         if (!response.ok) {
    //             throw new Error('Erreur lors de la requête fetch');
    //         }
    //         const data = await response.json();
    //         console.log(data);
    //     } catch (error) {
    //         console.error('Erreur lors de la requête fetch:', error.message);
    //     }
    // };

    // comportement
    const handleClickDBS = () => {
        console.log(`Database search with ${parameters.species.scientificName} !!`)
        requestDbsRun(parameters)
    }

    const handleClickSetting = () => {
        console.log(`Open settings with ${parameters.species.scientificName} !!`)
        navigate('/settings', {state: { parameters }});
    }

    const handleClickAutoRun = (parameters) => {
        const updatedParameters = {
            ...parameters,
            id: new Date().getTime()
        };
        setParameters(updatedParameters);
        console.log(`Run Auto run with ${JSON.stringify(parameters, null, 2)}`)
        const newRun = { data: '', status: 'running', parameters : parameters, id: updatedParameters.id };
        setRuns(prevRuns => [
            ...prevRuns,
            newRun
        ]);
        requestAutoRun(parameters, newRun)
    }

    const handleClickClassicRun = () => {
        const updatedParameters = {
            ...parameters,
            id: new Date().getTime()
        };
        setParameters(updatedParameters);
        console.log(`Classic run with ${JSON.stringify(parameters, null, 2)} !!`)
        const newRun = { data: '', status: 'running', parameters : parameters, id: updatedParameters.id };
        setRuns(prevRuns => [
            ...prevRuns,
            newRun
        ]);
        requestClassicRun(parameters, newRun)
    }

    //affichage
    return (
        <div className="cardContainer">
            <Card 
                title="Data available" 
                content={cardContent.text_card1} 
                button={card1_button} 
                colorFilter={-20} 
                handleClick={handleClickDBS}
                isDisabled1={!parameters.species.scientificName}
            />
            <Card 
                title="Automatic run" 
                content={cardContent.text_card2} 
                button={card2_button} 
                colorFilter={60} 
                handleClick={() => handleClickAutoRun(parameters)} // Faut que tu trouve un moyen d'executer cette fonction avec parameters en parametre. POur ca faut recupéré l'objet de Settings.js
                isDisabled1={!parameters.species.scientificName}
            />
            <Card 
                title="Classic run" 
                content={cardContent.text_card3} 
                button={card3_button} 
                colorFilter={40} 
                handleClick={[handleClickSetting, handleClickClassicRun]}
                isDisabled1={!parameters.species.scientificName}
                isDisabled2={!parameters.ready}
            />
        </div >
    )
}