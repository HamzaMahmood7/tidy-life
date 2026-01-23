import './App.css'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import UserProfilePage from './pages/UserProfilePage'
import Footer from './components/Footer'
import NotFoundPage from './pages/NotFoundPage'

function App() {

  return (
    <>
    <Navbar />
      <Routes>
        <Route path='/' element={<SignupPage />} />
        <Route path='/login' element={<LoginPage /> } />
        <Route path='/profile' element={<UserProfilePage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
