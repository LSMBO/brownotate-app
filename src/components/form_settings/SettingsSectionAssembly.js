import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsSectionAssembly({ enabled, updateParameters, parameters }) {

      const handleRadioChange = (name, isChecked) => {
        const parametersCopy = { ...parameters };
                    
        if (isChecked) {
          if (name === "Skip fastp") {
            parametersCopy.assemblySection.skipFastp = true;
          } else if (name === "Skip phix removing") {
            parametersCopy.assemblySection.skipPhix = true;
          }
        }
        else {
            if (name === "Skip fastp") {
                parametersCopy.assemblySection.skipFastp = false;
              } else if (name === "Skip phix removing") {
                parametersCopy.assemblySection.skipPhix = false;
              }
        }
        updateParameters(parametersCopy);
      };

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Assembly</legend>
            <div className="formElement">
              <SettingsFormElementInputRadio label="Skip fastp" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.assemblySection.skipFastp} onChange={handleRadioChange}/>
            </div>
            <div className="formElement">
              <SettingsFormElementInputRadio label="Skip phix removing" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.assemblySection.skipPhix} onChange={handleRadioChange}/>
            </div>
        </fieldset>
    )
}