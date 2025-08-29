import { useState } from "react";

export default function SpeciesInput({inputSpecies, setInputSpecies, searchError, onClick, buttonLabel }) {
    const [content, setContent] = useState(inputSpecies || "")

    const handleChange = (e) => {
        setContent(e.target.value)
        setInputSpecies(e.target.value)
    }
    
    return (
        <div>
            <div className="species-input">
                <input
                    className={`t2_light ${searchError ? "error" : ""}`}
                    value={content || ""}
                    type="text"
                    placeholder="Enter your species ..."
                    onChange={handleChange}
                />
                <button className="t2_bold dbsearch-btn" onClick={onClick} disabled={!inputSpecies}>{buttonLabel}</button>   
            </div>
            {searchError && 
                <p className="error-message">The taxonomy {searchError} has not been found in UniProt. Please retry with the taxonID or another name.</p>
            }
        </div>   
    )
}