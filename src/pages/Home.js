import Header from "../components/Header"
import SpeciesForm from "../components/SpeciesForm"
import CardContainer from "../components/CardContainer"
import Run from "../components/Run"
import Footer from "../components/Footer"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom";

// fetch("http://172.16.2.0/home/centos/br/bin/Brownotate-1.1.0/main.py")
//     .then(response => response.text())
//     .then(data => {
//         console.log(data); // Cela affichera la réponse du serveur
//     })
//     .catch(error => {
//         console.error("Error fetching data:", error);
//     });


// fetch("/scripts/test.py")
//     .then(response => response.text())
//     .then(data => {
//         console.log(data); // Cela affichera la réponse du serveur
//     })
//     .catch(error => {
//         console.error("Error fetching data:", error);
//     });

export default function Home() {
    //state
    const location = useLocation();
    const [parameters, setParameters] = useState(
        {
            id: null,
            species: {
                scientificName: "Cannabis sativa",
                taxonID: null
            },
            ready: true,
            startSection: {
                auto: true,
                genome: false,
                sequencing: false,
            },
            dataSection: {
                auto: true,
                illuminaOnly : false,
                excludedSRA : false,
                excludedSRAList : [],
                genomeFile: false,
                genomeFileList: [],
                sequencingFiles : false,
                sequencingFilesList : [],
                sequencingAccessions : false,
                sequencingAccessionsList : []
            },
            assemblySection: {
                skipFastp: false,
                skipPhix: false,
            },
            annotationSection: {
                evidenceAuto: true,
                evidenceFile: false,
                evidenceFileList: [],
                removeStrict: true,
                removeSoft: false,
            },
            brownamingSection: {
                skip: false,
                excludedSpeciesList: [],
                highestRank: "Suborder",
            },
            buscoSection: {
                assembly: true,
                annotation: true
            }
        }
    );
    const [runs, setRuns] = useState([]);

    useEffect(() => {
        // Cette fonction sera appelée chaque fois que les paramètres changent
        if (location.state && location.state.newParameters) {
          const newParams = location.state.newParameters;
          setParameters(newParams);
        }
      }, [location.state]);
    
    //comportement

    const handleSetSpecies = (speciesData) => {
        setParameters((prevParameters) => ({
          ...prevParameters,
          species: {
            scientificName: speciesData[0],
            taxonID: speciesData[1],
          },
        }));
      };
          
    //affichage
    return (
    <div>
        <Header />
        <SpeciesForm handleSetSpecies={handleSetSpecies}/>
        <CardContainer parameters={parameters} setParameters={setParameters} setRuns={setRuns}/>
        <div className="run-list">
            {runs.map((run, index) => (
            <Run id={run.id} data={run.data} status={run.status} parameters={run.parameters} />
            ))}
        </div>
        
        <Footer />
    </div>
    )
}