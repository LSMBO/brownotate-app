import { useState, useEffect } from 'react';

export default function SettingsFormElementInputText({ label, disabled, onChange, text, type, width, max=-1 }) { 
    const [newText, setNewText] = useState(text);
    const [errorMsg, setErrorMsg] = useState("");
    const widthClass = width ? `w${width}` : 'w50';

    useEffect(() => {
        if (text === "") {
            setNewText("");
        }
    }, [text]);

    const handleChange = (value) => {
        setNewText(value);
    };

    const handleNumericChange = (e) => {
        const value = e.target.value;
        onChange(value);
        handleChange(value);

    };

    return (
        <>
            { type == 'input-number' ? (
                <div className={widthClass}>
                    <input
                        type="number"
                        disabled={disabled}
                        name={label.toLowerCase()}
                        onChange={handleNumericChange}
                        value={newText}
                        min='0'
                        {...(max !== -1 && { max: max })}
                        step="any"
                        inputMode="numeric"
                    />
                </div>
            ) : (
                <textarea
                    disabled={disabled}
                    name={label.toLowerCase()}
                    onChange={(e) => {
                        onChange(e.target.value);
                        handleChange(e.target.value);
                    }}
                    rows="3"
                    value={Array.isArray(newText) ? newText.join('\n') : newText}
                    className={widthClass}
                />
            )}
        </>
    );
}
