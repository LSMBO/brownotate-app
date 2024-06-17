export default function SettingsFormElementInputFile({ label, disabled, handleFileChange, value, allowMultiple }) {

    const handleFileInputClick = (e) => {
        e.preventDefault();
        document.getElementById(label.toLowerCase().replace(' ', '_')).click();

    };

    return (
        <div className="settingsFormElementInputFile">
            <input
                id={label.toLowerCase().replace(' ', '_')}
                className="t2_light"
                type="file"
                disabled={disabled}
                name={label.toLowerCase().replace(' ', '_')}
                accept=".fastq, .fq, .fasta, .fna, .fa"
                {...(allowMultiple && { multiple: true })}
                onChange={handleFileChange}
            />   
            <button className="inputFile t2_light" disabled={disabled} onClick={(e) => handleFileInputClick(e)}>{allowMultiple ? 'Select File(s)' : 'Select File'}</button>     
            <ul style={{ display: value.length === 0 ? "none" : "block" }}>
                {value.map((file, index) => (
                    <li className="t1" key={index}>
                        <button onClick={(e) => handleFileChange(e, index)}>X</button>
                        {file.name}{' '}
                    </li>
                ))}
            </ul>
        </div>
    );
}
