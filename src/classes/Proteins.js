export default class Proteins {
	
	constructor() {
		this.ensembl = {}
		this.uniprot_proteomes = {}
		this.uniprot_swissprot = {}
		this.uniprot_trembl = {}
		this.refseq = {}
		this.genbank = {}
	}

	setEnsembl(data) {
		this.ensembl = data
	}

	setUniprotProteomes(data) {
		this.uniprot_proteomes = data
	}

	setUniprotSwissprot(taxonomy) {
		this.uniprot_swissprot = {
			"accession": `${taxonomy.scientificName.toLowerCase().replace(/ /g, '_')}_swissprot`,
			"database": 'uniprot',
			"data_type": "swissprot",
			"scientific_name": taxonomy.scientificName,
			"taxid": taxonomy.taxonId,
			"count": taxonomy.statistics.reviewedProteinCount,
			"url": `https://www.uniprot.org/uniprotkb?query=%28taxonomy_id%3A${taxonomy.taxonId}%29+AND+%28reviewed%3Atrue%29`,
			"download_url": `https://rest.uniprot.org/uniprotkb/stream?query=(taxonomy_id:${taxonomy.taxonId})%20AND%20(reviewed:true)&format=fasta`
		}
	}

	setUniprotTrembl(taxonomy) {
		this.uniprot_trembl = {
			"accession": `${taxonomy.scientificName.toLowerCase().replace(/ /g, '_')}_trembl`,
			"database": 'uniprot',
			"data_type": "trembl",
			"scientific_name": taxonomy.scientificName,
			"taxid": taxonomy.taxonId,
			"count": taxonomy.statistics.unreviewedProteinCount,
			"url": `https://www.uniprot.org/uniprotkb?query=%28taxonomy_id%3A${taxonomy.taxonId}%29+AND+%28reviewed%3Afalse%29`,
			"download_url": `https://rest.uniprot.org/uniprotkb/stream?query=(taxonomy_id:${taxonomy.taxonId})%20AND%20(reviewed:false)&format=fasta`
		}
	}

	setRefseq(data) {
		this.refseq = data
	}

	setGenbank(data) {
		this.genbank = data
	}

	setEnsembl(data) {
		this.ensembl = data
	}
}
