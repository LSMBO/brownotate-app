import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

import CONFIG from '../config';
import "./Settings.css";

import DBSUniprot from "../classes/DBSUniprot";
import DBSEnsembl from "../classes/DBSEnsembl";
import DBSRefSeq from "../classes/DBSRefSeq";
import DBSGenBank from "../classes/DBSGenBank";

import { useParameters } from "../contexts/ParametersContext";
import { useUser } from '../contexts/UserContext';
import { useAnnotations } from '../contexts/AnnotationsContext';
import { useDBSearch } from '../contexts/DBSearchContext';

import { downloadEnsemblFTP, downloadNCBI, handleClickDownload } from '../utils/Download';
import { speciesExists, getDBSearches, executeDBSearchRoute } from '../utils/DatabaseSearch';
import { handleAnnotationRun } from '../utils/AnnotationRun';

import SpeciesInput from "../components/SpeciesInput";
import SectionStart from "./Settings/SectionStart";
import SectionAssembly from "./Settings/SectionAssembly";
import SectionAnnotation from "./Settings/SectionAnnotation";
import Augustus from "./Settings/Augustus";
import SectionBrownaming from "./Settings/SectionBrownaming";
import SectionBusco from "./Settings/SectionBusco";
import Image from "../components/Image";
import Loading from '../components/Loading';

export default function Settings() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [inputSpecies, setInputSpecies] = useState("");
    const [speciesSearchError, setSpeciesSearchError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { fetchCPUs, addAnnotation, updateAnnotation} = useAnnotations();
    const { parameters, updateParameters } = useParameters();
    const { dbs } = useDBSearch();


    useEffect(() => {
        const initializeSpecies = async () => {
            window.scrollTo(0, 0);
            if (parameters.startSection.assembly) {
                await handleClickSpeciesSearch(parameters.startSection.assembly.scientific_name);
            }
            else if (parameters.startSection.sequencing) {
                await handleClickSpeciesSearch(parameters.startSection.sequencing.scientificName);
            }
        };
        initializeSpecies();
    }, []);

    // Automatically set assembler based on sequencing platform
    useEffect(() => {
        if (parameters.startSection.sequencing) {
            let platform = parameters.startSection.platform || '';
            
            // If using run accessions AND they are selected, get platform from the first run
            if (parameters.startSection.sequencingRuns && parameters.startSection.sequencingRunList.length > 0) {
                const firstRun = parameters.startSection.sequencingRunList[0];
                platform = firstRun.platform || '';
            }
            
            // Determine assembler based on platform
            if (platform.includes("PACBIO_SMRT") || platform.includes("OXFORD_NANOPORE")) {
                // Long read platforms: use CANU
                updateParameters({assemblySection: {runFastp: false, runBowtie2: false}});
                updateParameters({assemblySection: {canu: true, megahit: false}});
            } else if (platform) {
                // Short read platforms: use Megahit and enable fastp and bowtie2
                updateParameters({assemblySection: {runFastp: true, runBowtie2: true}});
                updateParameters({assemblySection: {canu: false, megahit: true}});
            }
        }
    }, [parameters.startSection.sequencingRunList, parameters.startSection.platform, parameters.startSection.sequencingRuns, parameters.startSection.sequencingFiles]);

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
        
        // Check if we already have DBS data from a previous search
        let pastDBS = await getDBSearches(species['taxonID']);
        
        const newDBS = {
            'uniprot': null,
            'ensembl': null, 
            'refseq': null,
            'genbank': null,
        };

        // Load from past searches if available
        if (pastDBS.status === 'success' && pastDBS.data) {
            if (pastDBS.data.uniprot?.status === 'success') {
                newDBS.uniprot = new DBSUniprot(new Date().getTime(), pastDBS.data.uniprot.data);
            }
            if (pastDBS.data.ensembl?.status === 'success') {
                newDBS.ensembl = new DBSEnsembl(new Date().getTime(), pastDBS.data.ensembl.data);
            }
            if (pastDBS.data.refseq?.status === 'success') {
                newDBS.refseq = new DBSRefSeq(new Date().getTime(), pastDBS.data.refseq.data);
            }
            if (pastDBS.data.genbank?.status === 'success') {
                newDBS.genbank = new DBSGenBank(new Date().getTime(), pastDBS.data.genbank.data);
            }
            
            // Return if we found all data from database
            if (newDBS.uniprot && newDBS.ensembl && newDBS.refseq && newDBS.genbank) {
                return newDBS;
            }
        }
        
        // Build taxonomy params for searches
        let params = {
            user: user,
            taxonomy: {
                'scientificName': species.scientificName,
                'taxonId': species.taxonID,
                'lineage': species.lineage,
                'is_bacteria': species.is_bacteria,
                'taxo_image_url': species.imageUrl,
                'statistics': species.statistics
            },
            options: { active: true }
        };

        // Uniprot (if not already loaded)
        if (!newDBS.uniprot) {
            let dbsUniprotResults = await executeDBSearchRoute('dbs_uniprot', params, source.token);
            if (dbsUniprotResults.success && dbsUniprotResults.data && dbsUniprotResults.data.status === 'success') {
                newDBS.uniprot = new DBSUniprot(new Date().getTime(), dbsUniprotResults.data.data);
            }
        }

        // Ensembl (if not already loaded)
        if (!newDBS.ensembl) {
            let dbsEnsemblResults = await executeDBSearchRoute('dbs_ensembl', params, source.token);
            if (dbsEnsemblResults.success && dbsEnsemblResults.data && dbsEnsemblResults.data.status === 'success') {
                newDBS.ensembl = new DBSEnsembl(new Date().getTime(), dbsEnsemblResults.data.data);
            }
        }

        // RefSeq (if not already loaded)
        if (!newDBS.refseq) {
            let dbsRefSeqResults = await executeDBSearchRoute('dbs_refseq', params, source.token);
            if (dbsRefSeqResults.success && dbsRefSeqResults.data && dbsRefSeqResults.data.status === 'success') {
                newDBS.refseq = new DBSRefSeq(new Date().getTime(), dbsRefSeqResults.data.data);
            }
        }

        // GenBank (if not already loaded)
        if (!newDBS.genbank) {
            let dbsGenBankResults = await executeDBSearchRoute('dbs_genbank', params, source.token);
            if (dbsGenBankResults.success && dbsGenBankResults.data && dbsGenBankResults.data.status === 'success') {
                newDBS.genbank = new DBSGenBank(new Date().getTime(), dbsGenBankResults.data.data);
            }
        }
        
        return newDBS;
    }

    const selectProteinSet = (dbs) => {
        const proteinSet = [];
        const targetTaxID = String(parameters.species.taxonID);
        // Add Uniprot SwissProt and TrEMBL
        if (dbs.uniprot) {
            if (dbs.uniprot.swissprot && dbs.uniprot.swissprot.count > 0) {
                proteinSet.push(dbs.uniprot.swissprot);
            }
            if (dbs.uniprot.trembl && dbs.uniprot.trembl.count > 0) {
                proteinSet.push(dbs.uniprot.trembl);
            }
            
            // Add UniProt Proteomes (up to 5)
            if (dbs.uniprot.proteins && Array.isArray(dbs.uniprot.proteins)) {
                const filteredProteomes = dbs.uniprot.proteins.filter(proteome => 
                    String(proteome.taxid) === targetTaxID
                );
                proteinSet.push(...filteredProteomes.slice(0, 5));
            }
        }

        // Add Ensembl proteins (up to 5)
        if (dbs.ensembl?.proteins && Array.isArray(dbs.ensembl.proteins)) {
            const filteredEnsembl = dbs.ensembl.proteins.filter(protein => 
                String(protein.taxid) === targetTaxID
            );
            proteinSet.push(...filteredEnsembl.slice(0, 5));
        }

        // Add RefSeq proteins (up to 5)
        if (dbs.refseq?.proteins && Array.isArray(dbs.refseq.proteins)) {
            const filteredRefSeq = dbs.refseq.proteins.filter(protein => 
                String(protein.taxid) === targetTaxID
            );
            proteinSet.push(...filteredRefSeq.slice(0, 5));
        }

        // Add GenBank proteins (up to 5)
        if (dbs.genbank?.proteins && Array.isArray(dbs.genbank.proteins)) {
            const filteredGenBank = dbs.genbank.proteins.filter(protein => 
                String(protein.taxid) === targetTaxID
            );
            proteinSet.push(...filteredGenBank.slice(0, 5));
        }

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
        if (parameters.startSection.sequencing && parameters.startSection.sequencingFiles && !parameters.startSection.platform) {
            alert("Please select a sequencing platform.");
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
        if (!checkParameters()) {
            if (freeCpus === 0) {
                alert("Another annotation is already running on the server. Please try again later.\nIn the future, a queue system will be implemented to manage annotations automatically.");
            }
            return;
        }
        console.log('freeCpus:', freeCpus);
        const runId = new Date().getTime();
        updateParameters({id: runId, cpus: freeCpus});

        try {
            console.log('Run started with parameters:', parameters);
            let stepList = calculateStepLists();
            const createRunResponse = await axios.post(`${CONFIG.API_BASE_URL}/create_run`, {
                run_id: runId, 
                cpus: freeCpus, 
                parameters: parameters, 
                user: user, 
                stepList: stepList
            });
            await addAnnotation(createRunResponse.data);
            navigate('/my-annotations', { state: { from: 'settings' } });

            // Upload and update assembly file
            if (parameters.startSection.assembly) {
                let assemblyFileOnServer;
                if (parameters.startSection.assembly.database === 'ENSEMBL') {
                    console.log('Run Downloading assembly file from Ensembl FTP ...');
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

            // Upload and update sequencing files
            if (parameters.startSection.sequencingFiles) {
                await updateAnnotation(user, runId, 'progress', 'Uploading sequencing files ...');
                let uploadedSequencingFiles = await uploadFile(parameters.startSection.sequencingFileList, 'sequencing', runId);
                updateParameters({startSection: {sequencingFileListOnServer: uploadedSequencingFiles }});
            }

            // Upload and update evidence files
            if (!parameters.species.is_bacteria) {
                let customEvidenceFileOnServer = [];
                if (parameters.annotationSection.customEvidence) {
                    await updateAnnotation(user, runId, 'progress', 'Uploading custom evidence files ...');
                    customEvidenceFileOnServer = await uploadFile(parameters.annotationSection.customEvidenceFileList, 'evidence', runId);
                } else {
                    await updateAnnotation(user, runId, 'progress', 'Searching for evidences (proteins) in the databases ...');
                    const dbsResult = await proteinDBSearch(parameters.species);
                    
                    await updateAnnotation(user, runId, 'progress', 'Selecting and downloading evidences (proteins) from the database search ...');
                    const proteinsSet = selectProteinSet(dbsResult);
                    customEvidenceFileOnServer = await handleClickDownload(proteinsSet, 'proteins', false, runId);
                    await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, 
                    { run_id: runId, 
                        user: user, 
                        data_type: 'evidence', 
                        file_list: customEvidenceFileOnServer 
                    });
                }
                updateParameters({annotationSection: {customEvidenceFileOnServer: customEvidenceFileOnServer }});
            }
            await handleAnnotationRun(runId, user, updateAnnotation, false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

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
            updateParameters({'species': {
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
            updateParameters({'species': null });
        }
        
    }
  
    const calculateStepLists = () => {
        let stepList = [];
        let stepCount = 0;

        if (parameters.startSection.sequencing && parameters.startSection.sequencingFiles) {
            stepList.push({ type: 'major', name: 'Uploading sequencing files ...', number: stepCount++ });
        } 
        if (parameters.startSection.assembly) {
            if (parameters.startSection.assembly.database === 'ENSEMBL') {
                stepList.push({ type: 'minor', name: 'Downloading assembly file from Ensembl FTP ...', number: stepCount++ });
            } else if (parameters.startSection.assembly.database === 'NCBI') {
                stepList.push({ type: 'minor', name: 'Downloading assembly file from NCBI ...', number: stepCount++ });
            } else {
                stepList.push({ type: 'minor', name: 'Uploading assembly file ...', number: stepCount++ });
            }
        }
        if (!parameters.species.is_bacteria) {
            if (parameters.annotationSection.customEvidence) {
                stepList.push({ type: 'minor', name: 'Uploading custom evidence files ...', number: stepCount++ });
            } else {
                stepList.push({ type: 'major', name: 'Searching for evidences (proteins) in the databases ...', number: stepCount++ });
                stepList.push({ type: 'minor', name: 'Selecting and downloading evidences (proteins) from the database search ...', number: stepCount++ });
            }
        }   
        if (parameters.startSection.sequencing) {
            if (parameters.startSection.sequencingRuns) {
                stepList.push({ type: 'major', name: 'Downloading sequencing files from SRA ...', number: stepCount++ });
            }
            // Preprocessing steps (for both Megahit and CANU if requested)
            if (parameters.assemblySection.runFastp) {
                stepList.push({ type: 'major', name: 'Running fastp on sequencing files ...', number: stepCount++ });
            }
            if (parameters.assemblySection.runBowtie2) {
                stepList.push({ type: 'major', name: 'Removing Phix from sequencing files ...', number: stepCount++ });
            }
            // Add assembler step based on selected assembler
            if (parameters.assemblySection.canu) {
                stepList.push({ type: 'major', name: 'Running CANU assembly ...', number: stepCount++ });
            } else {
                stepList.push({ type: 'major', name: 'Running Megahit assembly ...', number: stepCount++ });
            }
        }

        if (parameters.buscoSection.assembly) {
            stepList.push({ type: 'major', name: 'Running BUSCO on assembly ...', number: stepCount++ });
        }

        if (parameters.species.is_bacteria) {
            stepList.push({ type: 'major', name: 'Running Prokka annotation ...', number: stepCount++ });
        } else {
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
                <button className="t2_bold right" onClick={() => navigate('/functional-annotation', { state: { from: 'settings' } })}>Functional Annotation</button>
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
                {parameters.startSection.sequencing && parameters.startSection.platform && (
                    <>
                        <h3>Assembly Method</h3>
                        <SectionAssembly updateParameters={updateParameters} parameters={parameters}/>
                    </>
                )}
                <h3>Proteins prediction</h3>
                <SectionAnnotation updateParameters={updateParameters} parameters={parameters}/>
                
                {parameters.species && parameters.species.is_bacteria === false && (
                    <> 
                        <h3>Augustus parameters</h3>
                        <Augustus updateParameters={updateParameters} parameters={parameters}/>
                    </>
                )}
                   
                
                <h3>Functional Annotation</h3>
                <SectionBrownaming updateParameters={updateParameters} parameters={parameters}/>
                <h3>Busco completness evaluation</h3>
                <SectionBusco updateParameters={updateParameters} parameters={parameters}/>
            </div>
            <button 
                className="run-annotation-btn btn-tab-style active t3" 
                onClick={handleSubmit}
            >
                Run Brownotate
            </button>
            <div className="debugging-container">
                <h3>Debugging Information</h3>
                <pre>{JSON.stringify(parameters, null, 2)}</pre>
            </div>
            {isLoading && (<Loading/>)}
        </div>
    )
}