
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsSectionBusco({ enabled, updateParameters, parameters }) {

    const handleRadioChange = (name, isChecked) => {
        const parametersCopy = { ...parameters };
        if (isChecked) {
          if (name === "Evaluate the genome completeness") {
            parametersCopy.buscoSection.assembly = true;
          } 
          else if (name === "Evaluate the annotation completeness") {
            parametersCopy.buscoSection.annotation = true;
            }
        }
        else {
          if (name === "Evaluate the genome completeness") {
            parametersCopy.buscoSection.assembly = false;
          } 
          else if (name === "Evaluate the annotation completeness") {
            parametersCopy.buscoSection.annotation = false;
          }
        }
        updateParameters(parametersCopy);
    };


    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Busco (completeness evaluation)</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio disabled={parameters.startSection.genome} label="Evaluate the genome completeness" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.buscoSection.assembly} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Evaluate the annotation completeness" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.buscoSection.annotation} onChange={handleRadioChange}/>
            </div>
        </fieldset>
    )
}
