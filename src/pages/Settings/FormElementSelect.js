import HelpIcon from "../../assets/help.png";

export default function FormElementSelect({ label, help, options, value, onChange, disabled }) {
    return (
        <>
            <div className="label-tooltip-wrapper">
                <label>{label}</label>
                {help && (
                    <div className="tooltip-container">
                        <img src={HelpIcon} alt="help" className="helpIcon"/>
                        <span className="help-span">{help}</span>
                    </div>
                )}
            </div>
            <select 
                value={value || ""} 
                onChange={(e) => onChange(e.target.value)} 
                disabled={disabled}
            >
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </>
    );
}
