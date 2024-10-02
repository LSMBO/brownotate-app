import SettingsExcludedSpecies from "./SettingsExcludedSpecies";
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import SettingsSelect from "./SettingsSelect";

export default function SettingsSectionBrownaming({ disabled, updateParameters, parameters }) {
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
        <fieldset disabled={disabled}>
            <legend className="t2_bold">Brownaming (proteins naming)</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Skip Brownaming" help="Skip the step that assigns names to each protein." checked={parameters.brownamingSection.skip} onChange={handleRadioChange}/>
            </div>
            <SettingsExcludedSpecies 
                label="Excluded species" 
                help="Taxonomies excluded from the brownaming search space." 
                excludedSpeciesList={parameters.brownamingSection.excludedSpeciesList} 
                handleSetSpecies={handleSetSpecies} 
                removeSpecies={removeSpecies} 
                disabled={parameters.brownamingSection.skip}/>
            <SettingsSelect 
                label="Highest taxa rank" 
                help="Rank from which the blast comparison are stopped." 
                options={rankOptions} 
                defaultOption="Suborder"
                handleSetMaxRank={handleSetMaxRank} 
                disabled={parameters.brownamingSection.skip}/>
        </fieldset>
    )
}