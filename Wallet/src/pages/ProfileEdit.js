import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Snackbar, Alert,
  Fade, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const storedData = JSON.parse(localStorage.getItem('userData'));
  const [name, setName] = useState(storedData?.name || '');
  const [username, setUsername] = useState(storedData?.username || '');
  const [email] = useState(storedData?.email || '');
  const [newEmail, setNewEmail] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [submitted, setSubmitted] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const { logout } = useAuth0();

  const handleSubmit = async () => {
    setLoadingEdit(true);
    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/auth0/edit-profile', {
        email,
        name,
        username
      });

      const { message, success, user, changes } = res.data;

      if (success) {
        localStorage.setItem('userData', JSON.stringify(user));
        if (changes.length > 0) {
          setSnackbarMessage('Cambios guardados con éxito');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
          setSubmitted(true);
          setTimeout(() => navigate('/account', { state: { reload: true } }), 2000);
        } else {
          setSnackbarMessage('No se detectaron cambios en el perfil');
          setSnackbarSeverity('info');
          setOpenSnackbar(true);
        }
      } else {
        setSnackbarMessage(message);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Error inesperado';
      setSnackbarMessage(message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleChangeEmail = async () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
    if (!isValidEmail) {
      setSnackbarMessage('El email no tiene un formato válido');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    if (totpToken.length !== 6 || !/^\d+$/.test(totpToken)) {
      setSnackbarMessage('El código TOTP debe tener 6 dígitos');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    setLoadingEmail(true);
    try {
      const res = await axios.post('https://raulocoin.onrender.com/api/change-email', {
        username,
        totpToken,
        newEmail
      });

      const { success, message, user } = res.data;
      if (success) {
        setSnackbarMessage('Email actualizado correctamente');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        localStorage.setItem('userData', JSON.stringify(user));
        setTimeout(() => {
        localStorage.removeItem('userData');
        logout({
            returnTo: window.location.origin + '/login',
        });
        }, 2000);
      } else {
        setSnackbarMessage(message);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Error inesperado';
      if (err.response?.status === 401) {
        localStorage.removeItem('userData');
        navigate('/login');
      } else {
        setSnackbarMessage(message);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: 'url(/assets/background-image-waves.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 500,
            p: 4,
            bgcolor: '#032340',
            color: 'white',
            borderRadius: 4,
            transition: 'transform 0.3s ease',
            transform: submitted ? 'scale(0.98)' : 'scale(1)',
          }}
        >
          <Typography variant="h5" color="#F26938" gutterBottom>
            Editar Perfil
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>Nombre completo</Typography>
          <Fade in timeout={400}>
            <TextField
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{ mt: 1, bgcolor: 'white', borderRadius: 1 }}
            />
          </Fade>

          <Typography variant="subtitle2" sx={{ mt: 3 }}>Alias / Username</Typography>
          <Fade in timeout={600}>
            <TextField
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              sx={{ mt: 1, bgcolor: 'white', borderRadius: 1 }}
            />
          </Fade>

          <Fade in timeout={700}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={loadingEdit}
              sx={{
                mt: 4,
                bgcolor: '#A61F43',
                '&:hover': { bgcolor: '#7e1833' },
                color: 'white',
                py: 1.5,
              }}
            >
              {loadingEdit ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
            </Button>
          </Fade>

          <Typography variant="h6" color="#F26938" mt={5}>Cambiar Email</Typography>
          <Typography variant="body2" color="white" mt={1}>
            ⚠ Esta acción cerrará tu sesión y requerirá volver a iniciar sesión con el nuevo correo.
          </Typography>
          <TextField
            fullWidth
            label="Nuevo email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            variant="outlined"
            sx={{ mt: 2, bgcolor: 'white', borderRadius: 1 }}
          />
          <TextField
            fullWidth
            label="Código TOTP"
            value={totpToken}
            onChange={(e) => setTotpToken(e.target.value)}
            variant="outlined"
            sx={{ mt: 2, bgcolor: 'white', borderRadius: 1 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleChangeEmail}
            disabled={loadingEmail}
            sx={{
              mt: 3,
              bgcolor: '#F26938',
              '&:hover': { bgcolor: '#d55820' },
              color: 'white',
              py: 1.5,
            }}
          >
            {loadingEmail ? <CircularProgress size={24} color="inherit" /> : 'Cambiar Email'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/account')}
            sx={{
              mt: 4,
              borderColor: '#F26938',
              color: '#F26938',
              '&:hover': { borderColor: '#d55820', color: '#d55820' },
              py: 1.5,
            }}
          >
            Volver a la cuenta
          </Button>
        </Paper>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default ProfileEdit;