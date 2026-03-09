import React, { useState } from 'react';
import { faAngleRight, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useLocation } from 'react-router-dom';

const DatabaseSearchDescription = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step1Expanded, setStep1Expanded] = useState(false);
    const [step2Expanded, setStep2Expanded] = useState(false);
    const [step3Expanded, setStep3Expanded] = useState(false);
    const [step4Expanded, setStep4Expanded] = useState(false);

    // if (compact) {
    //     return (
    //         <div className='database-search-description compact' onClick={() => navigate('/about', { state: { from: location.pathname } })}>
    //             <div className='step clickable'>
    //                 <h3>How does it work ?</h3>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className='database-search-description'>
            <div className='step'>
                <h3>How does it work ?</h3>
            </div>
            <p>The Database Search module retrieves protein and genomic data from major public databases using a species latin name or TaxID provided by the user.</p>

            <div className='step' onClick={() => setStep1Expanded(!step1Expanded)}>
                <FontAwesomeIcon icon={step1Expanded ? faAngleDown : faAngleRight} className="expand-icon" />
                <label>Step 1 – Retrieve UniprotKB Information</label>
            </div>
            {step1Expanded && (
                <p>The input taxonomy is first queried in UniprotKB to retrieve key information such as taxonomic lineage, Swiss-Prot and TrEMBL proteins, and available proteomes.</p>
            )}

            <div className='step' onClick={() => setStep2Expanded(!step2Expanded)}>
                <FontAwesomeIcon icon={step2Expanded ? faAngleDown : faAngleRight} className="expand-icon" />
                <label>Step 2 – Assembly and Proteins Datasets (ENSEMBL and NCBI)</label>
            </div>
            {step2Expanded && (
                <p>
                    Using the TaxID retrieved from UniProt, the ENSEMBL and NCBI databases are queried for genome assemblies
                    and associated protein sets. If no datasets are available for the exact input taxonomy, the search
                    automatically expands to broader taxonomic levels until data is found.
                </p>
            )}

            <div className='step' onClick={() => setStep3Expanded(!step3Expanded)}>
                <FontAwesomeIcon icon={step3Expanded ? faAngleDown : faAngleRight} className="expand-icon" />
                <label>Step 3 – Sequencing Datasets (NCBI SRA)</label>
            </div>
            {step3Expanded && (
                <div>
                    <p>
                        Sequencing datasets are retrieved from the NCBI SRA database. Each dataset may contain up to 8 runs, 
                        and detailed information is displayed when a dataset is selected. You can refine the search using several filters:
                    </p>

                    <p><b>1. Platform</b></p>
                    <p>
                        The sequencing machines used to generate the reads. We recommend <b>PacBio SMRT</b> and <b>Oxford Nanopore</b> because 
                        they produce long reads, which are more suitable for resolving repeated genomic regions.
                        However, for smaller genomes such as bacteria or fungi, short‑read sequencing (e.g., Illumina) is usually sufficient.
                    </p>

                    <p><b>2. Layout</b></p>
                    <p>
                        This indicates how reads were sequenced (single-end or paired-end). Brownotate assembly tools can handle either layout.
                    </p>

                    <p><b>3. Coverage (depth)</b></p>
                    <p>
                        Coverage represents how many times, on average, each base of the genome is sequenced.
                        As described in the Brownotate publication, a minimum coverage of <b>50×</b> is generally recommended to obtain 
                        a complete assembly. Increasing coverage beyond <b>80×</b> usually does not improve assembly quality.
                        If you want to adjust this threshold, we recommend increasing the maximum coverage, because some sequencing runs 
                        may be excluded if their coverage is too high. If you decrease the minimum coverage, be aware that your assembly 
                        may become incomplete.
                    </p>

                    <p><b>4. Strategy</b></p>
                    <p>
                        The library strategy declared in SRA (WGS, RNA‑Seq, amplicon, etc.). For genome assembly, the appropriate strategy 
                        is <b>WGS</b> (Whole Genome Shotgun). Datasets using other strategies typically do not cover the entire genome 
                        and may lead to incomplete assemblies.
                    </p>

                    <p><b>5. Selection</b></p>
                    <p>
                        This describes how DNA fragments were selected or enriched before sequencing. For genome assembly, the recommended 
                        value is <b>RANDOM</b>, which means fragments were selected without bias. Other methods (e.g., PCR‑based selection) 
                        enrich only specific regions and therefore do not provide uniform genome coverage, making them unsuitable for 
                        complete assembly.
                    </p>

                    <p><b>6. Input taxonomy only</b></p>
                    <p>
                        By default, the search starts at the input taxonomy level. If no suitable dataset is found, it automatically 
                        moves up the taxonomic lineage (genus, family, etc.) until it finds something. You can restrict the search to the 
                        input taxonomy only by enabling this option.
                    </p>
                </div>
            )}

            <div className='step' onClick={() => setStep4Expanded(!step4Expanded)}>
                <FontAwesomeIcon icon={step4Expanded ? faAngleDown : faAngleRight} className="expand-icon" />
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