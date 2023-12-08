import { useState, useEffect } from "react";
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsSectionAnnotation({ enabled, updateFormData }) {
    const [sectionChecked, setSectionChecked] = useState({
        annotationSection: {
          removeStrict: false,
          removeSoft: false,
        }
      });

      const handleRadioChange = (name, isChecked) => {
        const sectionCheckedCopy = { ...sectionChecked };

        sectionCheckedCopy.annotationSection.removeStrict = false;
        sectionCheckedCopy.annotationSection.removeSoft = false;
                    
        if (isChecked) {
          if (name === "Remove duplicated sequence (strict)") {
            sectionCheckedCopy.annotationSection.removeStrict = true;
          } else if (name === "Remove duplicated sequence (soft)") {
            sectionCheckedCopy.annotationSection.removeSoft = true;
          }
        }
        setSectionChecked(sectionCheckedCopy);
        updateFormData(sectionCheckedCopy);
      };

    useEffect(() => {
        if (!enabled) {
            setSectionChecked({
              annotationSection: {
                removeStrict: false,
                removeSoft: false,
              }
            });
        }
      }, [enabled]);

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Annotation (proteins prediction)</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Remove duplicated sequence (strict)" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.annotationSection.removeStrict} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Remove duplicated sequence (soft)" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.annotationSection.removeSoft} onChange={handleRadioChange}/>
            </div>
        </fieldset>
    )
}