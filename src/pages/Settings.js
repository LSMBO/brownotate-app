import { useNavigate, useLocation } from "react-router-dom"
import SettingsSectionStart from "../components/form_settings/SettingsSectionStart";
import Header from "../components/Header"
import "./Settings.css"
import { useEffect, useState } from "react";
import SettingsSectionData from "../components/form_settings/SettingsSectionData";
import SettingsSectionAssembly from "../components/form_settings/SettingsSectionAssembly";
import SettingsSectionAnnotation from "../components/form_settings/SettingsSectionAnnotation";
import SettingsSectionBrownaming from "../components/form_settings/SettingsSectionBrownaming";

export default function Settings() {
    // props
    const { state } = useLocation();
    const navigate = useNavigate();
    const species = state.loadedSpecies;

    const [isSubmitable, setIsSubmitable] = useState(false)
    const [downloadEnabled, setDownloadEnabled] = useState(false);
    const [assemblyEnabled, setAssemblyEnabled] = useState(false);
    const [annotationEnabled, setAnnotationEnabled] = useState(false);
    const [brownamingEnabled, setBrownamingEnabled] = useState(false);

    const [formData, setFormData] = useState({
        id: new Date().getTime(),
        ready: false,
        startSection: {
            auto: false,
            genome: false,
            sequencing: false,
        },
        dataSection: {
            auto: false,
            file: false,
            accession: false,
            fileList: [],
            accessionList: []
        },
        assemblySection: {
            skipFastp: false,
            skipPhix: false,
        },
        annotationSection: {
            removeStrict: false,
            removeSoft: false,
        },
        brownamingSection: {
            skip: false,
            excludedSpeciesList: [],
            highestRank: null,
        },
    });

    

    // comportements

    useEffect(() => {
        handleSubmitable();
      }, [formData]);


    const handleSetStartEnable = (name, isNothing) => {
        if (name === "Auto") {
            setDownloadEnabled(false)     
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

    const updateFormData = (newData) => {
        setFormData({
            ...formData,
            ...newData,
        });
        handleSubmitable();
    }

    const handleSubmitable = () => {
        // Check startSection
        const isStartSectionValid = Object.values(formData.startSection).some(value => value === true);
        // Check dataSection
        const isDataSectionValid =
          (formData.startSection.auto === true) ||
          (formData.startSection.auto === false && (formData.dataSection.auto || formData.dataSection.file || formData.dataSection.accession));
        // Check fileList and accessionList
        const isFileListValid = formData.dataSection.file ? formData.dataSection.fileList.length > 0 : true;
        const isAccessionListValid = formData.dataSection.accession ? formData.dataSection.accessionList.length > 0 : true;

        const isReady = isStartSectionValid && isDataSectionValid && isFileListValid && isAccessionListValid;

        if (isReady !== formData.ready) {
            setFormData({
                ...formData,
                ready: isReady
            });
        }
        setIsSubmitable(isReady);
      };
      

    const handleSubmit = (e) => {
        e.preventDefault()
        navigate('/', {state: {formData}});
        console.log("SUBMIT")
    }

    // affichage
    return (
        <div className="settings t1_bold">
            <Header />
            <div className="titleBox">
                <h2>Settings</h2>
                <h3>Species : {species.scientificName}</h3>
            </div>
            <form action="submit" className="settingsForm t1_light" onSubmit={handleSubmit}>
                <SettingsSectionStart enabled={true} handleSetEnable={handleSetStartEnable} updateFormData={updateFormData}/>
                <SettingsSectionData enabled={downloadEnabled} updateFormData={updateFormData}/>
                <SettingsSectionAssembly enabled={assemblyEnabled} updateFormData={updateFormData}/>
                <SettingsSectionAnnotation enabled={annotationEnabled} updateFormData={updateFormData}/>
                <SettingsSectionBrownaming enabled={brownamingEnabled} updateFormData={updateFormData}/>
                <button disabled={!isSubmitable} className="submitButton t2">Save</button>
            </form>
        </div>
    )
}