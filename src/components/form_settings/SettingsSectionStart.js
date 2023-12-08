import { useState } from "react";
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsSectionStart({ enabled, handleSetEnable, updateFormData }) {
  const [sectionChecked, setSectionChecked] = useState({
    startSection: {
      auto: false,
      genome: false,
      sequencing: false,
    }
  });

  const handleRadioChange = (name, isChecked) => {
    const sectionCheckedCopy = { ...sectionChecked };
      
    sectionCheckedCopy.startSection.auto = false;
    sectionCheckedCopy.startSection.genome = false;
    sectionCheckedCopy.startSection.sequencing = false;
      
    if (isChecked) {
      if (name === "Auto") {
        sectionCheckedCopy.startSection.auto = true;
      } else if (name === "Genome") {
        sectionCheckedCopy.startSection.genome = true;
      } else if (name === "Sequencing") {
        sectionCheckedCopy.startSection.sequencing = true;
      }
    }
    if (!sectionCheckedCopy.startSection.auto && !sectionCheckedCopy.startSection.genome && !sectionCheckedCopy.startSection.sequencing) {
      handleSetEnable(name, true);
    }
    else {
      handleSetEnable(name, false);
    }
    
    setSectionChecked(sectionCheckedCopy);
    updateFormData(sectionCheckedCopy);
  };

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Start</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Auto" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.startSection.auto} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Genome" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.startSection.genome} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Sequencing" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.startSection.sequencing} onChange={handleRadioChange}/>
            </div>
        </fieldset>
    )
}