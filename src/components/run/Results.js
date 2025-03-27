import React from 'react'
import ResultsFailedRun from './ResultsFailedRun';
import ResultsCompletedRun from './ResultsCompletedRun';


function Results({ run, fileContents, setIsLoading }) {
  return (
      <div>
        {run.status === "failed" && (
          <ResultsFailedRun run={run} />
        )}					
        {(run.status === "completed" || run.status === "incomplete") && (
          <ResultsCompletedRun run={run} fileContents={fileContents} setIsLoading={setIsLoading} />
        )}
      </div>
    )
}

export default Results