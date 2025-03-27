
import { useEffect, useState } from "react";
import CONFIG from '../config';
import './CardDatabaseSearch.css';
import CardSequencing from "./CardSequencing";
import CardAssembly from "./CardAssembly";
import CardProteins from "./CardProteins";
import PhylogenyMap from "./PhylogenyMap";
import Loading from "./Loading";
import { useDBSearch } from '../contexts/DBSearchContext';

const CardDatabaseSearch = ({ data, dbsearchStatus, handleClickSettings, handleClickDownload, rerunDBSearch }) => {
    const { selectedData, setSelectedData } = useDBSearch();
    const [selectedSequencing, setSelectedSequencing] = useState([]);
    const [selectedAssembly, setSelectedAssembly] = useState(null);
    const [selectedProteins, setSelectedProteins] = useState([]);
    const [sequencingSize, setSequencingSize] = useState("0Go");
    const [noAssemblyFound, setNoAssemblyFound] = useState(false);
    const [noProteinsFound, setNoProteinsFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                Object.keys(data.proteins.uniprot_proteomes).length === 0 &&
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
                setSelectedProteins([]);
            }
        } else {
            setSelectedAssembly(null);
        }
    };

    const updateSelectedProteins = (proteins) => {
        if (selectedProteins.some(p => p.accession === proteins.accession)) {
            setSelectedProteins(selectedProteins.filter(p => p.accession !== proteins.accession));
        } else {
            setSelectedProteins([...selectedProteins, proteins]);
        }
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
            setSelectedProteins([]);
        }
    };

    const convertForDownload = async (data) => {
        try {
            setIsLoading(true);
            await handleClickDownload(data, 'proteins', true);
        } catch (error) {
            console.error('Error during download:', error);
        } finally {
            setIsLoading(false);
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
                <button className="retry-btn t2_bold" onClick={handleClickDBSearch}>New search</button>
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
                </div>
                <div className="protein-container">
                    <CardProteins
                        proteins={data.proteins}
                        selectedProteins={selectedProteins}
                        updateSelectedProteins={updateSelectedProteins}
                    />
                </div>
            </div>
            <div>
                {dbsearchStatus === 'done' ? (
                    <div className="card-container-footer">
                        <button 
                            className="t2_bold configure-btn" 
                            disabled={!selectedAssembly && selectedSequencing.length === 0} 
                            onClick={() => handleClickSettings(selectedData)}>
                                Configure the run with the sequencing/assembly selected
                        </button>
                        <button 
                            className="t2_bold download-btn" 
                            disabled={selectedProteins.length === 0} 
                            onClick={() => convertForDownload(selectedProteins)}>
                                Download the protein dataset
                        </button>
                    </div>
                ) : (
                    <div className="dbsearch-status">
                        Database Search in progress: {dbsearchStatus} ...
                    </div>
                )}
            </div>
            {data.phylogeny_map && (
                <PhylogenyMap
                    file={data.phylogeny_map}
                />
            )}
            {isLoading && (
                <Loading/>
            )}
        </div>
    );
};

export default CardDatabaseSearch;
