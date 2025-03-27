import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import CONFIG from '../config';
import { downloadEnsemblFTP, downloadNCBI, handleClickDownload } from '../utils/Download';
import { useParameters } from "../contexts/ParametersContext";
import { useUser } from '../contexts/UserContext';
import { useRuns } from '../contexts/RunsContext'
import SettingsSectionStart from "../components/form_settings/SettingsSectionStart";
import SettingsSectionAnnotation from "../components/form_settings/SettingsSectionAnnotation";
import SettingsSectionBrownaming from "../components/form_settings/SettingsSectionBrownaming";
import SettingsSectionBusco from "../components/form_settings/SettingsSectionBusco";
import SettingsSectionProcesses from "../components/form_settings/SettingsSectionProcesses";
import "./Settings.css";

export default function Settings() {
    const navigate = useNavigate();
    const { user } = useUser();
    const { fetchCPUs, freeCPUs, addRun, startRunMonitoring } = useRuns();
    const { parameters, setParameters } = useParameters();
    const [isSubmitable, setIsSubmitable] = useState(parameters.ready);    

    const updateParameters = (newData) => {
        setParameters({
            ...parameters,
            ...newData,
        });
        handleSubmitable(newData);
    }

    const handleSubmitable = (newData) => {
        const isStartSectionValid = newData.startSection.sequencing === true || newData.startSection.assembly === true;
        const isAssemblyFileListValid = newData.startSection.assembly ? newData.startSection.assemblyFileList.length > 0 || newData.startSection.assemblyDownload : true;
        const isSequencingFileListValid = newData.startSection.sequencingFiles ? newData.startSection.sequencingFilesList.length > 0 : true;
        const isSequencingAccessionsValid = newData.startSection.sequencingAccessions ? newData.startSection.sequencingAccessionList.length > 0 : true;
        const isCPUsValid = parseInt(newData.cpus) <= freeCPUs;
        const isReady = isStartSectionValid && isAssemblyFileListValid && isSequencingFileListValid && isSequencingAccessionsValid && isCPUsValid;
        if (isReady !== parameters.ready) {
            setParameters({
                ...parameters,
                ready: isReady,
                id: new Date().getTime(),
            });
        }
        setIsSubmitable(isReady);
      };

    const uploadFile = async (files, type) => {
        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append(`file${index}`, file);
        });
        formData.append('type', type);
        formData.append('run_id', parameters['id']);
        try {
            const response = await axios.post(`${CONFIG.API_BASE_URL}/upload_file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    const evidenceSearch = async (species) => {
        try {
            let response;

            // Taxonomy (Uniprot)
            response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_taxonomy`, { 
                scientificName: species['scientificName'], 
                taxID: species['taxonID'], 
                user: user,
                createNewDBS: false
            });
            
            // Uniprot Proteome
            response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_uniprot_proteome`, {
                user: user,
                dbsearch: response.data,
                createNewDBS: false
            });

            // Ensembl
            response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_ensembl`, {
                user: user,
                dbsearch: response.data,
                createNewDBS: false
            });

            // RefSeq
            response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_refseq`, {
                user: user,
                dbsearch: response.data,
                createNewDBS: false
            });

            // Genbank
            response = await axios.post(`${CONFIG.API_BASE_URL}/dbs_genbank`, {
                user: user,
                dbsearch: response.data,
                createNewDBS: false
            });

            let dbsearch_data = response.data.data;
            let swissprot_data = {
                "accession": `${dbsearch_data.taxonomy.scientificName.toLowerCase().replace(/ /g, '_')}_swissprot`,
                "database": 'uniprot',
                "data_type": "swissprot",
                "scientific_name": dbsearch_data.taxonomy.scientificName,
                "count": dbsearch_data.taxonomy.statistics.reviewedProteinCount,
                "url": `https://www.uniprot.org/uniprotkb?query=%28taxonomy_id%3A${dbsearch_data.taxonomy.taxonId}%29+AND+%28reviewed%3Atrue%29`,
                "download_url": `https://rest.uniprot.org/uniprotkb/stream?query=(taxonomy_id:${dbsearch_data.taxonomy.taxonId})%20AND%20(reviewed:true)&format=fasta`
            }
            let trembl_data = {
                "accession": `${dbsearch_data.taxonomy.scientificName.toLowerCase().replace(/ /g, '_')}_trembl`,
                "database": 'uniprot',
                "data_type": "trembl",
                "scientific_name": dbsearch_data.taxonomy.scientificName,
                "count": dbsearch_data.taxonomy.statistics.unreviewedProteinCount,
                "url": `https://www.uniprot.org/uniprotkb?query=%28taxonomy_id%3A${dbsearch_data.taxonomy.taxonId}%29+AND+%28reviewed%3Afalse%29`,
                "download_url": `https://rest.uniprot.org/uniprotkb/stream?query=(taxonomy_id:${dbsearch_data.taxonomy.taxonId})%20AND%20(reviewed:false)&format=fasta`
            }
            const data = [
                [swissprot_data],
                ...dbsearch_data.ensembl_annotated_genomes,
                ...dbsearch_data.uniprot_proteomes,
                ...dbsearch_data.ncbi_refseq_annotated_genomes,
                ...dbsearch_data.ncbi_genbank_annotated_genomes,
                ...(trembl_data.count < 100000 ? [trembl_data] : [])
            ];
            let server_filepath = await handleClickDownload(data, 'proteins', false);
            return [server_filepath];
        } catch (error) {
            console.error('Error:', error);
            return 
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        fetchCPUs();
        navigate('/')
        try {
            console.log('Run started with parameters:', parameters);
            const createRunResponse = await axios.post(`${CONFIG.API_BASE_URL}/create_run`, { parameters: parameters, user: user });
            addRun(createRunResponse.data);

            // Upload and update assembly file
            if (parameters.startSection.assembly) {
                let uploadedAssemblyFile;
                if (parameters.startSection.assemblyType === 'ensembl') {
                    uploadedAssemblyFile = await downloadEnsemblFTP(parameters.startSection.assemblyDownload, parameters.startSection.assemblyAccession[0], 'assembly');
                    uploadedAssemblyFile = [uploadedAssemblyFile];
                } else if (parameters.startSection.assemblyType === 'ncbi') {
                    uploadedAssemblyFile = await downloadNCBI(parameters.startSection.assemblyDownload);
                    uploadedAssemblyFile = [uploadedAssemblyFile];
                } else {
                    uploadedAssemblyFile = await uploadFile(parameters.startSection.assemblyFileList, 'assembly');
                }
                await setParameters(prevParams => ({
                    ...prevParams,
                    startSection: {
                        ...prevParams.startSection,
                        assemblyFileList: uploadedAssemblyFile
                    }
                }));
                await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, 
                    { run_id: parameters['id'], 
                        user: user, 
                        data_type: 'assembly', 
                        file_list: uploadedAssemblyFile 
                });
            }

            // Upload and update evidence files
            if (parameters.species.is_bacteria === false) {
                let uploadedEvidenceFile;
                if (parameters.annotationSection.evidenceFileList.length > 0) {
                    uploadedEvidenceFile = await uploadFile(parameters.annotationSection.evidenceFileList, 'evidence');
                } else {
                    uploadedEvidenceFile = await evidenceSearch(parameters.species); 
                }
                
                setParameters(prevParams => ({
                    ...prevParams,
                    annotationSection: {
                        ...prevParams.annotationSection,
                        evidenceFileList: uploadedEvidenceFile
                    }
                }));
                await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, 
                    { run_id: parameters['id'], 
                        user: user, 
                        data_type: 'evidence', 
                        file_list: uploadedEvidenceFile 
                    });                
            }



            // Upload and update sequencing files
            if (parameters.startSection.sequencingFileList.length > 0) {
                let uploadedSequencingFiles = await uploadFile(parameters.startSection.sequencingFilesList, 'sequencing');
                setParameters(prevParams => ({
                    ...prevParams,
                    startSection: {
                        ...prevParams.startSection,
                        sequencingFilesList: uploadedSequencingFiles
                    }
                }));
            }
            
            startRunMonitoring(user)
            await axios.post(`${CONFIG.API_BASE_URL}/run_brownotate`, { run_id: parameters['id'], user: user});
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="settings t2_bold">
            <h2 className="home-h2">
                Settings
                <p>Species : {parameters.species.scientificName}</p>
            </h2>
            
            <form action="submit" className="settingsForm t2_light" onSubmit={handleSubmit}>
                <SettingsSectionStart updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionAnnotation disabled={!isSubmitable} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionBrownaming disabled={!isSubmitable} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionBusco disabled={!isSubmitable} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionProcesses updateParameters={updateParameters} parameters={parameters} freeCPUs={freeCPUs}/>
                <button disabled={!isSubmitable} className="submitButton t3">Run Brownotate</button>
            </form>
        </div>
    )
}