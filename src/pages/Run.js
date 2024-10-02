import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { handleClickDownload } from '../utils/Download';
import { displayFile } from '../utils/DisplayFile';
import './Run.css';
import DownloadIcon from "../assets/download.png";
import CONFIG from '../config';
import TabsHeader from '../components/run/TabsHeader';
import Results from '../components/run/Results'
import Parameters from '../components/run/Parameters'
import Loading from '../components/Loading';

const Run = () => {
    const { id } = useParams();
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("Results");
    const [run, setRun] = useState(null);
    const [fileContents, setFileContents] = useState({
        logFile: null,
        buscoAssemblyFile: null,
        buscoAnnotationFile: null,
        brownamingStatsFile: null
    });

	
    useEffect(() => {
        const fetchRun = async () => {
            try {
                const response = await axios.post(`${CONFIG.API_BASE_URL}/get_run`, { run_id: id });
                const data = response.data.data;
                if (response.status === 200) {
                    setRun(data);
                } else {
                    console.error(response.data.message);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchRun();
    }, [id]);

	useEffect(() => {
		const fetchFiles = async () => {
			if (!run) return;
			const handleDisplayFile = async (filePath, fileType) => {
				try {
					const fileContent = await displayFile(filePath);
					setFileContents(prevState => ({
						...prevState,
						[fileType]: fileContent
					}));
				} catch (error) {
					console.error(`Error fetching ${fileType} file:`, error);
				}
			};

			if (run.status === 'upload' || run.status === 'running') {
				setActiveTab('Parameters');
			} else if (run.status !== 'failed') {
				await handleDisplayFile(`${run.results_path}/main.log`, 'logFile');
			}
	
			if (run.status === "completed" || run.status === "incomplete") {
				if (run.parameters.buscoSection.assembly) {
					await handleDisplayFile(`${run.results_path}/Busco_genome.json`, 'buscoAssemblyFile');
				}
			}
	
			if (run.status === "completed") {
				if (run.parameters.buscoSection.annotation) {
					await handleDisplayFile(`${run.results_path}/Busco_annotation.json`, 'buscoAnnotationFile');
				}
				if (!run.parameters.brownamingSection.skip) {
					await handleDisplayFile(`${run.results_path}/brownaming/stats.txt`, 'brownamingStatsFile');
				}
			}
		};
		fetchFiles();
	}, [run]);
	
    return (
        <div>
			<TabsHeader run={run} activeTab={activeTab} setActiveTab={setActiveTab} />
            {run && (
                <div className='t2_light'>
					{activeTab === "Results" && (
						<Results run={run} fileContents={fileContents} isLoading={isLoading} setIsLoading={setIsLoading} />
					)}

					{activeTab === 'Parameters' && (
						<Parameters run={run} />
					)}
				</div>
            )}
			{isLoading && (
                <Loading />
            )}
        </div>
    );
};

export default Run;
