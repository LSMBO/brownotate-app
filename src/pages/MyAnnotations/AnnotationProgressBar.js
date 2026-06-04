import React, { useState, useEffect } from 'react';

const AnnotationProgressBar = ({ annotation, waitingTime }) => {
  const NO_ESTIMATE_STEPS = new Set([
    'Searching for evidences (proteins) in the databases ...',
    'Selecting and downloading evidences (proteins) from the database search ...',
    'Downloading sequencing files from SRA ...',
    'Splitting assembly for annotation ...',
    'Removing redundancy from annotation ...'
  ]);

  const STEP_ALIASES = {
    'Removing short sequences from annotation according to the length filter ...': [
      'Removing short sequences from annotation ...'
    ]
  };

  const progressKey = (label) => String(label || '').replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
  const timerKey = (label) => String(label || '').replace(/\./g, '');
  const aliasesFor = (stepName) => [stepName, ...(STEP_ALIASES[stepName] || [])];

  const formatStepStartTime = (unixSeconds) => {
    if (!unixSeconds) return null;
    const date = new Date(unixSeconds * 1000);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const normalizeProgress = (progress) => {
    if (Array.isArray(progress)) {
      return [...progress];
    }
    if (typeof progress === 'string' && progress.trim()) {
      return [progress];
    }
    return [];
  };

  const stepList = annotation.stepList || [];
  const totalUnits = stepList.reduce((sum, step) => sum + (step.type === 'major' ? 3 : 1), 0);
  const [progressList, setProgressList] = useState([])
  const [activeStep, setActiveStep] = useState(null);
  const [waitingKey, setWaitingKey] = useState('')

  const resumeData = annotation.resumeData || {};
  const progressStartedAt = resumeData.progress_started_at || {};
  const progressFinishedAt = resumeData.progress_finished_at || {};
  const timers = annotation.timers || {};
  const hasCompletedStep = (stepName) => {
    return aliasesFor(stepName).some((name) => {
      const key = progressKey(name);
      return Boolean(
        progressFinishedAt[key] ||
        timers[name] ||
        timers[timerKey(name)]
      );
    });
  };
  const isScipioActive = activeStep === 'Running Scipio ...';
  const activeSubstep = resumeData.scipio_flex_step_state === 'running'
    ? resumeData.scipio_flex_detail
    : (resumeData.scipio_step_state === 'running' ? resumeData.scipio_detail : null);
  const activeStepStart = activeStep ? formatStepStartTime(progressStartedAt[progressKey(activeStep)]) : null;
  const canShowEstimate = annotation.status === 'running' && activeStep && !NO_ESTIMATE_STEPS.has(activeStep);
  const hasStepStarted = (stepName) => {
    return aliasesFor(stepName).some((name) => {
      const key = progressKey(name);
      return Boolean(
        progressList.includes(name) ||
        progressStartedAt[key] ||
        hasCompletedStep(name)
      );
    });
  };

  const failedBoundary = annotation.status === 'failed'
    ? stepList.reduce((maxIdx, step, idx) => (hasStepStarted(step.name) ? idx : maxIdx), -1)
    : -1;

  useEffect(() => {
    let mergedProgressList = normalizeProgress(annotation.progress);
    progressList.forEach((previousProgress) => {
      if (!mergedProgressList.includes(previousProgress)) {
        mergedProgressList.push(previousProgress);
      }
    });

    const completedStepNames = stepList
      .filter((step) => mergedProgressList.includes(step.name) || hasCompletedStep(step.name))
      .map((step) => step.name);
    const stableProgressList = Array.from(new Set([...mergedProgressList, ...completedStepNames]));

    let newActiveStep = null;

    if (annotation.status === 'completed') {
      setProgressList(stableProgressList);
      setActiveStep('Brownotate completed successfully');
      setWaitingKey('');
      return;
    }

    const firstIncompleteIndex = stepList.findIndex((step) => !completedStepNames.includes(step.name));
    if (firstIncompleteIndex === -1) {
      newActiveStep = annotation.status === 'failed'
        ? 'Pipeline failed'
        : (stepList[stepList.length - 1]?.name || 'Creating annotation run ...');
    } else if (firstIncompleteIndex === 0) {
      newActiveStep = 'Creating annotation run ...';
    } else {
      newActiveStep = stepList[firstIncompleteIndex - 1].name;
    }

    setProgressList(stableProgressList);
    setActiveStep(newActiveStep);
    setWaitingKey(newActiveStep ? newActiveStep.replace('...', '') : '');
  }, [annotation]);

  return (
    <div className='progress-bar-container'>
      {annotation.status !== 'failed' && (
        <>
          <h4 className={annotation.status}>{activeStep}</h4>
          {activeStepStart && (
            <div style={{ fontSize: '0.9em', opacity: 0.85, marginBottom: '6px' }}>
              Started at: {activeStepStart}
            </div>
          )}
          {isScipioActive && activeSubstep && (
            <div style={{ fontSize: '0.9em', opacity: 0.85, marginBottom: '6px' }}>{activeSubstep}</div>
          )}
          {canShowEstimate && waitingTime && waitingTime[waitingKey] && (
            <span>Estimated waiting time: {waitingTime[waitingKey][0]} to {waitingTime[waitingKey][1]}</span>
          )}
        </>
      )}
      <div className='progress-bar'>
        {stepList.map((step, idx) => {
          const units = step.type === 'major' ? 3 : 1;
          const widthPercent = (units / totalUnits) * 100;
          let state = '';

            if (annotation.status === 'completed') {
              state = 'completed';
            } else if (step.name === activeStep) {
            state = 'active';
          } else if (progressList.includes(step.name) || hasCompletedStep(step.name)) {
            state = 'completed';
          }
          if (annotation.status === 'failed' && idx <= failedBoundary && hasStepStarted(step.name)) {
            state = 'failed';
          }
          return (
            <div
              key={idx}
              className={`progress-bar-segment ${step.type} ${state}`}
              style={{
                width: `${widthPercent}%`,
                borderRight: idx < stepList.length - 1 ? '2px solid #fff' : 'none',
              }}
              title={step.name}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AnnotationProgressBar;