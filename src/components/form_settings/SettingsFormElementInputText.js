import { useState, useEffect } from 'react';


export default function SettingsFormElementInputText({ label, checked, onChange, onText, text }) {
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
            disabled={!checked}
            name={label.toLowerCase()}
            onChange={(e) => {
                onText(e.target.value);
                onChange(label, true);
                handleChange(e.target.value)
            }}
            rows="3"
            value={newText}
        />
    )
}