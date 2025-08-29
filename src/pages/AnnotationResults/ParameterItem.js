import React from 'react'

function ParameterItem({ label, value }) {
	return (
		<div className='item'>
			<div className="label">{label}</div>
			<div className="value">{value}</div>
		</div>
	)
}

export default ParameterItem