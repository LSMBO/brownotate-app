import { useEffect, useRef } from 'react';
import ExcludedTaxo from "./ExcludedTaxo";
import FormElementInputRadio from "./FormElementInputRadio";
import HelpIcon from "../../assets/help.png";

export default function SectionBrownaming({ disabled, updateParameters, parameters, showSkipOption = true }) {
    const autoInitializedLineageRef = useRef(null);

    const handleRadioChange = (name, isChecked) => {
        updateParameters({brownamingSection: {[name]: isChecked}});
    };

    const addExcludedTaxo = (taxo) => {
        const updatedTaxoList = [...parameters.brownamingSection.excludedTaxoList, {scientific_name: taxo.scientific_name, taxid: taxo.taxid}];
        updateParameters({brownamingSection: {excludedTaxoList: updatedTaxoList}});
    };
   

    const removeExcludedTaxo = (e, index) => {
      e.preventDefault();
      updateParameters({brownamingSection: {excludedTaxoList: parameters.brownamingSection.excludedTaxoList.filter((_, i) => i !== index)}});
  };


    const handleSetLastTaxid = (e) => {
        const value = e.target.value;
        updateParameters({brownamingSection: {lastTaxid: value === "" ? null : parseInt(value)}});
    };

    const lineage = parameters.species?.lineage || [];    
    const lineageSignature = lineage.map((taxon) => `${taxon.taxonId}:${taxon.rank}`).join('|');

    useEffect(() => {
        if (!lineage.length) {
            autoInitializedLineageRef.current = null;
            return;
        }

        if (autoInitializedLineageRef.current === lineageSignature) {
            return;
        }

        autoInitializedLineageRef.current = lineageSignature;

        if (parameters.brownamingSection.lastTaxid) {
            return;
        }

        const familyTaxon = lineage.find((taxon) => String(taxon.rank || '').toLowerCase() === 'family');
        if (familyTaxon?.taxonId) {
            updateParameters({ brownamingSection: { lastTaxid: familyTaxon.taxonId } });
        }
    }, [lineage, lineageSignature, parameters.brownamingSection.lastTaxid, updateParameters]);
    
    return (
        <div className="parameters-section">
            {showSkipOption && (
                <div className="form-element">
                    <FormElementInputRadio 
                      name="skip"
                      label="Skip" 
                      help="Skip the step that assigns names to each protein." 
                      checked={parameters.brownamingSection.skip} 
                      onChange={handleRadioChange}
                    />
                </div>
            )}
            <ExcludedTaxo 
                label="Excluded species" 
                help="Taxonomies excluded from the brownaming search space." 
                excludedTaxoList={parameters.brownamingSection.excludedTaxoList}
                addExcludedTaxo={addExcludedTaxo} 
                removeExcludedTaxo={removeExcludedTaxo} 
                disabled={parameters.brownamingSection.skip}/>

            <div className="form-element">
                <div className="label-tooltip-wrapper">
                    <label>Taxonomic Expansion Limit</label>
                    <div className="tooltip-container">
                        <img src={HelpIcon} alt="help" className="helpIcon"/>
                        <span className="help-span">Stops sequence comparisons once the selected taxonomic level is reached.</span>
                    </div>
                </div>
                <select 
                    className="t2_light" 
                    value={parameters.brownamingSection.lastTaxid || ""} 
                    onChange={handleSetLastTaxid} 
                    disabled={parameters.brownamingSection.skip || lineage.length === 0}
                >
                    <option value="">Select a taxonomic level</option>
                    {lineage.map((taxon, index) => (
                        <option key={index} value={taxon.taxonId}>
                            {taxon.scientificName} (taxID: {taxon.taxonId} | rank: {taxon.rank})
                        </option>
                    ))}
                </select>
            </div>
            <div className='form-element'>
                <FormElementInputRadio 
                    name="excludeTrembl"
                    label="Exclude trEMBL from search space" 
                    help="Exclude trEMBL sequences from the sequence comparison search space. Look only at SwissProt sequences." 
                    checked={parameters.brownamingSection.excludeTrembl} 
                    onChange={handleRadioChange}
                />                
            </div>
        </div>
    )
}