import { useState, useEffect } from "react";
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsSectionAssembly({ enabled, updateFormData }) {
    const [sectionChecked, setSectionChecked] = useState({
        assemblySection: {
          skipFastp: false,
          skipPhix: false,
        }
      });

      const handleRadioChange = (name, isChecked) => {
        const sectionCheckedCopy = { ...sectionChecked };
                    
        if (isChecked) {
          if (name === "Skip fastp") {
            sectionCheckedCopy.assemblySection.skipFastp = true;
          } else if (name === "Skip phix removing") {
            sectionCheckedCopy.assemblySection.skipPhix = true;
          }
        }
        else {
            if (name === "Skip fastp") {
                sectionCheckedCopy.assemblySection.skipFastp = false;
              } else if (name === "Skip phix removing") {
                sectionCheckedCopy.assemblySection.skipPhix = false;
              }
        }
        setSectionChecked(sectionCheckedCopy);
        updateFormData(sectionCheckedCopy);
      };

    useEffect(() => {
        if (!enabled) {
            setSectionChecked({
              assemblySection: {
                skipFastp: false,
                skipPhix: false,
              }
            });
        }
      }, [enabled]);

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Assembly</legend>
            <div className="formElement">
              <SettingsFormElementInputRadio label="Skip fastp" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.assemblySection.skipFastp} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
              <SettingsFormElementInputRadio label="Skip phix removing" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.assemblySection.skipPhix} onChange={handleRadioChange}/>
            </div>
        </fieldset>
    )
}