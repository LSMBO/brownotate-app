import { useState } from "react"
import SpeciesInput from "../SpeciesInput";

export default function SettingsExcludedSpecies() {
    const [excludedSpeciesList, setExcludedSpeciesList] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSetSpecies = (species) => {
        const excludedSpeciesListCopy = [...excludedSpeciesList]
        excludedSpeciesListCopy.push(species)
        setExcludedSpeciesList(excludedSpeciesListCopy)
    }

    const handleSetErrorMsg = (message) => {
        setErrorMsg(message);
    }


    const removeSpecies = (e, index) => {
        e.preventDefault();
        const excludedSpeciesListCopy = excludedSpeciesList.filter((_, i) => i !== index);
        setExcludedSpeciesList(excludedSpeciesListCopy)
    }

    return (
        <div className="excludedSpecies">
            <div className="labelForm">
                <label>Excluded species</label>
                <div className="labelFormInput">
                    <SpeciesInput button="Add" handleSetLoadedSpecies={handleSetSpecies} handleSetErrorMsg={handleSetErrorMsg} />
                    {errorMsg && <p className="error-message">{errorMsg}</p>}
                </div>
            </div>
            <ul>
                {excludedSpeciesList.map((species, index) => (
                <li key={index}>
                    {species[0]} ({species[1]}) <button onClick={(e) => removeSpecies(e, index)}>X</button>
                </li>
                ))}
            </ul>
        </div>
    )
}