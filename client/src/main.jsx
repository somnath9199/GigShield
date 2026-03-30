import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import Auth from './pages/Auth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<LandingPage/>}/>
      <Route path='/Auth' element={<Auth/>}/>
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
