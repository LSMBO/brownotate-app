import FormElementInputRadio from "./FormElementInputRadio";
import HelpIcon from "../../assets/help.png";
import FormElementInputText from "./FormElementInputText";

export default function SectionAnnotation({ updateParameters, parameters }) {

      const handleRadioChange = (name, isChecked) => {
        if (isChecked) {
          if (name === "100% Identity - Same length (recommended)") {
            updateParameters({annotationSection: {removeStrict: true, removeSoft: false }});
          } else if (name === "100% Identity - lower length") {
            updateParameters({annotationSection: {removeStrict: false, removeSoft: true }});
          }
        } else {
          if (name === "100% Identity - Same length (recommended)") {
            updateParameters({annotationSection: {removeStrict: false }});
          } else if (name === "100% Identity - lower length") {
            updateParameters({annotationSection: {removeSoft: false }});
          }
        }
      };

      const handleMinLengthChange = (text) => {
        updateParameters({annotationSection: {minLength: text }});
      }

    return (
      <div className="parameters-section">
        <div className="form-element">
          <div className="label-tooltip-wrapper">
            <label>Minimal sequence length (in amino acids)</label>
            <div className="tooltip-container">
              <img src={HelpIcon} alt="help" className="helpIcon"/>
              <span className="help-span">Predicted sequences with a length below this threshold are removed from the annotation.</span>
            </div>
          </div>
          <FormElementInputText 
            label="Minimal length"
            text={parameters.annotationSection.minLength} 
            onChange={handleMinLengthChange}
            type='input-number'
            width='5'
          />
        </div>
        <p className='form-warning'><i>Warning: More confident identifications are generally obtained when filtering out short predicted proteins</i></p>
        <div className="form-element">
          <div className="label-tooltip-wrapper">
            <label>Remove duplicate sequences</label>
          </div>
          <div>
              <FormElementInputRadio label="100% Identity - Same length (recommended)" help="Deletes sequences that are strictly identical to another sequence." checked={parameters.annotationSection.removeStrict} onChange={handleRadioChange}/>
              <FormElementInputRadio label="100% Identity - lower length" help="Deletes proteins whose sequence is strictly included in another protein sequence." checked={parameters.annotationSection.removeSoft} onChange={handleRadioChange}/>
          </div>
        </div>
      </div>
    )
}