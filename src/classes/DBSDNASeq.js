import SequencingRun from "./SequencingRun.js";

export default class DBSDNASeq {
    batches = [];
    readType = 'unknown'; // 'short', 'long', or 'unknown'

    constructor(id, data) {
        this.id = id;
        this.batches = [];
        let batch_identifier = 0;
        
        const batchesArray = Array.isArray(data) ? data : (data.data || []);
        
        // Determine the read type from the first batch (all batches should have the same type)
        if (batchesArray.length > 0 && batchesArray[0]['read_type']) {
            this.readType = batchesArray[0]['read_type'];
        }
        
        for (const batch of batchesArray) {
            let runs = this.setRuns(batch["runs"]);
            this.batches.push({
                totalBases: batch['total_bases'] || 0,
                totalSize: 0, // Can be calculated if needed
                scientificName: batch['scientific_name'] || "",
                taxid: batch['taxid'] || "",
                identifier: batch_identifier++,
                accessionList: runs.map(run => run.accession),
                assemblyExpectedSize: batch['assembly_expected_size'] || 0,
                lowerBound: batch['assembly_expected_size_stats']?.['lower_bound'] || 0,
                upperBound: batch['assembly_expected_size_stats']?.['upper_bound'] || 0,
                assemblyExpectedSizeStats: batch['assembly_expected_size_stats'] || {},
                depth: batch['coverage'] || 0,
                runs: runs,
                readType: batch['read_type'] || 'unknown',
            })
        }
    }

    setRuns(data) {
        const newRuns = [];
        for (const run of data) {
            newRuns.push(new SequencingRun(run));
        }
        return newRuns;
    }
}
