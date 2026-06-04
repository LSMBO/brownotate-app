export default class DBSUniprotProteome {

    constructor(id, data) {
        this.id = id;
        this.scientificName = data.scientific_name;
        this.taxonId = data.taxid;
        this.date = this.formatDate(data.date);
        this.proteome = data.data.proteome;
        this.setUniprotSwissprot(data.data.statistics);
        this.setUniprotTrembl(data.data.statistics);
    }

	setUniprotSwissprot(statistics) {
		this.swissprot = {
			"accession": `${this.scientificName.toLowerCase().replace(/ /g, '_')}_swissprot`,
			"database": 'UniprotKB',
			"data_type": "swissprot",
			"scientific_name": this.scientificName,
			"taxid": this.taxonId,
			"count": statistics.reviewedProteinCount,
			"url": `https://www.uniprot.org/uniprotkb?query=%28taxonomy_id%3A${this.taxonId}%29+AND+%28reviewed%3Atrue%29`,
			"download_url": `https://rest.uniprot.org/uniprotkb/stream?query=(taxonomy_id:${this.taxonId})%20AND%20(reviewed:true)&format=fasta`
		}
	}

	setUniprotTrembl(statistics) {
		this.trembl = {
			"accession": `${this.scientificName.toLowerCase().replace(/ /g, '_')}_trembl`,
			"database": 'UniprotKB',
			"data_type": "trembl",
			"scientific_name": this.scientificName,
			"taxid": this.taxonId,
			"count": statistics.unreviewedProteinCount,
			"url": `https://www.uniprot.org/uniprotkb?query=%28taxonomy_id%3A${this.taxonId}%29+AND+%28reviewed%3Afalse%29`,
			"download_url": `https://rest.uniprot.org/uniprotkb/stream?query=(taxonomy_id:${this.taxonId})%20AND%20(reviewed:false)&format=fasta`
		}
	}

    formatDate(dateString) {
        const datePart = dateString.split('-')[0]; // '21082024'
        const day = datePart.substring(0, 2); // '21'
        const month = datePart.substring(2, 4); // '08'
        const year = datePart.substring(4, 8); // '2024'
        return `${day}/${month}/${year}`;
    }    
}
