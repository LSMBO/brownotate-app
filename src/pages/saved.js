const handleClickClassicRun = () => {
    console.log(`Classic run with ${JSON.stringify(parameters, null, 2)} !!`)
    const newRun = new Run(new Date().getTime(), parameters);
    setRuns(prevRuns => [...prevRuns, newRun]);

    axios.post('http://localhost:5000/run_script', { argument: parameters })
    .then(response => {
        const lines = response.data.split('\n');
        const lastLine = lines[lines.length - 2];
        newRun.updateStatus('completed');
        newRun.updateData(lastLine);
        setRuns(prevRuns => [...prevRuns]);
    })
    .catch(error => {
        console.error('Error:', error);
        newRun.updateStatus('error');
        setRuns(prevRuns => [...prevRuns]);
    });
}

const handleClickAuto = () => {
	console.log(`Auto run with ${parameters.species.scientificName}`)
	const newRun = new Run(new Date().getTime(), parameters);
	setRuns(prevRuns => [...prevRuns, newRun]);

	axios.post('http://localhost:5000/run_script_auto', { argument: parameters })
	.then(response => {
		const lines = response.data.split('\n');
		const lastLine = lines[lines.length - 2];
		newRun.updateStatus('completed');
		newRun.updateData(lastLine);
		setRuns(prevRuns => [...prevRuns]);
	})
	.catch(error => {
		console.error('Error:', error);
		newRun.updateStatus('error');
		setRuns(prevRuns => [...prevRuns]);
	});
}


const handleSetSpecies = (speciesData) => {
	setParameters((prevParameters) => ({
	  ...prevParameters,
	  species: {
		scientificName: speciesData[0],
		taxonID: speciesData[1],
	  },
	}));
  };