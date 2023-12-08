import { useState } from "react"
import SpeciesInput from "../SpeciesInput";
import HelpIcon from "../../assets/help.png";


export default function SettingsExcludedSpecies({ label, help, excludedSpeciesList, handleSetSpecies, removeSpecies }) {
    const [errorMsg, setErrorMsg] = useState("");

    const handleSetErrorMsg = (message) => {
        setErrorMsg(message);
    }


    return (
        <div className="formElement">
          <div className="radioLabel">
            <label>{label}</label>
            <div className="tooltipContainer">
              <img src={HelpIcon} alt="help" className="helpIcon" />
              <span className="helpSpan">{help}</span>
            </div>
          </div>
          <div className="excludedSpecies">
            <div className="inputAndError">
              <SpeciesInput
                button="Add"
                handleSetLoadedSpecies={handleSetSpecies}
                handleSetErrorMsg={handleSetErrorMsg}
              />
              {errorMsg && <p className="error-message">{errorMsg}</p>}
            </div>
            <ul style={{ display: excludedSpeciesList.length === 0 ? "none" : "block" }}>
              {excludedSpeciesList.map((species, index) => (
                <li key={index}>
                  {species[0]} ({species[1]}){' '}
                  <button onClick={(e) => removeSpecies(e, index)}>X</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
      
}