import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css'
import MainDisplay from './pages/MainDisplay';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import AdminPanel from './pages/AdminPanel';
import FrogApp from './pages/FrogApp';


function App() {

  return (
    <Router>
      <div>
      {/* <div className='nav-here'>
        <Link to={'/'}> </Link>
        <div>
          <WalletMultiButton />
        </div>
      </div> */}
        <Routes>
          <Route path='/' element={<FrogApp/>}/>
          {/* <Route path='/iamadmin' element={<AdminPanel/>}/> */}
          {/* <Route path='/mine' element={<MyProducts/>}/> */}
        </Routes>

      </div>
    </Router>
  )
}

export default App
