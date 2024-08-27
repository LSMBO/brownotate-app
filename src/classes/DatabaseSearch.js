import Assembly from "./Assembly";
import Proteins from "./Proteins";
import Sequencing from "./Sequencing";

export default class DatabaseSearch {

    constructor(id, scientific_name) {
        this.id = id;
        this.scientific_name = scientific_name;
    }

    updateData(data) {
        this.dnaseq = new Sequencing(data["result"]["dnaseq"]);
		// this.rnaseq = new Sequencing(data["result"]["rnaseq"]);
		this.assembly = new Assembly(data["result"]["genome"]);
        this.proteins = new Proteins(data["result"]["proteins"]);
        this.date = this.formatDate(data["date"]);
    }	

    setTaxonID(taxonID) {
        this.taxonID = taxonID;
    }

    formatDate(dateString) {
        const datePart = dateString.split('-')[0]; // '21082024'
        const day = datePart.substring(0, 2); // '21'
        const month = datePart.substring(2, 4); // '08'
        const year = datePart.substring(4, 8); // '2024'
        return `${day}/${month}/${year}`;
    }

}
