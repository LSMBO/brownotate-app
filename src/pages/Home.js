
import { useEffect, useState } from "react";
import './Home.css';
import CardSequencing from "./Home/CardSequencing";
import CardAssembly from "./Home/CardAssembly";
import CardProteins from "./Home/CardProteins";
import DatabaseSearchDescription from "./Home/DatabaseSearchDescription";
import Image from "../components/Image";
import Loading from "../components/Loading";
import { useDBSearch } from '../contexts/DBSearchContext';
import { useParameters } from '../contexts/ParametersContext';
import SpeciesInput from "../components/SpeciesInput";
import CONFIG from '../config';
import axios from 'axios';
import { speciesExists, getDBSearch, executeDBSearchRoute } from '../utils/DatabaseSearch';
import DatabaseSearch from "../classes/DatabaseSearch";
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
    const { dbsearch, setDBSearch, dbsearchStatus, setDBSearchStatus, resetDBSearch } = useDBSearch();
    const { user } = useUser();
    const { updateParameters } = useParameters();


    // Reset parameters when Home component loads, except when coming from Settings
    useEffect(() => {
        // Check if we came from Settings page
        const fromSettings = location.state?.from === 'settings';
        
        if (!fromSettings) {
            resetParameters();
            resetDBSearch();
        }
    }, [location.state]);

    useEffect(() => {
        setIsLoading(cancelInProgress);
    }, [cancelInProgress]);

    const handleClickDBSearch = async (forceNewSearch) => {
        if (cancelTokenSource) {
            cancelTokenSource.cancel();
        }

        const source = axios.CancelToken.source();
        setCancelTokenSource(source);
        updateSelectedAssembly(null);
        updateSelectedProteins([]);
        updateSelectedSequencingBatch(null);
        resetDBSearch()
        const currentSpeciesFound = await speciesExists(inputSpecies);
        
        if (currentSpeciesFound) {
            updateParameters({'species': {
                'scientificName': currentSpeciesFound.scientific_name,
                'taxonID': currentSpeciesFound.taxid,
                'lineage': currentSpeciesFound.lineage,
                'is_bacteria': currentSpeciesFound.is_bacteria,
                'imageUrl': currentSpeciesFound.taxo_image_url,
            }})
            setSearchError(null);
            const newDbsearch = new DatabaseSearch(new Date().getTime(), currentSpeciesFound);
            setDBSearch(newDbsearch);
            let dbSearchResult = null;
            
            if (!forceNewSearch) {
                dbSearchResult = await getDBSearch(
                    currentSpeciesFound['taxid'], 
                    source.token
                );
                if (dbSearchResult.success && dbSearchResult.data) {
                    const past_dbsearch = dbSearchResult.data;
                    newDbsearch.setTaxonomy(past_dbsearch);
                    newDbsearch.setUniprotProteomes(past_dbsearch);
                    newDbsearch.setEnsembl(past_dbsearch);
                    newDbsearch.setRefseq(past_dbsearch);
                    newDbsearch.setGenbank(past_dbsearch);
                    newDbsearch.setDNASequencing(past_dbsearch);
                    newDbsearch.setPhylogeny(past_dbsearch);
                    setDBSearch({ ...newDbsearch });
                    setDBSearchStatus('done');
                }
            }
            if (forceNewSearch || dbSearchResult.success === false || !dbSearchResult?.data) {
                try {
                    // Waiting time
                    let response = await axios.post(`${CONFIG.API_BASE_URL}/waiting_time`, { cancelToken: source.token });
                    setWaitingTime(response.data.data);
                    
                    // (Uniprot) Taxonomy
                    let dbsTaxonomyResults = null;
                    setDBSearchStatus("Taxonomy");
                    let params = {
                        user: user,
                        createNewDBS: true,
                        dbsearch: currentSpeciesFound
                    }
                    dbsTaxonomyResults = await executeDBSearchRoute('dbs_taxonomy', params, source.token);
                    if (dbsTaxonomyResults.success && dbsTaxonomyResults.data) {
                        newDbsearch.setTaxonomy(dbsTaxonomyResults.data);
                        setDBSearch({...newDbsearch });
                    }
                    
                    // Uniprot Proteome
                    let dbsUniprotProteomeResults = null;
                    setDBSearchStatus("Uniprot Proteome");
                    params.dbsearch = dbsTaxonomyResults.data;
                    dbsUniprotProteomeResults = await executeDBSearchRoute('dbs_uniprot_proteome', params, source.token);
                    if (dbsUniprotProteomeResults.success && dbsUniprotProteomeResults.data) {
                        newDbsearch.setTaxonomy(dbsUniprotProteomeResults.data);
                        setDBSearch({...newDbsearch });
                    }

                    // Ensembl
                    let dbsEnsemblResults = null;
                    setDBSearchStatus("ENSEMBL");
                    params.dbsearch = dbsUniprotProteomeResults.data;
                    dbsEnsemblResults = await executeDBSearchRoute('dbs_ensembl', params, source.token);
                    if (dbsEnsemblResults.success && dbsEnsemblResults.data) {
                        newDbsearch.setEnsembl(dbsEnsemblResults.data);
                        setDBSearch({...newDbsearch });
                    }                    

                    // RefSeq
                    let dbsRefSeqResults = null;
                    setDBSearchStatus("NCBI RefSeq");
                    params.dbsearch = dbsEnsemblResults.data;
                    dbsRefSeqResults = await executeDBSearchRoute('dbs_refseq', params, source.token);
                    if (dbsRefSeqResults.success && dbsRefSeqResults.data) {
                        newDbsearch.setRefseq(dbsRefSeqResults.data);
                        setDBSearch({...newDbsearch });
                    }

                    // GenBank
                    let dbsGenBankResults = null;
                    setDBSearchStatus("NCBI GenBank");
                    params.dbsearch = dbsRefSeqResults.data;
                    dbsGenBankResults = await executeDBSearchRoute('dbs_genbank', params, source.token);
                    if (dbsGenBankResults.success && dbsGenBankResults.data) {
                        newDbsearch.setGenbank(dbsGenBankResults.data);
                        setDBSearch({...newDbsearch });
                    }

                    // DNA Sequencing 1/2
                    let dbsDNASeq1Results = null;
                    setDBSearchStatus("NCBI SRA (DNA Sequencing)");
                    params.dbsearch = dbsGenBankResults.data;
                    params.restricted = true;
                    dbsDNASeq1Results = await executeDBSearchRoute('dbs_dnaseq', params, source.token);
                    if (dbsDNASeq1Results.success && dbsDNASeq1Results.data) {
                        newDbsearch.setDNASequencing(dbsDNASeq1Results.data);
                        setDBSearch({...newDbsearch });
                    }
                    // DNA Sequencing 2/2
                    let dbsDNASeq2Results = null;
                    params.dbsearch = dbsDNASeq1Results.data;
                    params.restricted = false;
                    dbsDNASeq2Results = await executeDBSearchRoute('dbs_dnaseq', params, source.token);
                    if (dbsDNASeq2Results.success && dbsDNASeq2Results.data) {
                        newDbsearch.setDNASequencing(dbsDNASeq2Results.data);
                        setDBSearch({...newDbsearch });
                    }

                    // Phylogeny
                    let dbsPhylogenyResults = null;
                    setDBSearchStatus("Phylogeny");
                    params.dbsearch = dbsDNASeq2Results.data;
                    dbsPhylogenyResults = await executeDBSearchRoute('dbs_phylogeny', params, source.token);
                    if (dbsPhylogenyResults.success && dbsPhylogenyResults.data) {
                        newDbsearch.setPhylogeny(dbsPhylogenyResults.data);
                        setDBSearch({...newDbsearch });
                    }
                    console.log('DBSearch completed:', newDbsearch);
                    setDBSearchStatus('done');

                } catch (error) {
                    if (axios.isCancel(error)) {
                        console.log('Request canceled:', error.message);
                    } else {
                        console.error('Error:', error);
                        setDBSearchStatus('failed');
                    }                } 
            }
        } else {
            updateParameters({'species': null });
            setSearchError(inputSpecies);
        }
    };

    const updateSelectedSequencingBatch = (batch) => {
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
            await handleClickDownload(data, 'proteins', true);
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
        if (dbsearch && dbsearch.id) {
            try {
                const response = await axios.post(`${CONFIG.API_BASE_URL}/delete_dbsearch`, {
                    user: user,
                    dbsearch: dbsearch,
                });
            } catch (error) {
                console.error('Error deleting dbsearch:', error);
            }
        }
        setDBSearchStatus(null);
        setDBSearch(null);
        setWaitingTime(null);
        setCancelInProgress(false);
    }

    return (
        <div id="page">
            <div className="navigation-buttons">
                <button className="t2_bold left" onClick={() => { navigate('/my-annotations'); }}>
                    My Annotations
                </button>   
                <button className="t2_bold right" onClick={() => {navigate('/settings')}}>Create an Annotation</button>
            </div> 

            <div className="database-search-container">
                <h2 className="home-h2">Database Search</h2>
                <SpeciesInput 
                    inputSpecies={inputSpecies} 
                    setInputSpecies={setInputSpecies} 
                    searchError={searchError}
                    onClick={() => handleClickDBSearch(false)}
                    buttonLabel="Search"
                />

                <div className="card-container-header">
                    {dbsearch && (
                    <div className="taxonomy-card">
                        <h3>
                            <i>{dbsearch.scientific_name.charAt(0).toUpperCase() + dbsearch.scientific_name.slice(1).toLowerCase()}</i>
                            <br />
                            [TaxID: {dbsearch.taxonID}]
                        </h3>
                        <Image file={dbsearch.taxo_image_url}/>
                    </div>
                    )}
                    <DatabaseSearchDescription />
                </div>

                {dbsearchStatus === "failed" && (
                <p>A problem occurred during the search</p>
                )}     

                {dbsearchStatus && dbsearchStatus !== 'done' && dbsearchStatus !== 'failed' &&
                <div className="dbsearch-status">
                    <span>Database Search in progress: {dbsearchStatus} ...</span>
                    {waitingTime && waitingTime[dbsearchStatus] &&
                    <span>Estimated waiting time: {waitingTime[dbsearchStatus][0]} to {waitingTime[dbsearchStatus][1]}</span> 
                    }
                    <button className='red-btn' onClick={cancelDBSearch}>Cancel</button>
                </div>
                }  



                {dbsearchStatus === 'done' && (
                <div className="rerun-dbsearch">
                    <label>Search performed on {dbsearch.date}</label>
                    <button onClick={() => handleClickDBSearch(true)}>Perform a new search</button>
                </div>
                )}            
                

                {dbsearchStatus && dbsearchStatus !== 'failed' && (
                <div className="tabs-container">
                <div className="tabs-header">
                <div className={`tab ${activeTab === 'Proteins' ? 'active-tab': ''}`} onClick={() => setActiveTab('Proteins')}>Proteins</div>
                <div className={`tab ${activeTab === 'Assemblies' ? 'active-tab': ''}`} onClick={() => setActiveTab('Assemblies')}>Assemblies</div>
                <div className={`tab ${activeTab === 'Sequencing' ? 'active-tab': ''}`} onClick={() => setActiveTab('Sequencing')}>Sequencing</div>
                <div className={`tab ${activeTab === 'Phylogeny' ? 'active-tab': ''}`} onClick={() => setActiveTab('Phylogeny')}>Phylogeny Tree</div>
                </div>
                <div className="tabs-content">
                <div className={`tab-content ${activeTab === 'Proteins' ? 'active-content' : ''}`}>
                <CardProteins
                    proteins={dbsearch.proteins}
                    selectedProteins={selectedProteins}
                    updateSelectedProteins={updateSelectedProteins}
                    convertForDownload={convertForDownload}
                />
                </div>                    
                <div className={`tab-content ${activeTab === 'Assemblies' ? 'active-content' : ''}`}>
                <CardAssembly
                    assembly={dbsearch.assembly}
                    selectedAssembly={selectedAssembly}
                    updateSelectedAssembly={updateSelectedAssembly}
                />
                </div>
                <div className={`tab-content ${activeTab === 'Sequencing' ? 'active-content' : ''}`}>
                <CardSequencing
                    dnaseq={dbsearch.dnaseq}
                    selectedSequencingBatch={selectedSequencingBatch}
                    updateSelectedSequencingBatch={updateSelectedSequencingBatch}
                />
                </div>
                <div className={`tab-content ${activeTab === 'Phylogeny' ? 'active-content' : ''}`}>
                    <Image file={dbsearch.phylogeny_map}/>
                </div>                    
                </div>
                </div>  
                )}         
                {isLoading && (<Loading/>)}
            </div>
        </div>
        );
};
