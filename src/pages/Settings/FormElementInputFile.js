export default function FormElementInputFile({ label, disabled, handleFileChange, value, allowMultiple }) {

    const handleFileInputClick = (e) => {
        e.preventDefault();
        document.getElementById(label.toLowerCase().replace(' ', '_')).click();

    };

    const displayFileName = (file_url) => {
        if (typeof file_url === 'string') {
            const parts = file_url.split('/');
            return parts[parts.length - 1];
        } else if (file_url instanceof File) {
            return file_url.name;
        }
    };

    return (
        <div>
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
            <button disabled={disabled} onClick={(e) => handleFileInputClick(e)}>{allowMultiple ? 'Select File(s)' : 'Select File'}</button>    
            <ul style={{ display: value && (Array.isArray(value) ? value.length > 0 : true) ? "block" : "none" }}>
                {Array.isArray(value) ? value.map((file, index) => (
                    <li key={index}>
                        <button className="delete-btn" onClick={(e) => handleFileChange(e, index)}>X</button>
                        {displayFileName(file)}{' '}
                    </li>
                )) : value ? (
                    <li>
                        <button className="delete-btn" onClick={(e) => handleFileChange(e, 0)}>X</button>
                        {displayFileName(value)}
                    </li>
                ) : null}
            </ul>
        </div>
    );
}
