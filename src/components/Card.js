import "./Card.css"

export default function Card({ title, content, button, colorFilter, handleClick, isDisabled1, isDisabled2 }) {
    //state
    const buttonContents = button.split(";");


    //comportement


    return (
        <div className="card" style={{ filter: `hue-rotate(${colorFilter}deg)` }}>
            <div className="card-text">
                <h2>{title}</h2>
                <p className="t1_light">{content[0]}</p>
                <p className="t1_light" style={{ fontWeight: "bold" }}>{content[1]}</p>
            </div>
            <div className="button-div">
                {buttonContents.length === 2 ? ( // Vérifier s'il y a deux parties après la division
                    <>
                        <button className="t1_bold" onClick={handleClick[0]} disabled={isDisabled1}>{buttonContents[0]}</button>
                        <button className="t1_bold" onClick={handleClick[1]} disabled={isDisabled2}>{buttonContents[1]}</button>
                    </>
                ) : (
                    <button className="t1_bold" onClick={handleClick} disabled={isDisabled1}>{button}</button>
                )}
            </div>
        </div>
    );
}
