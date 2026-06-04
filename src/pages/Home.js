import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import DatabaseSearchOptions     from './Home/DatabaseSearchOptions';
import DatabaseSearchDescription from './Home/DatabaseSearchDescription';
import LoadPreviousDBSearch      from './Home/LoadPreviousDBSearch';
import DBSResults                from './Home/DBSResults';
import Loading                   from '../components/Loading';
import SpeciesInput              from '../components/SpeciesInput';
import { useDBSearch }           from '../contexts/DBSearchContext';
import { useParameters }         from '../contexts/ParametersContext';
import { useDBSelections }       from './Home/useDBSelections';
import { useDBSearchFlow }       from './Home/useDBSearchFlow';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();

    const { resetParameters }                                    = useParameters();
    const { dbs, setDBS, dbsStatus, setDBSStatus, resetDBS }    = useDBSearch();

    // ── UI state ──────────────────────────────────────────────────────────
    const [searchMode, setSearchMode] = useState('new');
    const [activeTab,  setActiveTab]  = useState('Proteins');
    const [dbsOptions, setDBSOptions] = useState({
        taxonomy: { active: true },
        uniprot:  { active: true },
        ensembl:  { active: true },
        refseq:   { active: true },
        genbank:  { active: true },
        dnaseq: {
            active: true,
            platforms: ['ILLUMINA', 'BGISEQ', 'ION_TORRENT', 'PACBIO_SMRT', 'OXFORD_NANOPORE'],
            layout: 'any',
            coverageLower: 50,
            coverageUpper: 80,
            strategy: 'WGS',
            selection: 'RANDOM',
            inputTaxonomyOnly: false,
        },
        rnaseq: {
            active: true,
            platforms: ['ILLUMINA', 'BGISEQ', 'ION_TORRENT', 'PACBIO_SMRT', 'OXFORD_NANOPORE'],
            layout: 'any',
            runSizeGbMin: '',
            runSizeGbMax: '',
            inputTaxonomyOnly: false,
        },
    });

    // ── selections hook ───────────────────────────────────────────────────
    const {
        selectedSequencingBatch, setSelectedSequencingBatch,
        selectedRNASeqBatches,
        selectedAssembly,
        selectedProteins,
        resetSelectionsWithParams,
        updateSelectedSequencingBatch,
        updateSelectedRNASeqBatch,
        updateSelectedAssembly,
        updateSelectedProteins,
    } = useDBSelections();

    // ── search-flow hook ──────────────────────────────────────────────────
    const {
        isLoading, inputSpecies, setInputSpecies,
        searchError, waitingTime, cancelInProgress,
        phylogenyLoading, availableSources, setAvailableSources,
        handleClickDBSearch,
        cancelDBSearch,
        handleResetDBS,
        handleLoadPreviousSearch,
        handleBatchLoadPreviousSearch,
        handleGeneratePhylogenyMap,
        convertForDownload,
    } = useDBSearchFlow({
        dbsOptions,
        activeTab,
        setActiveTab,
        resetSelectionsWithParams,
        setSelectedSequencingBatch,
    });

    // ── effects ───────────────────────────────────────────────────────────

    useEffect(() => {
        resetParameters();
        resetDBS();
        setDBS(null);
        setDBSStatus(null);
        setActiveTab('Proteins');
        resetSelectionsWithParams();
    }, [location.state]);

    useEffect(() => {
        setActiveTab('Proteins');
        resetSelectionsWithParams();
        setDBS(null);
    }, [searchMode]);

    useEffect(() => {
        if (searchMode === 'load') {
            setDBSStatus(null);
            setAvailableSources({ taxonomy: true, uniprot: true, ensembl: true, refseq: true, genbank: true, dnaseq: true, rnaseq: true });
        }
    }, [searchMode]);

    // Auto-manage active tab when sources change
    useEffect(() => {
        if (!dbs) return;

        const hasProteins = Boolean(
            dbs?.uniprot?.swissprot ||
            dbs?.uniprot?.trembl ||
            (Array.isArray(dbs?.uniprot?.proteome) && dbs.uniprot.proteome.length > 0) ||
            (Array.isArray(dbs?.ensembl?.proteins) && dbs.ensembl.proteins.length > 0) ||
            (Array.isArray(dbs?.refseq?.proteins) && dbs.refseq.proteins.length > 0) ||
            (Array.isArray(dbs?.genbank?.proteins) && dbs.genbank.proteins.length > 0)
        );
        const hasAssemblies = Boolean(
            (Array.isArray(dbs?.ensembl?.assemblies) && dbs.ensembl.assemblies.length > 0) ||
            (Array.isArray(dbs?.refseq?.assemblies) && dbs.refseq.assemblies.length > 0) ||
            (Array.isArray(dbs?.genbank?.assemblies) && dbs.genbank.assemblies.length > 0)
        );
        const hasSequencing = Boolean(Array.isArray(dbs?.dnaseq?.batches) && dbs.dnaseq.batches.length > 0);
        const hasRNASeq = Boolean(Array.isArray(dbs?.rnaseq?.runs) && dbs.rnaseq.runs.length > 0);
        const hasPhylogeny  = !!dbs.phylogeny_map;

        const tabIsInvalid =
            (activeTab === 'Proteins'       && !hasProteins)   ||
            (activeTab === 'Assemblies'     && !hasAssemblies) ||
            (activeTab === 'DNA Sequencing' && !hasSequencing) ||
            (activeTab === 'RNA Sequencing' && !hasRNASeq)     ||
            (activeTab === 'Phylogeny'      && !hasPhylogeny);

        if (tabIsInvalid) {
            if (hasProteins)        setActiveTab('Proteins');
            else if (hasAssemblies) setActiveTab('Assemblies');
            else if (hasSequencing) setActiveTab('DNA Sequencing');
            else if (hasRNASeq)     setActiveTab('RNA Sequencing');
            else if (hasPhylogeny)  setActiveTab('Phylogeny');
        }
    }, [dbs, availableSources, dbsStatus, activeTab, searchMode]);

    // ── render ────────────────────────────────────────────────────────────

    const searchInProgress = dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed';
    const interactionLocked = Boolean(searchInProgress || phylogenyLoading);
    const lockReason = searchInProgress
        ? 'The database search is still in progress, please try again once it is completed.'
        : 'The phylogeny map is currently being generated, please wait until it is completed.';

    return (
        <div id="page">
            <div className="navigation-buttons">
                <button className="t2_bold left" onClick={() => {
                    if (!interactionLocked) navigate('/my-annotations', { state: { from: 'home' } });
                    else alert(lockReason);
                }}>
                    My Annotations
                </button>
                <button className="t2_bold right" onClick={() => {
                    if (!interactionLocked) navigate('/settings', { state: { from: 'home' } });
                    else alert(lockReason);
                }}>
                    Create an Annotation
                </button>
            </div>

            <div className="database-search-container">
                <h2 className="home-h2">Database Search</h2>

                <div className="search-mode-selector">
                    {[['about', 'How does it work ?'], ['new', 'New Database Search'], ['load', 'Load Previous Search']].map(([mode, label]) => (
                        <button
                            key={mode}
                            className={`btn-tab-style t2_bold ${searchMode === mode ? 'active' : ''}`}
                            onClick={() => setSearchMode(mode)}
                            disabled={interactionLocked}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {searchMode === 'about' && <DatabaseSearchDescription compact={false} />}

                {searchMode === 'new' && (
                    <div className="search-form-container">
                        <SpeciesInput
                            inputSpecies={inputSpecies}
                            setInputSpecies={setInputSpecies}
                            searchError={searchError}
                            onClick={handleClickDBSearch}
                            buttonLabel="Search"
                        />
                        <DatabaseSearchOptions
                            options={dbsOptions}
                            setOptions={setDBSOptions}
                            disabled={interactionLocked}
                        />
                    </div>
                )}

                {searchMode === 'load' && (
                    <div className="search-form-container">
                        <LoadPreviousDBSearch
                            onLoad={handleLoadPreviousSearch}
                            onBatchLoad={handleBatchLoadPreviousSearch}
                            onReset={handleResetDBS}
                            onGeneratePhylogeny={handleGeneratePhylogenyMap}
                            phylogenyLoading={phylogenyLoading}
                            dbs={dbs}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            disabled={interactionLocked}
                        />
                    </div>
                )}

                {dbsStatus === 'failed' && <p>A problem occurred during the search</p>}

                {searchInProgress && (
                    <div className="dbsearch-status">
                        <div className="dbsearch-status-text">
                            <span>Database Search in progress: {dbsStatus} ...</span>
                            {waitingTime?.[dbsStatus] && (
                                <span>Estimated waiting time: {waitingTime[dbsStatus][0]} to {waitingTime[dbsStatus][1]}</span>
                            )}
                        </div>
                        <button className="red-btn" onClick={cancelDBSearch}>Cancel</button>
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
                    interactionLocked={interactionLocked}
                    selectedSequencingBatch={selectedSequencingBatch}
                    updateSelectedSequencingBatch={updateSelectedSequencingBatch}
                    selectedRNASeqBatches={selectedRNASeqBatches}
                    updateSelectedRNASeqBatch={updateSelectedRNASeqBatch}
                />

                {dbs && dbsStatus === 'done' && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button
                            className="btn-phylogeny"
                            onClick={handleGeneratePhylogenyMap}
                            disabled={interactionLocked}
                        >
                            {phylogenyLoading ? 'Generating Phylogeny Map...' : 'Generate Phylogeny Map'}
                        </button>
                    </div>
                )}
            </div>

            {(isLoading || phylogenyLoading) && <Loading />}
        </div>
    );
}
