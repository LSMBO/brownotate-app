import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { displayFile } from '../utils/DisplayFile';
import './AnnotationResults.css';
import CONFIG from '../config';
import Results from './AnnotationResults/Results'
import Parameters from './AnnotationResults/Parameters'
import Loading from '../components/Loading';

const AnnotationResults = () => {
    const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const [annotationTitle, setAnnotationTitle] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("Parameters");
    const [annotation, setAnnotation] = useState(null);
    const [fileContents, setFileContents] = useState({
        buscoAssemblyFile: null,
        buscoAnnotationFile: null,
        brownamingStatsFile: null
    });

    useEffect(() => {
        if (location.state?.tab === 'parameters') {
            setActiveTab('Parameters');
        } else {
            setActiveTab('Results');
        }
    }, [location.state]);

	
	useEffect(() => {
		const fetchRun = async () => {
			try {
				const response = await axios.post(`${CONFIG.API_BASE_URL}/get_run`, { run_id: id });
				const data = response.data.data;
				if (response.status === 200) {
					setAnnotation(data);
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
		if (annotation && annotation.parameters && annotation.parameters.species) {
			const scientificName = annotation.parameters.species.scientificName;
			const taxId = annotation.parameters.species.taxonID;
			setAnnotationTitle(`<i>${scientificName}</i>&nbsp;[TaxID: ${taxId}]`);
		}
	}, [annotation]);

	useEffect(() => {
		const fetchFiles = async () => {
			if (!annotation) return;
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
	
			if (annotation.status === "completed" || annotation.status === "incomplete") {
				if (annotation.parameters.buscoSection.assembly) {
					await handleDisplayFile(`${annotation.results_path}/Busco_genome.json`, 'buscoAssemblyFile');
				}
			}
	
			if (annotation.status === "completed") {
				if (annotation.parameters.buscoSection.annotation) {
					await handleDisplayFile(`${annotation.results_path}/Busco_annotation.json`, 'buscoAnnotationFile');
				}
				if (!annotation.parameters.brownamingSection.skip) {
					await handleDisplayFile(`${annotation.results_path}/brownaming/stats.txt`, 'brownamingStatsFile');
				}
			}
		};
		fetchFiles();
	}, [annotation]);
	
	return (
		<div className='page'>
			<div className="navigation-buttons">
				<div></div>
				<button className="t2_bold right" onClick={() => navigate('/my-annotations', { state: { from: 'annotation-results' } })}>My Annotations</button>   
			</div>

			<div className='annotation-results-container'>

				<h2 className="home-h2" dangerouslySetInnerHTML={{__html: annotationTitle}} />

				{annotation && annotation.status === "completed" && (
					<div className='tabs-header-annotation'>
						<div className={`tab ${activeTab === 'Results' ? 'active-tab' : ''}`} onClick={() => setActiveTab('Results')}>Results</div>
						<div className={`tab ${activeTab === 'Parameters' ? 'active-tab' : ''}`} onClick={() => setActiveTab('Parameters')}>Parameters</div>
					</div>
				)}

				{annotation && (
					<div className='t2_light'>
						{activeTab === "Results" && (
							<Results annotation={annotation} fileContents={fileContents} setIsLoading={setIsLoading} />
						)}

						{activeTab === 'Parameters' && (
							<Parameters annotation={annotation} />
						)}
					</div>
				)}
			</div>

			{isLoading && (
				<Loading />
			)}
		</div>
	);
};

export default AnnotationResults;
