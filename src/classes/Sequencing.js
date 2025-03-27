export default class Sequencing {
    runs = [];
    totalBase = 0;
    totalSize = 0;

	constructor(data) {
        this.runs = this.setRuns(data["runs"]);
        this.totalBase = this.getTotalBase();
    }

    setRuns(data) {
        const newRuns = [];
        for (const run of data) {
            const totalBases = run["total_bases"] || 0;
            newRuns.push({
                platform: run["platform"] || "",
                title: run["title"] || "",
                library_type: run["library_type"] || "",
                accession: run["accession"] || "",
                totalBases: totalBases,
                rank: run["rank"] || "",
                scientific_name: run["scientific_name"] || "",
                taxid: run["taxid"] || "",
                entry_id: run["entry_id"] || "",
            });
        }
        return newRuns;
    }

    getTotalBase() {
        let totalBases = 0;
        for (const run of this.runs) {
            totalBases += parseInt(run["totalBases"]);
        }
        return totalBases;
    }

}
