import axios from 'axios';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runAsyncPolledStep({
    apiBaseUrl,
    startPath,
    statusPath,
    payload,
    updateAnnotation,
    user,
    runId,
    stepLabel,
    pollMs = 30000,
    statusQuery = {}
}) {
    const startResponse = await axios.post(`${apiBaseUrl}${startPath}`, payload);
    if (startResponse.status !== 200 || startResponse.data?.status !== 'started') {
        throw new Error(startResponse.data?.message || `Unable to start ${stepLabel}`);
    }

    let lastDetail = null;

    while (true) {
        await sleep(pollMs);

        try {
            const query = new URLSearchParams(statusQuery).toString();
            const url = `${apiBaseUrl}${statusPath}${query ? `?${query}` : ''}`;
            const statusResponse = await axios.get(url);
            const statusData = statusResponse.data;

            if (statusData.status === 'running' && statusData.detail && statusData.detail !== lastDetail) {
                lastDetail = statusData.detail;
                const resumeKey = statusPath.includes('scipio')
                    ? (statusQuery.flex === 'true' ? 'scipio_flex_detail' : 'scipio_detail')
                    : 'current_step_detail';
                await updateAnnotation(user, runId, 'resumeData', { [resumeKey]: statusData.detail });
            }

            if (statusData.status === 'completed') {
                const normalizedResult =
                    statusData.result ??
                    statusData.data ??
                    statusData.assemblyFile ??
                    statusData;
                return {
                    data: normalizedResult,
                    timer: statusData.timer
                };
            }

            if (statusData.status === 'error') {
                const err = statusData.error || `${stepLabel} failed`;
                await updateAnnotation(user, runId, 'status', 'failed');
                await updateAnnotation(user, runId, 'error', err);
                throw new Error(err);
            }
        } catch (error) {
            if (error.response?.data?.status === 'error') {
                throw error;
            }
            // Keep polling on transient network issues.
        }
    }
}
