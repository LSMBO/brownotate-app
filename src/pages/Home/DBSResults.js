import CardProteins from './CardProteins';
import CardAssembly from './CardAssembly';
import CardSequencing from './CardSequencing';
import CardRNASeq from './CardRNASeq';
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
    interactionLocked,
    selectedSequencingBatch,
    updateSelectedSequencingBatch,
    selectedRNASeqBatches,
    updateSelectedRNASeqBatch
}) => {
    if (!dbs) return null;

    const dbSearchInProgress = interactionLocked || (dbsStatus && dbsStatus !== 'done' && dbsStatus !== 'failed');
    const hasProteinData = Boolean(
        dbs?.uniprot?.swissprot ||
        dbs?.uniprot?.trembl ||
        (Array.isArray(dbs?.uniprot?.proteome) && dbs.uniprot.proteome.length > 0) ||
        (Array.isArray(dbs?.ensembl?.proteins) && dbs.ensembl.proteins.length > 0) ||
        (Array.isArray(dbs?.refseq?.proteins) && dbs.refseq.proteins.length > 0) ||
        (Array.isArray(dbs?.genbank?.proteins) && dbs.genbank.proteins.length > 0)
    );
    const hasAssemblyData = Boolean(
        (Array.isArray(dbs?.ensembl?.assemblies) && dbs.ensembl.assemblies.length > 0) ||
        (Array.isArray(dbs?.refseq?.assemblies) && dbs.refseq.assemblies.length > 0) ||
        (Array.isArray(dbs?.genbank?.assemblies) && dbs.genbank.assemblies.length > 0)
    );
    const hasDNASeqData = Boolean(Array.isArray(dbs?.dnaseq?.batches) && dbs.dnaseq.batches.length > 0);
    const hasRNASeqData = Boolean(Array.isArray(dbs?.rnaseq?.runs) && dbs.rnaseq.runs.length > 0);
    const hasPhylogenyData = Boolean(dbs?.phylogeny_map);

    const switchTabPreservingPosition = (event, tabName) => {
        event.preventDefault();
        if (interactionLocked) {
            return;
        }
        const beforeTop = event.currentTarget.getBoundingClientRect().top;
        setActiveTab(tabName);
        requestAnimationFrame(() => {
            const afterTop = event.currentTarget.getBoundingClientRect().top;
            window.scrollBy(0, afterTop - beforeTop);
        });
    };

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
            {(hasProteinData || hasAssemblyData || hasDNASeqData || hasRNASeqData || hasPhylogenyData) && (
                <div className="tabs-container">
                    <div className="tabs-header">
                        {/* Show Proteins tab if any protein source is available */}
                        {hasProteinData && (
                            <div className={`tab ${activeTab === 'Proteins' ? 'active-tab': ''}`} onClick={(e) => switchTabPreservingPosition(e, 'Proteins')}>Proteins</div>
                        )}
                        {/* Show Assemblies tab if any assembly source is available */}
                        {hasAssemblyData && (
                            <div className={`tab ${activeTab === 'Assemblies' ? 'active-tab': ''}`} onClick={(e) => switchTabPreservingPosition(e, 'Assemblies')}>Assemblies</div>
                        )}
                        {/* Show Sequencing tab if dnaseq is available */}
                        {hasDNASeqData && (
                            <div className={`tab ${activeTab === 'DNA Sequencing' ? 'active-tab': ''}`} onClick={(e) => switchTabPreservingPosition(e, 'DNA Sequencing')}>DNA Sequencing</div>
                        )}
                        {/* Show RNAseq tab if rnaseq is available */}
                        {hasRNASeqData && (
                            <div className={`tab ${activeTab === 'RNA Sequencing' ? 'active-tab': ''}`} onClick={(e) => switchTabPreservingPosition(e, 'RNA Sequencing')}>RNA Sequencing</div>
                        )}
                        {/* Show Phylogeny tab only if phylogeny_map was generated */}
                        {hasPhylogenyData && (
                            <div className={`tab ${activeTab === 'Phylogeny' ? 'active-tab': ''}`} onClick={(e) => switchTabPreservingPosition(e, 'Phylogeny')}>Phylogeny Tree</div>
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
                        {hasDNASeqData && (
                            <div className={`tab-content ${activeTab === 'DNA Sequencing' ? 'active-content' : ''}`}>
                                <CardSequencing
                                    dnaseq={dbs?.dnaseq}
                                    selectedSequencingBatch={selectedSequencingBatch}
                                    updateSelectedSequencingBatch={updateSelectedSequencingBatch}
                                    dbSearchInProgress={dbSearchInProgress}
                                />
                            </div>
                        )}
                        {hasRNASeqData && (
                            <div className={`tab-content ${activeTab === 'RNA Sequencing' ? 'active-content' : ''}`}>
                                <CardRNASeq
                                    rnaseq={dbs?.rnaseq}
                                    selectedRNASeqBatches={selectedRNASeqBatches}
                                    updateSelectedRNASeqBatch={updateSelectedRNASeqBatch}
                                    dbSearchInProgress={dbSearchInProgress}
                                />
                            </div>
                        )}
                        {hasPhylogenyData && (
                            <div className={`tab-content ${activeTab === 'Phylogeny' ? 'active-content' : ''}`}>
                                <CardPhylogeny phylogeny={dbs?.phylogeny_map?.phylogeny}/>
                            </div>
                        )}
                    </div>
                </div>  
            )}
        </div>
    );
};

export default DBSResults;
