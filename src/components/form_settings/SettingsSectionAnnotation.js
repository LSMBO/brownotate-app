import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import SettingsFormElementInputFile from "./SettingsFormElementInputFile";
import HelpIcon from "../../assets/help.png";


export default function SettingsSectionAnnotation({ enabled, updateParameters, parameters }) {
      const handleRadioChange = (name, isChecked) => {
        const parametersCopy = { ...parameters };
               
        if (isChecked) {
          if (name === "100% Identity - Same length (default)") {
            parametersCopy.annotationSection.removeSoft = false;
            parametersCopy.annotationSection.removeStrict = true;
          } else if (name === "100% Identity - lower length") {
            parametersCopy.annotationSection.removeStrict = false;
            parametersCopy.annotationSection.removeSoft = true;
          } else if (name === "Auto (get most relevant evidences)") {
            parametersCopy.annotationSection.evidenceFile = false;
            parametersCopy.annotationSection.evidenceAuto = true;
            parametersCopy.annotationSection.evidenceFileList = [];
          } else if (name === "File") {
            parametersCopy.annotationSection.evidenceAuto = false;
            parametersCopy.annotationSection.evidenceFile = true;
          } 
        }
        updateParameters(parametersCopy);
      };

      const handleFileChange = (event) => {
        const files = event.target.files;
    
        if (files) {
            const parametersCopy = { ...parameters };
            if (files.length <= 1) {
                parametersCopy.annotationSection.evidenceFileList = Array.from(files);
            } else {
                console.error("You can only select one file.");
                parametersCopy.annotationSection.evidenceFileList = [];
            }
            updateParameters(parametersCopy);
        }
    };

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Annotation (proteins prediction)</legend>
            <div className="formSection">
              <div className="sectionTitle">
                <label>Protein evidence</label>
                <div className="tooltipContainer">
                  <img src={HelpIcon} alt="help" className="helpIcon" />
                  <span className="helpSpan">Searches for a genome and, if unavailable, looks for a sequencing dataset.</span>
                </div>
              </div>
              <div className="formElement">
                <SettingsFormElementInputRadio 
                      label="Auto (get most relevant evidences)" 
                      help="Searches for a genome and, if unavailable, looks for a sequencing dataset."  
                      checked={parameters.annotationSection.evidenceAuto} 
                      onChange={handleRadioChange}
                />
              </div>
              <div className="formElement">
                <SettingsFormElementInputRadio 
                      label="File" 
                      help="Searches for a genome and, if unavailable, looks for a sequencing dataset."  
                      checked={parameters.annotationSection.evidenceFile} 
                      onChange={handleRadioChange}
                />
                <SettingsFormElementInputFile 
                      label="File"
                      help="Searches for a genome and, if unavailable, looks for a sequencing dataset." 
                      checked={true} 
                      onChange={handleRadioChange} 
                      handleFileChange={handleFileChange}
                />
              </div>
            </div>
            
            <div className="formSection">
            <div className="sectionTitle">
                <label>Remove duplicated sequence</label>
                <div className="tooltipContainer">
                  <img src={HelpIcon} alt="help" className="helpIcon" />
                  <span className="helpSpan">Searches for a genome and, if unavailable, looks for a sequencing dataset.</span>
                </div>
              </div>
              <div className="formElement">
                  <SettingsFormElementInputRadio label="100% Identity - Same length (default)" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.annotationSection.removeStrict} onChange={handleRadioChange}/>
              </div>
              <div className="formElement">
                  <SettingsFormElementInputRadio label="100% Identity - lower length" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.annotationSection.removeSoft} onChange={handleRadioChange}/>
              </div>
            </div>

           
        </fieldset>
    )
}