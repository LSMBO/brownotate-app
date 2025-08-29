import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import CONFIG from '../config';
import "./Settings.css";

import Proteins from "../classes/Proteins";

import { useParameters } from "../contexts/ParametersContext";
import { useUser } from '../contexts/UserContext';
import { useAnnotations } from '../contexts/AnnotationsContext';
import { useDBSearch } from '../contexts/DBSearchContext';

import { downloadEnsemblFTP, downloadNCBI, handleClickDownload } from '../utils/Download';
import { speciesExists, getDBSearch, executeDBSearchRoute } from '../utils/DatabaseSearch';
import { handleAnnotationRun } from '../utils/AnnotationRun';

import SpeciesInput from "../components/SpeciesInput";
import SectionStart from "./Settings/SectionStart";
import SectionAnnotation from "./Settings/SectionAnnotation";
import Augustus from "./Settings/Augustus";
import SectionBrownaming from "./Settings/SectionBrownaming";
import SectionBusco from "./Settings/SectionBusco";
import Image from "../components/Image";

export default function Settings() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [inputSpecies, setInputSpecies] = useState("");
    const [speciesSearchError, setSpeciesSearchError] = useState(null);
    const { fetchCPUs, addAnnotation, updateAnnotation} = useAnnotations();
    const { parameters, updateParameters } = useParameters();
    const { dbsearch } = useDBSearch();

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

    const proteinDBSearch = async (species) => {
        const source = axios.CancelToken.source();
        let proteinsSet = new Proteins();
        let dbSearchResult = await getDBSearch(
            species['taxonID'], 
            source.token
        );
        if (dbSearchResult.success && dbSearchResult.data) {
            proteinsSet = dbSearchResult.data;
        } else {
            let species_snakecase = {
                'scientific_name': species.scientificName,
                'taxid': species.taxonID,
                'lineage': species.lineage,
                'is_bacteria': species.is_bacteria,
                'taxo_image_url': species.imageUrl
            }
            let params = {
                user: user,
                createNewDBS: true,
                dbsearch: species_snakecase
            }
            let dbsTaxonomyResults = await executeDBSearchRoute('dbs_taxonomy', params, source.token);
            if (dbsTaxonomyResults.success && dbsTaxonomyResults.data) {
                params.dbsearch = dbsTaxonomyResults.data;
            } else {
                console.warn('Taxonomy search failed or returned no data.');
            }

            // Uniprot Proteome
            let dbsUniprotProteomeResults = await executeDBSearchRoute('dbs_uniprot_proteome', params, source.token);
            if (dbsUniprotProteomeResults.success && dbsUniprotProteomeResults.data) {
                params.dbsearch = dbsUniprotProteomeResults.data;
            } else {
                console.warn('Uniprot Proteome search failed or returned no data.');
            }

            // Ensembl
            let dbsEnsemblResults = await executeDBSearchRoute('dbs_ensembl', params, source.token);
            if (dbsEnsemblResults.success && dbsEnsemblResults.data) {
                params.dbsearch = dbsEnsemblResults.data;
            } else {
                console.warn('Ensembl search failed or returned no data.');
            }

            // RefSeq
            let dbsRefSeqResults = await executeDBSearchRoute('dbs_refseq', params, source.token);
            if (dbsRefSeqResults.success && dbsRefSeqResults.data) {
                params.dbsearch = dbsRefSeqResults.data;
            } else {
                console.warn('RefSeq search failed or returned no data.');
            }

            // GenBank
            let dbsGenBankResults = await executeDBSearchRoute('dbs_genbank', params, source.token);
            if (dbsGenBankResults.success && dbsGenBankResults.data) {
                params.dbsearch = dbsGenBankResults.data;
            } else {
                console.warn('GenBank search failed or returned no data.');
            }

            proteinsSet.setUniprotSwissprot(params.dbsearch.data.taxonomy);
            proteinsSet.setUniprotTrembl(params.dbsearch.data.taxonomy);
            proteinsSet.setUniprotProteomes(params.dbsearch.data.uniprot_proteomes);
            proteinsSet.setEnsembl(params.dbsearch.data.ensembl_annotated_genomes);
            proteinsSet.setRefseq(params.dbsearch.data.ncbi_refseq_annotated_genomes);
            proteinsSet.setGenbank(params.dbsearch.data.ncbi_genbank_annotated_genomes);
        }
        return proteinsSet;
    }

    const selectProteinSet = (proteins) => {
        const proteinSet = [];

        ['uniprot_swissprot', 'uniprot_trembl'].forEach(key => {
            if (proteins[key] && Object.keys(proteins[key]).length > 0) {
                proteinSet.push(proteins[key]);
            }
        });

        ['uniprot_proteomes', 'ensembl', 'refseq', 'genbank'].forEach(key => {
            if (Array.isArray(proteins[key]) && proteins[key].length > 0) {
                const filteredProteins = proteins[key].filter(protein => 
                    protein.taxid === parameters.species.taxonID
                );
                if (filteredProteins.length > 0) {
                    proteinSet.push(...filteredProteins.slice(0, 5));
                }
            }
        });

        return proteinSet;
    };


    const checkParameters = () => {
        if (!parameters.species.taxonID) {
            alert("Please select a valid species.");
            return false;
        }
        if (!parameters.startSection.sequencing && !parameters.startSection.assembly) {
            alert("Please select either sequencing mode or assembly mode.");
            return false;
        }
        if (parameters.startSection.sequencing && parameters.startSection.sequencingFiles && parameters.startSection.sequencingFileList.length === 0) {
            alert("Please load at least one sequencing file.");
            return false;
        }
        if (parameters.startSection.sequencing && parameters.startSection.sequencingRuns && parameters.startSection.sequencingRunList.length === 0) {
            alert("Please provide at least one SRA accession.");
            return false;
        }        
        if (parameters.startSection.sequencing && (!parameters.startSection.sequencingFiles && !parameters.startSection.sequencingRuns)) {
            alert("Please provide either sequencing files or SRA accessions.");
            return false;
        }
        if (parameters.startSection.assembly && (!parameters.startSection.assemblyFile && !parameters.startSection.assemblyAccession)) {
            alert("Please provide an assembly file.");
            return false;
        }
        if (!parameters.species.is_bacteria && parameters.annotationSection.customEvidence && parameters.annotationSection.customEvidenceFileList.length === 0) {
            alert("Please provide at least one protein file as evidence for Augustus.");
            return false;
        }
        return true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const freeCpus = await fetchCPUs();
        if (!checkParameters() || freeCpus === 0) {
            return;
        }
        console.log('freeCpus:', freeCpus);
        const runId = new Date().getTime();
        updateParameters({id: runId, cpus: freeCpus});

        try {
            console.log('Run started with parameters:', parameters);
            let stepList = calculateStepLists();
            const createRunResponse = await axios.post(`${CONFIG.API_BASE_URL}/create_run`, { run_id: runId, cpus: freeCpus, parameters: parameters, user: user, stepList: stepList });
            await addAnnotation(createRunResponse.data);
            navigate('/my-annotations', { state: { from: 'settings' } });

            // Upload and update assembly file
            if (parameters.startSection.assembly) {
                let assemblyFileOnServer;
                if (parameters.startSection.assembly.database === 'ENSEMBL') {
                    await updateAnnotation(user, runId, 'progress', 'Downloading assembly file from Ensembl FTP ...');
                    assemblyFileOnServer = await downloadEnsemblFTP(parameters.startSection.assembly.download_url, parameters.startSection.assemblyAccession, 'assembly');
                } else if (parameters.startSection.assembly.database === 'NCBI') {
                    await updateAnnotation(user, runId, 'progress', 'Downloading assembly file from NCBI ...');
                    assemblyFileOnServer = await downloadNCBI(parameters.startSection.assembly.download_command);
                } else {
                    await updateAnnotation(user, runId, 'progress', 'Uploading assembly file ...');
                    assemblyFileOnServer = await uploadFile(parameters.startSection.assemblyFile, 'assembly', runId);
                }
                updateParameters({startSection: {assemblyFileOnServer: assemblyFileOnServer }});
                await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, {
                    run_id: runId, 
                    user: user, 
                    data_type: 'assembly',
                    file_list: assemblyFileOnServer 
                });
            }

            // Upload and update evidence files
            if (!parameters.species.is_bacteria) {
                let customEvidenceFileOnServer = [];
                if (parameters.annotationSection.customEvidence) {
                    await updateAnnotation(user, runId, 'progress', 'Uploading custom evidence files ...');
                    customEvidenceFileOnServer = await uploadFile(parameters.annotationSection.customEvidenceFileList, 'evidence', runId);
                } else {
                    let proteinsSet = null;
                    let proteinsDBSearch;
                    if (!dbsearch) {
                        await updateAnnotation(user, runId, 'progress', 'Searching for evidences (proteins) in the databases ...');
                        proteinsDBSearch = await proteinDBSearch(parameters.species);
                        await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, {
                            run_id: runId, 
                            user: user,
                        });
                    } else {
                        proteinsDBSearch = dbsearch.proteins;
                    }
                    await updateAnnotation(user, runId, 'progress', 'Selecting and downloading evidences (proteins) from the database search ...');
                    proteinsSet = selectProteinSet(proteinsDBSearch);
                    customEvidenceFileOnServer = await handleClickDownload(proteinsSet, 'proteins', false);
                    await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, 
                    { run_id: runId, 
                        user: user, 
                        data_type: 'evidence', 
                        file_list: customEvidenceFileOnServer 
                    });
                }
                updateParameters({annotationSection: {customEvidenceFileOnServer: customEvidenceFileOnServer }});
                
            }
            // Upload and update sequencing files
            if (parameters.startSection.sequencingFiles) {
                await updateAnnotation(user, runId, 'progress', 'Uploading sequencing files ...');
                let uploadedSequencingFiles = await uploadFile(parameters.startSection.sequencingFileList, 'sequencing', runId);
                updateParameters({startSection: {sequencingFileListOnServer: uploadedSequencingFiles }});
            }

            handleAnnotationRun(runId, user, updateAnnotation, false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleClickSpeciesSearch = async () => {
        if (cancelTokenSource) {
            cancelTokenSource.cancel();
        }

        const source = axios.CancelToken.source();
        setCancelTokenSource(source);     
        const currentSpeciesFound = await speciesExists(inputSpecies);
        if (currentSpeciesFound) {
            updateParameters({'species': {
                'scientificName': currentSpeciesFound.scientific_name,
                'taxonID': currentSpeciesFound.taxid,
                'lineage': currentSpeciesFound.lineage,
                'is_bacteria': currentSpeciesFound.is_bacteria,
                'imageUrl': currentSpeciesFound.taxo_image_url
            }})
            setSpeciesSearchError(null);
        } else {
            setSpeciesSearchError(inputSpecies);
            updateParameters({'species': null });
        }
        
    }
  
    const calculateStepLists = () => {
        let stepList = [];
        let stepCount = 0;
        if (parameters.startSection.sequencing) {
            if (parameters.startSection.sequencingFiles) {
                stepList.push({ type: 'major', name: 'Uploading sequencing files ...', number: stepCount++ });
            } else {
                stepList.push({ type: 'major', name: 'Downloading sequencing files from SRA ...', number: stepCount++ });
            }
            if (!parameters.startSection.skipFastp) {
                stepList.push({ type: 'major', name: 'Running fastp on sequencing files ...', number: stepCount++ });
            }
            if (!parameters.startSection.skipPhix) {
                stepList.push({ type: 'major', name: 'Removing Phix from sequencing files ...', number: stepCount++ });
            }
            stepList.push({ type: 'major', name: 'Running Megahit assembly ...' });
        } else {
            if (parameters.startSection.assembly.database === 'ENSEMBL') {
                stepList.push({ type: 'minor', name: 'Downloading assembly file from Ensembl FTP ...', number: stepCount++ });
            } else if (parameters.startSection.assembly.database === 'NCBI') {
                stepList.push({ type: 'minor', name: 'Downloading assembly file from NCBI ...', number: stepCount++ });
            } else{
                stepList.push({ type: 'minor', name: 'Uploading assembly file ...', number: stepCount++ });
            }
        }

        if (parameters.buscoSection.assembly) {
            stepList.push({ type: 'major', name: 'Running BUSCO on assembly ...', number: stepCount++ });
        }

        if (parameters.species.is_bacteria) {
            stepList.push({ type: 'major', name: 'Running Prokka annotation ...', number: stepCount++ });
        } else {
            if (parameters.annotationSection.customEvidence) {
                stepList.push({ type: 'minor', name: 'Uploading custom evidence files ...', number: stepCount++ });
            } else {
                if (!dbsearch) {
                    stepList.push({ type: 'major', name: 'Searching for evidences (proteins) in the databases ...', number: stepCount++ });
                }
                stepList.push({ type: 'minor', name: 'Selecting and downloading evidences (proteins) from the database search ...', number: stepCount++ });
            }
            stepList.push({ type: 'minor', name: 'Splitting assembly for annotation ...', number: stepCount++ });
            stepList.push({ type: 'major', name: 'Running Scipio ...', number: stepCount++ });
            stepList.push({ type: 'major', name: 'Running gene prediction model ...', number: stepCount++ });
            // If less than 400 genes, add 2 more major steps but we cannot determine this now
            stepList.push({ type: 'major', name: 'Optimizing gene prediction model ...', number: stepCount++ });
            stepList.push({ type: 'major', name: 'Running Augustus annotation ...', number: stepCount++ });
        }
        if (parseInt(parameters.annotationSection.minLength) > 0) {
            stepList.push({ type: 'minor', name: 'Removing short sequences from annotation according to the length filter ...', number: stepCount++ });
        }
        if (parameters.annotationSection.removeStrict || parameters.annotationSection.removeSoft) {
            stepList.push({ type: 'minor', name: 'Removing redundancy from annotation ...', number: stepCount++ });
        }
        if (!parameters.brownamingSection.skip) {
            stepList.push({ type: 'major', name: 'Running Brownaming ...', number: stepCount++ });
        }
        if (parameters.buscoSection.annotation) {
            stepList.push({ type: 'major', name: 'Running BUSCO on annotation ...', number: stepCount++ });
        }
        return stepList;
    }

    return (
        <div className="page">
            <div className="navigation-buttons">
                <button className="t2_bold left" onClick={() => navigate('/', { state: { from: 'settings' } })}>Back Home</button>   
                <div></div>
            </div>
            <div className="settings-container">
                <h2 className="home-h2">Create Annotation</h2>
                <SpeciesInput 
                    inputSpecies={inputSpecies} 
                    setInputSpecies={setInputSpecies} 
                    searchError={speciesSearchError}
                    onClick={handleClickSpeciesSearch}
                    buttonLabel="Confirm"
                />
                <div className="card-container-header">
                    {parameters.species && parameters.species.scientificName && (
                    <div className="taxonomy-card">
                        <h3>
                            <i>{parameters.species.scientificName.charAt(0).toUpperCase() + parameters.species.scientificName.slice(1).toLowerCase()}</i>
                            <br />
                            [TaxID: {parameters.species.taxonID}]
                        </h3>
                        <Image file={parameters.species.imageUrl}/>
                    </div>
                    )}
                    <div className="start-section">
                        <h3>Annotate using Sequencing or Assembly data?</h3>
                        <SectionStart updateParameters={updateParameters} parameters={parameters}/>
                    </div>
                </div>
                <h3>Proteins prediction</h3>
                <SectionAnnotation updateParameters={updateParameters} parameters={parameters}/>
                
                {parameters.species && parameters.species.is_bacteria === false && (
                    <> 
                        <h3>Augustus parameters</h3>
                        <Augustus updateParameters={updateParameters} parameters={parameters}/>
                    </>
                )}
                   
                
                <h3>Proteins name assignment</h3>
                <SectionBrownaming updateParameters={updateParameters} parameters={parameters}/>
                <h3>Busco completness evaluation</h3>
                <SectionBusco updateParameters={updateParameters} parameters={parameters}/>
                <h3>Computational resource management</h3>
                <button className="submit-button t3" onClick={handleSubmit}>Run Brownotate</button>
            </div>
            {/* <div className="debugging-container">
                <h3>Debugging Information</h3>
                <pre>{JSON.stringify(parameters, null, 2)}</pre>
            </div> */}
        </div>
    )
}