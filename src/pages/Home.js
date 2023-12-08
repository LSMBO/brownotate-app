import Header from "../components/Header"
import SpeciesForm from "../components/SpeciesForm"
import CardContainer from "../components/CardContainer"
import Footer from "../components/Footer"
import { useNavigate, useLocation } from "react-router-dom"


import { useState } from "react"

export default function Home() {
    //state
    const { state } = useLocation();
    let formData = state?.formData;
    const [species, setSpecies] = useState("")

    
    //comportement
    const handleSetSpecies = (species) => {
        setSpecies(species)
    }


    //affichage
    return (
    <div>
        <Header />
        <SpeciesForm handleSetSpecies={handleSetSpecies}/>
        <CardContainer species={species}/>
        <div className="t1_light">
                species : {species}
                <br/>
                id : {JSON.stringify(formData.id, null, 2)}
                <br/>
                ready : {JSON.stringify(formData.ready, null, 2)}
                <br/>
                start : {JSON.stringify(formData.startSection, null, 2)}
                <br/>
                data : {JSON.stringify(formData.dataSection, null, 2)}
                <br/>
                assembly : {JSON.stringify(formData.assemblySection, null, 2)}
                <br/>
                annotation : {JSON.stringify(formData.annotationSection, null, 2)}
                <br/>
                brownaming : {JSON.stringify(formData.brownamingSection, null, 2)}
            </div>
        <Footer />
    </div>
    )
}