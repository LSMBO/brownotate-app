import { useState } from "react";
import "./SpeciesForm.css"


export default function SpeciesForm( {handleSetSpecies} ) {
    // state
const [newSpecies, setNewSpecies] = useState("")
const [loadedSpecies, setLoadedSpecies] = useState([])
const [error, setError] = useState(null);
const [success, setSuccess] = useState(false);

    // comportement
    const buildUrl = (species) => {
        if (typeof species === 'string' && isNaN(species)) {
            const speciesWords = species.toLowerCase().split(' ');
            const scientificName = speciesWords.join('%20');
            return `https://rest.uniprot.org/taxonomy/search?query=(scientific:%22${scientificName}%22)%20AND%20(rank:SPECIES)&size=500&format=json`;
        } else {
            return `https://rest.uniprot.org/taxonomy/search?query=(tax_id:${species})%20AND%20(rank:SPECIES)&size=500&format=json`;
        }
    };
    
    const handleApiResponse = (data) => {
        const lowerSpecies = newSpecies.toLowerCase();
        
        for (const result of data.results) {
            const lowerScientificName = result.scientificName.toLowerCase();
            const trimmedScientificName = lowerScientificName.split(' (')[0];
    
            if (trimmedScientificName === lowerSpecies) {
                console.log('Your species has been found:', result.scientificName);
                setLoadedSpecies([result.scientificName, result.taxonId])
                return [result.scientificName, result.taxonId]
            }
        }
        return false
    };
    
    const handleError = (error) => {
        console.error('Error fetching data:', error);
        return 'Oops! Something went wrong while getting the data. Please try again later.';
    };

    const handleChange = (e) => {
        setNewSpecies(e.target.value)
    } 

     const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = buildUrl(newSpecies);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const apiResponse = handleApiResponse(data);
                if (apiResponse[0]){
                    setError("");
                    setSuccess(true);
                    handleSetSpecies(apiResponse)
                }
                else {
                    setError("Your species has not been found in UniProt. Please use another species name.")
                    setSuccess(false);
                }
                console.log(apiResponse)
            } else {
                setError(handleError(response));
                setSuccess(false);
            }
        } catch (error) {
            setError(handleError(error));
            setSuccess(false);
        }
    };

    // affichage
    return (
        <form action="submit" onSubmit={handleSubmit}>
            <label className="t2">Species :</label>
            <div className="t1_bold input-button">
                <input
                    className={error ? "t1_light error" : success ? "t1_light success" : "t1_light"}
                    value={newSpecies}
                    type="text"
                    placeholder="Enter your species ..."
                    onChange={handleChange}
                />
                <button className="t1_bold">Load</button>
            </div>
            {<p className="t1_bold error-message">{error}</p>}
            {<p className="t1_bold success-message"><i>{loadedSpecies[0]}&nbsp;</i>{loadedSpecies[0] ? `(${loadedSpecies[1]}) is loaded` : ""}</p>}
        </form>
      );
}