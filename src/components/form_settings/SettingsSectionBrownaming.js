import { useState, useEffect } from "react";
import SettingsExcludedSpecies from "./SettingsExcludedSpecies";
import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";
import SettingsSelect from "./SettingsSelect";

export default function SettingsSectionBrownaming({ enabled, updateFormData }) {
    const rankOptions = ["Species", "Species subgroup", "Species group", "Subgenus", "Genus", "Subtribe", "Tribe", "Subfamily", "Family", "Superfamily", "Parvorder", "Infraorder", "Suborder", "Order", "Superorder", "Subcohort", "Cohort", "Infraclass", "Subclass", "Class", "Superclass", "Subphylum", "Phylum", "Superphylum", "Subkingdom", "Kingdom", "Superkingdom"]

    const [sectionChecked, setSectionChecked] = useState({
        brownamingSection: {
          skip: false,
          excludedSpeciesList: [],
          highestRank: null
        }
      });


    useEffect(() => {
        if (!enabled) {
            setSectionChecked({
              brownamingSection: {
                skip: false,
                excludedSpeciesList: [],
                highestRank: null
              }
            });
        }
      }, [enabled]);
    

    const handleRadioChange = (name, isChecked) => {
        const sectionCheckedCopy = { ...sectionChecked };
        if (name === "Skip Brownaming"){
          if (isChecked) {
            sectionCheckedCopy.brownamingSection.skip = true
          }
          else {
            sectionCheckedCopy.brownamingSection.skip = false
          }
        }
        setSectionChecked(sectionCheckedCopy);
        updateFormData(sectionCheckedCopy);
    };


    const handleSetSpecies = (species) => {
        const sectionCheckedCopy = { ...sectionChecked };
        sectionCheckedCopy.brownamingSection.excludedSpeciesList.push(species)
        setSectionChecked(sectionCheckedCopy);
        updateFormData(sectionCheckedCopy);
    };
   

    const removeSpecies = (e, index) => {
      e.preventDefault();
      const sectionCheckedCopy = { ...sectionChecked };
      sectionCheckedCopy.brownamingSection.excludedSpeciesList.splice(index, 1);
      setSectionChecked(sectionCheckedCopy);
      updateFormData(sectionCheckedCopy);
  };
  

    const handleSetMaxRank = (value) => {
      const sectionCheckedCopy = { ...sectionChecked };
      sectionCheckedCopy.brownamingSection.highestRank = value;
      setSectionChecked(sectionCheckedCopy);
      updateFormData(sectionCheckedCopy);
  };

    return (
        <fieldset disabled={!enabled}>
            <legend className="t1_bold">Brownaming (proteins naming)</legend>
            <div className="formElement">
                <SettingsFormElementInputRadio label="Skip Brownaming" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." checked={sectionChecked.brownamingSection.skip} onChange={handleRadioChange}/>
            </div>
            <SettingsExcludedSpecies label="Excluded species" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." excludedSpeciesList={sectionChecked.brownamingSection.excludedSpeciesList} handleSetSpecies={handleSetSpecies} removeSpecies={removeSpecies}/>
            <SettingsSelect label="Highest taxa rank" help="Searches for a genome and, if unavailable, looks for a sequencing dataset." options={rankOptions} defaultOption="Order" handleSetMaxRank={handleSetMaxRank}/>
        </fieldset>
    )
}