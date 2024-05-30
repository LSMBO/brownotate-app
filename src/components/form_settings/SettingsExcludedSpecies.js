import { useState } from "react"
import axios from 'axios';
import HelpIcon from "../../assets/help.png";


export default function SettingsExcludedSpecies({ label, help, excludedSpeciesList, handleSetSpecies, removeSpecies, disabled }) {
    const [inputValue, setInputValue] = useState("")
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e) => {
      setInputValue(e.target.value)
    } 

    const handleInputSubmit = (inputValue, e) => {
      e.preventDefault();
      axios.post('http://localhost:5000/run_species_exists', { argument: inputValue })
        .then(response => {
            const lastLine = response.data.split('\n').slice(-2)[0];
            if (lastLine === `Taxo \"${inputValue}\" not found.`) {
                setErrorMsg(lastLine)

            } else {
              setErrorMsg('')
                handleSetSpecies(lastLine.split(';'))
            }
        })
        .catch(error => {
            console.error('Error:', error);
        })
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
                    value={inputValue}
                    type="text"
                    placeholder="Enter your species ..."
                    onChange={handleChange}
                    disabled={disabled}
                />
                <button className="speciesInputBtn t1" disabled={disabled} onClick={(e) => handleInputSubmit(inputValue, e)}>Add</button>
              </div>
              {errorMsg && <p className="error-message">{errorMsg}</p>}
            </div>
            <ul style={{ display: excludedSpeciesList.length === 0 ? "none" : "block" }}>
              {excludedSpeciesList.map((species, index) => (
                <li key={index}>
                  <button onClick={(e) => removeSpecies(e, index)}>X</button>
                  {species[0]} ({species[1]}){' '}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
      
}