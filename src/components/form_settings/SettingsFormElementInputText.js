import { useState, useEffect } from 'react';


export default function SettingsFormElementInputText({ label, disabled, onChange, text }) {
    const [newText, setNewText] = useState(text);

    useEffect(() => {
        if (text === "") {
            setNewText("");
        }
    }, [text]);
    
    const handleChange = (value) => {
        setNewText(value);
      };


    return (
        <textarea
            disabled={disabled}
            name={label.toLowerCase()}
            onChange={(e) => {
                onChange(e.target.value);
                handleChange(e.target.value)
            }}
            rows="3"
            value={Array.isArray(newText) ? newText.join('\n') : newText}
        />
    )
}