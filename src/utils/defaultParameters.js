export const defaultParameters = {
    id: null,
    ready: false,
    species: {
        scientificName: "",
        taxonID: null,
        lineage: [],
        is_bacteria: false,
    },
    startSection: {
        assembly: false,
        sequencing: false,
        assemblyFile: false,
        assemblyType: null, // custom, ncbi, ensembl
        assemblyAccession: [],
        assemblyDownload: null, // type:custom -> null ; type:ncbi -> download_command ; type:ensembl -> download_url
        assemblyFileList: [], // type:custom -> [FileObj] ; type:ncbi -> [] ; type:ensembl -> []
        sequencingFiles : false,
        sequencingFileList : [],
        sequencingAccessions : false,
        sequencingAccessionList : [],
		skipFastp: false,
        skipPhix: false
    },
    annotationSection: {
        evidenceFileList: [],
        minLength: '0',
        removeStrict: true,
        removeSoft: false
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
