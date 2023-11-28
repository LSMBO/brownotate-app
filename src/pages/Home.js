import Header from "../components/Header"
import SpeciesForm from "../components/SpeciesForm"
import CardContainer from "../components/CardContainer"
import Footer from "../components/Footer"

import { useState } from "react"

export default function Home() {
    //state
    const [species, setSpecies] = useState("")

    
    //comportement
    const handleSetSpecies = (newSpecies) => {
        setSpecies(newSpecies)
    }


    //affichage
    return (
    <div>
        <Header />
        <SpeciesForm handleSetSpecies={handleSetSpecies}/>
        <CardContainer species={species}/>
        <Footer />
    </div>
    )
}