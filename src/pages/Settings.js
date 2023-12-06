
import SettingsSection from "../components/form_settings/SettingsSection";
import Header from "../components/Header"
import "./Settings.css"
import formContent from "../assets/text/settings.json";
import { useState } from "react";

export default function Settings() {
    // props
    const [downloadEnabled, setDownloadEnabled] = useState(false);
    const [assemblyEnabled, setAssemblyEnabled] = useState(false);
    const [annotationEnabled, setAnnotationEnabled] = useState(false);
    const [brownamingEnabled, setBrownamingEnabled] = useState(false);

    // comportements
    const handleSetStartEnable = (name) => {
        console.log(`run handleSetStartEnable name=${name}`)
        if (name === "Auto") {
            setDownloadEnabled(false)
            setAssemblyEnabled(true)
            setAnnotationEnabled(true)
            setBrownamingEnabled(true)  
        }
        if (name === "Genome") {
            setDownloadEnabled(true)
            setAssemblyEnabled(false)
        }
        if (name === "Sequencing") {
            setDownloadEnabled(true)
            setAssemblyEnabled(true)
        }
    }

    const handleSetDownloadEnable = (name) => {
        console.log(`run handleSet Download Enable name=${name}`)
        
    }

    const handleSetAssemblyEnable = (name) => {
        console.log(`run handleSet Assembly Enable name=${name}`)
        
    }

    const handleSetAnnotationEnable = (name) => {
        console.log(`run handleSet Annotation Enable name=${name}`)
        
    }

    const handleSetBrownamingEnable = (name) => {
        console.log(`run handleSet Brownaming Enable name=${name}`)
        
    }

    const handleSubmit = () => {
        console.log("SUBMIT")
    }

    // affichage
    return (
        <div>
            <Header />
            <form action="submit" className="settingsForm t1_light" onSubmit={handleSubmit}>
                <SettingsSection content={formContent.start} handleSetEnable={handleSetStartEnable} enabled={true}/>
                <SettingsSection content={formContent.download} handleSetEnable={handleSetDownloadEnable} enabled={downloadEnabled} />
                <SettingsSection content={formContent.assembly} handleSetEnable={handleSetAssemblyEnable} enabled={assemblyEnabled}/>
                <SettingsSection content={formContent.annotation} handleSetEnable={handleSetAnnotationEnable} enabled={annotationEnabled}/>
                <SettingsSection content={formContent.brownaming} handleSetEnable={handleSetBrownamingEnable} enabled={brownamingEnabled}/>
                <button className="submitButton t2">Save</button>
            </form>
        </div>
    )
}