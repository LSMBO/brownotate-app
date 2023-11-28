import Card from "./Card"
import cardContent from "../assets/text/cards.json";

export default function cardContainer( {species} ) {
    // state
    const loadedSpecies = {
        "scientificName" : species[0],
        "taxonId" : species[1]
    }

    // const possibleColorFilters = [0, 80, 120, 160, 200, 260];
    // 0 : bleu ; 80 : violet ; 120 : rose ; 160 : orange ; 200 : gold ; 260 : vert
    const possibleColorFilters = [-20, 0, 40, 60];

    const randomColorFilter1 = possibleColorFilters[Math.floor(Math.random() * possibleColorFilters.length)];
    const remainingFilters1 = possibleColorFilters.filter(filter => filter !== randomColorFilter1);
    const randomColorFilter2 = remainingFilters1[Math.floor(Math.random() * remainingFilters1.length)];
    const remainingFilters2 = remainingFilters1.filter(filter => filter !== randomColorFilter2);
    const randomColorFilter3 = remainingFilters2[Math.floor(Math.random() * remainingFilters2.length)];

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
                colorFilter={randomColorFilter1} 
                handleClick={handleClickDBS}
                isDisabled={!loadedSpecies.scientificName}
            />
            <Card 
                title="Automatic run" 
                content={cardContent.text_card2} 
                button={card2_button} 
                colorFilter={randomColorFilter2} 
                handleClick={handleClickAuto}
                isDisabled={!loadedSpecies.scientificName}
            />
            <Card 
                title="Classic run" 
                content={cardContent.text_card3} 
                button={card3_button} 
                colorFilter={randomColorFilter3} 
                handleClick={[handleClickSetting, handleClickClassicRun]}
                isDisabled={!loadedSpecies.scientificName}
            />
        </div >
    )
}