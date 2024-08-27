export default class Assembly {

	ensembl = {}
	refseq = {}
	genbank = {}
	
	constructor(data) {
		this.ensembl = data["ensembl"]
		if (Object.keys(data["ensembl"]).length !== 0 && data["ensembl"]["url"]!=="") {
			this.ensembl['accession'] = this.getEnsemblAccession(this.ensembl.url)
			this.ensembl['userURL'] = this.getEnsemblURL(this.ensembl.url, 'user');
			this.ensembl['downloadURL'] = this.getEnsemblURL(this.ensembl.url, 'download')
		}
		this.refseq = data["refseq"]
		if (Object.keys(data["refseq"]).length !== 0 && data["refseq"]["url"]!=="") {
			this.refseq['accession'] = this.getNCBIAccession(this.refseq.url)
			this.refseq['userURL'] = this.getNCBIURL(this.refseq.accession, this.refseq.url, 'user');
			this.refseq['downloadURL'] = this.getNCBIURL(this.refseq.accession, this.refseq.url, 'download');
		}
		this.genbank = data["genbank"]
		if (Object.keys(data["genbank"]).length !== 0 && data["genbank"]["url"]!=="") {
			this.genbank['accession'] = this.getNCBIAccession(this.genbank.url)
			this.genbank['userURL'] = this.getNCBIURL(this.genbank.accession, this.genbank.url, 'user');
			this.genbank['downloadURL'] = this.getNCBIURL(this.genbank.accession, this.genbank.url, 'download');

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

	getNCBIURL(accession, url, mode) {
		if (mode === "user") {
			return `https://www.ncbi.nlm.nih.gov/datasets/genome/${accession}/`
		} else {
			return `ftp.ncbi.nlm.nih.gov${url}` 
		}		
	}

	getEnsemblURL(url, mode) {
		if (mode === "download") {
			return `https://ftp.ensembl.org${url}`;
		} else {
			const urlParts = url.split('/');
			const newUrl = urlParts.slice(0, -2).join('/') + '/';
			return `ftp.ensembl.org${newUrl}`;
		}
	}
}
