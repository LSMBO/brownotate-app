import { useState, useEffect } from "react";

export default function SpeciesInput({ handleSetInputSpecies, isError }) {
    const [content, setContent] = useState("")
    const [error, setError] = useState({isError});
    
    useEffect(() => {
        setError(isError);
    }, [isError]);

    const handleChange = (e) => {
        setContent(e.target.value)
        handleSetInputSpecies(e.target.value)
    } 
    
    return (
        <div>
            <input
                className={error ? "t1_light error" : "t1_light"}
                value={content}
                type="text"
                placeholder="Enter your species ..."
                onChange={handleChange}
            />
            {error!=="" ? 
            <p className="error-message">Your species {isError} has not been found in UniProt. Please use another species name.</p> :
            <p></p>}
        </div>   
    )
}