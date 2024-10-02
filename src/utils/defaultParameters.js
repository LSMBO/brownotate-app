export const defaultParameters = {
    id: null,
    ready: false,
    species: {
        scientificName: "",
        taxonID: null
    },
    startSection: {
        genome: false,
        sequencing: false,
        genomeFile: false,
        genomeFileIsURL: false,
        genomeFileList: [],
        sequencingFiles : false,
        sequencingFilesList : [],
        sequencingAccessions : false,
        sequencingAccessionsList : [],
		skipFastp: false,
        skipPhix: false
    },
    annotationSection: {
        evidenceAuto: true,
        evidenceFile: false,
        evidenceFileIsURL: false,
        evidenceFileList: [],
        minLength: '0',
        removeStrict: true,
        removeSoft: false,
    },
    brownamingSection: {
        skip: false,
        excludedSpeciesList: [],
        highestRank: "Suborder",
    },
    buscoSection: {
        assembly: true,
        annotation: true
    },
    cpus: '1'
};

export const getDefaultParameters = () => {
    return JSON.parse(JSON.stringify(defaultParameters));
};
