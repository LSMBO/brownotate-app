import React from 'react'

function TabsHeader({ run, activeTab, setActiveTab }) {

	return (
		<div className='tabs-header'>
			{run && (
				<>
					<div className={`tab ${activeTab === 'Results' ? 'active-tab' : ''}`} onClick={() => setActiveTab('Results')}>Results</div>
					<div className={`tab ${activeTab === 'Parameters' ? 'active-tab' : ''}`} onClick={() => setActiveTab('Parameters')}>Parameters</div>
				</>
			)}
		</div>
	)
}

export default TabsHeader