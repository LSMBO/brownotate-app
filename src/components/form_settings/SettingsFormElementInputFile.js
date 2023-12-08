import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsFormElementInputFile({ label, help, checked, onChange }) {

    return (
        <div className="formElement">
            <SettingsFormElementInputRadio label={label} help={help} checked={checked} onChange={onChange}/>
            <input
                  className="t1_light"
                  type="file"
                  disabled={!checked}
                  name={label.toLowerCase().replace(' ', '_')}
                  accept=".fastq, .fq, .fasta, .fna, .fa"
                  multiple
              />
        </div>
        
    )
}
