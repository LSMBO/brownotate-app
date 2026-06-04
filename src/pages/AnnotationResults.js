import { useEffect, useState } from 'react';
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
    const [annotation, setAnnotation] = useState(null);	const [isFetching, setIsFetching] = useState(true);	const [isFunctionalAnnotation, setIsFunctionalAnnotation] = useState(false);
    const [fileContents, setFileContents] = useState({
        buscoAssemblyFile: null,
        buscoAnnotationFile: null,
        brownamingStatsFile: null,
        brownamingLogFile: null
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
			} finally {
				setIsFetching(false);
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
			
			const isFunctional = annotation.parameters?.type === 'functional';
			setIsFunctionalAnnotation(isFunctional);
			
			const handleDisplayFile = async (filePath, fileType) => {
				if (!filePath) {
					return;
				}
				try {
					const fileContent = await displayFile(filePath);
					if (!fileContent) {
						return;
					}
					setFileContents(prevState => ({
						...prevState,
						[fileType]: fileContent
					}));
				} catch (error) {
					console.error(`Error fetching ${fileType} file:`, error);
				}
			};

			const hasResultsPath = Boolean(annotation.results_path);
			const hasBuscoAssemblyData = Boolean(
				annotation.resumeData?.busco_assembly_result?.raw_summary ||
				annotation.resumeData?.busco_assembly_result?.scores ||
				annotation.resumeData?.buscoAssembly ||
				annotation.resumeData?.busco_assembly_step_state === 'success'
			);
			const hasBuscoAnnotationData = Boolean(
				annotation.resumeData?.busco_annotation_result?.raw_summary ||
				annotation.resumeData?.busco_annotation_result?.results ||
				annotation.resumeData?.buscoAnnotation ||
				annotation.resumeData?.busco_annotation_step_state === 'success'
			);
	
			// Only load Busco files for non-functional annotations
			if (!isFunctional) {
				if (annotation.resumeData?.busco_assembly_result?.raw_summary) {
					setFileContents(prevState => ({
						...prevState,
						buscoAssemblyFile: annotation.resumeData.busco_assembly_result.raw_summary
					}));
				} else if (annotation.parameters.buscoSection && annotation.parameters.buscoSection.assembly && hasBuscoAssemblyData && hasResultsPath) {
					await handleDisplayFile(`${annotation.results_path}/Busco_genome.json`, 'buscoAssemblyFile');
				}

				if (annotation.resumeData?.busco_annotation_result?.raw_summary) {
					setFileContents(prevState => ({
						...prevState,
						buscoAnnotationFile: annotation.resumeData.busco_annotation_result.raw_summary
					}));
				} else if (annotation.parameters.buscoSection && annotation.parameters.buscoSection.annotation && hasBuscoAnnotationData && hasResultsPath) {
					await handleDisplayFile(`${annotation.results_path}/Busco_annotation.json`, 'buscoAnnotationFile');
				}
			}
			
			if (!annotation.parameters.brownamingSection.skip) {
				const brownamingResults = annotation.resumeData?.brownamingResults || annotation.resumeData?.brownaming_result?.output_files;
				if (brownamingResults) {
					const brownamingDir = annotation.resumeData?.brownaming_dir || annotation.resumeData?.brownaming_result?.brownaming_dir;
					const statsFileName = brownamingResults.stats ? brownamingResults.stats.split('/').pop() : null;
					const logFileName = brownamingResults.log ? brownamingResults.log.split('/').pop() : null;
					const statsPath = annotation.results_path && brownamingResults.stats
						? `${annotation.results_path}/${brownamingResults.stats}`
						: (brownamingDir && statsFileName ? `${brownamingDir}/${statsFileName}` : null);
					const logPath = annotation.results_path && brownamingResults.log
						? `${annotation.results_path}/${brownamingResults.log}`
						: (brownamingDir && logFileName ? `${brownamingDir}/${logFileName}` : null);

					setFileContents(prevState => ({
						...prevState,
						brownamingStatsFile: statsPath,
					}));
					
					// Load log file content
					if (logPath) {
						await handleDisplayFile(logPath, 'brownamingLogFile');
					}
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
				
				<div className='tabs-container'>
					{annotation && (
						<div className='tabs-header'>
							<div className={`tab ${activeTab === 'Results' ? 'active-tab' : ''}`} onClick={() => setActiveTab('Results')}>Results</div>
							<div className={`tab ${activeTab === 'Parameters' ? 'active-tab' : ''}`} onClick={() => setActiveTab('Parameters')}>Parameters</div>
						</div>
					)}
					
					{annotation && (
						<div className='tabs-content'>
							<div className={`tab-content ${activeTab === 'Results' ? 'active-content' : ''}`}>
								<Results annotation={annotation} fileContents={fileContents} setIsLoading={setIsLoading} />
							</div>
							<div className={`tab-content ${activeTab === 'Parameters' ? 'active-content' : ''}`}>
								<Parameters annotation={annotation} functionalAnnotationRun={isFunctionalAnnotation}/>
							</div>
						</div>
					)}
				</div>
			</div>

			{isLoading && (
				<Loading />
			)}
			{isFetching && !isLoading && (
				<Loading />
			)}
		</div>
	);
};

export default AnnotationResults;
