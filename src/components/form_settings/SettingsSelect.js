import HelpIcon from "../../assets/help.png";




export default function SettingsSelect({ label, help, options, defaultOption, handleSetMaxRank, disabled }) {
    const handleChange = (e) => {
        const selectedValue = e.target.value;
        handleSetMaxRank(selectedValue);
      };
      
    return (
        <div className="formElement">
            <div className="radioLabel">
                <div className="labelTooltipWrapper">
                    <label>{label}</label>
                    <div className="tooltipContainer">
                            <img src={HelpIcon} alt="help" className="helpIcon"/>
                            <span className="helpSpan">{help}</span>
                    </div>
                </div>
            </div>
            <select className="t2_light" defaultValue={defaultOption} onChange={handleChange} disabled={disabled}>
                {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
                ))}
            </select>
        </div>
    )
}