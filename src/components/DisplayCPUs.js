export default function DisplayCPUs({ totalCPUs, usedCPUs, variant = 'default' }) {
    const cpuElements = [];

    for (let i = 0; i < totalCPUs; i++) {
        cpuElements.push(
            <div 
                key={i} 
                className={`cpu-circle ${i < usedCPUs ? 'used' : ''} ${variant === 'settings' ? 'cpu-small' : ''}`}
            />
        );
    }

    return (
        <div className={`cpus-display-container ${variant}`}>
            <div className={`cpus-display ${variant === 'settings' ? 'cpus-display-settings' : ''}`}>
                {cpuElements}
            </div>
            {totalCPUs > 0 && (
                <p className="t1 cpu-label">Server CPUs: Available (grey) In use (red)</p>
            )}
        </div>
    );
}