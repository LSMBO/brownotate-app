import './LoadPreviousDBSearch.css';
import { useState } from 'react';

export default function CollectionSection({ title, collectionName, data, onLoad, formatDate, color, selectedItemDate }) {
    const [isExpanded, setIsExpanded] = useState(false);

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
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <label>{title}</label>
                <span className="count-badge">{data.length} result{data.length > 1 ? 's' : ''}</span>
            </div>
            
            {isExpanded && (
                <div className="collection-items">
                    {data.map((item, index) => {
                        const isSelected = item.date === selectedItemDate;
                        return (
                            <div 
                                key={index} 
                                className={`collection-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => onLoad(collectionName, item)}
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