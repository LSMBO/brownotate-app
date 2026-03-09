import { useState, useEffect } from 'react';
import CollectionSection from './CollectionSection';
import { getDBSearches, speciesExists } from '../../utils/DatabaseSearch';
import Loading from '../../components/Loading';
import './LoadPreviousDBSearch.css';

export default function LoadPreviousDBSearch({ onLoad, onReset, onGeneratePhylogeny, phylogenyLoading, dbs, disabled }) {
    const [dbSearches, setDBSearches] = useState(null);
    const [taxonomies, setTaxonomies] = useState([]);
    const [selectedTaxonomy, setSelectedTaxonomy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    
    // States for search with suggestions
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getDBSearches();
            if (result.status === 'success') {
                setDBSearches(result.data);
                
                const enrichedTaxonomies = await extractTaxonomies(result.data);
                setTaxonomies(enrichedTaxonomies);
                
                if (enrichedTaxonomies.length > 0) {
                    setSelectedTaxonomy(enrichedTaxonomies[0]);
                }
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
        const collections = ['uniprot', 'ensembl', 'refseq', 'genbank', 'dnaseq'];
        
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
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const handleLoadCollection = (collectionName, item) => {
        const isCurrentlySelected = selectedItems[collectionName] === item.date;
        
        if (isCurrentlySelected) {
            // Deselect the item
            setSelectedItems(prev => {
                const newItems = { ...prev };
                delete newItems[collectionName];
                return newItems;
            });
            
            if (onLoad) {
                onLoad(collectionName, item, selectedTaxonomy, true); // true = isDeselecting
            }
        } else {
            // Select the item
            setSelectedItems(prev => ({
                ...prev,
                [collectionName]: item.date
            }));
            
            if (onLoad) {
                onLoad(collectionName, item, selectedTaxonomy, false); // false = isSelecting
            }
        }
    };

    const handleTaxonomySelect = (taxonomy) => {
        setSelectedTaxonomy(taxonomy);
        setSearchQuery(taxonomy.scientificName);
        setShowSuggestions(false);
        setSelectedItems({});
        if (onReset) {
            onReset();
        }
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
                                selectedItemDate={selectedItems['uniprot']}
                            />
                            <CollectionSection 
                                title="Ensembl"
                                collectionName="ensembl"
                                data={getCollectionData('ensembl')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="ensembl"
                                selectedItemDate={selectedItems['ensembl']}
                            />
                            <CollectionSection 
                                title="NCBI RefSeq"
                                collectionName="refseq"
                                data={getCollectionData('refseq')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="refseq"
                                selectedItemDate={selectedItems['refseq']}
                            />
                            <CollectionSection 
                                title="NCBI GenBank"
                                collectionName="genbank"
                                data={getCollectionData('genbank')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="genbank"
                                selectedItemDate={selectedItems['genbank']}
                            />
                             <CollectionSection 
                                title="DNA Sequencing (NCBI SRA)"
                                collectionName="dnaseq"
                                data={getCollectionData('dnaseq')}
                                onLoad={handleLoadCollection}
                                formatDate={formatDate}
                                color="dnaseq"
                                selectedItemDate={selectedItems['dnaseq']}
                            />                                                                             
                        </div>
                        

                    </>
                )}
            </div>
        );
}