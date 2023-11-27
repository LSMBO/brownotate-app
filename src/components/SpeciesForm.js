import { useState } from "react";
import "./SpeciesForm.css"


export default function SpeciesForm() {
    // state
const [species, setSpecies] = useState("")
const [error, setError] = useState(null);

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
        const lowerSpecies = species.toLowerCase();
        
        for (const result of data.results) {
            const lowerScientificName = result.scientificName.toLowerCase();
            const trimmedScientificName = lowerScientificName.split(' (')[0];
    
            if (trimmedScientificName === lowerSpecies) {
                console.log('Your species has been found:', result.scientificName);
                return result.taxonId
            }
        }
        return false
    };
    
    const handleError = (error) => {
        console.error('Error fetching data:', error);
        return 'Oops! Something went wrong while getting the data. Please try again later.';
    };

    const handleChange = (e) => {
        setSpecies(e.target.value)
    } 

     const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = buildUrl(species);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const apiResponse = handleApiResponse(data);
                if (apiResponse){
                    setError("");
                }
                else {
                    setError("Your species has not been found in UniProt. Please use another species name.")
                }
                console.log(apiResponse)
            } else {
                setError(handleError(response));
            }
        } catch (error) {
            setError(handleError(error));
        }
    };

    // affichage
    return (
        <form action="submit" onSubmit={handleSubmit}>
            <label className="t2">Species :</label>
            <div className="t1 input-button">
                <input
                    className={error ? "t1 error" : "t1"}
                    value={species}
                    type="text"
                    placeholder="Enter your species ..."
                    onChange={handleChange}
                />
                <button className="t1">Search</button>
            </div>
            {<p className="t1 error-message">{error}</p>}
        </form>
      );
}