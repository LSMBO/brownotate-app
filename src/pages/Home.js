
import { useEffect, useState } from "react";
import './Home.css';
import DatabaseSearchOptions from "./Home/DatabaseSearchOptions";
import DatabaseSearchDescription from "./Home/DatabaseSearchDescription";
import LoadPreviousDBSearch from "./Home/LoadPreviousDBSearch";
import DBSResults from "./Home/DBSResults";
import Loading from "../components/Loading";
import { useDBSearch } from '../contexts/DBSearchContext';
import { useParameters } from '../contexts/ParametersContext';
import SpeciesInput from "../components/SpeciesInput";
import CONFIG from '../config';
import axios from 'axios';
import { speciesExists, executeDBSearchRoute } from '../utils/DatabaseSearch';
import DBSTaxonomy from "../classes/DBSTaxonomy";
import DBSUniprot from "../classes/DBSUniprot.js";
import DBSEnsembl from "../classes/DBSEnsembl";
import DBSRefSeq from "../classes/DBSRefSeq";
import DBSGenBank from "../classes/DBSGenBank";
import DBSDNASeq from "../classes/DBSDNASeq.js";
import DBSPhylogeny from "../classes/DBSPhylogeny";
import { useUser } from '../contexts/UserContext';
import { handleClickDownload } from '../utils/Download';
import { useNavigate, useLocation } from "react-router-dom";



export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const { resetParameters } = useParameters();
    const [selectedSequencingBatch, setSelectedSequencingBatch] = useState(null);
    const [selectedAssembly, setSelectedAssembly] = useState(null);
    const [selectedProteins, setSelectedProteins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Proteins');
    const [inputSpecies, setInputSpecies] = useState("");
    const [searchError, setSearchError] = useState(null);
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [waitingTime, setWaitingTime] = useState(null);
    const [cancelInProgress, setCancelInProgress] = useState(false);
    const [searchMode, setSearchMode] = useState('new'); // 'new' or 'load'
    const [phylogenyLoading, setPhylogenyLoading] = useState(false);
    const [currentSearchTaxid, setCurrentSearchTaxid] = useState(null);
    const [completedSearches, setCompletedSearches] = useState({
        taxonomy: false,
        uniprot: false,
        ensembl: false,
        refseq: false,
        genbank: false,
        dnaseq: false
    });
    const [availableSources, setAvailableSources] = useState({
        taxonomy: true,
        uniprot: true,
        ensembl: true,
        refseq: true,
        genbank: true,
        dnaseq: true
    });
    const { dbs, setDBS, dbsStatus, setDBSStatus, resetDBS } = useDBSearch();
    const { user } = useUser();
    const { updateParameters } = useParameters();

    const [dbsOptions, setDBSOptions] = useState({
        taxonomy: { active: true },
        uniprot: { active: true },
        ensembl: { active: true },
        refseq: { active: true },
        genbank: { active: true },
        dnaseq: {
            active: true,
            platforms: ['ILLUMINA'],
            layout: 'any',  // 'PAIRED', 'SINGLE', or 'any'
            coverageLower: 50,
            coverageUpper: 80,
            strategy: 'WGS',  // 'WGS' or 'any'
            selection: 'RANDOM',  // 'RANDOM' or 'any'
            inputTaxonomyOnly: false
        }
    });

    // Reset parameters when Home component loads, except when coming from Settings
    useEffect(() => {
            resetParameters();
            resetDBS();
            // Reset all selections and tabs
            setDBS(null);
            setDBSStatus(null);
            setSelectedAssembly(null);
            setSelectedProteins([]);
            setSelectedSequencingBatch(null);
            setActiveTab('Proteins');
            setCurrentSearchTaxid(null);
        
    }, [location.state]);

    // Reset tabs and selections when switching between 'new' and 'load' modes
    useEffect(() => {
        setActiveTab('Proteins');
        setSelectedSequencingBatch(null);
        setSelectedAssembly(null);
        setSelectedProteins([]);
        setDBS(null);
    }, [searchMode]);

    useEffect(() => {
        setIsLoading(cancelInProgress);
    }, [cancelInProgress]);

    // Reset DBS when switching to 'load' mode
    useEffect(() => {
        if (searchMode === 'load') {
            // Reset DBS results when switching to load mode
            setDBS(null);
            setDBSStatus(null);
            setSelectedAssembly(null);
            setSelectedProteins([]);
            setSelectedSequencingBatch(null);
            setCurrentSearchTaxid(null);
            // Reset available sources to default
            setAvailableSources({
                uniprot: true,
                ensembl: true,
                refseq: true,
                genbank: true,
                dnaseq: true
            });
        }
    }, [searchMode]);

    // Automatically manage active tab based on available sources
    useEffect(() => {
        // When DBS results change, ensure active tab is valid
        if (!dbs) {
            return; // No DBS data, keep current tab
        }

        // Check if current active tab is still valid
        const hasProteins = availableSources.uniprot || availableSources.ensembl || availableSources.refseq || availableSources.genbank;
        const hasAssemblies = availableSources.ensembl || availableSources.refseq || availableSources.genbank;
        const hasSequencing = availableSources.dnaseq;
        const hasPhylogeny = dbs.phylogeny_map;

        // Determine the appropriate tab to activate
        let newTab = null;

        // If current tab is invalid, switch to first available
        if (activeTab === 'Proteins' && !hasProteins) {
            if (hasAssemblies) newTab = 'Assemblies';
            else if (hasSequencing) newTab = 'Sequencing';
            else if (hasPhylogeny) newTab = 'Phylogeny';
        } else if (activeTab === 'Assemblies' && !hasAssemblies) {
            if (hasProteins) newTab = 'Proteins';
            else if (hasSequencing) newTab = 'Sequencing';
            else if (hasPhylogeny) newTab = 'Phylogeny';
        } else if (activeTab === 'Sequencing' && !hasSequencing) {
            if (hasProteins) newTab = 'Proteins';
            else if (hasAssemblies) newTab = 'Assemblies';
            else if (hasPhylogeny) newTab = 'Phylogeny';
        } else if (activeTab === 'Phylogeny' && !hasPhylogeny) {
            if (hasProteins) newTab = 'Proteins';
            else if (hasAssemblies) newTab = 'Assemblies';
            else if (hasSequencing) newTab = 'Sequencing';
        }

        // If coming from new search with only sequencing, switch to Sequencing tab
        if (searchMode === 'new' && dbsStatus === 'done' && hasSequencing && !hasProteins && activeTab !== 'Sequencing') {
            newTab = 'Sequencing';
        }

        // Only update if we determined a new tab
        if (newTab) {
            setActiveTab(newTab);
        }
    }, [dbs, availableSources, dbsStatus, activeTab, searchMode]);


    const shouldComputeDBS = (dbsOptions) => {
        if (dbsOptions.active) {
            return true;
        }
        return false;
    }

    const handleClickDBSearch = async () => {
        if (dbsStatus!=null && dbsStatus !== 'done' && dbsStatus !== 'failed') {
            alert('The database search is still in progress, please try again once it is completed.');
            return;
        } 
        if (dbsOptions.dnaseq.active && (!dbsOptions.dnaseq.platforms || dbsOptions.dnaseq.platforms.length === 0)) {
            alert('Please select at least one sequencing platform');
            return;
        }
        
        // Reset completed searches tracker
        setCompletedSearches({
            taxonomy: false,
            uniprot: false,
            ensembl: false,
            refseq: false,
            genbank: false,
            dnaseq: false,
            phylogeny: false
        });
                
        if (cancelTokenSource) {
            cancelTokenSource.cancel();
        }

        // reset immediately to hide old results during new search
        const source = axios.CancelToken.source();
        setCancelTokenSource(source);
        updateSelectedAssembly(null);
        updateSelectedProteins([]);
        updateSelectedSequencingBatch(null);
        setDBS(null);  // Clear display immediately
        setDBSStatus(null);  // Clear status immediately
        setWaitingTime(null);
        
        setIsLoading(true);
        const currentSpeciesFound = await speciesExists(inputSpecies);
        setIsLoading(false);
        if (!currentSpeciesFound) {
            updateParameters({'species': null });
            setSearchError(inputSpecies);
            return;
        }
        // Backend returns snake_case
        // parameters.species uses snake_case (sent to backend)
        updateParameters({'species': {
            'scientificName': currentSpeciesFound.scientific_name,
            'taxonID': currentSpeciesFound.taxid,
            'lineage': currentSpeciesFound.data?.lineage || [],
            'is_bacteria': currentSpeciesFound.data?.is_bacteria || false,
            'imageUrl': currentSpeciesFound.taxo_image_url,
        }})
        setSearchError(null);
        // DBSTaxonomy accepts snake_case from backend
        const newDBS = {
            'taxonomy': new DBSTaxonomy(new Date().getTime(), currentSpeciesFound),
            'uniprot': null,
            'ensembl': null,
            'refseq': null,
            'genbank': null,
            'dnaseq': null,
            'phylogeny_map': null,
        };
        setDBS(newDBS);
        setCurrentSearchTaxid(currentSpeciesFound.taxid); // Store taxid for potential cancellation

        
        // Determine what needs to be recomputed BEFORE loading past data
        let computeDBSUniprot = shouldComputeDBS(dbsOptions.uniprot);
        let computeDBSEnsembl = shouldComputeDBS(dbsOptions.ensembl);
        let computeDBSRefSeq = shouldComputeDBS(dbsOptions.refseq);
        let computeDBSGenBank = shouldComputeDBS(dbsOptions.genbank);
        let computeDBSDNASeq = shouldComputeDBS(dbsOptions.dnaseq);

        // Reset available sources (all available at start)
        setAvailableSources({
            // taxonomy: true,
            uniprot: computeDBSUniprot,
            ensembl: computeDBSEnsembl,
            refseq: computeDBSRefSeq,
            genbank: computeDBSGenBank,
            dnaseq: computeDBSDNASeq
        });
        

        try {
            // Waiting time
            const response = await axios.post(`${CONFIG.API_BASE_URL}/waiting_time_dbsearch`, { cancelToken: source.token });
            setWaitingTime(response.data.data);

            // Initialize params
            let params = {
                user: user,
                taxonomy: currentSpeciesFound.data
            };

            // Uniprot
            if (computeDBSUniprot) {
                setDBSStatus("UniprotKB");
                params.options = dbsOptions.uniprot;
                const dbsUniprotResults = await executeDBSearchRoute('dbs_uniprot', params, source.token);
                if (dbsUniprotResults.success && dbsUniprotResults.data && dbsUniprotResults.data.status === 'success') {
                    newDBS['uniprot'] = new DBSUniprot(new Date().getTime(), dbsUniprotResults.data.data);
                    setDBS({...newDBS });
                    setCompletedSearches(prev => ({...prev, uniprot: true}));
                }
            }

            // Ensembl
            if (computeDBSEnsembl) {
                setDBSStatus("ENSEMBL");
                params.options = dbsOptions.ensembl;
                const dbsEnsemblResults = await executeDBSearchRoute('dbs_ensembl', params, source.token);
                if (dbsEnsemblResults.success && dbsEnsemblResults.data && dbsEnsemblResults.data.status === 'success') {
                    newDBS['ensembl'] = new DBSEnsembl(new Date().getTime(), dbsEnsemblResults.data.data);
                    setDBS({...newDBS });
                    setCompletedSearches(prev => ({...prev, ensembl: true}));
                }
            }

            // RefSeq
            if (computeDBSRefSeq) {
                setDBSStatus("NCBI RefSeq");
                params.options = dbsOptions.refseq;
                const dbsRefSeqResults = await executeDBSearchRoute('dbs_refseq', params, source.token);
                if (dbsRefSeqResults.success && dbsRefSeqResults.data && dbsRefSeqResults.data.status === 'success') {
                    newDBS['refseq'] = new DBSRefSeq(new Date().getTime(), dbsRefSeqResults.data.data);
                    setDBS({...newDBS });
                    setCompletedSearches(prev => ({...prev, refseq: true}));
                }
            }

            // GenBank
            if (computeDBSGenBank) {
                setDBSStatus("NCBI GenBank");
                params.options = dbsOptions.genbank;
                const dbsGenBankResults = await executeDBSearchRoute('dbs_genbank', params, source.token);
                if (dbsGenBankResults.success && dbsGenBankResults.data && dbsGenBankResults.data.status === 'success') {
                    newDBS['genbank'] = new DBSGenBank(new Date().getTime(), dbsGenBankResults.data.data);
                    setDBS({...newDBS });
                    setCompletedSearches(prev => ({...prev, genbank: true}));
                }
            }

            // DNA Sequencing
            if (computeDBSDNASeq) {
                setDBSStatus("NCBI SRA (DNA Sequencing)");
                params.options = dbsOptions.dnaseq;
                const dbsDNASeqResults = await executeDBSearchRoute('dbs_dnaseq', params, source.token);
                if (dbsDNASeqResults.success && dbsDNASeqResults.data && dbsDNASeqResults.data.status === 'success') {
                    newDBS['dnaseq'] = new DBSDNASeq(new Date().getTime(), dbsDNASeqResults.data.data);
                    setDBS({...newDBS });
                    setCompletedSearches(prev => ({...prev, dnaseq: true}));
                }
            }

            setDBSStatus('done');
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                console.error('Error during database search:', error);
                setDBSStatus('failed');
            }
        }
    };

    const updateSelectedSequencingBatch = async (batch) => {
        if (!batch || batch.identifier === selectedSequencingBatch?.identifier) {
            setSelectedSequencingBatch(null);
            updateParameters({startSection: {sequencing: null, sequencingRuns: false, sequencingRunList: []}});
        } else {
            setSelectedSequencingBatch(batch);
            updateParameters({startSection: {
                sequencing: batch, 
                sequencingRuns: true, 
                sequencingRunList: batch.runs, 
                sequencingFiles: false, 
                sequencingFileList: [],
                assembly: null, 
                assemblyAccession: null
            }});
            
            // Update species taxonomy from batch
            const speciesData = await speciesExists(batch.scientificName);
            if (speciesData) {
                updateParameters({'species': {
                    'scientificName': speciesData.scientificName,
                    'taxonID': speciesData.taxonId,
                    'lineage': speciesData.lineage,
                    'is_bacteria': speciesData.is_bacteria,
                    'imageUrl': speciesData.taxo_image_url
                }});
            }
        }
        if (selectedAssembly) {
            setSelectedAssembly(null);
        }
        if (selectedProteins) {
            setSelectedProteins([]);
        }
    };

    const updateSelectedAssembly = (assembly) => {
        if (!assembly || assembly.accession === selectedAssembly?.accession) {
            setSelectedAssembly(null);
            updateParameters({startSection: {assembly: null, assemblyAccession: null}});
        } else {
            setSelectedAssembly(assembly);
            updateParameters({startSection: {
                assembly: assembly, 
                assemblyAccession: assembly.accession, 
                sequencing: null, 
                sequencingRuns: false, 
                sequencingRunList: [], 
                sequencingFiles: false, 
                sequencingFileList: []
            }});
        }
        if (selectedSequencingBatch) {
            setSelectedSequencingBatch(null);
        }
        if (selectedProteins) {
            setSelectedProteins([]);
        }
    };

    const updateSelectedProteins = (proteins) => {
        if (selectedProteins.some(p => p.accession === proteins.accession)) {
            setSelectedProteins(selectedProteins.filter(p => p.accession !== proteins.accession));
        } else {
            setSelectedProteins([...selectedProteins, proteins]);
        }
        if (proteins && selectedSequencingBatch) {
            setSelectedSequencingBatch(null);
            updateParameters({startSection: {sequencing: null, sequencingRuns: false, sequencingRunList: []}});
        }
        if (proteins && selectedAssembly) {
            setSelectedAssembly(null);
            updateParameters({startSection: {assembly: null, assemblyAccession: null}});
        }
    };    
    
    const convertForDownload = async (data) => {
        try {
            setIsLoading(true);
            await handleClickDownload(data, 'proteins', true, dbs?.run_id);
        } catch (error) {
            console.error('Error during download:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const cancelDBSearch = async () => {
        if (cancelTokenSource) {
            cancelTokenSource.cancel('Database Search cancelled by user');
            setCancelTokenSource(null);
        }
        setCancelInProgress(true);
        
        // Call backend to delete partial results
        if (currentSearchTaxid && user) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/cancel_dbsearch`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user: user,
                        taxid: currentSearchTaxid
                    })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    console.log('Partial results deleted:', data.deleted_counts);
                } else {
                    console.error('Failed to delete partial results:', data.message);
                }
            } catch (error) {
                console.error('Error calling cancel_dbsearch:', error);
            }
        }
        
        // Mark as unavailable the sources that were not completed
        setAvailableSources(prev => ({
            ...prev,
            ensembl: completedSearches.ensembl,
            refseq: completedSearches.refseq,
            genbank: completedSearches.genbank,
            dnaseq: completedSearches.dnaseq
        }));
        
        // Keep existing data, just mark search as done
        setDBSStatus('done');
        setWaitingTime(null);
        setCancelInProgress(false);
        setCurrentSearchTaxid(null); // Clear taxid after cancellation
    }

    const handleResetDBS = () => {
        // Reset DBS results when taxonomy changes in LoadPreviousDBSearch
        setDBS(null);
        setDBSStatus(null);
        updateSelectedAssembly(null);
        updateSelectedProteins([]);
        updateSelectedSequencingBatch(null);
        setCurrentSearchTaxid(null);
        // Reset available sources to default (all true for new search)
        setAvailableSources({
            uniprot: true,
            ensembl: true,
            refseq: true,
            genbank: true,
            dnaseq: true
        });
    };

    const handleLoadPreviousSearch = (collectionName, item, taxonomy, isDeselecting) => {        
        // If deselecting, remove the collection from DBS
        if (isDeselecting && dbs) {
            const updatedDBS = { ...dbs };
            
            // Remove the specific collection
            switch(collectionName) {
                case 'uniprot':
                    updatedDBS.uniprot = null;
                    break;
                case 'ensembl':
                    updatedDBS.ensembl = null;
                    break;
                case 'refseq':
                    updatedDBS.refseq = null;
                    break;
                case 'genbank':
                    updatedDBS.genbank = null;
                    break;
                case 'dnaseq':
                    updatedDBS.dnaseq = null;
                    break;
                case 'phylogeny':
                    updatedDBS.phylogeny_map = null;
                    break;
            }
            
            // Update DBS and available sources
            setDBS(updatedDBS);
            setAvailableSources(prev => ({
                ...prev,
                taxonomy: true,
                uniprot: !!updatedDBS.uniprot,
                ensembl: !!updatedDBS.ensembl,
                refseq: !!updatedDBS.refseq,
                genbank: !!updatedDBS.genbank,
                dnaseq: !!updatedDBS.dnaseq
            }));
            return;
        }
        
        // If DBS exists and taxonomy matches, update only the selected collection
        // Otherwise, create a new DBS
        let newDBS;
        
        if (dbs && dbs.taxonomy && dbs.taxonomy.taxonId === taxonomy.taxonId) {
            // Keep existing DBS and update only the selected collection
            newDBS = { ...dbs };
            console.log('Updating existing DBS for same taxonomy');
        } else {
            // Create new DBS with taxonomy
            newDBS = {
                'taxonomy': new DBSTaxonomy(new Date().getTime(), {
                    taxid: taxonomy.taxonId,
                    scientific_name: taxonomy.scientificName,
                    is_bacteria: taxonomy.isBacteria || false,
                    taxo_image_url: taxonomy.imageUrl || null,
                    data: {
                        lineage: taxonomy.lineage || [],
                        is_bacteria: taxonomy.isBacteria || false
                    }
                }),
                'uniprot': null,
                'ensembl': null,
                'refseq': null,
                'genbank': null,
                'dnaseq': null,
                'phylogeny_map': null,
            };
            
            // Update species in parameters
            updateParameters({
                'species': {
                    'scientificName': taxonomy.scientificName,
                    'taxonID': taxonomy.taxonId,
                    'lineage': taxonomy.lineage || [],
                    'is_bacteria': taxonomy.isBacteria || false,
                    'imageUrl': taxonomy.imageUrl || null,
                }
            });
            setInputSpecies(taxonomy.scientificName);
        }

        // Load/Update the specific collection data based on collectionName
        switch(collectionName) {
            case 'uniprot':
                newDBS.uniprot = new DBSUniprot(new Date(item.date).getTime(), item);
                break;
            case 'ensembl':
                newDBS.ensembl = new DBSEnsembl(new Date(item.date).getTime(), item);
                break;
            case 'refseq':
                newDBS.refseq = new DBSRefSeq(new Date(item.date).getTime(), item);
                break;
            case 'genbank':
                newDBS.genbank = new DBSGenBank(new Date(item.date).getTime(), item);
                break;
            case 'dnaseq':
                newDBS.dnaseq = new DBSDNASeq(new Date(item.date).getTime(), item);
                setSelectedSequencingBatch(null);
                break;
            case 'phylogeny':
                newDBS.phylogeny_map = new DBSPhylogeny(new Date(item.date).getTime(), item);
                break;
            default:
                break;
        }

        // Set the DBS state
        setDBS(newDBS);
        setDBSStatus('done');
        setSearchError(null);

        // Update available sources based on what is now loaded
        setAvailableSources(prev => ({
            ...prev,
            taxonomy: true,
            uniprot: !!newDBS.uniprot,
            ensembl: !!newDBS.ensembl,
            refseq: !!newDBS.refseq,
            genbank: !!newDBS.genbank,
            dnaseq: !!newDBS.dnaseq
        }));

        // Change active tab based on collection selected
        switch(collectionName) {
            case 'dnaseq':
                setActiveTab('Sequencing');
                break;
            case 'uniprot':
                setActiveTab('Proteins');
                break;
            case 'phylogeny':
                setActiveTab('Phylogeny');
                break;
            case 'ensembl':
            case 'refseq':
            case 'genbank':
                // Keep current tab if it's Proteins or Assemblies, otherwise switch to Proteins
                if (activeTab !== 'Proteins' && activeTab !== 'Assemblies') {
                    setActiveTab('Proteins');
                }
                break;
        }

    };

    const handleGeneratePhylogenyMap = async () => {

        if (!dbs || !dbs.taxonomy) {
            console.error('No DBS data available to generate phylogeny map');
            return;
        }

        setPhylogenyLoading(true);
        
        try {
            // Convert DBS objects to Python-compatible format
            const convertedDBS = {};
            
            // Uniprot - Python expects 'uniprot_proteome' with 'proteins' array
            if (dbs.uniprot) {
                convertedDBS.uniprot_proteome = {
                    proteins: dbs.uniprot.proteins
                };
            }
            
            // Ensembl - proteins and assemblies
            if (dbs.ensembl) {
                convertedDBS.ensembl = {
                    proteins: dbs.ensembl.proteins || [],
                    assemblies: dbs.ensembl.assemblies || []
                };
            }
            
            // RefSeq - proteins and assemblies
            if (dbs.refseq) {
                convertedDBS.refseq = {
                    proteins: dbs.refseq.proteins || [],
                    assemblies: dbs.refseq.assemblies || []
                };
            }
            
            // GenBank - proteins and assemblies
            if (dbs.genbank) {
                convertedDBS.genbank = {
                    proteins: dbs.genbank.proteins || [],
                    assemblies: dbs.genbank.assemblies || []
                };
            }
            
            // DNASeq - convert batches back to Python format
            if (dbs.dnaseq) {
                convertedDBS.dnaseq = {
                    batches: dbs.dnaseq.batches.map(batch => ({
                        total_bases: batch.totalBases,
                        scientific_name: batch.scientificName,
                        taxid: batch.taxid,
                        assembly_expected_size: batch.assemblyExpectedSize,
                        assembly_expected_size_stats: batch.assemblyExpectedSizeStats,
                        coverage: batch.depth,
                        read_type: batch.readType,
                        runs: batch.runs.map(run => ({
                            accession: run.accession,
                            taxid: run.taxid,
                            scientific_name: run.scientificName,
                            total_bases: run.totalBases
                        }))
                    }))
                };
            }
            
            const params = {
                user: user,
                dbs: convertedDBS,
                taxonomy: {
                    scientificName: dbs.taxonomy.scientificName,
                    taxonId: dbs.taxonomy.taxonId,
                    lineage: dbs.taxonomy.lineage
                }
            };
            
            const response = await executeDBSearchRoute('dbs_phylogeny', params);
            
            if (response.success && response.data && response.data.status === 'success') {
                const updatedDBS = { ...dbs };
                updatedDBS.phylogeny_map = new DBSPhylogeny(new Date().getTime(), response.data.data);
                setDBS(updatedDBS);
                setActiveTab('Phylogeny');
            } else {
                console.error('Failed to generate phylogeny map:', response);
            }
        } catch (error) {
            console.error('Error generating phylogeny map:', error);
        } finally {
            setPhylogenyLoading(false);
        }
    };

    return (
        <div id="page">
            <div className="navigation-buttons">
            <button className="t2_bold left" onClick={() => {
                if (!dbsStatus || dbsStatus === 'done' || dbsStatus === 'failed') {
                    navigate('/my-annotations', { state: { from: 'home' } });
                } else {
                    alert('The database search is still in progress, please try again once it is completed.');
                }
            }}>
                My Annotations
            </button>   
            <button className="t2_bold right" onClick={() => {
                if (!dbsStatus || dbsStatus === 'done' || dbsStatus === 'failed') {
                    navigate('/settings', { state: { from: 'home' } });
                } else {
                    alert('The database search is still in progress, please try again once it is completed.');
                }
            }}>
                Create an Annotation
            </button>
            </div>

            <div className="database-search-container">
                <h2 className="home-h2">Database Search</h2>
                

                <div className="search-mode-selector">
                    <button 
                        className={`btn-tab-style t2_bold ${searchMode === 'about' ? 'active' : ''}`}
                        onClick={() => setSearchMode('about')}
                        disabled={dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed'}
                    >
                        How does it work ?
                    </button>
                    <button 
                        className={`btn-tab-style t2_bold ${searchMode === 'new' ? 'active' : ''}`}
                        onClick={() => setSearchMode('new')}
                        disabled={dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed'}
                    >
                        New Database Search
                    </button>
                    <button 
                        className={`btn-tab-style t2_bold ${searchMode === 'load' ? 'active' : ''}`}
                        onClick={() => setSearchMode('load')}
                        disabled={dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed'}
                    >
                        Load Previous Search
                    </button>
                </div>

                {searchMode === 'about' && (
                    <DatabaseSearchDescription compact={false} />
                )}

                {searchMode === 'new' && (
                    <div className="search-form-container">
                        <SpeciesInput 
                            inputSpecies={inputSpecies} 
                            setInputSpecies={setInputSpecies} 
                            searchError={searchError}
                            onClick={() => handleClickDBSearch()}
                            buttonLabel="Search"
                        />
                        <DatabaseSearchOptions 
                            options={dbsOptions}
                            setOptions={setDBSOptions}
                            disabled={dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed'}
                        />
                    </div>
                )}

                {searchMode === 'load' && (
                    <div className="search-form-container">
                        <LoadPreviousDBSearch 
                            onLoad={handleLoadPreviousSearch}
                            onReset={handleResetDBS}
                            onGeneratePhylogeny={handleGeneratePhylogenyMap}
                            phylogenyLoading={phylogenyLoading}
                            dbs={dbs}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            disabled={dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed'}
                        />
                    </div>
                )}

                {dbsStatus === "failed" && (
                    <p>A problem occurred during the search</p>
                )}     

                {dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed' && (
                    <div className="dbsearch-status">
                        <div className="dbsearch-status-text">
                            <span>Database Search in progress: {dbsStatus} ...</span>
                            {waitingTime && waitingTime[dbsStatus] && (
                                <span>Estimated waiting time: {waitingTime[dbsStatus][0]} to {waitingTime[dbsStatus][1]}</span> 
                            )}
                        </div>
                        <button className='red-btn' onClick={cancelDBSearch}>Cancel</button>
                    </div>
                )}

                <DBSResults
                    dbs={dbs}
                    availableSources={availableSources}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedProteins={selectedProteins}
                    updateSelectedProteins={updateSelectedProteins}
                    convertForDownload={convertForDownload}
                    dbsOptions={dbsOptions}
                    selectedAssembly={selectedAssembly}
                    updateSelectedAssembly={updateSelectedAssembly}
                    dbsStatus={dbsStatus}
                    selectedSequencingBatch={selectedSequencingBatch}
                    updateSelectedSequencingBatch={updateSelectedSequencingBatch}
                />
                {dbs && dbsStatus === 'done' && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button 
                            className="btn-phylogeny"
                            onClick={handleGeneratePhylogenyMap}
                            disabled={phylogenyLoading}
                        >
                        {phylogenyLoading ? 'Generating Phylogeny Map...' : 'Generate Phylogeny Map'}
                        </button>
                    </div>
                )}
            {isLoading && (<Loading/>)}
            </div>
        </div>
        );
};
