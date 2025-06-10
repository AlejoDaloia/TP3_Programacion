import React, { useEffect, useState } from 'react';
import {
  Box, Typography, IconButton, Button, CircularProgress, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTotpPrompt, setShowTotpPrompt] = useState(false);
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('userData'));
    if (!savedData) return navigate('/');

    if (location.state?.clearToken) {
      delete savedData.token;
      localStorage.setItem('userData', JSON.stringify(savedData));
    }

    if (!savedData.token) setShowTotpPrompt(true);

    setUserData(savedData);
  }, [navigate, location.state?.reload, location.state?.clearToken]);

  useEffect(() => {
    const fetchMovimientos = async () => {
      if (!userData) return;
      setLoading(true);
      try {
        const { username, token } = userData;
        const res = await axios.post('https://raulocoin.onrender.com/api/transactions', {
          username,
          totpToken: token,
        });
        setMovimientos(res.data.transactions || []);
      } catch (error) {
        console.error('Error al cargar movimientos:', error);
        setMovimientos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovimientos();
  }, [userData, location.state?.reload]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleTransfer = () => navigate('/transfer');

  const tipo = {
    sent: 'TRANSFERENCIA ENVIADA',
    received: 'TRANSFERENCIA RECIBIDA',
    award: 'TRANSFERENCIA RECIBIDA',
  };

  if (!userData) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundImage: 'url(/assets/background-image-waves.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        p: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: { xs: 4, md: 0 },
        }}
      >
        <Paper
          elevation={5}
          sx={{
            width: '100%',
            maxWidth: 500,
            aspectRatio: '16 / 9',
            bgcolor: '#032340',
            color: 'white',
            borderRadius: 4,
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          }}
        >
          <Box>
            <Typography variant="subtitle1" color="#F26938">
              Nombre
            </Typography>
            <Typography variant="h5" gutterBottom>
              {userData.name}
            </Typography>
            <Typography variant="subtitle1" color="#F26938">
              Alias
            </Typography>
            <Typography variant="h5">{userData.username}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="#F26938">
              Saldo disponible
            </Typography>
            <Typography variant="h3" fontWeight="bold">
              R$ {userData.balance}
            </Typography>
          </Box>
        </Paper>
      </Box>
      <Box
        sx={{
          flex: 1,
          ml: { md: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="white">Hola, {userData.name}</Typography>
          <IconButton onClick={handleLogout} sx={{ color: 'white' }}>
            <LogoutIcon />
          </IconButton>
        </Box>

        <Button
          variant="contained"
          onClick={handleTransfer}
          sx={{
            bgcolor: '#A61F43',
            '&:hover': { bgcolor: '#7e1833' },
            color: 'white',
            mb: 2,
          }}
        >
          Transferir
        </Button>

        <Typography variant="h6" color="white">
          Historial de Movimientos
        </Typography>

        <Box
          sx={{
            maxHeight: { xs: 300, md: 'calc(100vh - 180px)' },
            overflowY: 'auto',
            pr: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center"><CircularProgress color="inherit" /></Box>
          ) : movimientos.length === 0 ? (
            <Typography color="white">No hay movimientos disponibles.</Typography>
          ) : (
            movimientos.map((mov, i) => (
              <Paper key={i} elevation={3} sx={{
                p: 2,
                borderLeft: '25px solid',
                borderLeftColor: mov.type === 'sent' ? 'error.main' : 'success.main',
                borderRadius: 2,
                bgcolor: '#FAF3EC',
              }}>
                <Typography fontWeight="bold">{tipo[mov.type] || mov.type}</Typography>
                <Typography color={mov.amount >= 0 ? 'green' : 'red'}>
                  {mov.amount >= 0 ? '+' : ''}{mov.amount} R$
                </Typography>
                <Typography>{mov.description}</Typography>
                {mov.type === 'sent' && <Typography>Enviado a: {mov.toName}</Typography>}
                {mov.type === 'received' && <Typography>Recibido de: {mov.fromName}</Typography>}
                {mov.type === 'award' && <Typography>Recibido de: {mov.awardedBy || 'Sistema'}</Typography>}
                <Typography fontSize={12} color="gray">
                  Fecha: {new Date(mov.createdAt * 1000).toLocaleString()}
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      </Box>

      <Dialog open={showTotpPrompt}>
        <DialogTitle>Por favor ingrese su token</DialogTitle>
        <DialogContent>
          <TextField
            type="text"
            fullWidth
            value={tempToken}
            onChange={(e) => setTempToken(e.target.value)}
            inputProps={{ maxLength: 6 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ color: '#032340' }}
            onClick={() => {
              navigate('/');
              localStorage.removeItem('userData');
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: '#A61F43',
              '&:hover': { bgcolor: '#7e1833' },
              color: 'white',
            }}
            onClick={() => {
              if (tempToken.length === 6) {
                const updatedData = { ...userData, token: tempToken };
                localStorage.setItem('userData', JSON.stringify(updatedData));
                setUserData(updatedData);
                setShowTotpPrompt(false);
              } else {
                setShowTotpPrompt(true);
              }
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Account;