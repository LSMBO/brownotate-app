
import HelpIcon from "../../assets/help.png";

export default function SettingsFormElementInputRadio({ label, help, checked, onChange }) {


    const handleClick = () => {
        new Promise((resolve) => {
            onChange(label, !checked);
          resolve();
        })
      };
    
    return (
            <div className={`radioLabel ${checked ? 't1_bold' : ''}`}>
                <input type="radio" onChange={() => {}} onClick={handleClick} checked={checked} />
                <label>{label}</label>
                <div className="tooltipContainer">
                    <img src={HelpIcon} alt="help" className="helpIcon"/>
                    <span className="helpSpan">{help}</span>
                </div>
            </div>
    )
}