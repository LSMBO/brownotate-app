import SettingsExcludedSpecies from "./SettingsExcludedSpecies";
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import SettingsSelect from "./SettingsSelect";

export default function SettingsSectionBrownaming({ enabled, updateParameters, parameters }) {
    const rankOptions = ["Species", "Species subgroup", "Species group", "Subgenus", "Genus", "Subtribe", "Tribe", "Subfamily", "Family", "Superfamily", "Parvorder", "Infraorder", "Suborder", "Order", "Superorder", "Subcohort", "Cohort", "Infraclass", "Subclass", "Class", "Superclass", "Subphylum", "Phylum", "Superphylum", "Subkingdom", "Kingdom", "Superkingdom"]

    const handleRadioChange = (name, isChecked) => {
        const parametersCopy = { ...parameters };
        if (name === "Skip Brownaming"){
          if (isChecked) {
            parametersCopy.brownamingSection.skip = true

          }
          else {
            parametersCopy.brownamingSection.skip = false
          }
        }
        updateParameters(parametersCopy);
    };


    const handleSetSpecies = (species) => {
        const parametersCopy = { ...parameters };
        parametersCopy.brownamingSection.excludedSpeciesList.push(species)
        updateParameters(parametersCopy);
    };
   

    const removeSpecies = (e, index) => {
      e.preventDefault();
      const parametersCopy = { ...parameters };
      parametersCopy.brownamingSection.excludedSpeciesList.splice(index, 1);
      updateParameters(parametersCopy);
  };
  

    const handleSetMaxRank = (value) => {
      const parametersCopy = { ...parameters };
      parametersCopy.brownamingSection.highestRank = value;
      updateParameters(parametersCopy);
  };

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Brownaming (proteins naming)</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Skip Brownaming" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={parameters.brownamingSection.skip} onChange={handleRadioChange}/>
            </div>
            <SettingsExcludedSpecies label="Excluded species" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." excludedSpeciesList={parameters.brownamingSection.excludedSpeciesList} handleSetSpecies={handleSetSpecies} removeSpecies={removeSpecies} isEnable={!parameters.brownamingSection.skip}/>
            <SettingsSelect label="Highest taxa rank" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." options={rankOptions} defaultOption="Suborder" handleSetMaxRank={handleSetMaxRank} isEnable={!parameters.brownamingSection.skip}/>
        </fieldset>
    )
}