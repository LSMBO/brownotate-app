import { useState, useEffect } from "react";

export default function SpeciesInput({ handleSetInputSpecies, speciesNotFound }) {
    const [content, setContent] = useState("")

    const handleChange = (e) => {
        setContent(e.target.value)
        handleSetInputSpecies(e.target.value)
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
            <p className="error-message">Your species {speciesNotFound} has not been found in UniProt. Please use another species name.</p> :
            <p></p>}
        </div>   
    )
}