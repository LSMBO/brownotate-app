import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsSectionStart({ enabled, handleSetEnable, updateParameters, parameters }) {

  const handleRadioChange = (name, isChecked) => {
    const parametersCopy = { ...parameters };
      
    parametersCopy.startSection.auto = false;
    parametersCopy.startSection.genome = false;
    parametersCopy.startSection.sequencing = false;
      
    if (isChecked) {
      if (name === "Auto") {
        parametersCopy.startSection.auto = true;
        parametersCopy.dataSection.auto = true;
        parametersCopy.dataSection.genomeFile = false;
        parametersCopy.dataSection.sequencingFiles = false;
        parametersCopy.dataSection.sequencingFilesList = []
        parametersCopy.dataSection.sequencingAccessions = false;
        parametersCopy.dataSection.sequencingAccessionsList = [];
        parametersCopy.buscoSection.assembly = true;
      } else if (name === "Genome") {
        parametersCopy.startSection.genome = true;
        parametersCopy.dataSection.sequencingFiles = false;
        parametersCopy.dataSection.auto = true;
        parametersCopy.dataSection.sequencingFilesList = []
        parametersCopy.dataSection.sequencingAccessions = false;
        parametersCopy.dataSection.sequencingAccessionsList = [];
        parametersCopy.dataSection.illuminaOnly = false;
        parametersCopy.dataSection.excludedSRA = false;
        parametersCopy.dataSection.excludedSRAList = [];
        parametersCopy.buscoSection.assembly = false;

      } else if (name === "Sequencing") {
        parametersCopy.startSection.sequencing = true;
        parametersCopy.dataSection.genomeFile = false;
        parametersCopy.dataSection.auto = true;
        parametersCopy.buscoSection.assembly = true;
      }
    }
    else {
      if (name === "Genome") {
        parametersCopy.dataSection.genomeFile = false;
        parametersCopy.dataSection.genomeFileList = []
      } else if (name === "Sequencing") {
        parametersCopy.dataSection.sequencingFiles = false;
        parametersCopy.dataSection.sequencingFilesList = []
        parametersCopy.dataSection.sequencingAccessions = false;
        parametersCopy.dataSection.sequencingAccessionsList = [];
      }
    }
    if (!parametersCopy.startSection.auto && !parametersCopy.startSection.genome && !parametersCopy.startSection.sequencing) {
      handleSetEnable(name, true);
    }
    else {
      handleSetEnable(name, false);
    }
    
    updateParameters(parametersCopy);
  };

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Start</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Auto" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.startSection.auto} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Genome" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.startSection.genome} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Sequencing" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.startSection.sequencing} onChange={handleRadioChange}/>
            </div>
        </fieldset>
    )
}