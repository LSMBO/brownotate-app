import HelpIcon from "../../assets/help.png";




export default function SettingsSelect({ label, help, options, defaultOption, handleSetMaxRank }) {
    const handleChange = (e) => {
        const selectedValue = e.target.value;
        handleSetMaxRank(selectedValue);
      };
      
    return (
        <div className="formElement">
            <div className="radioLabel">
                <label>{label}</label>
                <div className="tooltipContainer">
                        <img src={HelpIcon} alt="help" className="helpIcon"/>
                        <span className="helpSpan">{help}</span>
                </div>
            </div>
            <select defaultValue={defaultOption} onChange={handleChange}>
                {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
                ))}
            </select>
        </div>
    )
}