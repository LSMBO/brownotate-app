import "./Card.css"
import cardContent from "../assets/text/cards.json";

export default function CardDB({ handleClick, isDisabled }) {
    //state

    //comportement

    //render
    return (
        <div className="card" style={{ filter: `hue-rotate(-20deg)` }}>
            <div className="card-text">
                <h2>Data available</h2>
                <p className="t1_light">{cardContent.text_card1[0]}</p>
                <p className="t1_light" style={{ fontWeight: "bold" }}>{cardContent.text_card1[1]}</p>
            </div>
            <div className="button-div">
                <button className="t1_bold" onClick={handleClick} disabled={isDisabled}>Search</button>
            </div>
        </div>
    );
}
