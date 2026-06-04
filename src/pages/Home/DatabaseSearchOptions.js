import { useEffect, useState } from 'react';
import './DatabaseSearchOptions.css';

export default function DatabaseSearchOptions({ options, setOptions, disabled }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [seqTab, setSeqTab] = useState('dna'); // 'dna' or 'rna'

    useEffect(() => {
        const dnaActive = Boolean(options?.dnaseq?.active);
        const rnaActive = Boolean(options?.rnaseq?.active);

        if (!dnaActive && !rnaActive) {
            return;
        }

        if (seqTab === 'dna' && !dnaActive && rnaActive) {
            setSeqTab('rna');
            return;
        }

        if (seqTab === 'rna' && !rnaActive && dnaActive) {
            setSeqTab('dna');
            return;
        }

        if (seqTab !== 'dna' && seqTab !== 'rna') {
            setSeqTab(dnaActive ? 'dna' : 'rna');
        }
    }, [options?.dnaseq?.active, options?.rnaseq?.active, seqTab]);

    const handleCheckboxChange = (key) => {
        setOptions(prev => ({
            ...prev,
            [key]: { ...prev[key], active: !prev[key].active }
        }));
    };

    const handleDnaseqOptionChange = (field, value) => {
        setOptions(prev => ({
            ...prev,
            dnaseq: {
                ...prev.dnaseq,
                [field]: value
            }
        }));
    };

    const handleRnaseqOptionChange = (field, value) => {
        setOptions(prev => ({
            ...prev,
            rnaseq: {
                ...prev.rnaseq,
                [field]: value
            }
        }));
    };

    const handlePlatformToggle = (platform) => {
        const currentPlatforms = options.dnaseq.platforms || [];
        const newPlatforms = currentPlatforms.includes(platform)
            ? currentPlatforms.filter(p => p !== platform)
            : [...currentPlatforms, platform];
        
        if (newPlatforms.length === 0) {
            return; // Don't allow deselecting all platforms
        }
        
        handleDnaseqOptionChange('platforms', newPlatforms);
    };

    const handleRnaPlatformToggle = (platform) => {
        const currentPlatforms = options.rnaseq.platforms || [];
        const newPlatforms = currentPlatforms.includes(platform)
            ? currentPlatforms.filter(p => p !== platform)
            : [...currentPlatforms, platform];
        
        if (newPlatforms.length === 0) {
            return; // Don't allow deselecting all platforms
        }
        
        handleRnaseqOptionChange('platforms', newPlatforms);
    };

    const showSeqOptions = options.dnaseq.active || options.rnaseq.active;

    return (
                <div className='dbsearch-options-container'>
                    <ul>
                        <li 
                            data-color="uniprot"
                            onClick={() => !disabled && handleCheckboxChange('uniprot')}
                            className={disabled ? 'disabled' : ''}
                        >
                            <input
                                type="checkbox"
                                checked={options.uniprot.active}
                                onChange={() => {}} // Handled by li onClick
                                disabled={disabled}
                                readOnly
                            />
                            <label>Uniprot</label>
                        </li>
                        <li 
                            data-color="ensembl"
                            onClick={() => !disabled && handleCheckboxChange('ensembl')}
                            className={disabled ? 'disabled' : ''}
                        >
                            <input
                                type="checkbox"
                                checked={options.ensembl.active}
                                onChange={() => {}} // Handled by li onClick
                                disabled={disabled}
                                readOnly
                            />
                            <label>Ensembl</label>
                        </li>
                        <li 
                            data-color="refseq"
                            onClick={() => !disabled && handleCheckboxChange('refseq')}
                            className={disabled ? 'disabled' : ''}
                        >
                            <input
                                type="checkbox"
                                checked={options.refseq.active}
                                onChange={() => {}} // Handled by li onClick
                                disabled={disabled}
                                readOnly
                            />
                            <label>NCBI RefSeq</label>
                        </li>                    
                        <li 
                            data-color="genbank"
                            onClick={() => !disabled && handleCheckboxChange('genbank')}
                            className={disabled ? 'disabled' : ''}
                        >
                            <input
                                type="checkbox"
                                checked={options.genbank.active}
                                onChange={() => {}} // Handled by li onClick
                                disabled={disabled}
                                readOnly
                            />
                            <label>NCBI GenBank</label>
                        </li>
                        <li 
                            data-color="dnaseq"
                            onClick={() => !disabled && handleCheckboxChange('dnaseq')}
                            className={disabled ? 'disabled' : ''}
                        >
                            <input
                                type="checkbox"
                                checked={options.dnaseq.active}
                                onChange={() => {}} // Handled by li onClick
                                disabled={disabled}
                                readOnly
                            />
                            <label>DNA Sequencing (NCBI SRA)</label>
                        </li>
                        <li 
                            data-color="rnaseq"
                            onClick={() => !disabled && handleCheckboxChange('rnaseq')}
                            className={disabled ? 'disabled' : ''}
                        >
                            <input
                                type="checkbox"
                                checked={options.rnaseq.active}
                                onChange={() => {}} // Handled by li onClick
                                disabled={disabled}
                                readOnly
                            />
                            <label>RNA Sequencing (NCBI SRA)</label>
                        </li>
                    </ul>        
                {showSeqOptions && (
                    <div className="seq-options-tabs-container">
                        <div className="tabs-header">
                            {options.dnaseq.active && (
                                <div
                                    className={`tab${seqTab === 'dna' ? ' active-tab' : ''}`}
                                    onClick={() => setSeqTab('dna')}
                                >
                                    DNA Sequencing Options
                                </div>
                            )}
                            {options.rnaseq.active && (
                                <div
                                    className={`tab${seqTab === 'rna' ? ' active-tab' : ''}`}
                                    onClick={() => setSeqTab('rna')}
                                >
                                    RNA Sequencing Options
                                </div>
                            )}
                        </div>

                        {/* DNA Sequencing Options panel */}
                        {options.dnaseq.active && seqTab === 'dna' && (
                    <div className="dnaseq-options-section">
                        <div>
                            <div className="dnaseq-options-block">
                                <div className="dnaseq-options-group">
                                    <label className="dnaseq-group-label">Platforms</label>
                                    <div className="platform-checkboxes">
                                        {['ILLUMINA', 'BGISEQ', 'ION_TORRENT', 'PACBIO_SMRT', 'OXFORD_NANOPORE'].map(platform => (
                                            <label key={platform}>
                                                <input
                                                    type="checkbox"
                                                    checked={options.dnaseq.platforms?.includes(platform)}
                                                    onChange={() => handlePlatformToggle(platform)}
                                                    disabled={disabled}
                                                />
                                                {platform.replace('_', ' ')}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="dnaseq-options-group">
                                    <label className="dnaseq-group-label">Layout</label>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                name="layout"
                                                checked={options.dnaseq.layout === 'any'}
                                                onChange={() => handleDnaseqOptionChange('layout', 'any')}
                                                disabled={disabled}
                                            />
                                            Any
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="layout"
                                                checked={options.dnaseq.layout === 'PAIRED'}
                                                onChange={() => handleDnaseqOptionChange('layout', 'PAIRED')}
                                                disabled={disabled}
                                            />
                                            Paired
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="layout"
                                                checked={options.dnaseq.layout === 'SINGLE'}
                                                onChange={() => handleDnaseqOptionChange('layout', 'SINGLE')}
                                                disabled={disabled}
                                            />
                                            Single
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="dnaseq-options-group">
                                    <label className="dnaseq-group-label">Strategy</label>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                name="strategy"
                                                checked={options.dnaseq.strategy === 'WGS'}
                                                onChange={() => handleDnaseqOptionChange('strategy', 'WGS')}
                                                disabled={disabled}
                                            />
                                            WGS
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="strategy"
                                                checked={options.dnaseq.strategy === 'any'}
                                                onChange={() => handleDnaseqOptionChange('strategy', 'any')}
                                                disabled={disabled}
                                            />
                                            Any
                                        </label>
                                    </div>
                                </div>

                                <div className="dnaseq-options-group">
                                    <label className="dnaseq-group-label">Selection</label>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                name="selection"
                                                checked={options.dnaseq.selection === 'RANDOM'}
                                                onChange={() => handleDnaseqOptionChange('selection', 'RANDOM')}
                                                disabled={disabled}
                                            />
                                            RANDOM
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="selection"
                                                checked={options.dnaseq.selection === 'any'}
                                                onChange={() => handleDnaseqOptionChange('selection', 'any')}
                                                disabled={disabled}
                                            />
                                            Any
                                        </label>
                                    </div>
                                </div>
                            </div>
                        
                            <div className="dnaseq-options-block">
                                <div className="dnaseq-options-group">
                                    <label className="dnaseq-group-label">Coverage Range</label>
                                    <div className="coverage-inputs">
                                        <input
                                            type="number"
                                            value={options.dnaseq.coverageLower}
                                            onChange={(e) => handleDnaseqOptionChange('coverageLower', parseInt(e.target.value) || 0)}
                                            disabled={disabled}
                                            min="0"
                                            placeholder="Min"
                                        />
                                        <span>x to</span>
                                        <input
                                            type="number"
                                            value={options.dnaseq.coverageUpper}
                                            onChange={(e) => handleDnaseqOptionChange('coverageUpper', parseInt(e.target.value) || 0)}
                                            disabled={disabled}
                                            min="0"
                                            placeholder="Max"
                                        />
                                        <span>x</span>
                                    </div>                                     
                                </div>
                                <div className="dnaseq-options-group">
                                    <label className="dnaseq-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={options.dnaseq.inputTaxonomyOnly}
                                            onChange={(e) => handleDnaseqOptionChange('inputTaxonomyOnly', e.target.checked)}
                                            disabled={disabled}
                                        />
                                        Search input taxonomy only (don't look to parents)
                                    </label>
                                </div> 
                            </div>
                        </div>
                    </div>
                )}

                        {/* RNA Sequencing Options panel */}
                        {options.rnaseq.active && seqTab === 'rna' && (
                            <div className="dnaseq-options-section">
                                <div>
                                    <div className="dnaseq-options-block">
                                        <div className="dnaseq-options-group">
                                            <label className="dnaseq-group-label">Platforms</label>
                                            <div className="platform-checkboxes">
                                                {['ILLUMINA', 'BGISEQ', 'ION_TORRENT', 'PACBIO_SMRT', 'OXFORD_NANOPORE'].map(platform => (
                                                    <label key={platform}>
                                                        <input
                                                            type="checkbox"
                                                            checked={options.rnaseq.platforms?.includes(platform)}
                                                            onChange={() => handleRnaPlatformToggle(platform)}
                                                            disabled={disabled}
                                                        />
                                                        {platform.replace('_', ' ')}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="dnaseq-options-group">
                                            <label className="dnaseq-group-label">Layout</label>
                                            <div className="radio-group">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="rna-layout"
                                                        checked={options.rnaseq.layout === 'any'}
                                                        onChange={() => handleRnaseqOptionChange('layout', 'any')}
                                                        disabled={disabled}
                                                    />
                                                    Any
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="rna-layout"
                                                        checked={options.rnaseq.layout === 'PAIRED'}
                                                        onChange={() => handleRnaseqOptionChange('layout', 'PAIRED')}
                                                        disabled={disabled}
                                                    />
                                                    Paired
                                                </label>
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="rna-layout"
                                                        checked={options.rnaseq.layout === 'SINGLE'}
                                                        onChange={() => handleRnaseqOptionChange('layout', 'SINGLE')}
                                                        disabled={disabled}
                                                    />
                                                    Single
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dnaseq-options-block">
                                        <div className="dnaseq-options-group">
                                            <label className="dnaseq-group-label">Estimated FASTQ Size (GB) per run</label>
                                            <div className="coverage-inputs">
                                                <input
                                                    type="number"
                                                    value={options.rnaseq.runSizeGbMin}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        handleRnaseqOptionChange('runSizeGbMin', value === '' ? '' : (parseFloat(value) || 0));
                                                    }}
                                                    disabled={disabled}
                                                    min="0"
                                                    step="0.1"
                                                    placeholder="Min"
                                                />
                                                <span>to</span>
                                                <input
                                                    type="number"
                                                    value={options.rnaseq.runSizeGbMax}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        handleRnaseqOptionChange('runSizeGbMax', value === '' ? '' : (parseFloat(value) || 0));
                                                    }}
                                                    disabled={disabled}
                                                    min="0"
                                                    step="0.1"
                                                    placeholder="Max"
                                                />
                                                <span>GB</span>
                                            </div>
                                            <div className="helper-text" style={{ marginTop: '6px', fontSize: '0.9em' }}>
                                                Leave Min and/or Max empty to disable that bound. Values are estimated from total bases, layout, and platform.
                                            </div>
                                        </div>

                                        <div className="dnaseq-options-group">
                                            <label className="dnaseq-checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={options.rnaseq.inputTaxonomyOnly}
                                                    onChange={(e) => handleRnaseqOptionChange('inputTaxonomyOnly', e.target.checked)}
                                                    disabled={disabled}
                                                />
                                                Search input taxonomy only (don't look to parents)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>
            )

}