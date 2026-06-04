import { useState, useEffect } from 'react';
import CollectionSection from './CollectionSection';
import { getDBSearches, speciesExists } from '../../utils/DatabaseSearch';
import Loading from '../../components/Loading';
import './LoadPreviousDBSearch.css';

export default function LoadPreviousDBSearch({ onLoad, onBatchLoad, onReset, onGeneratePhylogeny, phylogenyLoading, dbs, disabled }) {
    const [dbSearches, setDBSearches] = useState(null);
    const [taxonomies, setTaxonomies] = useState([]);
    const [selectedTaxonomy, setSelectedTaxonomy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [expandedSections, setExpandedSections] = useState({});
    
    // States for search with suggestions
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const collectionNames = ['uniprot', 'ensembl', 'refseq', 'genbank', 'dnaseq', 'rnaseq'];

    const getItemKey = (item, index = 0) => {
        if (item?._id) return item._id;
        const optionsPart = item?.options ? JSON.stringify(item.options) : '{}';
        const runPart = item?.run_id || item?.id || 'no-run';
        return `${item?.date || 'no-date'}-${item?.taxid || 'no-taxid'}-${runPart}-${optionsPart}-${index}`;
    };

    const preserveClickPosition = (target, action) => {
        if (!target || typeof action !== 'function') {
            action?.();
            return;
        }
        const beforeTop = target.getBoundingClientRect().top;
        action();
        requestAnimationFrame(() => {
            const afterTop = target.getBoundingClientRect().top;
            window.scrollBy(0, afterTop - beforeTop);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const parseSearchDate = (dateString) => {
        if (!dateString) return 0;

        // Expected format: DDMMYYYY-HHmmss (e.g. 13022026-134456)
        const parts = String(dateString).split('-');
        if (parts.length === 2 && parts[0].length === 8 && parts[1].length >= 6) {
            const datePart = parts[0];
            const timePart = parts[1];

            const day = Number(datePart.substring(0, 2));
            const month = Number(datePart.substring(2, 4)) - 1;
            const year = Number(datePart.substring(4, 8));
            const hour = Number(timePart.substring(0, 2));
            const minute = Number(timePart.substring(2, 4));
            const second = Number(timePart.substring(4, 6));

            const timestamp = new Date(year, month, day, hour, minute, second).getTime();
            return Number.isNaN(timestamp) ? 0 : timestamp;
        }

        // Fallback for ISO or other parseable formats
        const fallback = new Date(dateString).getTime();
        return Number.isNaN(fallback) ? 0 : fallback;
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getDBSearches();
            if (result.status === 'success') {
                setDBSearches(result.data);
                
                const enrichedTaxonomies = await extractTaxonomies(result.data);
                setTaxonomies(enrichedTaxonomies);
                
                // Don't auto-select on initial load - let user choose
            }
        } catch (error) {
            console.error('Error loading previous searches:', error);
        } finally {
            setLoading(false);
        }
    };

    const extractTaxonomies = async (data) => {
        // First, collect unique taxids from all collections
        const taxonomyMap = new Map();      
        const collections = ['uniprot', 'ensembl', 'refseq', 'genbank', 'dnaseq', 'rnaseq'];
        
        collections.forEach(collectionName => {
            if (data[collectionName] && Array.isArray(data[collectionName])) {
                data[collectionName].forEach(item => {
                    if (item.taxid && !taxonomyMap.has(item.taxid)) {
                        taxonomyMap.set(item.taxid, {
                            taxid: item.taxid,
                            scientificName: item.scientific_name || `TaxID ${item.taxid}`
                        });
                    }
                });
            }
        });
        // Now enrich each taxonomy with full information from speciesExists
        const enrichedTaxonomies = [];
        for (const [taxid, basicInfo] of taxonomyMap) {
            try {
                const fullTaxonomy = await speciesExists(basicInfo.scientificName);
                if (fullTaxonomy) {
                    enrichedTaxonomies.push({
                        taxonId: fullTaxonomy.taxid,
                        scientificName: fullTaxonomy.scientific_name,
                        lineage: fullTaxonomy.data?.lineage || [],
                        isBacteria: fullTaxonomy.data?.is_bacteria || false,
                        imageUrl: fullTaxonomy.taxo_image_url,
                        data: fullTaxonomy.data
                    });
                } else {
                    // If speciesExists fails, use basic info
                    enrichedTaxonomies.push(basicInfo);
                }
            } catch (error) {
                console.error(`Error enriching taxonomy ${basicInfo.scientificName}:`, error);
                // If error, use basic info
                enrichedTaxonomies.push(basicInfo);
            }
        }
        
        return enrichedTaxonomies.sort((a, b) => 
            a.scientificName.localeCompare(b.scientificName)
        );
    };

    const getCollectionData = (collectionName) => {
        if (!dbSearches || !selectedTaxonomy) return [];
        
        const data = dbSearches[collectionName];
        if (!Array.isArray(data)) return [];
        
        return data
            .filter(item => item.taxid === selectedTaxonomy.taxonId)
            .sort((a, b) => parseSearchDate(b.date) - parseSearchDate(a.date));
    };

    const autoSelectMostRecent = (taxonomy) => {
        const newSelectedItems = {};
        const newExpandedSections = {};
        const itemsToLoad = [];

        collectionNames.forEach(collectionName => {
            if (!dbSearches || !dbSearches[collectionName]) return;
            
            const data = dbSearches[collectionName];
            if (!Array.isArray(data)) return;
            
            const filtered = data
                .filter(item => item.taxid === taxonomy.taxonId)
                .sort((a, b) => parseSearchDate(b.date) - parseSearchDate(a.date));
            
            if (filtered.length > 0) {
                const mostRecent = filtered[0];
                newSelectedItems[collectionName] = getItemKey(mostRecent, 0);
                newExpandedSections[collectionName] = true; // Auto-expand sections with selections
                itemsToLoad.push({ collectionName, item: mostRecent });
            }
        });

        setSelectedItems(newSelectedItems);
        setExpandedSections(newExpandedSections);

        // Load all items in a single batch call to avoid stale closure issues
        if (typeof onBatchLoad === 'function' && itemsToLoad.length > 0) {
            onBatchLoad(taxonomy, itemsToLoad);
        }
    };

    const rebuildFromSelectedItems = (nextSelectedItems) => {
        if (!selectedTaxonomy || typeof onBatchLoad !== 'function') {
            return;
        }

        const itemsToLoad = [];
        collectionNames.forEach((collectionName) => {
            const selectedKey = nextSelectedItems[collectionName];
            if (!selectedKey) {
                return;
            }

            const data = getCollectionData(collectionName);
            const match = data.find((entry, index) => getItemKey(entry, index) === selectedKey);
            if (match) {
                itemsToLoad.push({ collectionName, item: match });
            }
        });

        onBatchLoad(selectedTaxonomy, itemsToLoad);
    };

    const handleLoadCollection = (collectionName, item, clickTarget = null) => {
        const collectionData = getCollectionData(collectionName);
        const itemIndex = collectionData.findIndex((entry) => (entry?._id && item?._id ? entry._id === item._id : entry === item));
        const itemKey = getItemKey(item, itemIndex >= 0 ? itemIndex : 0);
        const isCurrentlySelected = selectedItems[collectionName] === itemKey;
        preserveClickPosition(clickTarget, () => {
            if (isCurrentlySelected) {
                // Deselect the item
                setSelectedItems(prev => {
                    const newItems = { ...prev };
                    delete newItems[collectionName];
                    rebuildFromSelectedItems(newItems);
                    return newItems;
                });
            } else {
                // Select the item
                setSelectedItems(prev => {
                    const newItems = {
                        ...prev,
                        [collectionName]: itemKey
                    };
                    rebuildFromSelectedItems(newItems);
                    return newItems;
                });

                // Auto-expand when selecting
                setExpandedSections(prev => ({
                    ...prev,
                    [collectionName]: true
                }));
            }
        });
    };

    const handleTaxonomySelect = (taxonomy) => {
        setSelectedTaxonomy(taxonomy);
        setSearchQuery(taxonomy.scientificName);
        setShowSuggestions(false);
        
        if (typeof onReset === 'function') {
            onReset();
        }
        
        // Auto-select most recent items for the new taxonomy
        // Use setTimeout to ensure state is cleared first
        setTimeout(() => {
            autoSelectMostRecent(taxonomy);
        }, 50);
    };

    const handleSearchInput = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setShowSuggestions(true);
    };

    const getFilteredTaxonomies = () => {
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length <= 1) {
            return taxonomies;
        }
        const query = trimmedQuery.toLowerCase();
        return taxonomies.filter(tax => 
            tax.scientificName.toLowerCase().includes(query) ||
            tax.taxonId.toString().includes(query)
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        // Handle format: DDMMYYYYHHmmss (e.g., "13022026-134456")
        const parts = dateString.split('-');
        if (parts.length === 2) {
            const datePart = parts[0];
            const timePart = parts[1];
            
            const day = datePart.substring(0, 2);
            const month = datePart.substring(2, 4);
            const year = datePart.substring(4, 8);
            const hour = timePart.substring(0, 2);
            const minute = timePart.substring(2, 4);
            const second = timePart.substring(4, 6);
            
            return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
        }
        
        // Fallback to standard date parsing
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div>
            {loading ? (
                    <Loading />
                ) : taxonomies.length === 0 ? (
                    <div className="modal-empty">No previous searches found</div>
                ) : (
                    <>
                        <div className="taxonomy-selector">
                            <label>Select Species:</label>
                            <div className="taxonomy-search-container">
                                <input
                                    type="text"
                                    className="taxonomy-search-input"
                                    placeholder="Type species name or TaxID..."
                                    value={searchQuery}
                                    onChange={handleSearchInput}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {showSuggestions && (
                                    <div className="taxonomy-suggestions">
                                        {getFilteredTaxonomies().length > 0 ? (
                                            getFilteredTaxonomies().map(taxonomy => (
                                                <div
                                                    key={taxonomy.taxonId}
                                                    className="suggestion-item"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleTaxonomySelect(taxonomy);
                                                    }}
                                                >
                                                    <strong>{taxonomy.scientificName.charAt(0).toUpperCase() + taxonomy.scientificName.slice(1).toLowerCase()}</strong>
                                                    <span className="suggestion-taxid">TaxID: {taxonomy.taxonId}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="suggestion-item no-results">No species found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="collections-container">
                            <CollectionSection 
                                title="Uniprot"
                                collectionName="uniprot"
                                data={getCollectionData('uniprot')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="uniprot"
                                selectedItemKey={selectedItems['uniprot']}
                                getItemKey={getItemKey}
                                isExpanded={expandedSections['uniprot']}
                                setIsExpanded={(val) => setExpandedSections(prev => ({ ...prev, uniprot: val }))}
                                preserveClickPosition={preserveClickPosition}
                            />
                            <CollectionSection 
                                title="Ensembl"
                                collectionName="ensembl"
                                data={getCollectionData('ensembl')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="ensembl"
                                selectedItemKey={selectedItems['ensembl']}
                                getItemKey={getItemKey}
                                isExpanded={expandedSections['ensembl']}
                                setIsExpanded={(val) => setExpandedSections(prev => ({ ...prev, ensembl: val }))}
                                preserveClickPosition={preserveClickPosition}
                            />
                            <CollectionSection 
                                title="NCBI RefSeq"
                                collectionName="refseq"
                                data={getCollectionData('refseq')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="refseq"
                                selectedItemKey={selectedItems['refseq']}
                                getItemKey={getItemKey}
                                isExpanded={expandedSections['refseq']}
                                setIsExpanded={(val) => setExpandedSections(prev => ({ ...prev, refseq: val }))}
                                preserveClickPosition={preserveClickPosition}
                            />
                            <CollectionSection 
                                title="NCBI GenBank"
                                collectionName="genbank"
                                data={getCollectionData('genbank')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="genbank"
                                selectedItemKey={selectedItems['genbank']}
                                getItemKey={getItemKey}
                                isExpanded={expandedSections['genbank']}
                                setIsExpanded={(val) => setExpandedSections(prev => ({ ...prev, genbank: val }))}
                                preserveClickPosition={preserveClickPosition}
                            />
                             <CollectionSection 
                                title="DNA Sequencing (NCBI SRA)"
                                collectionName="dnaseq"
                                data={getCollectionData('dnaseq')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="dnaseq"
                                          selectedItemKey={selectedItems['dnaseq']}
                                          getItemKey={getItemKey}
                                isExpanded={expandedSections['dnaseq']}
                                setIsExpanded={(val) => setExpandedSections(prev => ({ ...prev, dnaseq: val }))}
                                preserveClickPosition={preserveClickPosition}
                            />
                             <CollectionSection 
                                title="RNA Sequencing (NCBI SRA)"
                                collectionName="rnaseq"
                                data={getCollectionData('rnaseq')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="rnaseq"
                                          selectedItemKey={selectedItems['rnaseq']}
                                          getItemKey={getItemKey}
                                isExpanded={expandedSections['rnaseq']}
                                setIsExpanded={(val) => setExpandedSections(prev => ({ ...prev, rnaseq: val }))}
                                preserveClickPosition={preserveClickPosition}
                            />                                                                             
                        </div>
                        

                    </>
                )}
            </div>
        );
}