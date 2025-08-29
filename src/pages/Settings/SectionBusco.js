
import FormElementInputRadio from "./FormElementInputRadio";

export default function SectionBusco({ updateParameters, parameters }) {

    const handleRadioChange = (name, isChecked) => {
        if (isChecked) {
          if (name === "Evaluate the assembly completeness") {
            updateParameters({buscoSection: {assembly: true }});
          } 
          else if (name === "Evaluate the annotation completeness") {
            updateParameters({buscoSection: {annotation: true }});
            }
        }
        else {
          if (name === "Evaluate the assembly completeness") {
            updateParameters({buscoSection: {assembly: false }});
          } 
          else if (name === "Evaluate the annotation completeness") {
            updateParameters({buscoSection: {annotation: false }});
          }
        }
    };


    return (
        <div className="parameters-section">
            <div className="form-element">
                <FormElementInputRadio label="Evaluate the assembly completeness" help="Evaluates the BUSCO completeness evaluation of the assembly." checked={parameters.buscoSection.assembly} onChange={handleRadioChange}/>
            </div>
            <div className="form-element">
                <FormElementInputRadio label="Evaluate the annotation completeness" help="Evaluates the BUSCO completeness evaluation of the annotation." checked={parameters.buscoSection.annotation} onChange={handleRadioChange}/>
            </div>
        </div>
    )
}
