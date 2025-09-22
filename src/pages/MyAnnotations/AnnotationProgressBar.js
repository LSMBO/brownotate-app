import React, { useState, useEffect } from 'react';

const AnnotationProgressBar = ({ annotation, waitingTime }) => {

  useEffect(() => {
    let mergedProgressList = Array.isArray(annotation.progress) ? [...annotation.progress] : [];
    progressList.forEach((previousProgress) => {
      if (!mergedProgressList.includes(previousProgress)) {
        mergedProgressList.push(previousProgress);
      }
    });

    let newActiveStep = null;
    for (let i = 0; i < stepList.length; i++) {
      const stepName = stepList[i].name;
      if (!mergedProgressList.includes(stepName)) {
        if (!mergedProgressList.includes(stepList[i - 1]?.name)) {
          newActiveStep = "Creating annotation run ...";
        } else {
          newActiveStep = stepList[i-1].name;
        }
        break;
      }
      else if (!mergedProgressList.includes('Annotation run completed successfully')) {
        newActiveStep = stepName;
      }
    }
    if (!newActiveStep) {
      newActiveStep = 'Annotation run completed successfully';
    }
    setProgressList(mergedProgressList);
    setActiveStep(newActiveStep);
    setWaitingKey(newActiveStep ? newActiveStep.replace('...', '') : '');
  }, [annotation]);

  const stepList = annotation.stepList || [];
  const totalUnits = stepList.reduce((sum, step) => sum + (step.type === 'major' ? 3 : 1), 0);
  const [progressList, setProgressList] = useState([])
  const [activeStep, setActiveStep] = useState(null);
  const [waitingKey, setWaitingKey] = useState('')


  return (
    <div className='progress-bar-container'>
      {annotation.status !== 'failed' && (
        <>
          <h4 className={annotation.status}>{activeStep}</h4>
          {waitingTime && waitingTime[waitingKey] && (
            <span>Estimated waiting time: {waitingTime[waitingKey][0]} to {waitingTime[waitingKey][1]}</span>
          )}
        </>
      )}
      <div className='progress-bar'>
        {stepList.map((step, idx) => {
          const units = step.type === 'major' ? 3 : 1;
          const widthPercent = (units / totalUnits) * 100;
          let state = '';

          if (step.name === activeStep) {
            state = 'active';
          } else if (progressList.includes(step.name)) {
            state = 'completed';
          }
          if (annotation.status === 'failed' && progressList.includes(step.name)) {
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