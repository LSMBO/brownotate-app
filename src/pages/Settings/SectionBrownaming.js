import ExcludedTaxo from "./ExcludedTaxo";
import FormElementInputRadio from "./FormElementInputRadio";
import HelpIcon from "../../assets/help.png";

export default function SectionBrownaming({ disabled, updateParameters, parameters }) {
    const rankOptions = ["Species", "Species subgroup", "Species group", "Subgenus", "Genus", "Subtribe", "Tribe", "Subfamily", "Family", "Superfamily", "Parvorder", "Infraorder", "Suborder", "Order", "Superorder", "Subcohort", "Cohort", "Infraclass", "Subclass", "Class", "Superclass", "Subphylum", "Phylum", "Superphylum", "Subkingdom", "Kingdom", "Superkingdom"]

    const handleRadioChange = (name, isChecked) => {
        if (isChecked) {
            updateParameters({brownamingSection: {skip: true}});
        } else {
            updateParameters({brownamingSection: {skip: false}});
        }
    };

    const addExcludedTaxo = (taxo) => {
        const updatedTaxoList = [...parameters.brownamingSection.excludedTaxoList, taxo];
        updateParameters({brownamingSection: {excludedTaxoList: updatedTaxoList}});
    };
   

    const removeExcludedTaxo = (e, index) => {
      e.preventDefault();
      updateParameters({brownamingSection: {excludedTaxoList: parameters.brownamingSection.excludedTaxoList.filter((_, i) => i !== index)}});
  };


    const handleSetMaxRank = (e) => {
        updateParameters({brownamingSection: {highestRank: e.target.value}});
    };    
    
    return (
        <div className="parameters-section">
            <div className="form-element">
                <FormElementInputRadio 
                  label="Skip Brownaming" 
                  help="Skip the step that assigns names to each protein." 
                  checked={parameters.brownamingSection.skip} 
                  onChange={handleRadioChange}
                />
            </div>
            <ExcludedTaxo 
                label="Excluded species" 
                help="Taxonomies excluded from the brownaming search space." 
                excludedTaxoList={parameters.brownamingSection.excludedTaxoList}
                addExcludedTaxo={addExcludedTaxo} 
                removeExcludedTaxo={removeExcludedTaxo} 
                disabled={parameters.brownamingSection.skip}/>


            <div className="form-element">
                <div className="label-tooltip-wrapper">
                    <label>Highest taxa rank</label>
                    <div className="tooltip-container">
                        <img src={HelpIcon} alt="help" className="helpIcon"/>
                        <span className="help-span">Rank from which the blast comparison are stopped.</span>
                    </div>
                </div>
                <select className="t2_light" value={parameters.brownamingSection.highestRank || "Suborder"} onChange={handleSetMaxRank} disabled={parameters.brownamingSection.skip}>
                    {rankOptions.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                    ))}
                </select>    
            </div>        
        </div>
    )
}