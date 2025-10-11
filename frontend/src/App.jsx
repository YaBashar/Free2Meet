import Register from './components/Register';
import Login from './components/Login';
import LandingPage from './components/LandingPage';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {

  return (

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Register/>}></Route>
      </Routes>
    </BrowserRouter>

    
  )
}

export default App
