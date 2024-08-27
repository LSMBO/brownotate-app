import { useState } from "react"
import axios from 'axios';
import HelpIcon from "../../assets/help.png";


export default function SettingsExcludedSpecies({ label, help, excludedSpeciesList, handleSetSpecies, removeSpecies, disabled }) {
    const [inputSpecies, setInputSpecies] = useState("")
    const [speciesNotFound, setSpeciesNotFound] = useState("")
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
      setInputSpecies(e.target.value)
    } 

  const speciesExists = async (inputSpecies) => {
      try {
          if (inputSpecies==='') {
              setSpeciesNotFound(" ");
              setErrorMsg(`Taxo \"${inputSpecies}\" not found.`);
          }
          else {
              const response = await axios.post('http://134.158.151.129:80/check_species_exists', { species: inputSpecies });
              setSpeciesNotFound("");
              return response.data.results;
          }
      } catch (error) {
          console.error('Error:', error);
          setSpeciesNotFound(inputSpecies);
          setErrorMsg(`Taxo \"${inputSpecies}\" not found.`);
          return false;
      }
  };

    const handleInputSubmit = async (e) => {
      e.preventDefault();
      const speciesFound = await speciesExists(inputSpecies);
      setInputSpecies('');
      if (speciesFound) {
        setErrorMsg('');
        handleSetSpecies(speciesFound);
      }
    }

    return (
        <div className="formElement">
          <div className="radioLabel">
            <div className="labelTooltipWrapper">
              <label>{label}</label>
              <div className="tooltipContainer">
                <img src={HelpIcon} alt="help" className="helpIcon" />
                <span className="helpSpan">{help}</span>
              </div>
            </div>
          </div>
          <div className="excludedSpecies">
            <div>
              <div className="inputAndButton">
                <input
                    className={!!errorMsg ? "t2_light error" : "t2_light"}
                    value={inputSpecies}
                    type="text"
                    placeholder="Enter your species ..."
                    onChange={handleChange}
                    disabled={disabled}
                />
                <button className="speciesInputBtn t1" disabled={disabled} onClick={(e) => handleInputSubmit(e)}>Add</button>
              </div>
              {errorMsg && <p className="error-message">{errorMsg}</p>}
            </div>
            <ul style={{ display: excludedSpeciesList.length === 0 ? "none" : "block" }}>
              {excludedSpeciesList.map((species, index) => (
                <li key={index}>
                  <button onClick={(e) => removeSpecies(e, index)}>X</button>
                  {species['scientific_name']} ({species['taxID']}){' '}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
      
}