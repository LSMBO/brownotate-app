import { useEffect, useState } from "react";
import CardSequencing from "./CardSequencing";
import CardAssembly from "./CardAssembly";
import CardProteins from "./CardProteins";
import './CardDatabaseSearch.css';

const CardDatabaseSearch = ({ species, data, handleClickSettings, handleClickDownload }) => {
    const [selectedData, setSelectedData] = useState([]);
    const [selectedSequencing, setSelectedSequencing] = useState([]);
    const [selectedAssembly, setSelectedAssembly] = useState(null);
    const [selectedProteins, setSelectedProteins] = useState(null);
    const [sequencingSize, setSequencingSize] = useState("0Go");
    const [noAssemblyFound, setNoAssemblyFound] = useState(false);
    const [noProteinsFound, setNoProteinsFound] = useState(false);

    useEffect(() => {
        if (data.assembly) {
            if (
                Object.keys(data.assembly.ensembl).length === 0 &&
                Object.keys(data.assembly.refseq).length === 0 &&
                Object.keys(data.assembly.genbank).length === 0
            ) {
                setNoAssemblyFound(true);
            } else {
                setNoAssemblyFound(false);
                let recommendedAssembly = '';
                if (Object.keys(data.assembly.ensembl).length !== 0) {
                    recommendedAssembly = data.assembly.ensembl.accession;
                } else if (Object.keys(data.assembly.refseq).length !== 0) {
                    recommendedAssembly = data.assembly.refseq.accession;
                } else if (Object.keys(data.assembly.genbank).length !== 0) {
                    recommendedAssembly = data.assembly.genbank.accession;
                }
                setSelectedAssembly(recommendedAssembly);
                setSelectedData([recommendedAssembly]);
            }

            if (data.proteins && (
                Object.keys(data.proteins.ensembl).length === 0 &&
                Object.keys(data.proteins.uniprot).length === 0 &&
                Object.keys(data.proteins.refseq).length === 0 &&
                Object.keys(data.proteins.genbank).length === 0
            )) {
                setNoProteinsFound(true);
            } else {
                setNoProteinsFound(false);
                let recommendedProteins = {};
                if (Object.keys(data.proteins.ensembl).length !== 0) {
                    recommendedProteins = data.proteins.ensembl;
                } else if (Object.keys(data.proteins.uniprot).length !== 0) {
                    recommendedProteins = data.proteins.uniprot;
                }	else if (Object.keys(data.proteins.refseq).length !== 0) {
                    recommendedProteins = data.proteins.refseq;
                } else if (Object.keys(data.proteins.genbank).length !== 0) {
                    recommendedProteins = data.proteins.genbank;
                }
                setSelectedProteins(recommendedProteins);
                setSelectedData([recommendedProteins]);
                setSelectedAssembly()
            }
        }
    }, [data]);

    const updateSelectedAssembly = (assembly) => {
        if (assembly) {
            setSelectedAssembly(assembly);
            setSelectedData([assembly]);
            if (selectedSequencing.length > 0) {
                setSelectedSequencing([]);
                setSequencingSize('0Go');
            }
            if (selectedProteins) {
                setSelectedProteins(null);
            }
        }
        else {
            setSelectedAssembly(null)
        }
    };

    const updateSelectedProteins = (proteins) => {
        setSelectedProteins(proteins);
        setSelectedData([proteins]);
        if (proteins && selectedSequencing.length > 0) {
            setSelectedSequencing([]);
            setSequencingSize('0Go');
        }
        if (proteins && selectedAssembly) {
            setSelectedAssembly(null);
        }
    };

    const updateSelectedSequencing = (runs) => {
        setSelectedSequencing(runs);
        setSelectedData(runs);
        if (runs && selectedAssembly) {
            setSelectedAssembly(null);
        }
        if (runs && selectedProteins) {
            setSelectedProteins(null);
        }
    };
    
    return (
        <div>
            <label className="t2_bold">Data found for {species} :</label>
            <div className="card-container t2_light">
                <div className="sequencing-assembly-container">
                    <div className="sequencing-assembly-cards">
                        <CardSequencing
                            dnaseq={data.dnaseq}
                            noAssemblyFound={noAssemblyFound}
                            noProteinsFound={noProteinsFound}
                            selectedSequencing={selectedSequencing}
                            updateSelectedSequencing={updateSelectedSequencing}
                            sequencingSize={sequencingSize}
                            setSequencingSize={setSequencingSize}
                        />
                        <CardAssembly
                            assembly={data.assembly}
                            noProteinsFound={noProteinsFound}
                            selectedAssembly={selectedAssembly}
                            updateSelectedAssembly={updateSelectedAssembly}
                        />
                    </div>
                    <button disabled={!selectedAssembly && selectedSequencing.length === 0} onClick={() => handleClickSettings(selectedData)}>Run</button>
                </div>
                <div className="protein-container">
                    <CardProteins
                        proteins={data.proteins}
                        selectedProteins={selectedProteins}
                        updateSelectedProteins={updateSelectedProteins}
                    />
                <button disabled={!selectedProteins} onClick={() => handleClickDownload(selectedProteins)}>Download</button>
                </div>
            </div>
        </div>
    );
};

export default CardDatabaseSearch;
