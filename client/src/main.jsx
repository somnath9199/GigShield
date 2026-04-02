import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RiderLiveLocation from './pages/LiveLocation.jsx'
import RiskScore from './pages/RiskScore.jsx'
import Plans from './pages/Plans.jsx'
import History from './pages/History.jsx'
import AppLayout from './components/AppLayout.jsx'
import Bankinfo from './pages/Bankinfo.jsx'
import Profile from './pages/Profile.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/Auth' element={<Auth/>}/>
      <Route path='/dashboard' element={<AppLayout/>}>
        <Route index element={<Dashboard/>}/>
        <Route path='live-location' element={<RiderLiveLocation/>}/>
        <Route path='risk' element={<RiskScore/>}/>
        <Route path='plans' element={<Plans/>}/>
        <Route path='history' element={<History/>}/>
        <Route path='bankinfo' element={<Bankinfo/>}/>
        <Route path='profile' element={<Profile/>}/>
      </Route>
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
