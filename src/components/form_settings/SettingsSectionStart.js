import { useState, useEffect } from "react";
import HelpIcon from "../../assets/help.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import SettingsFormElementInputText from "./SettingsFormElementInputText";
import SettingsFormElementInputFile from "./SettingsFormElementInputFile";

export default function SettingsSectionStart({ updateParameters, parameters }) {
  const [activeTab, setActiveTab] = useState();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (parameters.startSection.genome) {
      setActiveTab('Assembly');
    } else {
      setActiveTab('Sequencing');
    }
  }, [parameters.startSection.genome]);

  const toggleTab = (tab) => {
    const parametersCopy = { ...parameters };
    parametersCopy.startSection.sequencing = false;
    parametersCopy.startSection.genome = false;
    if (tab === "Sequencing"){
      parametersCopy.startSection.sequencing = true;
    }
    if (tab === "Assembly"){
      parametersCopy.startSection.genome = true;
    }
    updateParameters(parametersCopy);
    setActiveTab(tab);
  };

  const handleSequencingFilesChange = (e, index) => {
    e.preventDefault();
    const parametersCopy = { ...parameters };  
    if (index !== undefined) {
      parametersCopy.startSection.sequencingFilesList.splice(index, 1);
    } 
    else {
      const files = e.target.files;
      if (files) {
        parametersCopy.startSection.sequencingFilesList = Array.from(files);
      }
    }
    updateParameters(parametersCopy);
  };

  const handleTextAccessionsChange = (text) => {
    const parametersCopy = {...parameters}
    parametersCopy.startSection.sequencingAccessionsList = text.trim() !== '' ? text.trim().split("\n") : [];
    updateParameters(parametersCopy)
  }

  const handleGenomeFileChange = (e, index) => {
    e.preventDefault();
    const parametersCopy = { ...parameters };  
    if (index !== undefined) {
      parametersCopy.startSection.genomeFileList.splice(index, 1);
      parametersCopy.startSection.genomeFile = false;
      parametersCopy.startSection.genomeFileIsURL = false;
    } 
    else {
      const files = e.target.files;
      if (files) {
        parametersCopy.startSection.genomeFileList = Array.from(files);
        parametersCopy.startSection.genomeFile = true;
        parametersCopy.startSection.genomeFileIsURL = false;
        parametersCopy.startSection.sequencingFiles = false;
        parametersCopy.startSection.sequencingAccessions = false;
      }
    }
    updateParameters(parametersCopy);
  };

  const handleRadioChange = (name, isChecked) => {
    const parametersCopy = { ...parameters };
    if (isChecked) {
      if (name === "Sequencing file(s)"){
          parametersCopy.startSection.genomeFile = false;
          parametersCopy.startSection.sequencingFiles = true;
          parametersCopy.startSection.sequencingAccessions = false;
          parametersCopy.startSection.sequencing = true;
      } 
      else if (name === "SRA accessions"){
          parametersCopy.startSection.genomeFile = false;
          parametersCopy.startSection.sequencingAccessions = true;
          parametersCopy.startSection.sequencingFiles = false;
          parametersCopy.startSection.sequencing = true;
      } 
      else if (name === "Skip fastp"){
        parametersCopy.startSection.skipFastp = true;
      }
      else if (name === "Skip phix removing"){
        parametersCopy.startSection.skipPhix = true;
      }
    }
    else {
      if (name === "Skip fastp"){
        parametersCopy.startSection.skipFastp = false;
      }
      else if (name === "Skip phix removing"){
        parametersCopy.startSection.skipPhix = false;
      }
    }
    
    updateParameters(parametersCopy);
  };
  return (
      <div className="tabs-container">
        <div className="tabs-header">
          <div className={`tab ${activeTab === 'Sequencing' ? 'active-tab' : ''}`} onClick={() => toggleTab('Sequencing')}>Sequencing</div>
          <div className={`tab ${activeTab === 'Assembly' ? 'active-tab' : ''}`} onClick={() => toggleTab('Assembly')}>Assembly</div>
        </div>
        <div className="tabs-content">
          <div className={`tab-content ${activeTab === 'Sequencing' ? 'active-content' : ''}`}>
            <div className="formSection">
              <div className="sectionTitle">
                <label>Put your sequencing file(s) or SRA accession(s)</label>
              </div>
              <div className="formElement">
                <SettingsFormElementInputRadio
                  disabled={parameters.startSection.genome}
                  label="Sequencing file(s)" 
                  help="DNA sequencing FASTQ file(s). Please enter both the forward and reverse file for paird-end sequencing." 
                  checked={parameters.startSection.sequencingFiles} 
                  onChange={handleRadioChange}
                />
                <SettingsFormElementInputFile 
                  label="Sequencing file(s)"
                  disabled={!parameters.startSection.sequencingFiles}
                  handleFileChange={handleSequencingFilesChange}
                  value={parameters.startSection.sequencingFilesList}
                  allowMultiple={true}
                />
              </div>
              <div className="formElement">
                <SettingsFormElementInputRadio 
                  disabled={parameters.startSection.genome}
                  label="SRA accessions" 
                  help="SRA accession number of the input DNA sequencing data." 
                  checked={parameters.startSection.sequencingAccessions} 
                  onChange={handleRadioChange}
                />
                <SettingsFormElementInputText 
                  label="SRA accessions" 
                  disabled={!parameters.startSection.sequencingAccessions} 
                  onChange={handleTextAccessionsChange} 
                  text={parameters.startSection.sequencingAccessionsList}
                  type='textarea'
                />
              </div>
            </div>
            <div className="formSection">
              <div className="sectionTitle">
                <div className="labelTooltipWrapper">
                  <label>Advanced parameters</label>
                  <FontAwesomeIcon icon={expanded ? faAngleUp : faAngleDown} className="expand-icon" onClick={() => setExpanded(!expanded)}/>
                </div>
              </div>
              {expanded && (
                <div>
                  <div className="formElement">
                    <SettingsFormElementInputRadio 
                      label="Skip fastp" 
                      help="Fastp filters out low-quality reads in sequencing. If you have already refined your sequencing, you can skip this step." 
                      checked={parameters.startSection.skipFastp} 
                      onChange={handleRadioChange}
                    />
                  </div>
                  <div className="formElement">
                    <SettingsFormElementInputRadio 
                      label="Skip phix removing" 
                      help="Illumina sequencing is often carried out using phix virus to control quality. Eliminating reads that appear to be phix virus is good practice, but you can skip this step if you don't have Illumina sequencing." 
                      checked={parameters.startSection.skipPhix} 
                      onChange={handleRadioChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={`tab-content ${activeTab === 'Assembly' ? 'active-content' : ''}`}>
            <div className="formElement">
              <div className="radioLabel">
                <div className="labelTooltipWrapper">
                    <label>Assembly file</label>
                    <div className="tooltipContainer">
                        <img src={HelpIcon} alt="help" className="helpIcon"/>
                        <span className="helpSpan">Assembly FASTA file.</span>
                    </div>
                </div>
              </div>
              <SettingsFormElementInputFile 
                label="Genome file"
                handleFileChange={handleGenomeFileChange}
                value={parameters.startSection.genomeFileList}
              />
            </div>
          </div>
        </div>
      </div>
  )

}