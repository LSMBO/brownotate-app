import SequencingRun from "./SequencingRun.js";

export default class DBSRNASeq {
    runs = [];

    constructor(id, data) {
        this.id = id;
        this.runs = [];

        const batchesArray = Array.isArray(data) ? data : (data.data || []);

        for (let i = 0; i < batchesArray.length; i++) {
            const batch = batchesArray[i];
            const runs = (batch.runs || []).map(r => new SequencingRun(r));
            this.runs.push({
                identifier: i,
                runs,
                totalBases: batch.total_bases || 0,
                scientificName: batch.scientific_name || "",
                taxid: batch.taxid || "",
                tissue: batch.tissue || null,
            });
        }
    }
}
