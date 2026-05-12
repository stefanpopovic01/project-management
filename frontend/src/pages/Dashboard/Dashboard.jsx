import { React, useState} from 'react';
import './Dashboard.css'

import ForYou from '../ForYou/ForYou';

function Dashboard() {

  return (
    <div className="dashboard-container">
        <ForYou/>
    </div>
  )
}

export default Dashboard;
