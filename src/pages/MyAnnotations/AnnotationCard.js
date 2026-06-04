import "./AnnotationCard.css"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { useAnnotations } from '../../contexts/AnnotationsContext';
import axios from 'axios';
import CONFIG from '../../config';
import resumeArrowIcon from "../../assets/resume_arrow.png"
import Image from "../../components/Image";
import AnnotationProgressBar from "./AnnotationProgressBar";
import { handleAnnotationRunNewArchitecture } from '../../utils/AnnotationRun';

const AnnotationCard = ({ user, annotation }) => {
    const navigate = useNavigate();
    const { waitingTime, fetchUserAnnotations, fetchCPUs, updateAnnotation, setIsLoading } = useAnnotations();
    const [resolvedError, setResolvedError] = useState(annotation.error || null);

    useEffect(() => {
      setResolvedError(annotation.error || null);
    }, [annotation.error]);

    useEffect(() => {
      const fetchErrorMessage = async () => {
        if (annotation.status !== "failed") {
          return;
        }

        try {
          const response = await axios.post(`${CONFIG.API_BASE_URL}/get_error_message`, { run_id: annotation.parameters.id });
          if (response.status === 200 && response.data?.status === 'success' && response.data?.data?.message) {
            setResolvedError((prev) => {
              const remoteError = response.data.data;
              const previousMessage = typeof prev === 'string' ? prev : prev?.message;
              const shouldKeepPreviousMessage = previousMessage && previousMessage.trim() && previousMessage !== 'Pipeline failed';
              if (previousMessage && previousMessage.trim() && previousMessage !== 'Pipeline failed') {
                return {
                  ...(typeof prev === 'object' && prev ? prev : { message: previousMessage }),
                  step: remoteError.step,
                  source: remoteError.source,
                  run_id: remoteError.run_id,
                  message: previousMessage,
                };
              }
              return {
                ...(typeof prev === 'object' && prev ? prev : {}),
                ...remoteError,
                message: shouldKeepPreviousMessage ? previousMessage : remoteError.message
              };
            });
          }
        } catch (error) {
          console.error('Error fetching failed run message:', error);
        }
      };

      fetchErrorMessage();
    }, [annotation.status, annotation.parameters.id]);

    const formatDate = (dateTimeString) => {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
        });
    };

    const handleRefreshRun = async (e) => {
      e.stopPropagation();
      fetchUserAnnotations(user, true);
    }

    const handleDeleteRun = async (e) => {
      e.stopPropagation();
      const confirmDelete = window.confirm("Are you sure you want to completely delete this annotation?");
      if (!confirmDelete) {
        return;
      }
      setIsLoading(true);
      try {
        await axios.post(`${CONFIG.API_BASE_URL}/delete_run`, { id: annotation.parameters.id });
        fetchUserAnnotations(user, true)
        fetchCPUs();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    const handleResumeRun = async (e) => {
      e.stopPropagation();
      const freeCpus = await fetchCPUs();
      if (freeCpus === 0) {
        alert("An annotation is already running on the server. Please try again later.");
        return;
      }
      await updateAnnotation(user, annotation.parameters.id, 'status', 'running');
      
      const isFunctionalAnnotation = annotation.parameters.type === 'functional';
      if (isFunctionalAnnotation) {
        try {
          console.log("Resuming Brownaming for run ID:", annotation.parameters.id);
          const brownamingResult = await axios.post(`${CONFIG.API_BASE_URL}/run_brownaming`, { 'resume': true, 'run_id': annotation.parameters.id });
          await updateAnnotation(user, annotation.parameters.id, 'resumeData', {
              'brownamingResults': brownamingResult.data.output_files,
              'brownaming_dir': brownamingResult.data.brownaming_dir
          });    
          await axios.post(`${CONFIG.API_BASE_URL}/set_annotation_completed`, { 'run_id': annotation.parameters.id })

        } catch (error) {
            await updateAnnotation(user, annotation.parameters.id, 'status', 'failed');
            await updateAnnotation(user, annotation.parameters.id, 'error', error.response?.data || error.message);
        }   

      } else {
        await handleAnnotationRunNewArchitecture(annotation.parameters.id, user, fetchUserAnnotations);
      }
    }

    const handleClick = (tab) => {
        navigate(`/my-annotations/${annotation.parameters.id}`, { state: { tab: tab } });
    };

    const parseBuscoScore = (summary) => {
      if (typeof summary !== 'string') {
        return null;
      }
      const match = summary.match(/C:\s*([0-9]+(?:\.[0-9]+)?)%/i);
      return match ? `${match[1]}%` : null;
    };

    const getBuscoScore = (scope) => {
      const resultKey = scope === 'assembly' ? 'busco_assembly_result' : 'busco_annotation_result';
      const result = annotation.resumeData?.[resultKey];

      const scoreFromScores = result?.scores?.C;
      if (typeof scoreFromScores === 'number') {
        return `${scoreFromScores}%`;
      }

      const scoreFromResults = result?.results?.['Complete percentage'];
      if (typeof scoreFromResults === 'number') {
        return `${scoreFromResults}%`;
      }

      return parseBuscoScore(result?.results?.one_line_summary || result?.raw_summary);
    };

    const isFunctionalAnnotation = annotation.parameters.type === 'functional';
    const assemblyBuscoScore = getBuscoScore('assembly');
    const annotationBuscoScore = getBuscoScore('annotation');
    const errorObj = typeof resolvedError === 'object' && resolvedError !== null ? resolvedError : null;
    const errorMessage = typeof resolvedError === 'string' ? resolvedError : errorObj?.message;

    return (
      <div className={`annotation-card t2_light ${annotation.status}`}>
        <button className="refresh-btn" onClick={async (e) => { await handleRefreshRun(e); }}>REFRESH</button>
        <button className="delete-btn" onClick={async (e) => { await handleDeleteRun(e); }}>X</button>

        <div className="taxonomy-annotation-card">
          <Image file={annotation.parameters.species.imageUrl}/>
          <div className="annotation-infos">
            <label>
              <i>{annotation.parameters.species.scientificName.charAt(0).toUpperCase() + annotation.parameters.species.scientificName.slice(1).toLowerCase()}</i>&nbsp;[TaxID: {annotation.parameters.species.taxonID}]
            </label>
            <label>{formatDate(annotation.parameters.id)}</label>
          </div>
        </div>
        {isFunctionalAnnotation && <label className="functional-badge">Brownaming</label>}
        {!isFunctionalAnnotation && (
          <AnnotationProgressBar annotation={annotation} waitingTime={waitingTime}/>
        )}
        {isFunctionalAnnotation && (
          <label className={`functional-status ${annotation.status}`}><b>Status:</b> {annotation.status}</label>
        )}
        <div className="annotation-details">
          <button className='t2_bold btn-tab-style' onClick={ () => handleClick('parameters') }>Parameters</button>
          <button className='t2_bold btn-tab-style' onClick={ () => handleClick('results') }>Results</button>
        </div>
        {(assemblyBuscoScore || annotationBuscoScore) && (
          <div className="annotation-busco-summary">
            {assemblyBuscoScore && <label>Busco on assembly: {assemblyBuscoScore}</label>}
            {annotationBuscoScore && <label>Busco on annotation: {annotationBuscoScore}</label>}
          </div>
        )}
        {annotation.status === "failed" && (
          <>
            <h4>Pipeline failed</h4>
            <div className="failed-run-id"><b>Run ID:</b> {annotation.parameters.id}</div>
          </>
        )}
        {annotation.status === "failed" && resolvedError && (
          <>
            <div className="annotation-error-box">
              {errorMessage && (
                <div><b>Message:</b> {errorMessage}</div>
              )}
              {errorObj?.command && (
                <div><b>Command:</b> <code>{errorObj.command}</code></div>
              )}
              {errorObj?.stderr && errorObj.stderr.trim() && (
                <div className="error-block"><b>stderr:</b><pre>{errorObj.stderr}</pre></div>
              )}
              {errorObj?.stdout && errorObj.stdout.trim() && (
                <div className="error-block"><b>stdout:</b><pre>{errorObj.stdout}</pre></div>
              )}
              {errorObj?.timer && (
                <div><b>Time before failure:</b> {errorObj.timer}</div>
              )}
            </div>
          </>
        )}
        {annotation.status === "failed" && (
          <button className="resume-btn" onClick={(e) => { handleResumeRun(e); }}>
              <label>RESUME</label>
              <img src={resumeArrowIcon} alt="Resume icon" className="resume-icon" />
            </button>
        )}
      </div>
    );

}
export default AnnotationCard;
