import "./Settings.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParameters } from "../contexts/ParametersContext";
import { useUser } from '../contexts/UserContext';
import { useRuns } from '../contexts/RunsContext'
import axios from 'axios';
import SettingsSectionStart from "../components/form_settings/SettingsSectionStart";
import SettingsSectionAnnotation from "../components/form_settings/SettingsSectionAnnotation";
import SettingsSectionBrownaming from "../components/form_settings/SettingsSectionBrownaming";
import SettingsSectionBusco from "../components/form_settings/SettingsSectionBusco";
import CONFIG from '../config';

export default function Settings() {
    const navigate = useNavigate();
    const { user } = useUser();
    const { addRun } = useRuns()
    const { parameters, setParameters } = useParameters();
    const [isSubmitable, setIsSubmitable] = useState(parameters.ready);    
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        navigate('/')
        try {
            const createRunResponse = await axios.post(`${CONFIG.API_BASE_URL}/create_run`, { parameters: parameters, user: user });
            addRun(createRunResponse.data);
    
            const urls = {
                'assembly': null,
                'evidence': null
            };
        

            // Upload and update assembly file
            if (parameters.startSection.genomeFileList.length > 0) {
                if (Array.isArray(parameters.startSection.genomeFileList) && !parameters.startSection.genomeFileIsURL) {
                    let uploadedAssemblyFile = await uploadFile(parameters.startSection.genomeFileList, 'assembly');
                    setParameters(prevParams => ({
                        ...prevParams,
                        startSection: {
                            ...prevParams.startSection,
                            genomeFileList: uploadedAssemblyFile
                        }
                    }));
                } else {
                    urls['assembly'] = parameters.startSection.genomeFileList
                }
            }  

            // Upload and update evidence files
            if (parameters.annotationSection.evidenceFileList.length > 0) {
                if (Array.isArray(parameters.annotationSection.evidenceFileList)) {
                    let uploadedEvidenceFile = await uploadFile(parameters.annotationSection.evidenceFileList, 'evidence');
                    setParameters(prevParams => ({
                        ...prevParams,
                        annotationSection: {
                            ...prevParams.annotationSection,
                            evidenceFileList: uploadedEvidenceFile
                        }
                    }));
                } else {
                    urls['evidence'] = parameters.annotationSection.evidenceFileList
                }
            }

            // Upload and update sequencing files
            if (parameters.startSection.sequencingFilesList.length > 0) {
                let uploadedSequencingFiles = await uploadFile(parameters.startSection.sequencingFilesList, 'sequencing');
                setParameters(prevParams => ({
                    ...prevParams,
                    startSection: {
                        ...prevParams.startSection,
                        sequencingFilesList: uploadedSequencingFiles
                    }
                }));
            }

            if (urls['assembly'] || urls['evidence']) {
                await axios.post(`${CONFIG.API_BASE_URL}/update_run_parameters`, { run_id: parameters['id'], user: user, urls: urls });
            }
            
            await axios.post(`${CONFIG.API_BASE_URL}/run_brownotate`, { run_id: parameters['id'], user: user});
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // affichage
    return (
        <div className="settings t2_bold">
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