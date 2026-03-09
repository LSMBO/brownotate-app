export const defaultParameters = {
    id: null,
    run_id: null,
    ready: false,
    species: {
        scientificName: "",
        taxonID: null,
        lineage: [],
        is_bacteria: false,
        imageUrl: "user_download/image_not_found.png"
    },
    startSection: {
        assembly: null,
        assemblyFile: false,
        assemblyFileOnServer: null,
        assemblyAccession: null,        
        sequencing: null,
        sequencingRuns : false,
        sequencingRunList : [],        
        sequencingFiles : false,
        sequencingFileList : [],
        sequencingFileListOnServer: [],
        skipPhix: false,
        platform: ""
    },
    assemblySection: {
        canu: true,
        megahit: false,
        runFastp: true,
        runBowtie2: true
    },
    annotationSection: {
        autoEvidence: true,
        customEvidence: false,
        customEvidenceFileList: [],
        evidenceFileOnServer: [],
        minLength: '0',
        removeStrict: true,
        removeSoft: false
    },
    brownamingSection: {
        skip: false,
        excludedTaxoList: [],
        lastTaxid: null,
        excludeTrembl: false
    },
    buscoSection: {
        assembly: true,
        annotation: true
    },
    cpus: null
};

export const getDefaultParameters = () => {
    return JSON.parse(JSON.stringify(defaultParameters));
};
