import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [email, setEmail] = useState('');
  const [alias, setAlias] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const navigate = useNavigate();

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: nombre,
      username: alias,
      email: email,
    };

    axios.post('https://raulocoin.onrender.com/api/register', data)
      .then((response) => {
        const res = response.data;
        if (res.success) {
          navigate('/totp', { state: res.totpSetup });
        } else {
          showSnackbar('Registro fallido', 'error');
        }
      })
      .catch((error) => {
        console.error(error);
        showSnackbar('Error al registrarse', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
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
            Regístrate
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={2}>
            ¡Empecemos esta aventura juntos!
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: '#C62368',
                '&:hover': { bgcolor: '#A31C55' },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarme'}
            </Button>

            <Box textAlign="center" sx={{ mt: 2 }}>
              <MuiLink component={Link} to="/" underline="hover" color="#C62368">
                Iniciar sesión
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;