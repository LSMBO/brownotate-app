import { useEffect, useState } from "react";
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import SettingsFormElementInputFile from "./SettingsFormElementInputFile";
import SettingsFormElementInputText from "./SettingsFormElementInputText";

export default function SettingsSectionData({ enabled, updateFormData }) {

    const [sectionChecked, setSectionChecked] = useState({
        dataSection: {
            auto: false,
            file: false,
            accession: [],
            fileList: [],
            accessionList: null
        }
      });

    const handleRadioChange = (name, isChecked) => {
        const sectionCheckedCopy = {...sectionChecked}
        sectionCheckedCopy.dataSection.auto = false;
        sectionCheckedCopy.dataSection.file = false;
        sectionCheckedCopy.dataSection.accession = false;
        if (isChecked) {
            if (name === "Auto"){
                sectionCheckedCopy.dataSection.auto = true;
            } else if (name === "File(s)"){
                sectionCheckedCopy.dataSection.file = true;
            } else if (name === "Accession(s)"){
                sectionCheckedCopy.dataSection.accession = true;
            }
        }
        
        setSectionChecked(sectionCheckedCopy)
        updateFormData(sectionCheckedCopy)
    }

    const handleTextChange= (text) => {
        const sectionCheckedCopy = {...sectionChecked}
        sectionCheckedCopy.dataSection.accessionList = text.trim() !== '' ? text.trim().split("\n") : [];
        setSectionChecked(sectionCheckedCopy)
        updateFormData(sectionCheckedCopy)
    }

    useEffect(() => {
        if (!enabled) {
            setSectionChecked({
                dataSection: {
                    auto: false,
                    file: false,
                    accession: false,
                    fileList: [],
                    accessionList: []
                }
            });
        }
      }, [enabled]);


    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Data</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Auto" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.dataSection.auto} onChange={handleRadioChange}/>
            </div>
            <SettingsFormElementInputText label="Accession(s)" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.dataSection.accession} onChange={handleRadioChange} onText={handleTextChange} />
            <SettingsFormElementInputFile label="File(s)" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.dataSection.file} onChange={handleRadioChange}/>
        </fieldset>
    )
}