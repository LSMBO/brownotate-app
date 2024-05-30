import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SettingsSectionStart from "../components/form_settings/SettingsSectionStart";
import "./Settings.css";
import SettingsSectionAnnotation from "../components/form_settings/SettingsSectionAnnotation";
import SettingsSectionBrownaming from "../components/form_settings/SettingsSectionBrownaming";
import SettingsSectionBusco from "../components/form_settings/SettingsSectionBusco";

export default function Settings() {
    const navigate = useNavigate();
    const location = useLocation();
    const [parameters, setParameters] = useState(location.state ? location.state.newParameters : null);
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
      
      const handleSubmit = async (e) => {
        navigate('/', { state: { parameters } }); 
        e.preventDefault();
    };

    // affichage
    return (
        <div className="settings t2_bold">
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
                <button disabled={!isSubmitable} className="submitButton t3">Save</button>
            </form>
        </div>
    )
}