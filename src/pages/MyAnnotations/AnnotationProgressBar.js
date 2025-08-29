import React from 'react';

const AnnotationProgressBar = ({ annotation, waitingTime }) => {
  const stepList = annotation.stepList || [];
  const totalUnits = stepList.reduce((sum, step) => sum + (step.type === 'major' ? 3 : 1), 0);

  // Nettoie la clé pour matcher waitingTime
  const waitingKey = annotation.progress ? annotation.progress.replace('...', '') : '';
  return (
    <div className='progress-bar-container'>
      {annotation.status !== 'failed' && (
        <>
          <h4 className={annotation.status}>{annotation.progress}</h4>
          {/* <div className="debugging-container">
            <h3>Debugging Information</h3>
            <pre>{JSON.stringify(waitingTime, null, 2)}</pre>
          </div> */}
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
          let annotationProgress = annotation.progress;

          if (annotation.progress === "Less than 400 genes predicted, retrying with more flexible Scipio ...") {
            annotationProgress = "Running Scipio ...";
          } else if (annotation.progress === "Running gene prediction model after flexible Scipio ...") {
            annotationProgress = "Running gene prediction model ...";
          }
          const progressIdx = stepList.findIndex(s => s.name === annotationProgress);
          if (step.name === annotationProgress) {
            state = 'active';
            if (annotation.status === 'failed') {
              state = 'failed';
            }
          } else if (progressIdx > idx || annotationProgress === "Annotation run completed successfully") {
            state = 'completed';
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