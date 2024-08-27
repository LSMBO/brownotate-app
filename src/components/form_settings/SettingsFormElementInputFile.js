export default function SettingsFormElementInputFile({ label, disabled, handleFileChange, value, allowMultiple }) {

    const handleFileInputClick = (e) => {
        e.preventDefault();
        document.getElementById(label.toLowerCase().replace(' ', '_')).click();

    };

    const displayFileName = (file_url) => {
        if (typeof file_url === 'string') {
            const parts = file_url.split('/');
            return parts[parts.length - 1];;
        } else if (file_url instanceof File) {
            return file_url.name;
        }
    };


    return (
        <div className="settingsFormElementInputFile">
            <input
                id={label.toLowerCase().replace(' ', '_')}
                className="t2_light"
                type="file"
                disabled={disabled}
                name={label.toLowerCase().replace(' ', '_')}
                accept=".fastq, .fq, .fasta, .fna, .fa, .gz"
                {...(allowMultiple && { multiple: true })}
                onChange={handleFileChange}
            />   
            <button className="inputFile t2_light" disabled={disabled} onClick={(e) => handleFileInputClick(e)}>{allowMultiple ? 'Select File(s)' : 'Select File'}</button>     
            <ul style={{ display: value.length === 0 ? "none" : "block" }}>
                {value.map((file, index) => (
                    <li className="t1" key={index}>
                        <button onClick={(e) => handleFileChange(e, index)}>X</button>
                        {displayFileName(file)}{' '}
                    </li>
                ))}
            </ul>
        </div>
    );
}
