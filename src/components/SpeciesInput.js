import { useState, useEffect } from "react";

export default function SpeciesInput({inputSpecies, setInputSpecies, speciesNotFound }) {
    const [content, setContent] = useState(inputSpecies)

    const handleChange = (e) => {
        setContent(e.target.value)
        setInputSpecies(e.target.value)
    } 
    
    return (
        <div>
            <input
                className={speciesNotFound ? "t2_light error" : "t2_light"}
                value={content}
                type="text"
                placeholder="Enter your species ..."
                onChange={handleChange}
            />
            {speciesNotFound!=="" ? 
            <p className="error-message">The taxonomy {speciesNotFound} has not been found in UniProt. Please retry with the taxonID or another name.</p> :
            <p></p>}
        </div>   
    )
}