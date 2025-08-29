import React, { useState } from 'react';
import { faAngleRight, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DatabaseSearchDescription = () => {
    const [step1Expanded, setStep1Expanded] = useState(false);
    const [step2Expanded, setStep2Expanded] = useState(false);
    const [step3Expanded, setStep3Expanded] = useState(false);
    const [step4Expanded, setStep4Expanded] = useState(false);

    return (
        <div className='database-search-description'>
            <div className='step'>
                <h3>What it does ?</h3>
            </div>
            <p>The Database Search module retrieves protein and genomic data from major public databases using a species latin name or TaxID provided by the user.</p>

            <div className='step'>
                <FontAwesomeIcon icon={step1Expanded ? faAngleDown : faAngleRight} className="expand-icon" onClick={() => setStep1Expanded(!step1Expanded)}/>
                <label>Step 1 – Retrieve UniprotKB Information</label>
            </div>
            {step1Expanded && (
                <p>The input taxonomy is first queried in UniprotKB to retrieve key information such as taxonomic lineage, Swiss-Prot and TrEMBL proteins, and available proteomes.</p>
            )}

            <div className='step'>
                <FontAwesomeIcon icon={step2Expanded ? faAngleDown : faAngleRight} className="expand-icon" onClick={() => setStep2Expanded(!step2Expanded)}/>
                <label>Step 2 – Assembly and Proteins Datasets (ENSEMBL and NCBI)</label>
            </div>
            {step2Expanded && (
                <p>
                    Using the TaxID retrieved from UniProt, the ENSEMBL and NCBI databases are queried for genome assemblies
                    and associated protein sets. If no datasets are available for the exact input taxonomy, the search
                    automatically expands to broader taxonomic levels until data is found.
                </p>
            )}

            <div className='step'>
                <FontAwesomeIcon icon={step3Expanded ? faAngleDown : faAngleRight} className="expand-icon" onClick={() => setStep3Expanded(!step3Expanded)}/>
                <label>Step 3 – Sequencing Datasets (NCBI SRA)</label>
            </div>
            {step3Expanded && (
                <p>
                    <p>Sequencing datasets are retrieved from NCBI SRA database. Each dataset groups until 8 runs, and details are shown when a dataset is selected.
                    First, the best dataset for the input taxonomy is retrieved. An <span className='green'>optimal dataset</span> have the following features:</p>
                    <ul>
                        <li><b>Supported Platforms</b>&nbsp; (for each run of the dataset): Illumina, BGISEQ, IonTorrent </li>
                        <li><b>Strategy</b>&nbsp; (for each run of the dataset): WGS</li>
                        <li><b>Selection</b>&nbsp; (for each run of the dataset): RANDOM</li>
                        <li><b>Sequencing depth</b>&nbsp; (sum of each run): Between 50 and 80</li>
                        <li><i>&nbsp;&nbsp;&nbsp;Definition: Average number of times each base in the assembly is covered by sequencing reads</i></li>

                    </ul>

                    <p>If no <span className='green'>optimal dataset</span> is found, the filters are relaxed, allowing datasets that may include runs from <span className='red'>other platforms, strategies and selections</span>. 
                    The dataset size can be smaller or larger than expected for the group, which means the accepted sequencing depth range is widened (first <span className='orange'>1.5 times longer/shorter</span>, then <span className='red'>with no size limit</span>). </p>

                    <p>Then, while no <span className='green'>optimal dataset</span> is found, the search is expanded to broader taxonomic levels. <b>The database search always return at 
                        least one sequencing dataset of the input taxonomy, and one <span className='green'>optimal dataset</span></b>.</p>
                </p>
            )}

            <div className='step'>
                <FontAwesomeIcon icon={step4Expanded ? faAngleDown : faAngleRight} className="expand-icon" onClick={() => setStep4Expanded(!step4Expanded)}/>
                <label>Step 4 – Phylogeny Tree</label>
            </div>
            {step4Expanded && (
                <p>To help understand how the datasets relate to the input taxonomy, a phylogenetic tree is displayed.
                    It shows the relationship between the queried taxonomy and the taxa for which data was found.</p>
            )}
        </div>
    );
};

export default DatabaseSearchDescription;