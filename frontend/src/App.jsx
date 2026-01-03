import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Profile from './pages/profile'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Aimentor from './pages/AiMentor'
function App() {
  

  return (
 <Router>
  <Routes>
    <Route path ="/" element= {<Login/>}/>
    <Route path ="/home" element= {<HomePage/>}/>
    <Route path ="/profile" element= {<Profile/>}/>
    <Route path ="/aimentor" element= {<Aimentor/>}/>
  </Routes>
 </Router>
  )
}

export default App
