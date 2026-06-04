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
import { speciesExists, executeDBSearchRoute } from '../utils/DatabaseSearch';
import { handleAnnotationRunNewArchitecture } from '../utils/AnnotationRun';

import SpeciesInput from "../components/SpeciesInput";
import SectionStart from "./Settings/SectionStart";
import SectionAssembly from "./Settings/SectionAssembly";
import SectionRnaAssembly from "./Settings/SectionRnaAssembly";
import SectionAnnotation from "./Settings/SectionAnnotation";
import Augustus from "./Settings/Augustus";
import SectionBrownaming from "./Settings/SectionBrownaming";
import SectionBusco from "./Settings/SectionBusco";
import Image from "../components/Image";
import Loading from '../components/Loading';

export default function Settings() {
    const MIN_DIRECT_UNIPROT_EVIDENCE = 800;

    const navigate = useNavigate();
    const { user, isGuest } = useUser();
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [inputSpecies, setInputSpecies] = useState("");
    const [speciesSearchError, setSpeciesSearchError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDebug, setShowDebug] = useState(false);
    const { fetchCPUs, addAnnotation, updateAnnotation, fetchUserAnnotations } = useAnnotations();
    const { parameters, updateParameters } = useParameters();

    const formatTimer = (startMs) => {
        const elapsed = Math.max(0, Date.now() - startMs);
        const ms = elapsed % 1000;
        const totalSeconds = Math.floor(elapsed / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);
        const pad = (value, size = 2) => String(value).padStart(size, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(ms, 3)}`;
    };


    useEffect(() => {
        const initializeSpecies = async () => {
            window.scrollTo(0, 0);
            if (parameters.startSection.assembly) {
                await handleClickSpeciesSearch(parameters.startSection.assembly.scientific_name);
            }
            else if (parameters.startSection.sequencing) {
                await handleClickSpeciesSearch(parameters.startSection.sequencing.scientificName);
            }
            else if (parameters.startSection.rnaSequencing) {
                const speciesName =
                    parameters.startSection.rnaSequencing.scientificName ||
                    parameters.startSection.rnaSequencing.scientific_name;
                if (speciesName) {
                    await handleClickSpeciesSearch(speciesName);
                }
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
        const newDBS = {
            'uniprot': null,
            'ensembl': null, 
            'refseq': null,
            'genbank': null,
        };
        const availableSources = {
            uniprot: false,
            ensembl: false,
            refseq: false,
            genbank: false
        };
        
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

        let dbsUniprotResults = await executeDBSearchRoute('dbs_uniprot', params, source.token);
        if (dbsUniprotResults.success && dbsUniprotResults.data && dbsUniprotResults.data.status === 'success') {
            newDBS.uniprot = new DBSUniprot(new Date().getTime(), dbsUniprotResults.data.data);
            availableSources.uniprot = true;
        }

        let dbsEnsemblResults = await executeDBSearchRoute('dbs_ensembl', params, source.token);
        if (dbsEnsemblResults.success && dbsEnsemblResults.data && dbsEnsemblResults.data.status === 'success') {
            newDBS.ensembl = new DBSEnsembl(new Date().getTime(), dbsEnsemblResults.data.data);
            availableSources.ensembl = true;
        }

        let dbsRefSeqResults = await executeDBSearchRoute('dbs_refseq', params, source.token);
        if (dbsRefSeqResults.success && dbsRefSeqResults.data && dbsRefSeqResults.data.status === 'success') {
            newDBS.refseq = new DBSRefSeq(new Date().getTime(), dbsRefSeqResults.data.data);
            availableSources.refseq = true;
        }

        let dbsGenBankResults = await executeDBSearchRoute('dbs_genbank', params, source.token);
        if (dbsGenBankResults.success && dbsGenBankResults.data && dbsGenBankResults.data.status === 'success') {
            newDBS.genbank = new DBSGenBank(new Date().getTime(), dbsGenBankResults.data.data);
            availableSources.genbank = true;
        }
        
        return {
            dbs: newDBS,
            availableSources: availableSources
        };
    }

    const deduplicateProteinEntries = (proteinSet) => {
        const seen = new Set();
        return proteinSet.filter((protein) => {
            const key = `${protein.database || ''}|${protein.accession || ''}|${protein.download_url || ''}|${protein.taxid || ''}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    };

    const getProteinCandidatesByTaxonomicDistance = (dbs, targetTaxID, availableSources) => {
        const exactMatches = [];
        const nearbyMatches = [];

        const collectProteins = (proteinList) => {
            if (!proteinList || !Array.isArray(proteinList)) {
                return;
            }

            proteinList.forEach((protein) => {
                if (!protein) {
                    return;
                }
                if (String(protein.taxid) === targetTaxID) {
                    exactMatches.push(protein);
                } else {
                    nearbyMatches.push(protein);
                }
            });
        };

        // Les routes de DB search renvoient déjà les résultats en remontant la lignée taxonomique
        if (availableSources.uniprot && dbs.uniprot?.proteome && Array.isArray(dbs.uniprot.proteome)) {
            collectProteins(dbs.uniprot.proteome);
        }
        if (availableSources.ensembl && dbs.ensembl?.proteins && Array.isArray(dbs.ensembl.proteins)) {
            collectProteins(dbs.ensembl.proteins);
        }
        if (availableSources.refseq && dbs.refseq?.proteins && Array.isArray(dbs.refseq.proteins)) {
            collectProteins(dbs.refseq.proteins);
        }
        if (availableSources.genbank && dbs.genbank?.proteins && Array.isArray(dbs.genbank.proteins)) {
            collectProteins(dbs.genbank.proteins);
        }

        return {
            exactMatches: deduplicateProteinEntries(exactMatches),
            nearbyMatches: deduplicateProteinEntries(nearbyMatches)
        };
    };

    const getAllProteins = (dbs, availableSources) => {
        const allProteins = [];
        if (availableSources.uniprot && dbs.uniprot?.swissprot?.count > 0) {
            allProteins.push(dbs.uniprot.swissprot);
        }
        if (availableSources.uniprot && dbs.uniprot?.trembl?.count > 0) {
            allProteins.push(dbs.uniprot.trembl);
        }
        if (availableSources.uniprot && dbs.uniprot?.proteome && Array.isArray(dbs.uniprot.proteome)) {
            allProteins.push(...dbs.uniprot.proteome);
        }
        if (availableSources.ensembl && dbs.ensembl?.proteins && Array.isArray(dbs.ensembl.proteins)) {
            allProteins.push(...dbs.ensembl.proteins);
        }
        if (availableSources.refseq && dbs.refseq?.proteins && Array.isArray(dbs.refseq.proteins)) {
            allProteins.push(...dbs.refseq.proteins);
        }
        if (availableSources.genbank && dbs.genbank?.proteins && Array.isArray(dbs.genbank.proteins)) {
            allProteins.push(...dbs.genbank.proteins);
        }
        return allProteins;
    };

    const hasSpeciesProteinFromSource = (proteinList, targetTaxID) => {
        if (!proteinList || !Array.isArray(proteinList)) {
            return false;
        }
        return proteinList.some((protein) => String(protein.taxid) === targetTaxID);
    };

    const MAX_ANNOTATION_FILES = 4;

    const getEvidencePriority = (protein) => {
        const database = (protein?.database || '').toUpperCase();
        if (database === 'UNIPROTKB') return 0;
        if (database === 'ENSEMBL') return 1;
        if (database === 'NCBI') {
            const accession = (protein?.accession || '').toUpperCase();
            if (accession.includes('REFSEQ')) return 2;
            return 3;
        }
        return 4;
    };

    const limitEvidenceFiles = (proteinSet) => {
        const deduplicated = deduplicateProteinEntries(proteinSet);
        const prioritized = [...deduplicated].sort((a, b) => {
            const byPriority = getEvidencePriority(a) - getEvidencePriority(b);
            if (byPriority !== 0) return byPriority;

            const countA = Number(a?.count || 0);
            const countB = Number(b?.count || 0);
            return countB - countA;
        });
        return prioritized.slice(0, MAX_ANNOTATION_FILES);
    };

    const selectProteinSet = (dbs, availableSources) => {
        const proteinSet = [];
        const targetTaxID = String(parameters.species.taxonID);

        // Toujours inclure les protéines de l'espèce cible
        if (availableSources.uniprot && dbs.uniprot?.swissprot?.count > 0) {
            proteinSet.push(dbs.uniprot.swissprot);
        }
        if (availableSources.uniprot && dbs.uniprot?.trembl?.count > 0) {
            proteinSet.push(dbs.uniprot.trembl);
        }

        const { exactMatches, nearbyMatches } = getProteinCandidatesByTaxonomicDistance(dbs, targetTaxID, availableSources);

        // Si on a des annotations directes, on n'utilise qu'elles
        if (exactMatches.length > 0) {
            proteinSet.push(...exactMatches);
        } else {
            // Sinon, on prend au maximum 4 annotations d'un niveau phylogénétique supérieur
            proteinSet.push(...nearbyMatches.slice(0, MAX_ANNOTATION_FILES));
        }

        const directUniprotCount = (dbs.uniprot?.swissprot?.count || 0) + (dbs.uniprot?.trembl?.count || 0);
        const finalSet = limitEvidenceFiles(proteinSet);

        console.log(
            `Evidence strategy: ${exactMatches.length > 0 ? 'direct target-species annotations' : 'up to 4 higher-level neighboring annotations'}; ` +
            `direct UniProt count=${directUniprotCount}; selected files=${finalSet.length}`
        );
        console.log('Selected evidence taxa:', finalSet.map((protein) => `${protein.scientific_name || 'Unknown'} (${protein.taxid || 'NA'}) - ${protein.database || 'Unknown'}`));

        return finalSet;
    };

    const hasValidServerFile = (filePath) => {
        if (Array.isArray(filePath)) {
            return filePath.length > 0 && filePath.every((item) => (
                typeof item === 'string' && item.trim() !== '' && item.trim().toLowerCase() !== 'none'
            ));
        }
        return typeof filePath === 'string' && filePath.trim() !== '' && filePath.trim().toLowerCase() !== 'none';
    };

    const checkParameters = () => {
        if (!parameters.species.taxonID) {
            alert("Please select a valid species.");
            return false;
        }
        if (!parameters.startSection.sequencing && !parameters.startSection.assembly && !parameters.startSection.rnaSequencing) {
            alert("Please select either sequencing mode, assembly mode, or RNA sequencing mode.");
            return false;
        }
        if (parameters.startSection.rnaSequencing && parameters.startSection.rnaSequencingFiles && parameters.startSection.rnaSequencingFileList.length === 0) {
            alert("Please load at least one RNA sequencing file.");
            return false;
        }
        if (parameters.startSection.rnaSequencing && parameters.startSection.rnaSequencingRuns && parameters.startSection.rnaSequencingRunList.length === 0) {
            alert("Please provide at least one SRA accession for RNA sequencing.");
            return false;
        }
        if (parameters.startSection.rnaSequencing && (!parameters.startSection.rnaSequencingFiles && !parameters.startSection.rnaSequencingRuns)) {
            alert("Please provide either RNA sequencing files or SRA accessions.");
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
        if (!parameters.species.is_bacteria && !parameters.startSection.rnaSequencing && parameters.annotationSection.customEvidence && parameters.annotationSection.customEvidenceFileList.length === 0) {
            alert("Please provide at least one protein file as evidence for Augustus.");
            return false;
        }
        return true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Block guest users from running annotations
        if (isGuest) {
            alert("Guest mode allows database searches only.\n\nTo run annotations, please contact fbertile@unistra.fr to create an account.");
            return;
        }
        
        const freeCpus = await fetchCPUs();
        if (freeCpus === 0) {
            alert("An annotation is already running on the server. Please try again later.");
            return;
        }
        if (!checkParameters()) {
            return;
        }

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

            // Upload and update RNA sequencing files
            if (parameters.startSection.rnaSequencingFiles) {
                await updateAnnotation(user, runId, 'progress', 'Uploading RNA sequencing files ...');
                let uploadedRnaSequencingFiles = await uploadFile(parameters.startSection.rnaSequencingFileList, 'rna_sequencing', runId);
                updateParameters({startSection: {rnaSequencingFileListOnServer: uploadedRnaSequencingFiles }});
                await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, {
                    run_id: runId,
                    user: user,
                    data_type: 'rna_sequencing',
                    file_list: uploadedRnaSequencingFiles
                });
            }

            // Upload and update evidence files
            if (!parameters.species.is_bacteria && !parameters.startSection.rnaSequencing) {
                let customEvidenceFileOnServer = [];
                let evidenceMetadata = {
                    mode: 'unknown',
                    source_files: [],
                    selected_entries: []
                };
                if (parameters.annotationSection.customEvidence) {
                    await updateAnnotation(user, runId, 'progress', 'Uploading custom evidence files ...');
                    customEvidenceFileOnServer = await uploadFile(parameters.annotationSection.customEvidenceFileList, 'evidence', runId);
                    evidenceMetadata = {
                        mode: 'custom',
                        source_files: Array.isArray(customEvidenceFileOnServer) ? customEvidenceFileOnServer : [customEvidenceFileOnServer],
                        selected_entries: []
                    };
                } else {
                    const searchStart = Date.now();
                    await updateAnnotation(user, runId, 'progress', 'Searching for evidences (proteins) in the databases ...');
                    const dbsSearchResult = await proteinDBSearch(parameters.species);
                    await updateAnnotation(user, runId, 'timers', {
                        'Searching for evidences (proteins) in the databases ': formatTimer(searchStart)
                    });

                    const dbsResult = dbsSearchResult.dbs;
                    const availableSources = dbsSearchResult.availableSources;
                    console.log('Searching for evidences (proteins) in the databases, found:', dbsSearchResult);

                    const downloadStart = Date.now();
                    await updateAnnotation(user, runId, 'progress', 'Selecting and downloading evidences (proteins) from the database search ...');
                    const proteinsSet = selectProteinSet(dbsResult, availableSources);
                    if (!proteinsSet || proteinsSet.length === 0) {
                        throw new Error('No protein evidence found in available database sources for this species.');
                    }
                    console.log('Protein set selected for evidence:', proteinsSet);
                    const evidenceDownload = await handleClickDownload(proteinsSet, 'proteins', false, runId, true, { mergeScope: 'run' });
                    customEvidenceFileOnServer = evidenceDownload?.finalFilePath || evidenceDownload;
                    evidenceMetadata = {
                        mode: 'automatic',
                        source_files: evidenceDownload?.sourceFiles || [],
                        selected_entries: proteinsSet.map((protein) => ({
                            scientific_name: protein.scientific_name || null,
                            taxid: protein.taxid || null,
                            database: protein.database || null,
                            accession: protein.accession || null
                        }))
                    };
                    await updateAnnotation(user, runId, 'timers', {
                        'Selecting and downloading evidences (proteins) from the database search ': formatTimer(downloadStart)
                    });
                    console.log('Downloaded evidence files from database search:', customEvidenceFileOnServer);
                }

                if (!hasValidServerFile(customEvidenceFileOnServer)) {
                    await updateAnnotation(user, runId, 'error', 'No valid protein evidence file was produced after selection/download.');
                    throw new Error('No valid protein evidence file was produced after selection/download.');
                }

                await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, 
                { run_id: runId, 
                    user: user, 
                    data_type: 'evidence', 
                    file_list: customEvidenceFileOnServer 
                });

                await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, {
                    run_id: runId,
                    user: user,
                    data_type: 'evidence_metadata',
                    metadata: evidenceMetadata
                });

                updateParameters({annotationSection: {
                    customEvidenceFileOnServer: customEvidenceFileOnServer,
                    evidenceFileOnServer: customEvidenceFileOnServer,
                    evidenceSelectionMode: evidenceMetadata.mode,
                    evidenceSourceFiles: evidenceMetadata.source_files,
                    selectedEvidenceEntries: evidenceMetadata.selected_entries
                }});
            }
            await handleAnnotationRunNewArchitecture(runId, user, fetchUserAnnotations);
        } catch (error) {
            console.error('Error:', error);
            try {
                await updateAnnotation(user, runId, 'status', 'failed');
                await updateAnnotation(user, runId, 'error', {
                    message: error?.response?.data?.message || error.message || 'Unknown annotation error',
                    step: 'pipeline',
                    source: 'client'
                });
            } catch (updateErr) {
                console.error('Error while updating failed status:', updateErr);
            }
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
        const isRnaSeq = Boolean(parameters.startSection.rnaSequencing);

        if (parameters.startSection.sequencing && parameters.startSection.sequencingFiles) {
            stepList.push({ type: 'major', name: 'Uploading sequencing files ...', number: stepCount++ });
        }
        if (isRnaSeq && parameters.startSection.rnaSequencingFiles) {
            stepList.push({ type: 'major', name: 'Uploading RNA sequencing files ...', number: stepCount++ });
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
        if (!parameters.species.is_bacteria && !isRnaSeq) {
            if (parameters.annotationSection.customEvidence) {
                stepList.push({ type: 'minor', name: 'Uploading custom evidence files ...', number: stepCount++ });
            } else {
                stepList.push({ type: 'minor', name: 'Searching for evidences (proteins) in the databases ...', number: stepCount++ });
                stepList.push({ type: 'major', name: 'Selecting and downloading evidences (proteins) from the database search ...', number: stepCount++ });
            }
        }
        if (isRnaSeq && parameters.startSection.rnaSequencingRuns) {
            stepList.push({ type: 'major', name: 'Downloading RNA sequencing files from SRA ...', number: stepCount++ });
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

        if (isRnaSeq) {
            if ((parameters.rnaAssemblySection?.assembler || 'trinity') === 'trinity') {
                stepList.push({ type: 'major', name: 'Running Trinity transcriptome assembly ...', number: stepCount++ });
            } else {
                stepList.push({ type: 'major', name: 'Running RNA-Bloom transcriptome assembly ...', number: stepCount++ });
            }
            stepList.push({ type: 'major', name: 'Running TransDecoder protein prediction ...', number: stepCount++ });
        }

        if (parameters.buscoSection.assembly && !isRnaSeq) {
            stepList.push({ type: 'major', name: 'Running BUSCO on assembly ...', number: stepCount++ });
        }

        if (parameters.species.is_bacteria && !isRnaSeq) {
            stepList.push({ type: 'major', name: 'Running Prokka annotation ...', number: stepCount++ });
        } else if (!isRnaSeq) {
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
                <button className="t2_bold right" onClick={() => navigate('/brownaming', { state: { from: 'settings' } })}>Brownaming</button>
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
                {parameters.startSection.rnaSequencing && (
                    <>
                        <h3>Transcript Assembly</h3>
                        <SectionRnaAssembly updateParameters={updateParameters} parameters={parameters}/>
                    </>
                )}
                <h3>Proteins prediction</h3>
                <SectionAnnotation updateParameters={updateParameters} parameters={parameters}/>
                
                {parameters.species && parameters.species.is_bacteria === false && !parameters.startSection.rnaSequencing && (
                    <> 
                        <h3>Augustus parameters</h3>
                        <Augustus updateParameters={updateParameters} parameters={parameters}/>
                    </>
                )}
                   
                
                <h3>Protein Name Assignment (Brownaming)</h3>
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
                <h3 
                    onClick={() => setShowDebug(!showDebug)} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    {showDebug ? '▼' : '▶'} Debugging Information
                </h3>
                {showDebug && <pre>{JSON.stringify(parameters, null, 2)}</pre>}
            </div>
            {isLoading && (<Loading/>)}
        </div>
    )
}