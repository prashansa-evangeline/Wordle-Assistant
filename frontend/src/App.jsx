import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Components/Login'
import Signup from './Components/SignUp'
import Game from './Components/Game'
import Hints from './Components/Hints'

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/signup" element={<Signup />} /> 
          <Route path="/game" element={<Game />} />
          <Route path="/hints" element={<Hints />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
