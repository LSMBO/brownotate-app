import FormElementInputRadio from "./FormElementInputRadio";
import FormElementInputFile from "./FormElementInputFile";
import HelpIcon from "../../assets/help.png";

export default function Augustus({ updateParameters, parameters }) {

  const handleRadioChange = (name, isChecked) => {
    if (isChecked) {
      if (name === "Automatic evidence selection") {
        updateParameters({annotationSection: {autoEvidence: true, customEvidence: false, customEvidenceFileList: [] }});
      } else if (name === "Custom evidence file") {
        updateParameters({annotationSection: {autoEvidence: false, customEvidence: true }});
      }
    }
  };

const handleFileChange = (e, index) => {
    e.preventDefault();

    if (index !== undefined) {
      updateParameters({annotationSection: {customEvidenceFileList: parameters.annotationSection.customEvidenceFileList.filter((_, i) => i !== index)}});
    } 
    else {
      const files = e.target.files;
      if (files) {
        updateParameters({annotationSection: {customEvidenceFileList: Array.from(files)}});
      }
    }
  };

  return (
    <div className="parameters-section">
        <div className="form-element">
            <div className="label-tooltip-wrapper">
                <label>Evidence proteins</label>
                <div className="tooltip-container">
                    <img src={HelpIcon} alt="help" className="helpIcon" />
                    <span className="help-span">Set of proteins used to locate few genes in the assembly. These genes are used to train the augustus gene model.</span>
                </div>
            </div>
            <div></div>
        </div>
        <div className="form-element">
              <FormElementInputRadio
                  disabled={false}
                  label="Automatic evidence selection" 
                  help="Selects automatically the proteins of the closest related organism from NCBI, Uniprot and Ensembl databases and concatenates them." 
                  checked={parameters.annotationSection.autoEvidence}
                  onChange={handleRadioChange}
              />
              <div></div>
        </div>        
        <div className="form-element">
              <FormElementInputRadio
                  disabled={false}
                  label="Custom evidence file"
                  help="Select your own fasta file(s) with the proteins of a related organism. If several files are selected, they will be concatenated." 
                  checked={parameters.annotationSection.customEvidence}
                  onChange={handleRadioChange}
              />
              <FormElementInputFile 
                label="Evidence file"
                disabled={!parameters.annotationSection.customEvidence}
                handleFileChange={handleFileChange}
                value={parameters.annotationSection.customEvidenceFileList}
                allowMultiple={true}
              />
        </div>        
    </div>
  )
}