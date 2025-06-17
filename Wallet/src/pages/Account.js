import React, { useEffect, useState } from 'react';
import {
  Box, Typography, IconButton, Button, CircularProgress, Paper,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData] = useState(() => JSON.parse(localStorage.getItem('userData')));
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth0(); 

  useEffect(() => {
    const fetchMovimientos = async () => {
      if (!userData) return;
      setLoading(true);
      try {
        const { email } = userData;
        const res = await axios.post('https://raulocoin.onrender.com/api/auth0/transactions', {
          email
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

  const HandleLogout = () => {
    localStorage.removeItem('userData');
    logout({ returnTo: window.location.origin });
  };

  const handleTransfer = () => navigate('/transfer');

  const tipo = {
    sent: 'TRANSFERENCIA ENVIADA',
    received: 'TRANSFERENCIA RECIBIDA',
    award: 'TRANSFERENCIA RECIBIDA',
  };

  const movimientosFiltrados = movimientos
    .filter(m => ['sent', 'received', 'award'].includes(m.type))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

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
          <IconButton onClick={HandleLogout} sx={{ color: 'white' }}>
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
          Últimos movimientos
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
          ) : movimientosFiltrados.length === 0 ? (
            <Typography color="white">No hay movimientos disponibles.</Typography>
          ) : (
            movimientosFiltrados.map((mov, i) => (
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
    </Box>
  );
};

export default Account;