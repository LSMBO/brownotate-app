
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsSectionBusco({ disabled, updateParameters, parameters }) {

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
        <fieldset disabled={disabled}>
            <legend className="t2_bold">Busco (completeness evaluation)</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Evaluate the genome completeness" help="Evaluates the BUSCO completeness evaluation of the assembly." checked={parameters.buscoSection.assembly} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Evaluate the annotation completeness" help="Evaluates the BUSCO completeness evaluation of the annotation." checked={parameters.buscoSection.annotation} onChange={handleRadioChange}/>
            </div>
        </fieldset>
    )
}
