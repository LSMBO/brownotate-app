import axios from 'axios';
import CONFIG from '../config';


export async function handleAnnotationRunNewArchitecture(runId, user, fetchUserAnnotations) {
    console.log('[NEW-ORCHESTRATION] Starting annotation run via new architecture');
    
    // Fetch run to get parameters
    const getRunResult = await axios.post(`${CONFIG.API_BASE_URL}/get_run`, { 'run_id': runId });
    if (getRunResult.status !== 200) {
        console.error('Error fetching run data');
        return;
    }
    
    const runData = getRunResult.data.data;
    const parameters = runData.parameters;
    const cpus = runData.parameters?.cpus || runData.cpus || 4;
    
    console.log('[NEW-ORCHESTRATION] Launching server-side orchestration with parameters:', parameters);
    
    // SINGLE REQUEST: Launch orchestration on server
    // The server handles ALL step sequencing, execution, and error handling
    try {
        const orchestrationResponse = await axios.post(
            `${CONFIG.API_BASE_URL}/run_annotation_orchestrated`,
            {
                run_id: runId,
                user: user,
                parameters: parameters,
                cpus: cpus
            }
        );
        
        if (orchestrationResponse.status !== 200) {
            console.error('Failed to start orchestration');
            return;
        }
        
        console.log('[NEW-ORCHESTRATION] Orchestration started on server, polling for progress...');
    } catch (error) {
        console.error('Error launching orchestration:', error);
        return;
    }
    
    // POLLING LOOP: Client becomes read-only observer
    // Poll every 30s to check status and update UI
    await pollAnnotationProgress(user, runId, fetchUserAnnotations);
}


export async function pollAnnotationProgress(user, runId, fetchUserAnnotations, pollIntervalMs = 5000) {
    const maxPollAttempts = 1000; // ~8 hours at 30s intervals
    let pollCount = 0;
    
    return new Promise((resolve) => {
        const pollOnce = async () => {
            pollCount++;
            
            try {
                // Fetch current run state
                const response = await axios.post(`${CONFIG.API_BASE_URL}/get_run`, { 'run_id': runId });
                
                if (response.status !== 200) {
                    console.error('[POLLING] Failed to fetch run status');
                    return;
                }
                
                const runData = response.data.data;
                const status = runData.status;
                const progress = runData.progress;
                
                console.log(`[POLLING] Poll #${pollCount}: status=${status}, progress="${progress}"`);
                
                await fetchUserAnnotations(user, false);
                
                // Check if annotation is complete or failed
                if (status === 'completed') {
                    console.log('[POLLING] Annotation completed!');
                    resolve({ success: true, status: 'completed' });
                    return true;
                } else if (status === 'failed') {
                    const error = runData.error || 'Unknown error';
                    console.error('[POLLING] Annotation failed:', error);
                    resolve({ success: false, status: 'failed', error });
                    return true;
                } else if (pollCount >= maxPollAttempts) {
                    console.warn('[POLLING] Max poll attempts reached, stopping');
                    resolve({ success: false, status: 'timeout' });
                    return true;
                }
                // Otherwise continue polling...
                return false;
                
            } catch (error) {
                console.error('[POLLING] Error polling status:', error);
                // Continue polling despite errors
                return false;
            }
        };

        // Run one poll immediately to avoid a long blank initial state.
        pollOnce().then((isDone) => {
            if (isDone) return;

            const pollInterval = setInterval(async () => {
                const done = await pollOnce();
                if (done) {
                    clearInterval(pollInterval);
                }
            }, pollIntervalMs);
        });
    });
}
