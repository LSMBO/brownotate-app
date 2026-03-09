import FormElementInputRadio from "./FormElementInputRadio";

export default function SectionAssembly({ updateParameters, parameters }) {

      const handleRadioChange = (name, isChecked) => {
        if (isChecked) {
          if (name === "Run fastp") {
            updateParameters({assemblySection: {runFastp: true}});
          } else if (name === "Run Bowtie2") {
            updateParameters({assemblySection: {runBowtie2: true}});
          }
        } else {
          if (name === "Run fastp") {
            updateParameters({assemblySection: {runFastp: false}});
          } else if (name === "Run Bowtie2") {
            updateParameters({assemblySection: {runBowtie2: false}});
          }
        }
      };

      const getAssemblerMessage = () => {
        if (parameters.assemblySection.canu) {
          return "Your assembly will be done by CANU because your sequencing data uses long-read technology (PacBio or Nanopore), which is optimized for this assembler.";
        } else {
          return "Your assembly will be done by Megahit because your sequencing data uses short-read technology (Illumina or similar), which is optimized for this assembler.";
        }
      };

    return (
      <div className="parameters-section">
        {parameters.startSection.sequencing && (
          <p className='form-warning'>
            <i>{getAssemblerMessage()}</i>
          </p>
        )}
        
        {parameters.assemblySection.megahit && (
          <div className="form-element">
            <div className="label-tooltip-wrapper">
              <label>Quality control preprocessing</label>
            </div>
            <div>
                <FormElementInputRadio 
                  label="Run fastp" 
                  help="Fastp filters out low-quality reads. For long reads (PacBio/Nanopore), this step is skipped automatically as they require different QC tools. For short reads, uncheck if you have already refined your sequencing." 
                  checked={parameters.assemblySection.runFastp} 
                  onChange={handleRadioChange}
                />
                <FormElementInputRadio 
                  label="Run Bowtie2" 
                  help="Bowtie2 removes PhiX contamination commonly found in Illumina sequencing. Uncheck if you don't have Illumina sequencing or have already removed PhiX." 
                  checked={parameters.assemblySection.runBowtie2} 
                  onChange={handleRadioChange}
                />
            </div>
          </div>
        )}
      </div>
    )
}