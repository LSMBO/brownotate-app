export default class Assembly {

	constructor() {
		this.ensembl = {}
		this.refseq = {}
		this.genbank = {}
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
