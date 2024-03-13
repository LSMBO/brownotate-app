import "./Card.css"
import cardContent from "../assets/text/cards.json";
import { useState, useEffect } from "react"


export default function CardClassic({ uploadProgress, handleClickSettings, handleClickRun, isDisabledSettings, isReady }) {
    //state
    const [uploading, setUploading] = useState(false)
    const [totalFiles, setTotalFiles] = useState(uploadProgress.totalFiles);
    const [uploadedFiles, setUploadedFiles] = useState(uploadProgress.uploadedFiles);

    const [ready, setReady] = useState(false);

    //comportement
    useEffect(() => {
        setTotalFiles(uploadProgress.totalFiles);
        setUploadedFiles(uploadProgress.uploadedFiles);
        setUploading(uploadProgress.totalFiles !== uploadProgress.uploadedFiles && uploadProgress.totalFiles !== 0);
    }, [uploadProgress]);

    useEffect(() => {
        setReady(isReady);
    }, [isReady]);



    //render
    return (
        <div className="card" style={{ filter: `hue-rotate(40deg)` }}>
            <div className="card-text">
                <h2>Classic run</h2>
                <p className="t1_light">{cardContent.text_card3[0]}</p>
                <p className="t1_light" style={{ fontWeight: "bold" }}>{cardContent.text_card3[1]}</p>
            </div>
            <div className="button-div">
                {uploading && <p>uploading files ({uploadedFiles} / {totalFiles}) ...</p>}  
                <button className="t1_bold" onClick={handleClickSettings} disabled={isDisabledSettings}>Settings</button>
                <button className="t1_bold" onClick={handleClickRun} disabled={!ready || uploading}>Run</button>
            </div>
        </div>
    );
}
