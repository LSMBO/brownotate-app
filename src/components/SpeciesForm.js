import { useState } from "react";
import "./SpeciesForm.css"
import SpeciesInput from "./SpeciesInput";


export default function SpeciesForm( {handleSetSpecies} ) {
    // state
    const [loadedSpecies, setLoadedSpecies] = useState("")
    const [errorMsg, setErrorMsg] = useState("");

    //comportement
    const handleSetLoadedSpecies = (species) => {
        setLoadedSpecies(species);
        handleSetSpecies(species);
    }

    const handleSetErrorMsg = (message) => {
        setErrorMsg(message);
    }

    // affichage
    return (
        <div className="speciesFormHome">
            <label className="t2">Species :</label>
            <SpeciesInput button="Load" handleSetLoadedSpecies={handleSetLoadedSpecies} handleSetErrorMsg={handleSetErrorMsg} />
            {errorMsg && <p className="t1_bold error-message">{errorMsg}</p>}
            {loadedSpecies[0] && <p className="t1_bold success-message"><i>{loadedSpecies[0]}&nbsp;</i>{loadedSpecies[0] ? `(${loadedSpecies[1]}) is loaded` : ""}</p>}
        </div>
      );
}
