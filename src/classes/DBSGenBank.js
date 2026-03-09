export default class DBSGenBank {

    constructor(id, data) {
        this.id = id;
        this.scientificName = data['scientific_name'];
        this.taxonId = data['taxid'];
        this.date = this.formatDate(data['date']);
        this.proteins = data['data']['ncbi_genbank_annotated_genomes'];
        this.assemblies = data['data']['ncbi_genbank_genomes'];
    }

    formatDate(dateString) {
        const datePart = dateString.split('-')[0]; // '21082024'
        const day = datePart.substring(0, 2); // '21'
        const month = datePart.substring(2, 4); // '08'
        const year = datePart.substring(4, 8); // '2024'
        return `${day}/${month}/${year}`;
    }    
}
