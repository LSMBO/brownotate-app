import "../components/Loading.css";
import { useEffect, useState } from "react";
import CardSequencing from "./CardSequencing";
import CardAssembly from "./CardAssembly";
import CardProteins from "./CardProteins";
import Loading from "./Loading";
import './CardDatabaseSearch.css';
import { useDBSearch } from '../contexts/DBSearchContext';
import { useUser } from '../contexts/UserContext';

const CardDatabaseSearch = ({ species, data, handleClickSettings, handleClickDownload, rerunDBSearch, setForceNewDBSearch }) => {
    const { selectedData, setSelectedData } = useDBSearch();
    const [selectedSequencing, setSelectedSequencing] = useState([]);
    const [selectedAssembly, setSelectedAssembly] = useState(null);
    const [selectedProteins, setSelectedProteins] = useState(null);
    const [sequencingSize, setSequencingSize] = useState("0Go");
    const [noAssemblyFound, setNoAssemblyFound] = useState(false);
    const [noProteinsFound, setNoProteinsFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (selectedData && selectedData[0].data_type === "genome") {
            setSelectedAssembly(selectedData[0]);
        } else if (selectedData && selectedData.every(item => typeof item === 'string')) {
            updateSelectedSequencing(selectedData);   
        } else {
            if (data.assembly && (
                Object.keys(data.assembly.ensembl).length === 0 &&
                Object.keys(data.assembly.refseq).length === 0 &&
                Object.keys(data.assembly.genbank).length === 0
            )) {
                setNoAssemblyFound(true);
            } else {
                setNoAssemblyFound(false);
            }

            if (data.proteins && (
                Object.keys(data.proteins.ensembl).length === 0 &&
                Object.keys(data.proteins.uniprot_swissprot).length === 0 &&
                Object.keys(data.proteins.uniprot_trembl).length === 0 &&
                Object.keys(data.proteins.uniprot_proteome).length === 0 &&
                Object.keys(data.proteins.refseq).length === 0 &&
                Object.keys(data.proteins.genbank).length === 0
            )) {
                setNoProteinsFound(true);
            } else {
                setNoProteinsFound(false);
                if (!selectedData) {
                    setSelectedAssembly();
                } else if (selectedData[0].data_type === "proteins") {
                    setSelectedAssembly(selectedData[0]);
                }
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
        } else {
            setSelectedAssembly(null);
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

    const convertForDownload = async (data) => {
        try {
            setIsLoading(true);
            if (data.database === 'uniprot' || data.database === 'swissprot' || data.database === 'trembl') {
                await handleClickDownload([data.downloadURL, data.accession], 'uniprot', setIsLoading);
            } else {
                await handleClickDownload(data.downloadURL, 'ftp', setIsLoading);
            }
        } catch (error) {
            console.error('Error during download:', error);
        }
    };

    const handleClickDBSearch = async () => {
        await rerunDBSearch(true)
    }

    return (
        <div>
            <h2 className="home-h2">Database Search</h2>
           <div className="card-container-header t2_bold">
                <label>
                    <i>{data.scientific_name.charAt(0).toUpperCase() + data.scientific_name.slice(1).toLowerCase()}</i> ({data.taxonID}) on {data.date}.
                </label>
                <button className="retry-btn t2_bold" onClick={handleClickDBSearch}>Retry the search with today's data</button>
            </div>
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
                    <button className="t2_bold" disabled={!selectedAssembly && selectedSequencing.length === 0} onClick={() => handleClickSettings(selectedData)}>Configure the run with the sequencing/assembly selected</button>
                </div>
                <div className="protein-container">
                    <CardProteins
                        proteins={data.proteins}
                        selectedProteins={selectedProteins}
                        updateSelectedProteins={updateSelectedProteins}
                    />
                    <button className="t2_bold" disabled={!selectedProteins} onClick={() => convertForDownload(selectedProteins)}>Download the protein dataset</button>
                </div>
            </div>
            {isLoading && (
                <Loading/>
            )}
        </div>
    );
};

export default CardDatabaseSearch;
