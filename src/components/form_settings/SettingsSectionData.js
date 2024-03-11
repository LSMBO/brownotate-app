import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import SettingsFormElementInputFile from "./SettingsFormElementInputFile";
import SettingsFormElementInputText from "./SettingsFormElementInputText";

export default function SettingsSectionData({ enabled, updateParameters, parameters }) {

    // dataSection: {
    //     auto: false,
    //     illuminaOnly : false,
    //     excludedSRA : false,
    //     excludedSRAList : [],
    //     genomeFile: false,
    //     genomeFileList: [],
    //     sequencingFiles : false,
    //     sequencingFilesList : [],
    //     sequencingAccessions : false,
    //     sequencingAccessionsList : []
    // }

    const handleRadioChange = (name, isChecked) => {
        const parametersCopy = {...parameters}
        if (isChecked) {
            if (name === "Genome file"){
                parametersCopy.dataSection.auto = false;
                parametersCopy.dataSection.sequencingFiles = false;
                parametersCopy.dataSection.sequencingAccessions = false;
                parametersCopy.dataSection.illuminaOnly = false;
                parametersCopy.dataSection.genomeFile = true;
                parametersCopy.dataSection.excludedSRA = false;
                parametersCopy.dataSection.excludedSRAList = [];
            }
            else if (name === "Sequencing file(s)"){
                parametersCopy.dataSection.auto = false;
                parametersCopy.dataSection.genomeFile = false;
                parametersCopy.dataSection.illuminaOnly = false;
                parametersCopy.dataSection.sequencingFiles = true;
                parametersCopy.dataSection.sequencingAccessions = false;
                parametersCopy.dataSection.sequencingAccessionsList = [];
                parametersCopy.dataSection.excludedSRA = false;
                parametersCopy.dataSection.excludedSRAList = [];
            } 
            else if (name === "SRA accessions"){
                parametersCopy.dataSection.auto = false;
                parametersCopy.dataSection.genomeFile = false;
                parametersCopy.dataSection.illuminaOnly = false;
                parametersCopy.dataSection.sequencingAccessions = true;
                parametersCopy.dataSection.sequencingFiles = false;
                parametersCopy.dataSection.sequencingFilesList = [];
                parametersCopy.dataSection.excludedSRA = false;
                parametersCopy.dataSection.excludedSRAList = [];
            } 
            else if (name === "Auto (get most relevant data)"){
                parametersCopy.dataSection.auto = true;
                parametersCopy.dataSection.genomeFile = false;
                parametersCopy.dataSection.sequencingFiles = false;
                parametersCopy.dataSection.sequencingAccessions = false;
                parametersCopy.dataSection.sequencingAccessionsList = [];
            } 
            else if (name === "Search only Illumina sequencing data"){
                parametersCopy.dataSection.illuminaOnly = true;
                parametersCopy.dataSection.auto = true;
                parametersCopy.dataSection.sequencingFiles = false;
                parametersCopy.dataSection.sequencingAccessions = false;
                parametersCopy.dataSection.sequencingAccessionsList = [];
            }
            else if (name === "Exclude SRA accessions"){
                parametersCopy.dataSection.excludedSRA = true;
                parametersCopy.dataSection.auto = true;
                parametersCopy.dataSection.sequencingFiles = false;
                parametersCopy.dataSection.sequencingAccessions = false;
                parametersCopy.dataSection.sequencingAccessionsList = [];
            }
        }
        else {
            if (name === "Auto (get most relevant data)") {
                parametersCopy.dataSection.auto = false;
                parametersCopy.dataSection.illuminaOnly = false;
                parametersCopy.dataSection.excludedSRA = false;
                parametersCopy.dataSection.excludedSRAList = [];
            }
            else if (name === "Genome file") {
                parametersCopy.dataSection.genomeFile = false;
                parametersCopy.dataSection.genomeFileList = []
            } 
            else if (name === "Sequencing file(s)") {
                parametersCopy.dataSection.sequencingFiles = false;
                parametersCopy.dataSection.sequencingFilesList = []
            } 
            else if (name === "SRA accessions") {
                parametersCopy.dataSection.sequencingAccessions = false;
                parametersCopy.dataSection.sequencingAccessionsList = []
            } 
            else if (name === "Search only Illumina sequencing data") {
                parametersCopy.dataSection.illuminaOnly = false;
            } 
            else if (name === "Exclude SRA accessions") {
                parametersCopy.dataSection.excludedSRA = false;
                parametersCopy.dataSection.excludedSRAList = []
            } 
        }
        updateParameters(parametersCopy)
    }

    const handleTextExcludedSRAChange = (text) => {
        const parametersCopy = {...parameters}
        parametersCopy.dataSection.excludedSRAList = text.trim() !== '' ? text.trim().split("\n") : [];
        updateParameters(parametersCopy)
    }

    const handleTextAccessionsChange = (text) => {
        const parametersCopy = {...parameters}
        parametersCopy.dataSection.sequencingAccessionsList = text.trim() !== '' ? text.trim().split("\n") : [];
        updateParameters(parametersCopy)
    }


    const handleGenomeFileChange = (event) => {
        const files = event.target.files;
      
        if (files) {
          const parametersCopy = { ...parameters };
          parametersCopy.dataSection.genomeFileList = Array.from(files);
          updateParameters(parametersCopy);
        }
      };

      const handleSequencingFilesChange = (event) => {
        const files = event.target.files;
      
        if (files) {
          const parametersCopy = { ...parameters };
          parametersCopy.dataSection.sequencingFilesList = Array.from(files);
          updateParameters(parametersCopy);
        }
      };

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Data</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio 
                        disabled={parameters.startSection.auto || parameters.startSection.sequencing}
                        label="Genome file" 
                        help="Searches for a genome and, if unavailable, looks for a sequencing dataset." 
                        checked={parameters.dataSection.genomeFile}
                        onChange={handleRadioChange}
                />
                <SettingsFormElementInputFile 
                        label="Genome file" 
                        checked={parameters.dataSection.genomeFile} 
                        handleFileChange={handleGenomeFileChange}
                />
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio
                        disabled={parameters.startSection.auto || parameters.startSection.genome}
                        label="Sequencing file(s)" 
                        help="Searches for a genome and, if unavailable, looks for a sequencing dataset." 
                        checked={parameters.dataSection.sequencingFiles} 
                        onChange={handleRadioChange}
                />
                <SettingsFormElementInputFile 
                        label="Sequencing file(s)" 
                        checked={parameters.dataSection.sequencingFiles} 
                        handleFileChange={handleSequencingFilesChange}
                        allowMultiple={true}
                />
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio 
                        disabled={parameters.startSection.auto || parameters.startSection.genome}
                        label="SRA accessions" 
                        help="Searches for a genome and, if unavailable, looks for a sequencing dataset." 
                        checked={parameters.dataSection.sequencingAccessions} 
                        onChange={handleRadioChange}
                />
                <SettingsFormElementInputText 
                        label="SRA accessions" 
                        checked={parameters.dataSection.sequencingAccessions} 
                        onChange={handleRadioChange}
                        onText={handleTextAccessionsChange} 
                        text={parameters.dataSection.sequencingAccessionsList}
                />
            </div>
            <div className="formElement">
               <SettingsFormElementInputRadio 
                        disabled={parameters.startSection.auto}
                        label="Auto (get most relevant data)" 
                        help="Searches for a genome and, if unavailable, looks for a sequencing dataset." 
                        checked={parameters.dataSection.auto || parameters.startSection.auto} 
                        onChange={handleRadioChange}
                />
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio 
                        disabled={parameters.startSection.genome}
                        label="Search only Illumina sequencing data" 
                        help="Searches for a genome and, if unavailable, looks for a sequencing dataset." 
                        checked={parameters.dataSection.illuminaOnly} 
                        onChange={handleRadioChange}
                />
            </div>
            <div className="formElement">
                <SettingsFormElementInputRadio 
                        disabled={parameters.startSection.genome}
                        label="Exclude SRA accessions" 
                        help="Searches for a genome and, if unavailable, looks for a sequencing dataset." 
                        checked={parameters.dataSection.excludedSRA} 
                        onChange={handleRadioChange}
                />
                <SettingsFormElementInputText 
                        label="Exclude SRA accessions" 
                        checked={parameters.dataSection.excludedSRA} 
                        onChange={handleRadioChange} 
                        onText={handleTextExcludedSRAChange} 
                        text={parameters.dataSection.excludedSRAList}
                />
            </div>
        </fieldset>
    )
}