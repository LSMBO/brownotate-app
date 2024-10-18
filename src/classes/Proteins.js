export default class Proteins {

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
		this.uniprot_proteome = data["uniprot_proteome"]
		if (Object.keys(data["uniprot_proteome"]).length !== 0 && data["uniprot_proteome"]["url"]!=="") {
			this.uniprot_proteome['accession'] = this.uniprot_proteome.proteome_id;
			this.uniprot_proteome['userURL'] = this.getUniprotProteomeURL(this.uniprot_proteome.accession)
			this.uniprot_proteome['downloadURL'] = this.uniprot_proteome['url']
		}
		this.uniprot_swissprot = data["uniprot_swissprot"]
		if (Object.keys(data["uniprot_swissprot"]).length !== 0 && data["uniprot_swissprot"]["url"]!=="") {
			this.uniprot_swissprot['accession'] = 'swissprot'
			this.uniprot_swissprot['userURL'] = this.getSwissprotURL(this.uniprot_swissprot.taxonId)
			this.uniprot_swissprot['downloadURL'] = this.uniprot_swissprot['url']
			this.uniprot_swissprot['count'] = this.uniprot_swissprot['sequence_count']
		}
		this.uniprot_trembl = data["uniprot_trembl"]
		if (Object.keys(data["uniprot_trembl"]).length !== 0 && data["uniprot_trembl"]["url"]!=="") {
			this.uniprot_trembl['accession'] = 'trembl'
			this.uniprot_trembl['userURL'] = this.getTremblURL(this.uniprot_trembl.taxonId)
			this.uniprot_trembl['downloadURL'] = this.uniprot_trembl['url']
			this.uniprot_trembl['count'] = this.uniprot_trembl['sequence_count']
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
			return `https://ftp.ncbi.nlm.nih.gov/${url}` 
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

	getUniprotProteomeURL(accession) {
		return `https://www.uniprot.org/proteomes/${accession}`
	}

	getSwissprotURL(taxid) {
		return `https://www.uniprot.org/uniprotkb?query=%28taxonomy_id%3A${taxid}%29+AND+%28reviewed%3Atrue%29`
		
	}

	getTremblURL(taxid) {
		return `https://www.uniprot.org/uniprotkb?query=%28taxonomy_id%3A${taxid}%29+AND+%28reviewed%3Afalse%29`
	}

}
