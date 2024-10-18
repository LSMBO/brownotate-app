import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import HelpIcon from "../../assets/help.png";
import SettingsFormElementInputFile from "./SettingsFormElementInputFile";
import SettingsFormElementInputText from "./SettingsFormElementInputText";



export default function SettingsSectionAnnotation({ disabled, updateParameters, parameters }) {
      const handleRadioChange = (name, isChecked) => {
        const parametersCopy = { ...parameters };
               
        if (isChecked) {
          if (name === "100% Identity - Same length (recommanded)") {
            parametersCopy.annotationSection.removeSoft = false;
            parametersCopy.annotationSection.removeStrict = true;
          } else if (name === "100% Identity - lower length") {
            parametersCopy.annotationSection.removeStrict = false;
            parametersCopy.annotationSection.removeSoft = true;
          } else if (name === "Auto (get most relevant evidences)") {
            parametersCopy.annotationSection.evidenceFile = false;
            parametersCopy.annotationSection.evidenceAuto = true;
          } else if (name === "Evidence file") {
            parametersCopy.annotationSection.evidenceAuto = false;
            parametersCopy.annotationSection.evidenceFile = true;
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
                  <label>Protein evidence</label>
                  <div className="tooltipContainer">
                    <img src={HelpIcon} alt="help" className="helpIcon" />
                    <span className="helpSpan">Set of proteins used to locate few genes in the assembly. These genes are used to train the augustus gene model.</span>
                  </div>
                </div>
              </div>
              <div className="formElement">
                <SettingsFormElementInputRadio 
                      label="Auto (get most relevant evidences)" 
                      help="Automatically searches for and downloads proteins from the organism closest to the target species"  
                      checked={parameters.annotationSection.evidenceAuto} 
                      onChange={handleRadioChange}
                />
              </div>
              <div className="formElement">
                <SettingsFormElementInputRadio
                    disabled={false}
                    label="Evidence file" 
                    help="Select your own fasta file with the proteins of a related organism." 
                    checked={parameters.annotationSection.evidenceFile}
                    onChange={handleRadioChange}
                />
                <SettingsFormElementInputFile 
                  label="Evidence file"
                  disabled={!parameters.annotationSection.evidenceFile}
                  handleFileChange={handleFileChange}
                  value={parameters.annotationSection.evidenceFileList}
                />
              </div>
            </div>
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

           
        </fieldset>
    )
}