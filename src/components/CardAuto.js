import "./Card.css"
import cardContent from "../assets/text/cards.json";

export default function CardDB({ handleClick, isDisabled }) {
    //state

    //comportement

    //render
    return (
        <div className="card" style={{ filter: `hue-rotate(60deg)` }}>
            <div className="card-text">
                <h2>Auto run</h2>
                <p className="t1_light">{cardContent.text_card2[0]}</p>
                <p className="t1_light" style={{ fontWeight: "bold" }}>{cardContent.text_card2[1]}</p>
            </div>
            <div className="button-div">
                <button className="t1_bold" onClick={handleClick} disabled={isDisabled}>Run</button>
            </div>
        </div>
    );
}
