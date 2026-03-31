import React from 'react'

const Dashboard = () => {
  return (
    <div>
        <h1>Rider Dashboard</h1>
        <div>
        <div>
            <h3>Coverage</h3>
             <h4>Active</h4>
        </div>
         <div>
            <h3>This Week</h3>
             <h4>187Rs</h4>
        </div>
         <div>
            <h3>Total Recieved</h3>
             <h4>2450Rs</h4>
        </div>
        <div>
            <h3>Risk Status</h3>
            <h4>LOW</h4>
        </div>
        </div>
        <div>
  {/* Merged Graph of Premium Paid and payout get  */}
        </div>
        <div>
            {/* Distruption alert Banner */}
        </div>
        
      
    </div>
  )
}

export default Dashboard