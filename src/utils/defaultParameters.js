// utils/defaultParameters.js
export const defaultParameters = {
    id: null,
    species: {
        scientificName: "Cannabis sativa",
        taxonID: null
    },
    ready: false,
    startSection: {
        genome: false,
        sequencing: false,
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
        evidenceFileList: [],
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
    }
};

export const getDefaultParameters = () => {
    return JSON.parse(JSON.stringify(defaultParameters));
};
