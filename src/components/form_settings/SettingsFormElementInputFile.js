import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsFormElementInputFile({ label, checked, handleFileChange, allowMultiple }) {
    return (
        <div className="formElement">
            <input
                  className="t1_light"
                  type="file"
                  disabled={!checked}
                  name={label.toLowerCase().replace(' ', '_')}
                  accept=".fastq, .fq, .fasta, .fna, .fa"
                  {...(allowMultiple && { multiple: true })}
                  onChange={handleFileChange}
              />
              
        </div>
        
    )
}
