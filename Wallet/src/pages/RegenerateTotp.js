import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegenerateTotp = () => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [totpSetup, setTotpSetup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTotpSetup(null);

    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/regenerate-totp', {
        username: alias,
        email: email,
      });

      if (res.data.success) {
        setTotpSetup(res.data.totpSetup);
      } else {
        setSnackbar({ open: true, message: res.data.message, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error inesperado',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(totpSetup.manualSetupCode);
    setSnackbar({ open: true, message: 'Copiado al portapapeles', severity: 'success' });
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
          {!totpSetup ? (
            <>
              <Typography variant="h5" gutterBottom>
                Regenerar código TOTP
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mb={2}>
                Ingresa tu alias y correo electrónico para generar un nuevo código
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Regenerar'}
                </Button>
                <Box textAlign="center" sx={{ mt: 2 }}>
                  <MuiLink component={Link} to="/" underline="hover" color="#C62368">
                    Volver
                  </MuiLink>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                Nuevo código TOTP
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" mb={2}>
                Escanea este código con tu app de autenticación
              </Typography>
              <Box mt={2} mb={2}>
                <img
                  src={totpSetup.qrCodeUrl}
                  alt="TOTP QR"
                  style={{ maxWidth: 250, borderRadius: 8 }}
                />
              </Box>
              <Typography
                variant="body2"
                onClick={handleCopy}
                sx={{
                  cursor: 'pointer',
                  bgcolor: '#f5f5f5',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  px: 2,
                  py: 1,
                  '&:hover': { bgcolor: '#e0e0e0' }
                }}
              >
                {totpSetup.manualSetupCode}
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{
                  mt: 3,
                  bgcolor: '#C62368',
                  '&:hover': { bgcolor: '#A31C55' },
                }}
              >
                Volver
              </Button>
            </>
          )}
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

export default RegenerateTotp;