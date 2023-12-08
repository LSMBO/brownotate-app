import SettingsFormElementInputRadio from "./SettingsFormElementInputRadio";

export default function SettingsFormElementInputText({ label, help, checked, onChange, onText }) {


    return (
        <div className="formElement">
            <SettingsFormElementInputRadio label={label} help={help} checked={checked} onChange={onChange}/>
            <textarea
                disabled={!checked}
                name={label.toLowerCase()}
                onChange={(e) => onText(e.target.value)}
                rows="3"
            />
        </div>
    )
}