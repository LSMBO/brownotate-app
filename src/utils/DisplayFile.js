import axios from 'axios';
import CONFIG from '../config';

function displayBusco(data) {
    const completePercent = parseFloat(data.results["Complete percentage"]);
    const singleCopyPercent = parseFloat(data.results["Single copy percentage"]);
    const multiCopyPercent = parseFloat(data.results["Multi copy percentage"]);
    const fragmentedPercent = parseFloat(data.results["Fragmented percentage"]);
    const missingPercent = parseFloat(data.results["Missing percentage"]);

    const singleCopyWidth = `${singleCopyPercent}%`;
    const multiCopyWidth = `${multiCopyPercent}%`;
    const fragmentedWidth = `${fragmentedPercent}%`;
    const missingWidth = `${missingPercent}%`;

    return (
        <div>
			<div className="legend">
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#aacc30' }}></span>
                    <span>Single-copy</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#137c6e' }}></span>
                    <span>Multi-copy</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#eca15b' }}></span>
                    <span>Fragmented</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#2604bd' }}></span>
                    <span>Missing</span>
                </div>
            </div>

            <div className="progress-bar">
                <div className="progress-segment" style={{ width: singleCopyWidth, backgroundColor: '#aacc30' }}></div>
                <div className="progress-segment" style={{ width: multiCopyWidth, backgroundColor: '#137c6e' }}></div>
                <div className="progress-segment" style={{ width: fragmentedWidth, backgroundColor: '#eca15b' }}></div>
                <div className="progress-segment" style={{ width: missingWidth, backgroundColor: '#2604bd' }}></div>
            </div>

			<div className="busco-stats">
				<div>n:{data.lineage_dataset.number_of_buscos} · {data.lineage_dataset.name}</div>
				<div className="busco-percentages"><span style={{ fontWeight: 'bold'}}>C:{completePercent.toFixed(1)}%</span> (S:{singleCopyPercent.toFixed(1)}% D:{multiCopyPercent.toFixed(1)}%) F:{fragmentedPercent.toFixed(1)}% M:{missingPercent.toFixed(1)}%</div>
			</div>
        </div>
    );
}

export async function displayFile(path) {
    let file_type = ".txt";
    if (path.endsWith('.json')) {
        file_type = '.json';
    }

    try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/read_file`, { path: path, file_type: file_type });
        const fileContent = response.data;

        // Formatage du contenu en JSX
        if (file_type === '.json') {
			if (path.includes('Busco')) {
                return displayBusco(fileContent);
            } else {
                return <pre>{JSON.stringify(fileContent, null, 2)}</pre>;
            }
        } else {
            return <pre>{fileContent}</pre>;
        }
    } catch (error) {
        console.error('Error fetching file:', error);
        return <p>Error fetching file: {error.message}</p>; // Gestion de l'erreur
    }
}