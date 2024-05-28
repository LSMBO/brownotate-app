export default class Proteins {

	ensembl = {}
	refseq = {}
	genbank = {}
	
	constructor(data) {
		if (data["ensembl"]["url"]!=="") {
			this.ensembl = data["ensembl"]
			this.ensembl['accession'] = this.getEnsemblAccession(this.ensembl.url)
			this.ensembl['userURL'] = this.getEnsemblURL(this.ensembl.url, 'user');
			this.ensembl['downloadURL'] = this.getEnsemblURL(this.ensembl.url, 'download')
		}
		if (data["uniprot"]["url"]!=="") {
			this.uniprot = data["uniprot"]
			this.uniprot['accession'] = this.uniprot.proteome_id;
			this.uniprot['userURL'] = this.getUniprotURL(this.uniprot.accession)
			this.uniprot['downloadURL'] = this.uniprot['url']
		}
		if (data["refseq"]["url"]!=="") {
			this.refseq = data["refseq"]
			this.refseq['accession'] = this.getNCBIAccession(this.refseq.url)
			this.refseq['userURL'] = this.getNCBIURL(this.refseq.accession, this.refseq.url, 'user');
			this.refseq['downloadURL'] = this.getNCBIURL(this.refseq.accession, this.refseq.url, 'download');
		}		
		if (data["genbank"]["url"]!=="") {
			this.genbank = data["genbank"]
			this.genbank['accession'] = this.getNCBIAccession(this.genbank.url)
			this.genbank['userURL'] = this.getNCBIURL(this.genbank.accession, this.genbank.url, 'user');
			this.genbank['downloadURL'] = this.getNCBIURL(this.genbank.accession, this.genbank.url, 'download');
		}
    }

	getEnsemblAccession(url) {
		const urlParts = url.split('/');
		const lastPart = urlParts[urlParts.length - 1];
		const nameParts = lastPart.split('.pep.');
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
			return `https://ftp.ncbi.nlm.nih.gov${url}` 
		}		
	}

	getEnsemblURL(url, mode) {
		if (mode === "download") {
			return `https://ftp.ensembl.org${url}`;
		} else {
			const urlParts = url.split('/');
			const newUrl = urlParts.slice(0, -2).join('/') + '/';
			return `https://ftp.ensembl.org${newUrl}`;
		}
	}

	getUniprotURL(accession) {
		return `https://www.uniprot.org/proteomes/${accession}`
	}

}
