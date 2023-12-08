import Card from "./Card"
import cardContent from "../assets/text/cards.json";
import { useNavigate } from "react-router-dom";


export default function CardContainer( {species} ) {
    // state
    const loadedSpecies = {
        "scientificName" : species[0],
        "taxonId" : species[1]
    }
    const navigate = useNavigate();

    const card1_button = "Search"
    const card2_button = "Run"
    const card3_button = "Settings;Run"

    // comportement
    const handleClickDBS = () => {
        console.log(`Database search with ${loadedSpecies.scientificName} !!`)
    }

    const handleClickAuto = () => {
        console.log(`Auto run with ${loadedSpecies.scientificName} !!`)
    }

    const handleClickSetting = () => {
        console.log(`Open settings with ${loadedSpecies.scientificName} !!`)
        navigate('/settings', {state: {loadedSpecies}});
    }

    const handleClickClassicRun = () => {
        console.log(`Classic run with ${loadedSpecies.scientificName} !!`)
    }

    //affichage
    return (
        <div className="cardContainer" >
            <Card 
                title="Data available" 
                content={cardContent.text_card1} 
                button={card1_button} 
                colorFilter={-20} 
                handleClick={handleClickDBS}
                isDisabled={!loadedSpecies.scientificName}
            />
            <Card 
                title="Automatic run" 
                content={cardContent.text_card2} 
                button={card2_button} 
                colorFilter={60} 
                handleClick={handleClickAuto}
                isDisabled={!loadedSpecies.scientificName}
            />
            <Card 
                title="Classic run" 
                content={cardContent.text_card3} 
                button={card3_button} 
                colorFilter={40} 
                handleClick={[handleClickSetting, handleClickClassicRun]}
                isDisabled={!loadedSpecies.scientificName}
            />
        </div >
    )
}