import { useState } from "react";
import HelpIcon from "../../assets/help.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import FormElementInputRadio from "./FormElementInputRadio";
import FormElementInputFile from "./FormElementInputFile";
import SequencingRuns from "./SequencingRuns";
import SequencingDetails from "../../components/SequencingDetails";

export default function SectionStart({ updateParameters, parameters }) {
  const [activeTab, setActiveTab] = useState(parameters.startSection.assembly ? "Assembly" : "Sequencing");
  const [expanded, setExpanded] = useState(false);

  const toggleTab = (tab) => {
    if (tab === "Sequencing"){
      updateParameters({startSection: {sequencing: true, assembly: false}});
    }
    if (tab === "Assembly"){
      updateParameters({startSection: {sequencing: false, assembly: true}});
    }
    setActiveTab(tab);
  };

  const handleSequencingFilesChange = (e, index) => {
    e.preventDefault();

    if (index !== undefined) {
      updateParameters({startSection: {sequencingFileList: parameters.startSection.sequencingFileList.filter((_, i) => i !== index)}});
    } 
    else {
      const files = e.target.files;
      if (files) {
        updateParameters({startSection: {sequencingFileList: Array.from(files)}});
      }
    }
  };

  const handleAssemblyFileChange = (e, index) => {
    e.preventDefault();
    if (index !== undefined) {
      updateParameters({startSection: {assemblyFile: null, assemblyAccession: []}});
    } else {
      const files = e.target.files;
      if (files) {
        updateParameters({startSection: {assemblyFile: files[0], assemblyAccession: files[0].name, sequencingFiles: false, sequencingRuns: false}});
      }
    }
  };  

  const handleRadioChange = (name, isChecked) => {
    if (isChecked) {
      if (name === "Run accession(s) (from NCBI SRA)") {
        updateParameters({startSection: {sequencing: true, assemblyFile: false, sequencingRuns: true, sequencingFiles: false, sequencingFileList: [] }});
      } else if (name === "Custom Sequencing file(s)") {
        updateParameters({startSection: {sequencing: true, assemblyFile: false, sequencingRuns: false, sequencingFiles: true }});
      } else if (name === "Skip fastp") {
        updateParameters({startSection: {skipFastp: true}});
      } else if (name === "Skip phix removing") {
        updateParameters({startSection: {skipPhix: true}});
      }
    } else {
      if (name === "Skip fastp") {
        updateParameters({startSection: {skipFastp: false}});
      } else if (name === "Skip phix removing") {
        updateParameters({startSection: {skipPhix: false}});
      }
    }
  };

  return (
      <div className="tabs-container">
        <div className="tabs-header">
          <div className={`tab ${activeTab === 'Sequencing' ? 'active-tab' : ''}`} onClick={() => toggleTab('Sequencing')}>Sequencing</div>
          <div className={`tab ${activeTab === 'Assembly' ? 'active-tab' : ''}`} onClick={() => toggleTab('Assembly')}>Assembly</div>
        </div>
        <div>
          <div className={`tab-content ${activeTab === 'Sequencing' ? 'active-content' : ''}`}>
            <div className="form-element">
              <FormElementInputRadio 
                disabled={parameters.startSection.assembly}
                label="Run accession(s) (from NCBI SRA)" 
                help="Identifier(s) of the sequencing run(s) from NCBI SRA (SRR... or ERR...)" 
                checked={parameters.startSection.sequencingRuns} 
                onChange={handleRadioChange}
              />
              <SequencingRuns 
                disabled={!parameters.startSection.sequencingRuns}
                /> 
            </div>    
            <div className="form-element">
              <div></div>
              {parameters.startSection.sequencingRunList.length > 0 && (
                <SequencingDetails runs={parameters.startSection.sequencingRunList} displaySpecies={true}/>
              )}
            </div>     
            <div className="form-element">
              <FormElementInputRadio
                disabled={parameters.startSection.assembly}
                label="Custom Sequencing file(s)" 
                help="DNA sequencing FASTQ file(s). Please enter both the forward and reverse file for paired-end sequencing." 
                checked={parameters.startSection.sequencingFiles} 
                onChange={handleRadioChange}
              />
              <FormElementInputFile 
                label="Sequencing file(s)"
                disabled={!parameters.startSection.sequencingFiles}
                handleFileChange={handleSequencingFilesChange}
                value={parameters.startSection.sequencingFileList}
                allowMultiple={true}
              />
            </div>
            <div className="expanded-label">
              <label>Advanced parameters</label>
              <FontAwesomeIcon icon={expanded ? faAngleUp : faAngleDown} className="expand-icon" onClick={() => setExpanded(!expanded)}/>
            </div>
            {expanded && (
              <div>
                <div className="form-element">
                  <FormElementInputRadio 
                    label="Skip fastp" 
                    help="Fastp filters out low-quality reads in sequencing. If you have already refined your sequencing, you can skip this step." 
                    checked={parameters.startSection.skipFastp} 
                    onChange={handleRadioChange}
                  />
                </div>
                <div className="form-element">
                  <FormElementInputRadio 
                    label="Skip phix removing" 
                    help="Illumina sequencing is often carried out using phix virus to control quality. Eliminating reads that appear to be phix virus is good practice, but you can skip this step if you don't have Illumina sequencing." 
                    checked={parameters.startSection.skipPhix} 
                    onChange={handleRadioChange}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className={`tab-content ${activeTab === 'Assembly' ? 'active-content' : ''}`}>
            <div className="form-element">
              <div className="radioLabel">
                <div className="label-tooltip-wrapper">
                    <label>Assembly file</label>
                    <div className="tooltip-container">
                        <img src={HelpIcon} alt="help" className="helpIcon"/>
                        <span className="help-span">Assembly FASTA file.</span>
                    </div>
                </div>
              </div>
              <FormElementInputFile 
                label="Assembly file"
                disabled={false}
                handleFileChange={handleAssemblyFileChange}
                value={parameters.startSection.assemblyAccession}
              />
            </div>
          </div>
        </div>
      </div>
  )

}