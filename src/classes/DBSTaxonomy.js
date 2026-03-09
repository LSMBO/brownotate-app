export default class DBSTaxonomy {

    constructor(id, data) {
        this.id = id;
        this.run_id = null;
        this.scientificName = data.scientific_name || data.scientificName;
        this.taxonId = data.taxid || data.taxonId;
        this.isBacteria = data.is_bacteria || data.isBacteria || false;
        this.lineage = data.data?.lineage || data.lineage || [];
        this.statistics = data.data?.statistics || data.statistics || { reviewedProteinCount: 0, unreviewedProteinCount: 0 };
        this.date = data.date || null;
        this.taxoImageUrl = data.taxo_image_url || data.taxoImageUrl || null;
        this.data = data.data || null;
    }
}
