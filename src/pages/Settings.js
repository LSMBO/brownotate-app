import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useParameters } from "../context/ParametersContext";
import axios from 'axios';
import SettingsSectionStart from "../components/form_settings/SettingsSectionStart";
import "./Settings.css";
import SettingsSectionAnnotation from "../components/form_settings/SettingsSectionAnnotation";
import SettingsSectionBrownaming from "../components/form_settings/SettingsSectionBrownaming";
import SettingsSectionBusco from "../components/form_settings/SettingsSectionBusco";

export default function Settings() {
    const navigate = useNavigate();
    const location = useLocation();
    const { parameters, setParameters } = useParameters();
    //const [parameters, setParameters] = useState(location.state ? location.state.newParameters : null);
    const [isSubmitable, setIsSubmitable] = useState(parameters.ready);
    const dbsearch = location.state ? location.state.dbsearch : null;
    const dbsearchStatus = location.state ? location.state.dbsearchStatus : null;
    

    const updateParameters = (newData) => {
        setParameters({
            ...parameters,
            ...newData,
        });
        handleSubmitable();
    }

    const handleSubmitable = () => {
        const isStartSectionValid = parameters.startSection.sequencing === true || parameters.startSection.genome === true;
        const isGenomeFileListValid = parameters.startSection.genome ? parameters.startSection.genomeFileList.length > 0 : true;
        const isSequencingFileListValid = parameters.startSection.sequencingFiles ? parameters.startSection.sequencingFilesList.length > 0 : true;
        const isSequencingAccessionsValid = parameters.startSection.sequencingAccessions ? parameters.startSection.sequencingAccessionsList.length > 0 : true;
        const isReady = isStartSectionValid && isGenomeFileListValid && isSequencingFileListValid && isSequencingAccessionsValid;
        if (isReady !== parameters.ready) {
            setParameters({
                ...parameters,
                ready: isReady,
                id: new Date().getTime(),
            });
        }
        setIsSubmitable(isReady);
      };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await axios.post('http://localhost:5000/upload_file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const filePath = response.data;
            // setUploadProgress(prevState => ({
            //     ...prevState,
            //     uploadedFiles: prevState.uploadedFiles + 1
            // }));
            return filePath;
        } catch (error) {
            console.error('Erreur lors du téléchargement du fichier : ', error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        navigate('/')

        setParameters(prevParams => ({
            ...prevParams,
            isRun: true
        }));

        const totalFiles = parameters.startSection.genomeFileList.length 
						   + parameters.startSection.sequencingFilesList.length 
						   + parameters.annotationSection.evidenceFileList.length;
        
		//setUploadProgress({ totalFiles, uploadedFiles: 0 });
        const uploadedGenomeFiles = [];
        const uploadedSequencingFiles = [];
        const uploadedEvidenceFiles = [];
        
        // Upload and update genome files
        for (const file of parameters.startSection.genomeFileList) {
            let filePath = ''
            if ('size' in file) {
                filePath = await uploadFile(file);
            } else {
                filePath = file['url']
            }
            uploadedGenomeFiles.push(filePath);
        }
        setParameters(prevParams => ({
            ...prevParams,
            startSection: {
                ...prevParams.startSection,
                genomeFileList: uploadedGenomeFiles
            }
        }));

        // Upload and update sequencing files
        for (const file of parameters.startSection.sequencingFilesList) {
            let filePath = await uploadFile(file);
            if (filePath) {
                uploadedSequencingFiles.push(filePath);
            }
        }
        setParameters(prevParams => ({
            ...prevParams,
            startSection: {
                ...prevParams.startSection,
                sequencingFilesList: uploadedSequencingFiles
            }
        }));

        // Upload and update evidence files
        for (const file of parameters.annotationSection.evidenceFileList) {
            let filePath = ''
            if ('size' in file) {
                filePath = await uploadFile(file);
            } else {
                filePath = file['url']
            }
            uploadedEvidenceFiles.push(filePath);
        }
        setParameters(prevParams => ({
            ...prevParams,
            annotationSection: {
                ...prevParams.annotationSection,
                evidenceFileList: uploadedEvidenceFiles
            }
        }));

        try {
            console.log(parameters)
            const response = await axios.post('http://localhost:5000/run_script', { argument: parameters });
            const jsonString = response.data.substring(response.data.indexOf("{"));
            const response_data = JSON.parse(jsonString);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // affichage
    return (
        <div className="settings t2_bold">
            <button onClick={() => navigate('/', { state: { parameters, dbsearch, dbsearchStatus } })} className="t3">Back</button>
            <p>{JSON.stringify(parameters, null, 2)}</p>
            <div className="titleBox">
                <h2>Settings</h2>
                <h3>Species : {parameters.species.scientificName}</h3>
            </div>
            <form action="submit" className="settingsForm t2_light" onSubmit={handleSubmit}>
                <SettingsSectionStart updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionAnnotation disabled={!isSubmitable} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionBrownaming disabled={!isSubmitable} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionBusco disabled={!isSubmitable} updateParameters={updateParameters} parameters={parameters}/>
                <button disabled={!isSubmitable} className="submitButton t3">Run Brownotate</button>
            </form>
        </div>
    )
}