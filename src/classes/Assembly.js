export default class Assembly {

	ensembl = {}
	refseq = {}
	genbank = {}
	
	constructor(data) {
		if (data["ensembl"]["url"]!=="") {
			this.ensembl = data["ensembl"]
			this.ensembl['accession'] = this.getEnsemblAccession(this.ensembl.url)
			this.ensembl['userURL'] = this.getEnsemblURL(this.ensembl.url);
		}
		if (data["refseq"]["url"]!=="") {
			this.refseq = data["refseq"]
			this.refseq['accession'] = this.getNCBIAccession(this.refseq.url)
			this.refseq['userURL'] = this.getNCBIURL(this.refseq.accession);
		}
		if (data["genbank"]["url"]!=="") {
			this.genbank = data["genbank"]
			this.genbank['accession'] = this.getNCBIAccession(this.genbank.url)
			this.genbank['userURL'] = this.getNCBIURL(this.genbank.accession);
		}
    }

	getEnsemblAccession(url) {
		const urlParts = url.split('/');
		const lastPart = urlParts[urlParts.length - 1];
		const nameParts = lastPart.split('.dna.');
		return nameParts[0];
	}

	getNCBIAccession(url) {
		const urlParts = url.split('/');
		const fullAccession = urlParts[urlParts.length - 2];
		const accessionParts = fullAccession.split('_');
		return `${accessionParts[0]}_${accessionParts[1]}`;
	}

	getNCBIURL(accession) {
		return `https://www.ncbi.nlm.nih.gov/datasets/genome/${accession}/`
	}

	getEnsemblURL(url) {
		const urlParts = url.split('/');
		const newUrl = urlParts.slice(0, -2).join('/') + '/';
		return `https://ftp.ensembl.org${newUrl}`
	}
}
