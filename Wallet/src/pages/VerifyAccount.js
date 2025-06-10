import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Link as MuiLink
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyAccount = () => {
  const location = useLocation();
  const [alias] = useState(location.state?.alias || '');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      username: alias,
      totpToken: codigo,
    };

    try {
      const verifyResponse = await axios.post('https://raulocoin.onrender.com/api/verify-totp-setup', data);
      const verifyRes = verifyResponse.data;

      if (verifyRes.success) {
        const userResponse = await axios.post('https://raulocoin.onrender.com/api/user-details', data);
        const userRes = userResponse.data;

        if (userRes.success && userRes.user) {
          localStorage.setItem('userData', JSON.stringify({
            name: userRes.user.name,
            username: userRes.user.username,
            balance: userRes.user.balance,
            token: data.totpToken,
          }));
          navigate('/account');
        } else {
          setSnackbar({ open: true, message: 'No se pudieron obtener los datos del usuario.', severity: 'error' });
        }
      } else {
        setSnackbar({ open: true, message: 'Código TOTP incorrecto.', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al verificar el código TOTP.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundImage: 'url(/assets/background-image-waves.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: 1000,
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#001220',
            color: 'white',
            p: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <img
            className="floating-logo"
            src="/assets/raulocoinlogo.png"
            alt="raulCoin"
            style={{ width: '80%', height: 'auto', border: '0px solid white' }}
          />
        </Box>
        <Paper
          sx={{
            flex: 1,
            p: { xs:2, sm: 4 },
            bgcolor: '#F2E2C4',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxHeight: { xs: '90dvh', sm: '90dvh' },
            overflowY: 'auto',
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Verifica tu cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={2}>
            ¡Es necesario verificar para continuar!
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label="Alias"
              value={alias}
              disabled
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Código TOTP"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                bgcolor: '#C62368',
                '&:hover': { bgcolor: '#A31C55' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verificar'}
            </Button>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <MuiLink component={Link} to="/" underline="hover" color="#C62368">
                Volver
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VerifyAccount;