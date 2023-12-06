import { useState } from "react";
import SettingsFormElement from "./SettingsFormElement";

export default function SettingsSection({ content, handleSetEnable, enabled }){
    const { sectionName, formElements } = content;
    const [checkedRadio, setCheckedRadio] = useState(null);


    const handleRadioChange = (name) => {
      setCheckedRadio(name);
      handleSetEnable(name)
    }

    return (
        <fieldset disabled={!enabled}>
          <legend className="t1_bold">{sectionName}</legend>
          <div className="sectionElements">
            {formElements.map((element, index) => (
              <SettingsFormElement
                key={index}
                name={element.name}
                type={element.type}
                help={element.help || "To complete"}
                checked={element.name === checkedRadio}
                onRadioChange={handleRadioChange}
              />
            ))}
          </div>
        </fieldset>
    )
}
