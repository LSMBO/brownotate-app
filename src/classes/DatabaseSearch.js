import Assembly from "./Assembly";
import Proteins from "./Proteins";
import Sequencing from "./Sequencing";

export default class DatabaseSearch {

    constructor(id, inputSpecies) {
        this.id = id;
        this.inputSpecies = inputSpecies;
    }

    updateData(data) {
        this.dnaseq = new Sequencing(data["dnaseq"]);
		// this.rnaseq = new Sequencing(data["rnaseq"]);
		this.assembly = new Assembly(data["genome"]);
        this.proteins = new Proteins(data["proteins"]);
    }	

    setTaxonID(taxonID) {
        this.taxonID = taxonID;
    }
}
