import React from 'react';
import './DBSTabs.css';

const DBSLoading = () => {
    return (
        <div className="dbs-loading-container">
            <div className="dbs-loading-spinner" />
            <p className="dbs-loading-text">Loading data...</p>
        </div>
    );
};

export default DBSLoading;
