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
    const location = useLocation();
    const { setUploadProgress } = useUploadProgress();
    const [newParameters, setNewParameters] = useState(location.state.parameters);
    const [isSubmitable, setIsSubmitable] = useState(newParameters.ready)
    const [downloadEnabled, setDownloadEnabled] = useState(newParameters.ready);
    const [assemblyEnabled, setAssemblyEnabled] = useState(newParameters.ready);
    const [annotationEnabled, setAnnotationEnabled] = useState(newParameters.ready);
    const [brownamingEnabled, setBrownamingEnabled] = useState(newParameters.ready);

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
        setNewParameters({
            ...newParameters,
            ...newData,
        });
        handleSubmitable();
    }

    const handleSubmitable = () => {
        // Check startSection
        const isStartSectionValid = Object.values(newParameters.startSection).some(value => value === true);
        // Check dataSection
        const isDataSectionValid =
          (newParameters.startSection.auto === true) ||
          (newParameters.dataSection.auto === true) ||
          (newParameters.startSection.genome === true && newParameters.dataSection.genomeFile) ||
          (newParameters.startSection.sequencing === true && (newParameters.dataSection.sequencingFiles || newParameters.dataSection.sequencingAccessions));

        // Check fileList and accessionList
        const isGenomeFileListValid = newParameters.dataSection.genomeFile ? newParameters.dataSection.genomeFileList.length > 0 : true;
        const isSequencingFileListValid = newParameters.dataSection.sequencingFiles ? newParameters.dataSection.sequencingFilesList.length > 0 : true;
        const isSequencingAccessionsValid = newParameters.dataSection.sequencingAccessions ? newParameters.dataSection.sequencingAccessionsList.length > 0 : true;

        const isReady = isStartSectionValid && isDataSectionValid && isGenomeFileListValid && isSequencingFileListValid && isSequencingAccessionsValid;

        if (isReady !== newParameters.ready) {
            setNewParameters({
                ...newParameters,
                ready: isReady,
                id: new Date().getTime(),
            });
        }
        setIsSubmitable(isReady);
      };
      
      const handleSubmit = async (e) => {
        navigate('/', { state: { newParameters } });
        
        e.preventDefault();
        
        const totalFiles = newParameters.dataSection.genomeFileList.length 
                         + newParameters.dataSection.sequencingFilesList.length 
                         + newParameters.annotationSection.evidenceFileList.length;
    
        setUploadProgress({ totalFiles, uploadedFiles: 0 });
    
        // Array to store uploaded file paths
        const uploadedGenomeFiles = [];
        const uploadedSequencingFiles = [];
        const uploadedEvidenceFiles = [];
    
        // Upload and update genome files
        for (const file of newParameters.dataSection.genomeFileList) {
            const filePath = await uploadFile(file);
            if (filePath) {
                uploadedGenomeFiles.push(filePath);
            }
        }
        setNewParameters(prevParams => ({
            ...prevParams,
            dataSection: {
                ...prevParams.dataSection,
                genomeFileList: uploadedGenomeFiles
            }
        }));
    
        for (const file of newParameters.dataSection.sequencingFilesList) {
            const filePath = await uploadFile(file);
            if (filePath) {
                uploadedSequencingFiles.push(filePath);
            }
        }
        setNewParameters(prevParams => ({
            ...prevParams,
            dataSection: {
                ...prevParams.dataSection,
                sequencingFilesList: uploadedSequencingFiles
            }
        }));
    
        // Upload and update evidence files
        for (const file of newParameters.annotationSection.evidenceFileList) {
            const filePath = await uploadFile(file);
            if (filePath) {
                uploadedEvidenceFiles.push(filePath);
            }
        }
        setNewParameters(prevParams => ({
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
            <Header />
            <p>{JSON.stringify(newParameters, null, 2)}</p>
            <div className="titleBox">
                <h2>Settings</h2>
                <h3>Species : {newParameters.species.scientificName}</h3>
            </div>
            <form action="submit" className="settingsForm t1_light" onSubmit={handleSubmit}>
                <SettingsSectionStart enabled={true} handleSetEnable={handleSetStartEnable} updateParameters={updateParameters} parameters={newParameters}/>
                <SettingsSectionData enabled={downloadEnabled} updateParameters={updateParameters} parameters={newParameters}/>
                <SettingsSectionAssembly enabled={assemblyEnabled} updateParameters={updateParameters} parameters={newParameters}/>
                <SettingsSectionAnnotation enabled={annotationEnabled} updateParameters={updateParameters} parameters={newParameters}/>
                <SettingsSectionBrownaming enabled={brownamingEnabled} updateParameters={updateParameters} parameters={newParameters}/>
                <SettingsSectionBusco enabled={true} updateParameters={updateParameters} parameters={newParameters}/>
                <button disabled={!isSubmitable} className="submitButton t2">Save</button>
            </form>
        </div>
    )
}