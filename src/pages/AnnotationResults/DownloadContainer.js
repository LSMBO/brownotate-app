import { downloadFromServer } from '../../utils/Download';
import DownloadIcon from "../../assets/download.png"


function DownloadContainer({ annotation, setIsLoading }) {
	const isFunctionalAnnotation = annotation.parameters.type === 'functional';
	const isRnaSeqAnnotation = Boolean(annotation.parameters?.startSection?.rnaSequencing);
	const hasAllResults = annotation.status === 'completed';
	const assemblyFilePath = annotation.resumeData?.assemblyFile
		|| annotation.resumeData?.megahit_result
		|| annotation.resumeData?.canu_result
		|| annotation.parameters.startSection?.assemblyFileOnServer;
	const hasAssemblyDownload = !isRnaSeqAnnotation && Boolean(assemblyFilePath || annotation.parameters.startSection?.assembly || annotation.status === 'completed');
	const brownamingFastaRel = annotation.resumeData?.brownamingResults?.fasta
		|| annotation.resumeData?.brownaming_result?.output_files?.fasta;
	const completedAnnotationPath = brownamingFastaRel && annotation.results_path
		? `${annotation.results_path}/${brownamingFastaRel}`
		: annotation.results_path;
	const annotationDownloadPath = annotation.status === 'completed'
		? completedAnnotationPath
		: (annotation.resumeData?.annotationFile || annotation.resumeData?.augustus_result || null);
	const annotationDownloadExtension = annotationDownloadPath === annotation.results_path ? '.fasta' : null;
	const hasAnnotationDownload = Boolean(annotationDownloadPath);
	const hasBrownamingDownload = Boolean(annotation.resumeData?.brownamingResults && !annotation.parameters.brownamingSection.skip);

	const handleClickDownload = async (path, extension) => {
		setIsLoading(true);
		await downloadFromServer(path, extension);
		setIsLoading(false);
	}


	return (
		<fieldset className='download-container'>
			<legend className="t2_bold">Download</legend>
			{!isFunctionalAnnotation && (
				<>
					<div className={`download ${hasAllResults ? '' : 'disabled'}`} onClick={hasAllResults ? () => handleClickDownload(`${annotation.results_path}`, null) : null}>
						<div className="t2_light">All (zipped)</div>
						<img src={DownloadIcon} alt="download" className="downloadIcon" />
					</div>
					{annotation.parameters.startSection && annotation.parameters.startSection.assembly && !isRnaSeqAnnotation ? (
						<div className='download' onClick={() => handleClickDownload(assemblyFilePath || annotation.parameters.startSection.assemblyFileOnServer)}>
							<div className="t2_light">Assembly</div>
							<img src={DownloadIcon} alt="download" className="downloadIcon" />
						</div>
					) : (
						<div className={`download ${hasAssemblyDownload ? '' : 'disabled'}`} onClick={hasAssemblyDownload ? () => handleClickDownload(assemblyFilePath || `${annotation.results_path}/genome`, assemblyFilePath ? null : '.fasta') : null}>
							<div className="t2_light">Assembly</div>
							<img src={DownloadIcon} alt="download" className="downloadIcon" />
						</div>
					)}			
					<div className={`download ${hasAnnotationDownload ? '' : 'disabled'}`} onClick={hasAnnotationDownload ? () => handleClickDownload(annotationDownloadPath, annotationDownloadExtension) : null}>
						<div className="t2_light">Annotation</div>
						<img src={DownloadIcon} alt="download" className="downloadIcon" />
					</div>
				</>
			)}
			<div className={`download ${hasBrownamingDownload ? '' : 'disabled'}`} onClick={hasBrownamingDownload ? () => handleClickDownload(`${annotation.results_path}/brownaming`, null) : null}>
				<div className="t2_light">Brownaming (zipped)</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
		</fieldset>
	)
}

export default DownloadContainer