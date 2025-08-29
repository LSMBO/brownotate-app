import { useState } from "react"
import axios from 'axios';
import HelpIcon from "../../assets/help.png";
import CONFIG from "../../config";

export default function ExcludedTaxo({ label, help, excludedTaxoList, addExcludedTaxo, removeExcludedTaxo, disabled }) {
    const [inputTaxo, setInputTaxo] = useState("")
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
      setInputTaxo(e.target.value)
    } 

  const taxoExists = async (inputTaxo) => {
      try {
          if (inputTaxo==='') {
              setErrorMsg(`Taxo "${inputTaxo}" not found.`);
          }
          else {
              const response = await axios.post(`${CONFIG.API_BASE_URL}/check_species_exists`, { species: inputTaxo });
              setErrorMsg(null);
              return response.data.results;
          }
      } catch (error) {
          console.error('Error:', error);
          setErrorMsg(`Taxo "${inputTaxo}" not found.`);
          return false;
      }
  };

    const handleInputSubmit = async (e) => {
      e.preventDefault();
      const speciesFound = await taxoExists(inputTaxo);
      setInputTaxo('');
      if (speciesFound) {
        setErrorMsg(null);
        addExcludedTaxo(speciesFound);
      }
    }

    return (
        <div className="form-element">
          <div className="label-tooltip-wrapper">
            <label>{label}</label>
            <div className="tooltip-container">
              <img src={HelpIcon} alt="help" className="helpIcon" />
              <span className="help-span">{help}</span>
            </div>
          </div>
          <div> 
            <div className="exclude-species">
              <input
                  className={!!errorMsg ? "t2_light error" : "t2_light"}
                  value={inputTaxo}
                  type="text"
                  placeholder="Enter your species ..."
                  onChange={handleChange}
                  disabled={disabled}
              />
              <button className="speciesInputBtn t1" disabled={disabled} onClick={(e) => handleInputSubmit(e)}>Add</button>
            </div>
            {errorMsg && <div className="error-message">{errorMsg}</div>}
            <ul style={{ display: excludedTaxoList.length === 0 ? "none" : "block" }}>
              {excludedTaxoList.map((species, index) => (
                <li key={index}>
                  <button className="delete-btn" onClick={(e) => removeExcludedTaxo(e, index)}>X</button>
                  {species['scientific_name']} ({species['taxid']}){' '}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
      
}