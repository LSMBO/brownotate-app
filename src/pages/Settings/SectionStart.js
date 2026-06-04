import { useState, useEffect } from "react";
import HelpIcon from "../../assets/help.png";
import FormElementInputRadio from "./FormElementInputRadio";
import FormElementInputFile from "./FormElementInputFile";
import FormElementSelect from "./FormElementSelect";
import SequencingRuns from "./SequencingRuns";
import RnaSequencingRuns from "./RnaSequencingRuns";
import SequencingDetails from "../../components/SequencingDetails";

export default function SectionStart({ updateParameters, parameters }) {
  const initTab = parameters.startSection.assembly
    ? "Assembly"
    : parameters.startSection.rnaSequencing
    ? "RNA Sequencing"
    : "DNA Sequencing";
  const [activeTab, setActiveTab] = useState(initTab);

  useEffect(() => {
    if (parameters.startSection.sequencingRuns && parameters.startSection.sequencingRunList.length > 0) {
      const firstRun = parameters.startSection.sequencingRunList[0];
      const platform = firstRun.platform || "";
      updateParameters({ startSection: { platform } });
    }
  }, [parameters.startSection.sequencingRunList]);

  const platformOptions = [
    { value: "", label: "Select platform" },
    { value: "ILLUMINA", label: "ILLUMINA" },
    { value: "BGISEQ", label: "BGISEQ" },
    { value: "ION TORRENT", label: "ION TORRENT" },
    { value: "PACBIO_SMRT", label: "PACBIO SMRT" },
    { value: "OXFORD_NANOPORE", label: "OXFORD NANOPORE" },
  ];

  const toggleTab = (tab) => {
    if (tab === "DNA Sequencing") {
      updateParameters({ startSection: { sequencing: true, assembly: false, rnaSequencing: null } });
    } else if (tab === "Assembly") {
      updateParameters({ startSection: { sequencing: false, assembly: true, rnaSequencing: null } });
    } else if (tab === "RNA Sequencing") {
      updateParameters({ startSection: { sequencing: false, assembly: false, rnaSequencing: true } });
    }
    setActiveTab(tab);
  };

  const handleSequencingFilesChange = (e, index) => {
    e.preventDefault();
    if (index !== undefined) {
      updateParameters({
        startSection: {
          sequencingFileList: parameters.startSection.sequencingFileList.filter((_, i) => i !== index),
        },
      });
    } else {
      const files = e.target.files;
      if (files) {
        updateParameters({ startSection: { sequencingFileList: Array.from(files) } });
      }
    }
  };

  const handleRnaSequencingFilesChange = (e, index) => {
    e.preventDefault();
    if (index !== undefined) {
      updateParameters({
        startSection: {
          rnaSequencingFileList: parameters.startSection.rnaSequencingFileList.filter((_, i) => i !== index),
        },
      });
    } else {
      const files = e.target.files;
      if (files) {
        updateParameters({ startSection: { rnaSequencingFileList: Array.from(files) } });
      }
    }
  };

  const handleAssemblyFileChange = (e, index) => {
    e.preventDefault();
    if (index !== undefined) {
      updateParameters({ startSection: { assemblyFile: null, assemblyAccession: [] } });
    } else {
      const files = e.target.files;
      if (files) {
        updateParameters({
          startSection: {
            assemblyFile: files[0],
            assemblyAccession: files[0].name,
            sequencingFiles: false,
            sequencingRuns: false,
          },
        });
      }
    }
  };

  const handleRadioChange = (name, isChecked) => {
    if (isChecked) {
      if (name === "Run accession(s) (from NCBI SRA)") {
        updateParameters({
          startSection: {
            sequencing: true,
            assemblyFile: false,
            sequencingRuns: true,
            sequencingFiles: false,
            sequencingFileList: [],
          },
        });
      } else if (name === "Custom Sequencing file(s)") {
        updateParameters({
          startSection: {
            sequencing: true,
            assemblyFile: false,
            sequencingRuns: false,
            sequencingFiles: true,
          },
        });
      }
    }
  };

  const handleRnaRadioChange = (name, isChecked) => {
    if (isChecked) {
      if (name === "RNA Run accession(s) (from NCBI SRA)") {
        updateParameters({
          startSection: {
            rnaSequencing: true,
            rnaSequencingRuns: true,
            rnaSequencingFiles: false,
            rnaSequencingFileList: [],
          },
        });
      } else if (name === "Custom RNA Sequencing file(s)") {
        updateParameters({
          startSection: {
            rnaSequencing: true,
            rnaSequencingRuns: false,
            rnaSequencingFiles: true,
          },
        });
      }
    }
  };

  const handlePlatformChange = (value) => {
    updateParameters({ startSection: { platform: value } });
  };

  const handleRnaPlatformChange = (value) => {
    updateParameters({ startSection: { rnaSequencingPlatform: value } });
  };

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <div className={`tab ${activeTab === "DNA Sequencing" ? "active-tab" : ""}`} onClick={() => toggleTab("DNA Sequencing")}>DNA Sequencing</div>
        <div className={`tab ${activeTab === "Assembly" ? "active-tab" : ""}`} onClick={() => toggleTab("Assembly")}>Assembly</div>
        <div className={`tab ${activeTab === "RNA Sequencing" ? "active-tab" : ""}`} onClick={() => toggleTab("RNA Sequencing")}>RNA Sequencing</div>
      </div>
      <div>
        <div className={`tab-content ${activeTab === "DNA Sequencing" ? "active-content" : ""}`}>
          <div className="form-element">
            <FormElementInputRadio
              disabled={parameters.startSection.assembly}
              label="Run accession(s) (from NCBI SRA)"
              help="Identifier(s) of the sequencing run(s) from NCBI SRA (SRR... or ERR...)"
              checked={parameters.startSection.sequencingRuns}
              onChange={handleRadioChange}
            />
            <SequencingRuns disabled={!parameters.startSection.sequencingRuns} />
          </div>
          <div className="form-element">
            <div></div>
            {parameters.startSection.sequencingRunList.length > 0 && (
              <SequencingDetails runs={parameters.startSection.sequencingRunList} displaySpecies={true} />
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
          <div className="form-element">
            <FormElementSelect
              label="Sequencing platform"
              help="Select the sequencing platform used to generate the data. This will determine the assembly strategy (Canu for long reads, Megahit for short reads)."
              options={platformOptions}
              value={parameters.startSection.platform}
              onChange={handlePlatformChange}
              disabled={parameters.startSection.sequencingRuns}
            />
          </div>
        </div>

        <div className={`tab-content ${activeTab === "Assembly" ? "active-content" : ""}`}>
          <div className="form-element">
            <div className="radioLabel">
              <div className="label-tooltip-wrapper">
                <label>Assembly file</label>
                <div className="tooltip-container">
                  <img src={HelpIcon} alt="help" className="helpIcon" />
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

        <div className={`tab-content ${activeTab === "RNA Sequencing" ? "active-content" : ""}`}>
          <div className="form-element">
            <FormElementInputRadio
              label="RNA Run accession(s) (from NCBI SRA)"
              help="Identifier(s) of the RNA-seq run(s) from NCBI SRA (SRR... or ERR...)"
              checked={parameters.startSection.rnaSequencingRuns}
              onChange={handleRnaRadioChange}
            />
            <RnaSequencingRuns disabled={!parameters.startSection.rnaSequencingRuns} />
          </div>
          <div className="form-element">
            <div></div>
            {parameters.startSection.rnaSequencingRunList.length > 0 && (
              <SequencingDetails runs={parameters.startSection.rnaSequencingRunList} displaySpecies={true} />
            )}
          </div>
          <div className="form-element">
            <FormElementInputRadio
              label="Custom RNA Sequencing file(s)"
              help="RNA-seq FASTQ file(s). Please enter both the forward and reverse file for paired-end sequencing."
              checked={parameters.startSection.rnaSequencingFiles}
              onChange={handleRnaRadioChange}
            />
            <FormElementInputFile
              label="RNA Sequencing file(s)"
              disabled={!parameters.startSection.rnaSequencingFiles}
              handleFileChange={handleRnaSequencingFilesChange}
              value={parameters.startSection.rnaSequencingFileList}
              allowMultiple={true}
            />
          </div>
          <div className="form-element">
            <FormElementSelect
              label="Sequencing platform"
              help="Select the RNA-seq sequencing platform."
              options={platformOptions}
              value={parameters.startSection.rnaSequencingPlatform}
              onChange={handleRnaPlatformChange}
              disabled={parameters.startSection.rnaSequencingRuns}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
