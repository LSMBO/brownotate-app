import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import HelpIcon from "../../assets/help.png";
import SettingsFormElementInputFile from "./SettingsFormElementInputFile";
import SettingsFormElementInputText from "./SettingsFormElementInputText";

export default function SettingsSectionAnnotation({ disabled, updateParameters, parameters }) {
      const [expanded, setExpanded] = useState(false);

      const handleRadioChange = (name, isChecked) => {
        const parametersCopy = { ...parameters };
               
        if (isChecked) {
          if (name === "100% Identity - Same length (recommanded)") {
            parametersCopy.annotationSection.removeSoft = false;
            parametersCopy.annotationSection.removeStrict = true;
          } else if (name === "100% Identity - lower length") {
            parametersCopy.annotationSection.removeStrict = false;
            parametersCopy.annotationSection.removeSoft = true;
          } 
        }
        updateParameters(parametersCopy);
      };

      const handleFileChange = (e, index) => {
        e.preventDefault();
        const parametersCopy = { ...parameters };  
        if (index !== undefined) {
          parametersCopy.annotationSection.evidenceFileList.splice(index, 1);
        } 
        else {
          const files = e.target.files;
          if (files) {
            parametersCopy.annotationSection.evidenceFileList = Array.from(files);
          }
        }
        updateParameters(parametersCopy);
      };

      const handleMinLengthChange = (text) => {
        const parametersCopy = { ...parameters };
        parametersCopy.annotationSection.minLength = text;
        updateParameters(parametersCopy)
      }

    return (
      <fieldset disabled={disabled}>
        <legend className="t2_bold">Annotation (proteins prediction)</legend>

        <div className="formSection">
          <div className="sectionTitle">
            <div className="labelTooltipWrapper">
              <label>Minimal sequence length (in amino acids)</label>
              <div className="tooltipContainer">
                <img src={HelpIcon} alt="help" className="helpIcon" />
                <span className="helpSpan">Augustus predicted sequences with a length below this threshold are removed from the annotation.</span>
              </div>
            </div>
          </div>
          <div className="formElement">
            <SettingsFormElementInputText 
              label="Minimal length"
              text={parameters.annotationSection.minLength} 
              onChange={handleMinLengthChange}
              type='input-number'
              width='5'/>
          </div>
        </div>
        
        <div className="formSection">
          <div className="sectionTitle">
            <label>Remove duplicated sequence</label>
          </div>
          <div className="formElement">
            <SettingsFormElementInputRadio label="100% Identity - Same length (recommanded)" help="Deletes sequences that are strictly identical to another sequence." checked={parameters.annotationSection.removeStrict} onChange={handleRadioChange}/>
          </div>
          <div className="formElement">
            <SettingsFormElementInputRadio label="100% Identity - lower length" help="Deletes proteins whose sequence is strictly included in another protein sequence." checked={parameters.annotationSection.removeSoft} onChange={handleRadioChange}/>
          </div>
        </div>
        
        <div className="sectionTitle">
          <div className="labelTooltipWrapper">
            <label>Advanced parameters</label>
              <FontAwesomeIcon icon={expanded ? faAngleUp : faAngleDown} className="expand-icon" onClick={() => setExpanded(!expanded)}/>
            </div>
        </div>

        {expanded && (
            <div className="formSection">
            <div className="sectionTitle">
              <div className="labelTooltipWrapper">
                <label>Protein evidence</label>
                <div className="tooltipContainer">
                  <img src={HelpIcon} alt="help" className="helpIcon" />
                  <span className="helpSpan">Set of proteins used to locate few genes in the assembly. These genes are used to train the augustus gene model.</span>
                </div>
              </div>
            </div>
            <div className="formElement">
              <SettingsFormElementInputRadio
                  disabled={false}
                  label="Evidence file" 
                  help="Select your own fasta file with the proteins of a related organism." 
                  checked={true}
                  onChange={handleRadioChange}
              />
              <SettingsFormElementInputFile 
                label="Evidence file"
                disabled={false}
                handleFileChange={handleFileChange}
                value={parameters.annotationSection.evidenceFileList}
              />
            </div>
          </div>
        )}
      </fieldset>
    )
}