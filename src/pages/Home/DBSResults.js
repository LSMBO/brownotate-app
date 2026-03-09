import CardProteins from './CardProteins';
import CardAssembly from './CardAssembly';
import CardSequencing from './CardSequencing';
import CardPhylogeny from './CardPhylogeny';
import Image from '../../components/Image';

const DBSResults = ({ 
    dbs, 
    availableSources, 
    activeTab, 
    setActiveTab,
    selectedProteins,
    updateSelectedProteins,
    convertForDownload,
    dbsOptions,
    selectedAssembly,
    updateSelectedAssembly,
    dbsStatus,
    selectedSequencingBatch,
    updateSelectedSequencingBatch
}) => {
    if (!dbs) return null;

    const dbSearchInProgress = dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed';

    return (
        <div className="results-layout">
            <div className="taxonomy-card">
                <h3>
                    <i>{dbs.taxonomy.scientificName.charAt(0).toUpperCase() + dbs.taxonomy.scientificName.slice(1).toLowerCase()}</i>
                    <br />
                    [TaxID: {dbs.taxonomy.taxonId}]
                </h3>
                <Image file={dbs.taxonomy.taxoImageUrl}/>
            </div>

            {/* Only show tabs if we have actual data loaded */}
            {(availableSources.uniprot || availableSources.ensembl || availableSources.refseq || availableSources.genbank || availableSources.dnaseq || dbs.phylogeny_map) && (
                <div className="tabs-container">
                    <div className="tabs-header">
                        {/* Show Proteins tab if any protein source is available */}
                        {(availableSources.uniprot || availableSources.ensembl || availableSources.refseq || availableSources.genbank) && (
                            <div className={`tab ${activeTab === 'Proteins' ? 'active-tab': ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Proteins'); }}>Proteins</div>
                        )}
                        {/* Show Assemblies tab if any assembly source is available */}
                        {(availableSources.ensembl || availableSources.refseq || availableSources.genbank) && (
                            <div className={`tab ${activeTab === 'Assemblies' ? 'active-tab': ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Assemblies'); }}>Assemblies</div>
                        )}
                        {/* Show Sequencing tab if dnaseq is available */}
                        {availableSources.dnaseq && (
                            <div className={`tab ${activeTab === 'Sequencing' ? 'active-tab': ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Sequencing'); }}>Sequencing</div>
                        )}
                        {/* Show Phylogeny tab only if phylogeny_map was generated */}
                        {dbs.phylogeny_map && (
                            <div className={`tab ${activeTab === 'Phylogeny' ? 'active-tab': ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('Phylogeny'); }}>Phylogeny Tree</div>
                        )}
                    </div>
                    <div className="tabs-content">
                        <div className={`tab-content ${activeTab === 'Proteins' ? 'active-content' : ''}`}>
                            <CardProteins
                                dbs={dbs}
                                dbsOptions={dbsOptions}
                                availableSources={availableSources}
                                selectedProteins={selectedProteins}
                                updateSelectedProteins={updateSelectedProteins}
                                convertForDownload={convertForDownload}
                            />
                        </div>                    
                        <div className={`tab-content ${activeTab === 'Assemblies' ? 'active-content' : ''}`}>
                            <CardAssembly
                                dbs={dbs}
                                dbsOptions={dbsOptions}
                                availableSources={availableSources}
                                selectedAssembly={selectedAssembly}
                                updateSelectedAssembly={updateSelectedAssembly}
                                dbSearchInProgress={dbSearchInProgress}
                            />
                        </div>
                        {availableSources.dnaseq && (
                            <div className={`tab-content ${activeTab === 'Sequencing' ? 'active-content' : ''}`}>
                                <CardSequencing
                                    dnaseq={dbs?.dnaseq}
                                    selectedSequencingBatch={selectedSequencingBatch}
                                    updateSelectedSequencingBatch={updateSelectedSequencingBatch}
                                    dbSearchInProgress={dbSearchInProgress}
                                />
                            </div>
                        )}
                        {dbs.phylogeny_map && (
                            <div className={`tab-content ${activeTab === 'Phylogeny' ? 'active-content' : ''}`}>
                                <CardPhylogeny file={dbs?.phylogeny_map?.phylogeny_map}/>
                            </div>
                        )}
                    </div>
                </div>  
            )}
        </div>
    );
};

export default DBSResults;
