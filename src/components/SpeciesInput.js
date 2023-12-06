import { useState } from "react";

export default function SpeciesInput({ button, handleSetLoadedSpecies, handleSetErrorMsg }) {
    const [loadedSpecies, setLoadedSpecies] = useState("")
    const [newSpecies, setNewSpecies] = useState("")
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

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
                    handleSetErrorMsg("");
                    setSuccess(true);
                    handleSetLoadedSpecies(apiResponse)
                }
                else {
                    setError("Your species has not been found in UniProt. Please use another species name.")
                    handleSetErrorMsg("Your species has not been found in UniProt. Please use another species name.");
                    setSuccess(false);
                }
                console.log(apiResponse)
            } else {
                setError(handleError(response));
                handleSetErrorMsg(handleError(response));
                setSuccess(false);
            }
        } catch (error) {
            setError(handleError(error));
            handleSetErrorMsg(handleError(error));
            setSuccess(false);
        }
    };


    return (
        <div className="speciesInputBtn">
            <input
                className={error ? "t1_light error" : success ? "t1_light success" : "t1_light"}
                value={newSpecies}
                type="text"
                placeholder="Enter your species ..."
                onChange={handleChange}
            />
            <button className="t1_bold" onClick={handleSubmit}>{button}</button>
        </div>
    )
}