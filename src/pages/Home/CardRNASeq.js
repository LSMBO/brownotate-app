import DBSLoading from './DBSLoading';
import SequencingDetails from '../../components/SequencingDetails';
import { useNavigate } from 'react-router-dom';

const LONG_READ_PLATFORMS = new Set(['PACBIO_SMRT', 'OXFORD_NANOPORE']);

const isLongRead  = (batch) => LONG_READ_PLATFORMS.has((batch.runs[0]?.platform || '').toUpperCase());
const batchSizeGb = (batch) => batch.runs.reduce((s, r) => s + (r.size || 0), 0);

const CardRNASeq = ({ rnaseq, selectedRNASeqBatches, updateSelectedRNASeqBatch, dbSearchInProgress }) => {

    const navigate = useNavigate();

    if (!rnaseq || !rnaseq.runs || rnaseq.runs.length === 0) {
        return <DBSLoading />;
    }

    const hasTissue    = rnaseq.runs.some(batch => batch.tissue);
    const selected     = selectedRNASeqBatches || [];
    const selectedIds  = new Set(selected.map(b => b.identifier));
    const selectedRuns = selected.flatMap(b => b.runs);

    const currentTotalGb    = selected.reduce((s, b) => s + batchSizeGb(b), 0);
    const selectionHasLong  = selected.some(isLongRead);
    const selectionHasShort = selected.some(b => !isLongRead(b));

    const getDisabledReason = (batch) => {
        if (selectedIds.has(batch.identifier)) return null; // always deselectable
        const long = isLongRead(batch);
        if (long && selectionHasShort)  return 'Cannot mix short reads and long reads';
        if (!long && selectionHasLong)  return 'Cannot mix short reads and long reads';
        if (currentTotalGb + batchSizeGb(batch) > 100)
            return `Adding this run would exceed the 100 Gb limit (current: ${currentTotalGb.toFixed(1)} Gb)`;
        return null;
    };

    return (
        <div className="sequencing-container">
            <div className='batch-container'>
                <div className='batch-headers'>
                    <h4>RNA Sequencing Datasets</h4>
                    <table className="sequencing-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Taxonomy</th>
                                <th>Estimated FASTQ Size (Gb)</th>
                                <th>Total Bases (Mbp)</th>
                                {hasTissue && <th>Tissue</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {rnaseq.runs.map((batch) => {
                                const reason     = getDisabledReason(batch);
                                const isDisabled = !!reason;
                                const sizeGb     = batchSizeGb(batch);
                                return (
                                    <tr
                                        key={batch.identifier}
                                        className={`sequencing-batch${selectedIds.has(batch.identifier) ? ' selected' : ''}${isDisabled ? ' disabled' : ''}`}
                                        title={reason || undefined}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(batch.identifier)}
                                                disabled={isDisabled}
                                                onChange={() => !isDisabled && updateSelectedRNASeqBatch(batch)}
                                                title={reason || undefined}
                                            />
                                        </td>
                                        <td style={isDisabled ? { color: '#bbb' } : {}}>
                                            {batch.scientificName} [TaxID: {batch.taxid}]
                                        </td>
                                        <td style={isDisabled ? { color: '#bbb' } : {}}>
                                            {sizeGb > 0 ? sizeGb.toFixed(2) : '—'}
                                        </td>
                                        <td style={isDisabled ? { color: '#bbb' } : {}}>
                                            {Math.round(batch.totalBases / 1e6).toLocaleString()} Mbp
                                        </td>
                                        {hasTissue && (
                                            <td>
                                                {batch.tissue
                                                    ? <span className="tissue-tag">{batch.tissue}</span>
                                                    : <span className="tissue-unknown">—</span>}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {selected.length > 0 && (
                        <div className="rnaseq-batch-summary">
                            <span>{selected.length} run{selected.length > 1 ? 's' : ''} selected</span>
                            <span>{currentTotalGb.toFixed(2)} Gb total</span>
                            {currentTotalGb > 80 && (
                                <span className="rnaseq-size-warning">
                                    {currentTotalGb > 100 ? '⚠ Exceeds 100 Gb limit' : '⚠ Approaching 100 Gb limit'}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className='batch-infos'>
                    <h4>Batch Details</h4>
                    {selectedRuns.length > 0
                        ? <SequencingDetails runs={selectedRuns} displaySpecies={false} displayTissue={true} />
                        : <p style={{ padding: '12px', color: '#aaa', fontStyle: 'italic' }}>Select one or more datasets to see details.</p>
                    }
                </div>
            </div>            <button
                className="t2_bold btn-tab-style"
                disabled={!selected || selected.length === 0}
                onClick={() => {
                    if (dbSearchInProgress) {
                        alert('The database search is still in progress, please try again once it is completed.');
                    } else {
                        navigate('/settings');
                    }
                }}
            >
                Create an annotation using the selected sequencing dataset
            </button>        </div>
    );
};

export default CardRNASeq;
