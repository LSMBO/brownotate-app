import Assembly from "./Assembly";
import Proteins from "./Proteins";
import Sequencing from "./Sequencing";

export default class DatabaseSearch {

    constructor(id, species) {
        this.id = id;
        this.scientific_name = species['scientific_name'];
        this.taxonID = species['taxid'];
        this.is_bacteria = species['is_bacteria'];
        this.lineage = null;
        this.date = null;        
        this.dnaseq = null;
        this.rnaseq = null;
        this.assembly = new Assembly();
        this.proteins = new Proteins();
        this.phylogeny_map = null;
    }

    setTaxonomy(data) {
        this.lineage = data.data.taxonomy.lineage;
        this.date = this.formatDate(data.date);
        this.proteins.setUniprotSwissprot(data.data.taxonomy);
        this.proteins.setUniprotTrembl(data.data.taxonomy);
    }

    setUniprotProteomes(data) {
        this.proteins.setUniprotProteomes(data.data.uniprot_proteomes);
    }

    setRefseq(data) {
        this.proteins.setRefseq(data.data.ncbi_refseq_annotated_genomes);
        this.assembly.setRefseq(data.data.ncbi_refseq_genomes);
    }

    setGenbank(data) {
        this.proteins.setGenbank(data.data.ncbi_genbank_annotated_genomes);
        this.assembly.setGenbank(data.data.ncbi_genbank_genomes);
    }

    setEnsembl(data) {
        this.proteins.setEnsembl(data.data.ensembl_annotated_genomes);
        this.assembly.setEnsembl(data.data.ensembl_genomes);
    }

    setDNASequencing(data) {
        this.dnaseq = new Sequencing(data.data.dnaseq);
    }

    setPhylogeny(data) {
        this.phylogeny_map = data.data.phylogeny_map;
    }
    
    formatDate(dateString) {
        const datePart = dateString.split('-')[0]; // '21082024'
        const day = datePart.substring(0, 2); // '21'
        const month = datePart.substring(2, 4); // '08'
        const year = datePart.substring(4, 8); // '2024'
        return `${day}/${month}/${year}`;
    }    
}
