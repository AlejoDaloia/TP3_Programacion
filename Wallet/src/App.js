import './App.css';
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Totp from './pages/Totp';
import Account from './pages/Account';
import VerifyAccount from './pages/VerifyAccount';
import Transfer from './pages/Transfer';
import TransferProof from './pages/TransferProof';
import RegenerateTotp from './pages/RegenerateTotp';
function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#222',
          borderRadius: 5,
        },
      }}
    >
      <Router>
        <div className="App">

          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/totp" element={<Totp />} />
            <Route path="/account" element={<Account />} />
            <Route path="/verify-account" element={<VerifyAccount />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/transfer-proof" element={<TransferProof />} />
            <Route path="/regenerate-totp" element={<RegenerateTotp />} />
          </Routes>

        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;