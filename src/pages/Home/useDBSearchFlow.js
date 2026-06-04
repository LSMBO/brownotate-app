import { useState } from 'react';
import CONFIG from '../../config';
import axios from 'axios';
import { useDBSearch } from '../../contexts/DBSearchContext';
import { useUser } from '../../contexts/UserContext';
import { useParameters } from '../../contexts/ParametersContext';
import { speciesExists, executeDBSearchRoute } from '../../utils/DatabaseSearch';
import { handleClickDownload } from '../../utils/Download';
import DBSTaxonomy  from '../../classes/DBSTaxonomy';
import DBSUniprot   from '../../classes/DBSUniprot.js';
import DBSEnsembl   from '../../classes/DBSEnsembl';
import DBSRefSeq    from '../../classes/DBSRefSeq';
import DBSGenBank   from '../../classes/DBSGenBank';
import DBSDNASeq    from '../../classes/DBSDNASeq.js';
import DBSRNASeq    from '../../classes/DBSRNASeq.js';
import DBSPhylogeny from '../../classes/DBSPhylogeny';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeTaxonomyDBS(taxonomy) {
    return new DBSTaxonomy(new Date().getTime(), {
        taxid: taxonomy.taxonId,
        scientific_name: taxonomy.scientificName,
        is_bacteria: taxonomy.isBacteria || false,
        taxo_image_url: taxonomy.imageUrl || null,
        data: {
            lineage: taxonomy.lineage || [],
            is_bacteria: taxonomy.isBacteria || false,
        },
    });
}

function parseSearchTimestamp(dateString) {
    if (!dateString) return Date.now();

    const parts = String(dateString).split('-');
    if (parts.length === 2 && parts[0].length === 8 && parts[1].length >= 6) {
        const day = Number(parts[0].substring(0, 2));
        const month = Number(parts[0].substring(2, 4)) - 1;
        const year = Number(parts[0].substring(4, 8));
        const hour = Number(parts[1].substring(0, 2));
        const minute = Number(parts[1].substring(2, 4));
        const second = Number(parts[1].substring(4, 6));
        const timestamp = new Date(year, month, day, hour, minute, second).getTime();
        if (!Number.isNaN(timestamp)) return timestamp;
    }

    const fallback = new Date(dateString).getTime();
    return Number.isNaN(fallback) ? Date.now() : fallback;
}

function applyCollectionToDBS(newDBS, collectionName, item) {
    const timestamp = parseSearchTimestamp(item?.date);
    switch (collectionName) {
        case 'uniprot':   newDBS.uniprot      = new DBSUniprot(timestamp, item); break;
        case 'ensembl':   newDBS.ensembl      = new DBSEnsembl(timestamp, item); break;
        case 'refseq':    newDBS.refseq       = new DBSRefSeq(timestamp, item);  break;
        case 'genbank':   newDBS.genbank      = new DBSGenBank(timestamp, item); break;
        case 'dnaseq':    newDBS.dnaseq       = new DBSDNASeq(timestamp, item);  break;
        case 'rnaseq':    newDBS.rnaseq       = new DBSRNASeq(timestamp, item);  break;
        case 'phylogeny': newDBS.phylogeny_map = new DBSPhylogeny(timestamp, item); break;
        default: break;
    }
}

function availableSourcesFromDBS(newDBS) {
    return {
        taxonomy:  true,
        uniprot:   !!newDBS.uniprot,
        ensembl:   !!newDBS.ensembl,
        refseq:    !!newDBS.refseq,
        genbank:   !!newDBS.genbank,
        dnaseq:    !!newDBS.dnaseq,
        rnaseq:    !!newDBS.rnaseq,
    };
}

function firstValidTab(dbs) {
    if (dbs.uniprot || dbs.ensembl || dbs.refseq || dbs.genbank) return 'Proteins';
    if (dbs.dnaseq)      return 'DNA Sequencing';
    if (dbs.rnaseq)      return 'RNA Sequencing';
    if (dbs.phylogeny_map) return 'Phylogeny';
    return 'Proteins';
}

function isTabAvailable(tab, dbs) {
    if (tab === 'Proteins') {
        return Boolean(dbs.uniprot || dbs.ensembl || dbs.refseq || dbs.genbank);
    }
    if (tab === 'DNA Sequencing') {
        return Boolean(dbs.dnaseq);
    }
    if (tab === 'RNA Sequencing') {
        return Boolean(dbs.rnaseq);
    }
    if (tab === 'Phylogeny') {
        return Boolean(dbs.phylogeny_map);
    }
    return false;
}

// ─── hook ───────────────────────────────────────────────────────────────────

/**
 * Hook encapsulating all DB-search orchestration:
 *   - new search flow (handleClickDBSearch / cancelDBSearch)
 *   - load-previous-search (handleLoadPreviousSearch / handleBatchLoadPreviousSearch / handleResetDBS)
 *   - phylogeny generation (handleGeneratePhylogenyMap)
 *   - file download (convertForDownload)
 */
export function useDBSearchFlow({
    dbsOptions,
    activeTab,
    setActiveTab,
    resetSelectionsWithParams,
    setSelectedSequencingBatch,
}) {
    const [isLoading,          setIsLoading]          = useState(false);
    const [inputSpecies,       setInputSpecies]        = useState('');
    const [searchError,        setSearchError]         = useState(null);
    const [cancelTokenSource,  setCancelTokenSource]   = useState(null);
    const [waitingTime,        setWaitingTime]         = useState(null);
    const [cancelInProgress,   setCancelInProgress]    = useState(false);
    const [phylogenyLoading,   setPhylogenyLoading]    = useState(false);
    const [currentSearchTaxid, setCurrentSearchTaxid]  = useState(null);
    const [completedSearches,  setCompletedSearches]   = useState({
        taxonomy: false, uniprot: false, ensembl: false,
        refseq: false, genbank: false, dnaseq: false, rnaseq: false,
    });
    const [availableSources, setAvailableSources] = useState({
        taxonomy: true, uniprot: true, ensembl: true,
        refseq: true, genbank: true, dnaseq: true, rnaseq: true,
    });

    const { dbs, setDBS, dbsStatus, setDBSStatus, resetDBS } = useDBSearch();
    const { user } = useUser();
    const { updateParameters, resetParameters } = useParameters();

    // ── new search ──────────────────────────────────────────────────────────

    const handleClickDBSearch = async () => {
        if (dbsStatus != null && dbsStatus !== 'done' && dbsStatus !== 'failed') {
            alert('The database search is still in progress, please try again once it is completed.');
            return;
        }
        if (dbsOptions.dnaseq.active && (!dbsOptions.dnaseq.platforms || dbsOptions.dnaseq.platforms.length === 0)) {
            alert('Please select at least one sequencing platform');
            return;
        }
        if (dbsOptions.rnaseq.active) {
            const min = dbsOptions.rnaseq.runSizeGbMin;
            const max = dbsOptions.rnaseq.runSizeGbMax;
            const minNum = (min === '' || min === null || min === undefined) ? null : Number(min);
            const maxNum = (max === '' || max === null || max === undefined) ? null : Number(max);
            if (minNum !== null && maxNum !== null && !Number.isNaN(minNum) && !Number.isNaN(maxNum) && minNum > maxNum) {
                alert('RNA run size filter invalid: min is greater than max');
                return;
            }
        }

        setCompletedSearches({ taxonomy: false, uniprot: false, ensembl: false, refseq: false, genbank: false, dnaseq: false, rnaseq: false, phylogeny: false });

        if (cancelTokenSource) cancelTokenSource.cancel();

        const source = axios.CancelToken.source();
        setCancelTokenSource(source);
        resetSelectionsWithParams();
        setDBS(null);
        setDBSStatus(null);
        setWaitingTime(null);

        setIsLoading(true);
        const currentSpeciesFound = await speciesExists(inputSpecies);
        setIsLoading(false);

        if (!currentSpeciesFound) {
            updateParameters({ species: null });
            setSearchError(inputSpecies);
            return;
        }

        updateParameters({
            species: {
                scientificName: currentSpeciesFound.scientific_name,
                taxonID:        currentSpeciesFound.taxid,
                lineage:        currentSpeciesFound.data?.lineage || [],
                is_bacteria:    currentSpeciesFound.data?.is_bacteria || false,
                imageUrl:       currentSpeciesFound.taxo_image_url,
            }
        });
        setSearchError(null);

        const newDBS = {
            taxonomy: new DBSTaxonomy(new Date().getTime(), currentSpeciesFound),
            uniprot: null, ensembl: null, refseq: null,
            genbank: null, dnaseq: null, rnaseq: null, phylogeny_map: null,
        };
        setDBS(newDBS);
        setCurrentSearchTaxid(currentSpeciesFound.taxid);

        const computeUniprot  = dbsOptions.uniprot.active;
        const computeEnsembl  = dbsOptions.ensembl.active;
        const computeRefSeq   = dbsOptions.refseq.active;
        const computeGenBank  = dbsOptions.genbank.active;
        const computeDNASeq   = dbsOptions.dnaseq.active;
        const computeRNASeq   = dbsOptions.rnaseq.active;

        setAvailableSources({
            taxonomy: true,
            uniprot: computeUniprot, ensembl: computeEnsembl,
            refseq: computeRefSeq, genbank: computeGenBank,
            dnaseq: computeDNASeq, rnaseq: computeRNASeq,
        });

        try {
            const waitResp = await axios.post(`${CONFIG.API_BASE_URL}/waiting_time_dbsearch`, { cancelToken: source.token });
            setWaitingTime(waitResp.data.data);

            let params = { user, taxonomy: currentSpeciesFound.data };

            if (computeUniprot) {
                setDBSStatus('UniprotKB');
                params.options = dbsOptions.uniprot;
                const res = await executeDBSearchRoute('dbs_uniprot', params, source.token);
                if (res.success && res.data?.status === 'success') {
                    newDBS.uniprot = new DBSUniprot(new Date().getTime(), res.data.data);
                    setDBS({ ...newDBS });
                    setCompletedSearches(prev => ({ ...prev, uniprot: true }));
                }
            }

            if (computeEnsembl) {
                setDBSStatus('ENSEMBL');
                params.options = dbsOptions.ensembl;
                const res = await executeDBSearchRoute('dbs_ensembl', params, source.token);
                if (res.success && res.data?.status === 'success') {
                    newDBS.ensembl = new DBSEnsembl(new Date().getTime(), res.data.data);
                    setDBS({ ...newDBS });
                    setCompletedSearches(prev => ({ ...prev, ensembl: true }));
                }
            }

            if (computeRefSeq) {
                setDBSStatus('NCBI RefSeq');
                params.options = dbsOptions.refseq;
                const res = await executeDBSearchRoute('dbs_refseq', params, source.token);
                if (res.success && res.data?.status === 'success') {
                    newDBS.refseq = new DBSRefSeq(new Date().getTime(), res.data.data);
                    setDBS({ ...newDBS });
                    setCompletedSearches(prev => ({ ...prev, refseq: true }));
                }
            }

            if (computeGenBank) {
                setDBSStatus('NCBI GenBank');
                params.options = dbsOptions.genbank;
                const res = await executeDBSearchRoute('dbs_genbank', params, source.token);
                if (res.success && res.data?.status === 'success') {
                    newDBS.genbank = new DBSGenBank(new Date().getTime(), res.data.data);
                    setDBS({ ...newDBS });
                    setCompletedSearches(prev => ({ ...prev, genbank: true }));
                }
            }

            if (computeDNASeq) {
                setDBSStatus('NCBI SRA (DNA Sequencing)');
                params.options = dbsOptions.dnaseq;
                const res = await executeDBSearchRoute('dbs_dnaseq', params, source.token);
                if (res.success && res.data?.status === 'success') {
                    newDBS.dnaseq = new DBSDNASeq(new Date().getTime(), res.data.data);
                    setDBS({ ...newDBS });
                    setCompletedSearches(prev => ({ ...prev, dnaseq: true }));
                }
            }

            if (computeRNASeq) {
                setDBSStatus('NCBI SRA (RNA Sequencing)');
                params.options = dbsOptions.rnaseq;
                const res = await executeDBSearchRoute('dbs_rnaseq', params, source.token);
                if (res.success && res.data?.status === 'success') {
                    newDBS.rnaseq = new DBSRNASeq(new Date().getTime(), res.data.data);
                    setDBS({ ...newDBS });
                    setCompletedSearches(prev => ({ ...prev, rnaseq: true }));
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

    const cancelDBSearch = async () => {
        if (cancelTokenSource) {
            cancelTokenSource.cancel('Database Search cancelled by user');
            setCancelTokenSource(null);
        }
        setCancelInProgress(true);
        setIsLoading(true);

        if (currentSearchTaxid && user) {
            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/cancel_dbsearch`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user, taxid: currentSearchTaxid }),
                });
                const data = await response.json();
                if (data.status !== 'success') console.error('Failed to delete partial results:', data.message);
            } catch (error) {
                console.error('Error calling cancel_dbsearch:', error);
            }
        }

        setAvailableSources(prev => ({
            ...prev,
            ensembl: completedSearches.ensembl,
            refseq:  completedSearches.refseq,
            genbank: completedSearches.genbank,
            dnaseq:  completedSearches.dnaseq,
            rnaseq:  completedSearches.rnaseq,
        }));

        setDBSStatus('done');
        setWaitingTime(null);
        setCancelInProgress(false);
        setIsLoading(false);
        setCurrentSearchTaxid(null);
    };

    // ── load previous search ────────────────────────────────────────────────

    const handleResetDBS = () => {
        setDBS(null);
        setDBSStatus(null);
        resetSelectionsWithParams();
        setCurrentSearchTaxid(null);
        setAvailableSources({ taxonomy: true, uniprot: true, ensembl: true, refseq: true, genbank: true, dnaseq: true, rnaseq: true });
    };

    /** Single-collection toggle (manual user click in CollectionSection) */
    const handleLoadPreviousSearch = (collectionName, item, taxonomy, isDeselecting) => {
        if (isDeselecting && dbs) {
            const updatedDBS = { ...dbs, [collectionName === 'phylogeny' ? 'phylogeny_map' : collectionName]: null };
            setDBS(updatedDBS);
            setAvailableSources(availableSourcesFromDBS(updatedDBS));
            return;
        }

        let newDBS;
        if (dbs?.taxonomy?.taxonId === taxonomy.taxonId) {
            newDBS = { ...dbs };
        } else {
            newDBS = {
                taxonomy: makeTaxonomyDBS(taxonomy),
                uniprot: null, ensembl: null, refseq: null,
                genbank: null, dnaseq: null, rnaseq: null, phylogeny_map: null,
            };
            updateParameters({
                species: {
                    scientificName: taxonomy.scientificName,
                    taxonID:        taxonomy.taxonId,
                    lineage:        taxonomy.lineage || [],
                    is_bacteria:    taxonomy.isBacteria || false,
                    imageUrl:       taxonomy.imageUrl || null,
                }
            });
            setInputSpecies(taxonomy.scientificName);
        }

        applyCollectionToDBS(newDBS, collectionName, item);
        if (collectionName === 'dnaseq') setSelectedSequencingBatch(null);

        setDBS(newDBS);
        setDBSStatus('done');
        setSearchError(null);
        setAvailableSources(availableSourcesFromDBS(newDBS));

        // Update active tab for manual single selection
        const tabMap = { dnaseq: 'DNA Sequencing', rnaseq: 'RNA Sequencing', uniprot: 'Proteins', phylogeny: 'Phylogeny' };
        if (tabMap[collectionName]) {
            setActiveTab(tabMap[collectionName]);
        } else if (activeTab !== 'Proteins' && activeTab !== 'Assemblies') {
            setActiveTab('Proteins');
        }
    };

    /** Batch load — builds full DBS in one shot to avoid stale-closure overwrites */
    const handleBatchLoadPreviousSearch = (taxonomy, itemsToLoad) => {
        const newDBS = {
            taxonomy: makeTaxonomyDBS(taxonomy),
            uniprot: null, ensembl: null, refseq: null,
            genbank: null, dnaseq: null, rnaseq: null, phylogeny_map: null,
        };

        updateParameters({
            species: {
                scientificName: taxonomy.scientificName,
                taxonID:        taxonomy.taxonId,
                lineage:        taxonomy.lineage || [],
                is_bacteria:    taxonomy.isBacteria || false,
                imageUrl:       taxonomy.imageUrl || null,
            }
        });
        setInputSpecies(taxonomy.scientificName);

        itemsToLoad.forEach(({ collectionName, item }) => applyCollectionToDBS(newDBS, collectionName, item));

        setDBS(newDBS);
        setDBSStatus('done');
        setSearchError(null);
        setSelectedSequencingBatch(null);
        setAvailableSources(availableSourcesFromDBS(newDBS));
        setActiveTab(isTabAvailable(activeTab, newDBS) ? activeTab : firstValidTab(newDBS));
    };

    // ── phylogeny ───────────────────────────────────────────────────────────

    const handleGeneratePhylogenyMap = async () => {
        if (!dbs?.taxonomy) {
            console.error('No DBS data available to generate phylogeny map');
            return;
        }

        setPhylogenyLoading(true);
        try {
            const convertedDBS = {};

            // Uniprot (all three sub-types, guarded)
            if (dbs.uniprot) {
                if (dbs.uniprot.trembl)             convertedDBS.uniprot_trembl    = dbs.uniprot.trembl;
                if (dbs.uniprot.swissprot)          convertedDBS.uniprot_swissprot = dbs.uniprot.swissprot;
                if (dbs.uniprot.proteome?.length)   convertedDBS.uniprot_proteome  = dbs.uniprot.proteome;
            }

            if (dbs.ensembl) convertedDBS.ensembl = { proteins: dbs.ensembl.proteins || [], assemblies: dbs.ensembl.assemblies || [] };
            if (dbs.refseq)  convertedDBS.refseq  = { proteins: dbs.refseq.proteins  || [], assemblies: dbs.refseq.assemblies  || [] };
            if (dbs.genbank) convertedDBS.genbank  = { proteins: dbs.genbank.proteins || [], assemblies: dbs.genbank.assemblies || [] };

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
                            accession: run.accession, taxid: run.taxid,
                            scientific_name: run.scientificName, total_bases: run.totalBases,
                        })),
                    })),
                };
            }

            if (dbs.rnaseq) {
                convertedDBS.rnaseq = {
                    batches: (dbs.rnaseq.batches || []).map(batch => ({
                        total_bases: batch.totalBases,
                        scientific_name: batch.scientificName,
                        taxid: batch.taxid,
                        runs: batch.runs.map(run => ({
                            accession: run.accession, taxid: run.taxid,
                            scientific_name: run.scientificName, total_bases: run.totalBases,
                        })),
                    })),
                };
            }

            const params = {
                user,
                dbs: convertedDBS,
                taxonomy: {
                    scientificName: dbs.taxonomy.scientificName,
                    taxonId:        dbs.taxonomy.taxonId,
                    lineage:        dbs.taxonomy.lineage,
                },
            };

            const response = await executeDBSearchRoute('dbs_phylogeny', params);
            if (response.success && response.data?.status === 'success') {
                setDBS({ ...dbs, phylogeny_map: new DBSPhylogeny(new Date().getTime(), response.data.data) });
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

    // ── download ────────────────────────────────────────────────────────────

    const convertForDownload = async (data) => {
        try {
            setIsLoading(true);
            await handleClickDownload(data, 'proteins', true, dbs?.run_id, false, { mergeScope: 'download' });
        } catch (error) {
            console.error('Error during download:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // state
        isLoading, inputSpecies, setInputSpecies,
        searchError, waitingTime, cancelInProgress,
        phylogenyLoading, availableSources, setAvailableSources,
        // handlers
        handleClickDBSearch,
        cancelDBSearch,
        handleResetDBS,
        handleLoadPreviousSearch,
        handleBatchLoadPreviousSearch,
        handleGeneratePhylogenyMap,
        convertForDownload,
    };
}
