import './LoadPreviousDBSearch.css';

export default function CollectionSection({ 
    title, 
    collectionName, 
    data, 
    onLoad, 
    formatDate, 
    color, 
    selectedItemKey,
    getItemKey,
    isExpanded = false, 
    setIsExpanded = () => {},
    preserveClickPosition = null,
}) {
    if (!data || data.length === 0) {
        return (
            <div className={`collection-section ${color}`}>
                <div className="collection-header">
                    <label>{title}</label>
                    <span className="no-data">No data found</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`collection-section ${color}`}>
            <div 
                className="collection-header clickable" 
                onClick={(event) => {
                    const action = () => setIsExpanded(!isExpanded);
                    if (typeof preserveClickPosition === 'function') {
                        preserveClickPosition(event.currentTarget, action);
                    } else {
                        action();
                    }
                }}
            >
                <label>{title}</label>
                <span className="count-badge">{data.length} result{data.length > 1 ? 's' : ''}</span>
            </div>
            
            {isExpanded && (
                <div className="collection-items">
                    {data.map((item, index) => {
                        const itemKey = getItemKey(item, index);
                        const isSelected = itemKey === selectedItemKey;
                        return (
                            <div 
                                key={itemKey}
                                className={`collection-item ${isSelected ? 'selected' : ''}`}
                                onClick={(event) => onLoad(collectionName, item, event.currentTarget)}
                            >
                                <div className="item-info">
                                    <span className="item-date">{formatDate(item.date)} - {item.scientific_name} [TaxID: {item.taxid}]</span>
                                    {item.options && (
                                        <span className="item-options">
                                            {JSON.stringify(item.options)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}