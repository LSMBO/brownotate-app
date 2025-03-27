import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import io from 'socket.io-client';
import CONFIG from '../config';
import { getDefaultParameters } from '../utils/defaultParameters';
import { handleClickDownload } from '../utils/Download';
import { useUser } from '../contexts/UserContext';
import { useDBSearch } from '../contexts/DBSearchContext';
import { useParameters } from '../contexts/ParametersContext';
import { useRuns } from '../contexts/RunsContext';
import SpeciesInput from "../components/SpeciesInput";
import CardRun from "../components/CardRun";
import CardDatabaseSearch from "../components/CardDatabaseSearch";
import DatabaseSearch from "../classes/DatabaseSearch";

const socket = io.connect(CONFIG.API_BASE_URL, {reconnection: false, transports: ['polling']});

export default function Home() {
    const navigate = useNavigate();
    const { parameters, setParameters } = useParameters();
    const { user } = useUser();
    const { dbsearch, setDBSearch, dbsearchStatus, setDBSearchStatus, dbsStderr, setDbsStderr } = useDBSearch();
    const [cancelTokenSource, setCancelTokenSource] = useState(null);
    const [inputSpecies, setInputSpecies] = useState("");
    const [speciesNotFound, setSpeciesNotFound] = useState("");
    const { runs, fetchCPUs, fetchUserRuns, startRunMonitoring } = useRuns();

    useEffect(() => {
        if (!socket) return;
    
        const handleRunsUpdated = (data) => {
            console.log('Socket.on run_updated:', data);
            fetchUserRuns(user);
        };

        socket.on('runs_updated', handleRunsUpdated);
    
        return () => {
            socket.off('runs_updated', handleRunsUpdated);
        };
    }, [socket, user]);
    

    const speciesExists = async (inputValue) => {
        try {
            if (inputValue==='') {
                setSpeciesNotFound(" ");
            }
            else {
                const response = await axios.post(`${CONFIG.API_BASE_URL}/check_species_exists`, { species: inputValue });
                if (response.data.status === 'success') {
                    setSpeciesNotFound("");
                    return response.data.results;
                } else {
                    console.error('Error:', response.data.message);
                    setSpeciesNotFound(inputValue);
                    return false;
                }
            }
        } catch (error) {
            setSpeciesNotFound(inputValue);
            return false;
        }
    };

    const handleClickDBS = async (force_new_search) => {
        if (cancelTokenSource) {
            cancelTokenSource.cancel();
        }
        const source = axios.CancelToken.source();
        setCancelTokenSource(source);
        setDBSearchStatus(null);
        setDBSearch(null);
        const speciesFound = await speciesExists(inputSpecies);
        if (speciesFound) {
            const newDbsearch = new DatabaseSearch(new Date().getTime(), speciesFound);
            setDBSearch({ ...newDbsearch });
            let response;
            if (!force_new_search) {
                response = await axios.post(`${CONFIG.API_BASE_URL}/get_dbsearch`, {
                    taxid: speciesFound['taxid']
                }, { cancelToken: source.token });
                if (response.data.data) {
                    let past_dbsearch = response.data.data
                    newDbsearch.setTaxonomy(past_dbsearch);
                    newDbsearch.setUniprotProteomes(past_dbsearch);
                    newDbsearch.setEnsembl(past_dbsearch);
                    newDbsearch.setRefseq(past_dbsearch);
                    newDbsearch.setGenbank(past_dbsearch);
                    newDbsearch.setDNASequencing(past_dbsearch);
                    newDbsearch.setPhylogeny(past_dbsearch);
                    setDBSearch({ ...newDbsearch });
                    console.log("Database Search:", newDbsearch);
                    setDBSearchStatus('done');
                }
            }
            if (force_new_search || !response.data.data) {
                try {
                    // (Uniprot) Taxonomy
                    setDBSearchStatus("Taxonomy");
                    response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_taxonomy`, { 
                        scientificName: speciesFound['scientific_name'], 
                        taxid: speciesFound['taxid'],
                        user: user,
                        createNewDBS: true
                    }, { cancelToken: source.token });
                    newDbsearch.setTaxonomy(response.data);
                    setDBSearch({ ...newDbsearch });
                            
                    // Uniprot Proteome
                    setDBSearchStatus("Uniprot Proteome");
                    response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_uniprot_proteome`, {
                        user: user,
                        dbsearch: response.data,
                        createNewDBS: true
                    }, { cancelToken: source.token });
                    newDbsearch.setUniprotProteomes(response.data);
                    setDBSearch({ ...newDbsearch });

                    // Ensembl
                    setDBSearchStatus("ENSEMBL");
                    response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_ensembl`, {
                        user: user,
                        dbsearch: response.data,
                        createNewDBS: true
                    }, { cancelToken: source.token });
                    newDbsearch.setEnsembl(response.data);
                    setDBSearch({ ...newDbsearch });

                    // RefSeq
                    setDBSearchStatus("NCBI RefSeq");
                    response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_refseq`, {
                        user: user,
                        dbsearch: response.data,
                        createNewDBS: true
                    }, { cancelToken: source.token });
                    newDbsearch.setRefseq(response.data);
                    setDBSearch({ ...newDbsearch });

                    // Genbank
                    setDBSearchStatus("NCBI GenBank");
                    response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_genbank`, {
                        user: user,
                        dbsearch: response.data,
                        createNewDBS: true
                    }, { cancelToken: source.token });
                    newDbsearch.setGenbank(response.data);
                    setDBSearch({ ...newDbsearch });

                    // DNA Sequencing
                    setDBSearchStatus("NCBI SRA (DNA Sequencing)");
                    response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_dnaseq`, {
                        user: user,
                        dbsearch: response.data,
                        createNewDBS: true
                    }, { cancelToken: source.token });
                    newDbsearch.setDNASequencing(response.data);
                    setDBSearch({ ...newDbsearch });

                    // Phylogeny
                    setDBSearchStatus("Phylogeny");
                    response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_phylogeny`, {
                        user: user,
                        dbsearch: response.data,
                        createNewDBS: true
                    }, { cancelToken: source.token });
                    newDbsearch.setPhylogeny(response.data);
                    setDBSearch({ ...newDbsearch });
                    console.log('DBSearch completed:', newDbsearch);

                    console.log('DBS Last Response:', response.data);
                    setDBSearchStatus('done');

                } catch (error) {
                    if (axios.isCancel(error)) {
                        console.log('Request canceled:', error.message);
                    } else {
                        console.error('Error:', error);
                        setDBSearchStatus('failed');
                        setDbsStderr(error.response.data.message);
                    }
                } 
            }
        }
    };
    
    const handleClickSettings = async (selectedData) => {
        console.log('handleClickSettings:', selectedData);
        const newParameters = getDefaultParameters();
        if (dbsearch) {
            newParameters.species.scientificName = dbsearch.scientific_name;
            newParameters.species.taxonID = dbsearch.taxonID;
            newParameters.species.lineage = dbsearch.lineage;
            newParameters.species.is_bacteria = dbsearch.is_bacteria;
        } else {
            const speciesFound = await speciesExists(inputSpecies)
            if (speciesFound) {
                newParameters.species.scientificName = speciesFound['scientific_name'];
                newParameters.species.taxonID = speciesFound['taxid'];
                newParameters.species.lineage = speciesFound['lineage'];
                newParameters.species.is_bacteria = speciesFound['is_bacteria'];
            } else {
                return ''
            }
        }
        if (selectedData) {
            if (Array.isArray(selectedData) && typeof selectedData[0] === 'string') {
                // Sequencing data
                newParameters.startSection.sequencing = true;
                newParameters.startSection.sequencingAccessions = true;
                newParameters.startSection.sequencingAccessionList = selectedData;
                newParameters.id = new Date().getTime();
                newParameters.ready = true;
                    
            } else if (Array.isArray(selectedData) && typeof selectedData[0] === 'object') {
                // Assembly data
                let selectedAssembly = selectedData[0];
                newParameters.startSection.assembly = true;
                newParameters.startSection.assemblyFile = false;
                newParameters.startSection.assemblyType = selectedAssembly.database;
                newParameters.startSection.assemblyAccession = [selectedAssembly.accession];
                if (selectedAssembly.database === 'ncbi') {
                    newParameters.startSection.assemblyDownload = selectedAssembly.download_command;
                } else {
                    newParameters.startSection.assemblyDownload = selectedAssembly.download_url;
                }
                newParameters.id = new Date().getTime();
                newParameters.ready = true;
            }
        }
        setParameters(newParameters);
        console.log("Navigate to /settings with Parameters:", newParameters);
        fetchCPUs();
        navigate('/settings');
    };
    

    return (
    <div id="page">
        <SpeciesInput inputSpecies={inputSpecies} setInputSpecies={setInputSpecies} speciesNotFound={speciesNotFound}/>
        <div className="startButtonContainer">
            <button className="t2_bold" onClick={() => handleClickDBS(false)} disabled={!inputSpecies}>Database Search</button>   
            <button className="t2_bold" onClick={handleClickSettings}>Custom Input</button>
        </div>
        {dbsearchStatus === null ? (
            <div></div>
        ) : dbsearchStatus === "failed" ? (
            <div>
                <pre>A problem occurred during the search</pre>
                <pre>{dbsStderr}</pre>
            </div>
        ) : (
            <CardDatabaseSearch 
                data={dbsearch} 
                dbsearchStatus={dbsearchStatus} 
                handleClickSettings={handleClickSettings} 
                handleClickDownload={handleClickDownload} 
                rerunDBSearch={handleClickDBS}/>
        )}
        <div className="run-list-container">
            <h2 className="home-h2">Runs</h2>
            <div className="run-list">
                {runs.map((run, index) => (
                    run.parameters && run.parameters.id ? (
                        <CardRun key={index} user={user} id={run.id} data={run} status={run.status} parameters={run.parameters} />
                    ) : (
                    <div key={index}></div>
                    )
                ))}
            </div>
            <div className="fetch-runs-button">
                <button className="t2_bold" onClick={() => fetchUserRuns(user)}>Update Runs</button>
            </div>
        </div>
    </div>
    )
}