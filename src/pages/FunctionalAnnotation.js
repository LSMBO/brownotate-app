import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import CONFIG from '../config';
import "./Settings.css";

import HelpIcon from "../assets/help.png";
import { useUser } from '../contexts/UserContext';
import { useAnnotations } from '../contexts/AnnotationsContext';
import { useFAParameters } from '../contexts/FAParametersContext';
import { speciesExists } from '../utils/DatabaseSearch';
import Loading from '../components/Loading';
import SpeciesInput from "../components/SpeciesInput";
import FormElementInputFile from "./Settings/FormElementInputFile";
import SectionBrownaming from "./Settings/SectionBrownaming";
import Image from "../components/Image";

export default function FunctionalAnnotation() {
    const navigate = useNavigate();
    const { user, isGuest } = useUser();
    const { addAnnotation, fetchCPUs, updateAnnotation } = useAnnotations();
    const { faParameters, updateFAParameters, resetFAParameters } = useFAParameters();
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [inputSpecies, setInputSpecies] = useState("");
    const [speciesSearchError, setSpeciesSearchError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Reset faParameters on component mount and unmount
    useEffect(() => {
        window.scrollTo(0, 0);
        resetFAParameters();
        
        // Cleanup: reset faParameters when leaving the page
        return () => {
            resetFAParameters();
        };
    }, []);

    const handleClickSpeciesSearch = async (speciesNameOrEvent) => {
        if (cancelTokenSource) {
            cancelTokenSource.cancel();
        }        
        const speciesName = typeof speciesNameOrEvent === 'string' 
            ? speciesNameOrEvent 
            : inputSpecies;
        if (!speciesName || speciesName.trim() === '') {
            setSpeciesSearchError("Please enter a species name");
            return;
        }
        const source = axios.CancelToken.source();
        setCancelTokenSource(source);
        setIsLoading(true);
        const currentSpeciesFound = await speciesExists(speciesName);
        setIsLoading(false);
        
        if (currentSpeciesFound) {
            updateFAParameters({'species': {
                'scientificName': currentSpeciesFound.data.scientificName,
                'taxonID': currentSpeciesFound.data.taxonId,
                'lineage': currentSpeciesFound.data.lineage,
                'is_bacteria': currentSpeciesFound.data.is_bacteria,
                'imageUrl': currentSpeciesFound.taxo_image_url,
                'statistics': currentSpeciesFound.data.statistics
            }})
            setSpeciesSearchError(null);
        } else {
            setSpeciesSearchError(speciesName);
            updateFAParameters({'species': null });
        }
    };

    const handleFileChange = (e, index) => {
        e.preventDefault();
        if (index !== undefined) {
            updateFAParameters({proteinFile: null, proteinFileAccession: []});
        } else {
        const files = e.target.files;
        if (files) {
            updateFAParameters({proteinFile: files[0], proteinFileAccession: files[0].name});
           }
        }
    };


    const uploadFile = async (files, type, run_id) => {
        const formData = new FormData();
        if (Array.isArray(files)) {
            files.forEach((file, index) => {
                formData.append(`file${index}`, file);
            });
        } else if (files instanceof File) {
            formData.append('file0', files);
        } else {
            console.error('Invalid files input:', files);
            return null;
        }

        formData.append('type', type);
        formData.append('run_id', run_id);

        try {
            const response = await axios.post(`${CONFIG.API_BASE_URL}/upload_file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.file_paths;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    const checkParameters = () => {
        if (!faParameters.species.taxonID) {
            alert("Please select a valid species.");
            return false;
        }
        if (!faParameters.proteinFile) {
            alert("Please select a protein FASTA file.");
            return false;
        }
        return true;
    };

    const handleRunFunctionalAnnotation = async () => {
        // Block guest users from running annotations
        if (isGuest) {
            alert("Guest mode allows database searches only.\n\nTo run annotations, please contact browna@unistra.fr to create an account.");
            return;
        }
        
        const freeCpus = await fetchCPUs();
        if (!checkParameters()) {
            if (freeCpus === 0) {
                alert("Another annotation is already running on the server. Please try again later.\nIn the future, a queue system will be implemented to manage annotations automatically.");
            }
            return;
        }

        const runId = new Date().getTime();
        updateFAParameters({run_id: runId, cpus: freeCpus});

        try {
            console.log('Run started with parameters:', faParameters);
            const createRunResponse = await axios.post(`${CONFIG.API_BASE_URL}/create_farun`, { 
                run_id: runId, 
                cpus: freeCpus, 
                parameters: faParameters, 
                user: user 
            });
            await addAnnotation(createRunResponse.data);
            navigate('/my-annotations', { state: { from: 'functional-annotation' } });

            let proteinFileOnServer = await uploadFile(faParameters.proteinFile, 'protein_fa', runId);

            updateFAParameters({proteinFileOnServer: proteinFileOnServer});
            await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, {
                run_id: runId, 
                user: user, 
                data_type: 'protein_fa',
                file_list: proteinFileOnServer 
            });
            
            try {
                const brownamingResult = await axios.post(`${CONFIG.API_BASE_URL}/run_brownaming`, { 'parameters': faParameters, 'annotation_file': proteinFileOnServer, 'run_id': runId, 'cpus': freeCpus });
                console.log('Brownaming completed: ', brownamingResult.data);
                await updateAnnotation(user, runId, 'timers', {'Running Brownaming ...': brownamingResult.data.timer})
                await updateAnnotation(user, runId, 'resumeData', {
                    'brownamingResults': brownamingResult.data.output_files,
                    'brownaming_dir': brownamingResult.data.brownaming_dir
                });                

                await axios.post(`${CONFIG.API_BASE_URL}/set_annotation_completed`, { 'run_id': runId })
                

            } catch (error) {
                await updateAnnotation(user, runId, 'status', 'failed');
                await updateAnnotation(user, runId, 'error', error.response?.data || error.message);
            }   

            
        

        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='page'>
            <div className='navigation-buttons'>
                <button className="t2_bold left" onClick={() => navigate('/settings')}>Back</button>
                <div></div>
            </div>
            <div className='settings-container'>
                <h2 className='home-h2'>Functional Annotation</h2>
                
                <SpeciesInput 
                    inputSpecies={inputSpecies}
                    setInputSpecies={setInputSpecies}
                    searchError={speciesSearchError}
                    onClick={() => handleClickSpeciesSearch(inputSpecies)}
                    buttonLabel="Confirm"
                />
                <div className="card-container-header">
                    {faParameters.species && faParameters.species.scientificName && (
                        <div className="taxonomy-card">
                            <h3>
                                <i>{faParameters.species.scientificName.charAt(0).toUpperCase() + faParameters.species.scientificName.slice(1).toLowerCase()}</i>
                                <br />
                                [TaxID: {faParameters.species.taxonID}]
                            </h3>
                            <Image file={faParameters.species.imageUrl}/>
                        </div>
                    )}
                    <div className="start-section">
                        <h3>Protein File</h3>
                        <div className='input-protein-section form-element'>
                            <div className="radioLabel">
                                <div className="label-tooltip-wrapper">
                                    <label>Protein file</label>
                                    <div className="tooltip-container">
                                        <img src={HelpIcon} alt="help" className="helpIcon"/>
                                        <span className="help-span">Protein FASTA file.</span>
                                    </div>
                                </div>
                            </div>
                            <FormElementInputFile
                                label="Protein FASTA"
                                disabled={false}
                                handleFileChange={handleFileChange}
                                value={faParameters.proteinFileAccession}
                                allowMultiple={false}
                            />
                        </div>
                    </div>
                </div>

                <h3>Options</h3>
                <SectionBrownaming 
                    disabled={false}
                    updateParameters={updateFAParameters}
                    parameters={faParameters}
                    showSkipOption={false}
                />
            </div>
            <button 
                className="run-annotation-btn btn-tab-style active t3"
                onClick={handleRunFunctionalAnnotation}
            >
                {isLoading ? 'Running...' : 'Run Functional Annotation'}
            </button>    
            {isLoading && (<Loading/>)}        
        </div>
    );
}   