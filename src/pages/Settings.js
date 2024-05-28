import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"
import SettingsSectionStart from "../components/form_settings/SettingsSectionStart";
import Header from "../components/Header"
import "./Settings.css"
import SettingsSectionData from "../components/form_settings/SettingsSectionData";
import SettingsSectionAssembly from "../components/form_settings/SettingsSectionAssembly";
import SettingsSectionAnnotation from "../components/form_settings/SettingsSectionAnnotation";
import SettingsSectionBrownaming from "../components/form_settings/SettingsSectionBrownaming";
import SettingsSectionBusco from "../components/form_settings/SettingsSectionBusco"
import axios from 'axios';
import { useUploadProgress } from '../UploadProgressContext';


export default function Settings() {
    // props
    const navigate = useNavigate();
    const { parameters, setParameters, setUploadProgress } = useUploadProgress();
    const [isSubmitable, setIsSubmitable] = useState(parameters.ready)
    const [downloadEnabled, setDownloadEnabled] = useState(parameters.ready);
    const [assemblyEnabled, setAssemblyEnabled] = useState(parameters.ready);
    const [annotationEnabled, setAnnotationEnabled] = useState(parameters.ready);
    const [brownamingEnabled, setBrownamingEnabled] = useState(parameters.ready);

    const handleSetStartEnable = (name, isNothing) => {
        if (name === "Auto") {
            setDownloadEnabled(true)     
            setAssemblyEnabled(true)
            setAnnotationEnabled(true)
            setBrownamingEnabled(true)  
        }
        if (name === "Genome") {
            setDownloadEnabled(true)
            setAssemblyEnabled(false)
            setAnnotationEnabled(true)
            setBrownamingEnabled(true)  
            
        }
        if (name === "Sequencing") {
            setDownloadEnabled(true)
            setAssemblyEnabled(true)
            setAnnotationEnabled(true)
            setBrownamingEnabled(true)  
        }
        if (isNothing) {
            setDownloadEnabled(false)     
            setAssemblyEnabled(false)
            setAnnotationEnabled(false)
            setBrownamingEnabled(false) 
        }
    }

    const updateParameters = (newData) => {
        setParameters({
            ...parameters,
            ...newData,
        });
        handleSubmitable();
    }

    const handleSubmitable = () => {
        // Check startSection
        const isStartSectionValid = Object.values(parameters.startSection).some(value => value === true);
        // Check dataSection
        const isDataSectionValid =
          (parameters.startSection.auto === true) ||
          (parameters.dataSection.auto === true) ||
          (parameters.startSection.genome === true && parameters.dataSection.genomeFile) ||
          (parameters.startSection.sequencing === true && (parameters.dataSection.sequencingFiles || parameters.dataSection.sequencingAccessions));

        // Check fileList and accessionList
        const isGenomeFileListValid = parameters.dataSection.genomeFile ? parameters.dataSection.genomeFileList.length > 0 : true;
        const isSequencingFileListValid = parameters.dataSection.sequencingFiles ? parameters.dataSection.sequencingFilesList.length > 0 : true;
        const isSequencingAccessionsValid = parameters.dataSection.sequencingAccessions ? parameters.dataSection.sequencingAccessionsList.length > 0 : true;

        const isReady = isStartSectionValid && isDataSectionValid && isGenomeFileListValid && isSequencingFileListValid && isSequencingAccessionsValid;

        if (isReady !== parameters.ready) {
            setParameters({
                ...parameters,
                ready: isReady,
                id: new Date().getTime(),
            });
        }
        setIsSubmitable(isReady);
      };
      
      const handleSubmit = async (e) => {
        navigate('/', { state: { parameters } });
        
        e.preventDefault();
        
        const totalFiles = parameters.dataSection.genomeFileList.length 
                         + parameters.dataSection.sequencingFilesList.length 
                         + parameters.annotationSection.evidenceFileList.length;
    
        setUploadProgress({ totalFiles, uploadedFiles: 0 });
    
        // Array to store uploaded file paths
        const uploadedGenomeFiles = [];
        const uploadedSequencingFiles = [];
        const uploadedEvidenceFiles = [];
    
        // Upload and update genome files
        for (const file of parameters.dataSection.genomeFileList) {
            const filePath = await uploadFile(file);
            if (filePath) {
                uploadedGenomeFiles.push(filePath);
            }
        }
        setParameters(prevParams => ({
            ...prevParams,
            dataSection: {
                ...prevParams.dataSection,
                genomeFileList: uploadedGenomeFiles
            }
        }));
    
        for (const file of parameters.dataSection.sequencingFilesList) {
            const filePath = await uploadFile(file);
            if (filePath) {
                uploadedSequencingFiles.push(filePath);
            }
        }
        setParameters(prevParams => ({
            ...prevParams,
            dataSection: {
                ...prevParams.dataSection,
                sequencingFilesList: uploadedSequencingFiles
            }
        }));
    
        // Upload and update evidence files
        for (const file of parameters.annotationSection.evidenceFileList) {
            const filePath = await uploadFile(file);
            if (filePath) {
                uploadedEvidenceFiles.push(filePath);
            }
        }
        setParameters(prevParams => ({
            ...prevParams,
            annotationSection: {
                ...prevParams.annotationSection,
                evidenceFileList: uploadedEvidenceFiles
            }
        }));
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
            setUploadProgress(prevState => ({
                ...prevState,
                uploadedFiles: prevState.uploadedFiles + 1
            }));
            return filePath;
        } catch (error) {
            console.error('Erreur lors du téléchargement du fichier : ', error);
            return null;
        }
    };


    // affichage
    return (
        <div className="settings t1_bold">
            <p>{JSON.stringify(parameters, null, 2)}</p>
            <div className="titleBox">
                <h2>Settings</h2>
                <h3>Species : {parameters.species.scientificName}</h3>
            </div>
            <form action="submit" className="settingsForm t1_light" onSubmit={handleSubmit}>
                <SettingsSectionStart enabled={true} handleSetEnable={handleSetStartEnable} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionData enabled={downloadEnabled} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionAssembly enabled={assemblyEnabled} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionAnnotation enabled={annotationEnabled} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionBrownaming enabled={brownamingEnabled} updateParameters={updateParameters} parameters={parameters}/>
                <SettingsSectionBusco enabled={true} updateParameters={updateParameters} parameters={parameters}/>
                <button disabled={!isSubmitable} className="submitButton t2">Save</button>
            </form>
        </div>
    )
}