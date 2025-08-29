import SequencingRun from "./SequencingRun.js";

export default class Sequencing {
    batches = [];

    constructor(data) {
        this.batches = [];
        let batch_identifier = 0;
        for (const batch of data) {
            let runs = this.setRuns(batch["runs"]);
            this.batches.push({
                totalBases: batch['total_size_bases'] || 0,
                totalSize: batch['total_size_gb'] || 0,
                scientificName: batch['scientific_name'] || "",
                taxid: batch['taxid'] || "",
                isOptimal: batch['optimal_sequencing_set'] || false,
                optimalSize: batch['optimal_size'] || 0,
                identifier: batch_identifier++,
                accessionList: runs.map(run => run.accession),
                assemblyExpectedSize: batch['assembly_expected_size'] || 0,
                lowerBound: batch['assembly_expected_size_stats']['lower_bound'] || 0,
                upperBound: batch['assembly_expected_size_stats']['upper_bound'] || 0,
                assemblyExpectedSizeStats: batch['assembly_expected_size_stats'] || 0,
                depth: Math.round(batch['total_size_bases']/batch['assembly_expected_size']) || 0,
                runs: runs,
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
