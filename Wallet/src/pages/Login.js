import React, { useState, useEffect } from 'react';
import '../pageStyles/Login.css';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import {
    useAuth0,
} from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [loading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const navigate = useNavigate();
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  //Definicion de dependencias de Auth0
  const { 
    isAuthenticated,
    user,
    getAccessTokenSilently,
    getIdTokenClaims,
    loginWithRedirect,
  } = useAuth0();

  //Llamada al endpoint de autenticación
  const auth0Authenticate = async (data) => {
    try {
      const res = await axios.post(`https://raulocoin.onrender.com/api/auth0/authenticate`, data)
      return res.data;
    } catch {
      console.log("Error en la autenticación");
      return null;
    }
  };

  //Funcion de login
  const handleLoginClick = () => {
    loginWithRedirect({
    authorizationParams: {
      prompt: 'login',
    },
    });
  };

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        if (!isAuthenticated || !user) return;

        const accessToken = await getAccessTokenSilently();
        const idTokenClaims = await getIdTokenClaims();

        const data = {
          auth0_payload: {
            iss: idTokenClaims.iss,
            sub: idTokenClaims.sub,
            aud: idTokenClaims.aud,
            iat: idTokenClaims.iat,
            exp: idTokenClaims.exp,
            email: user.email,
            name: user.name,
          },
          auth0_tokens: {
            access_token: accessToken,
            id_token: idTokenClaims.__raw,
          },
        };

        const res = await auth0Authenticate(data);
        if (!res) {
          setSnackbar({
            open: true,
            message: 'No se pudo autenticar. Por favor, intentá más tarde.',
            severity: 'error',
          });
          return;
        }

        localStorage.setItem('userData', JSON.stringify({
          name: res.user.name,
          username: res.user.username,
          email: res.user.email,
          balance: res.user.balance,
          isVerified: res.user.isVerified,
          totpVerified: res.user.totpVerified,
          needsTotpSetup: res.needsTotpSetup,
          existingUser: res.existingUser
        }));

        navigate('/account');
      } catch (error) {
        console.error("Error en el login:", error);
        setSnackbar({
          open: true,
          message: 'Error inesperado al iniciar sesión.',
          severity: 'error',
        });
      }
    };

    fetchTokens();
  }, [isAuthenticated, navigate, getAccessTokenSilently, getIdTokenClaims, user]);


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
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={2}>
            ¡Bienvenido de nuevo, te hemos echado de menos!
          </Typography>

          <Box component="form">
            <Box textAlign="center" sx={{ mt: 1 }}>

              {/*Boton de login*/}
              <Button 
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: '#C62368',
                  '&:hover': { bgcolor: '#A31C55' },
                }} 
                className="auth0-button" 
                onClick={handleLoginClick}
              >
                Ingresar
              </Button>

              {/*Boton de recuperación*/}
              <Button
               fullWidth
                variant="contained"
                sx={{
                mt: 2,
                bgcolor: '#C62368',
                '&:hover': { bgcolor: '#A31C55' },
                }}
                disabled={loading}
               >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Recuperar TOTP'}
              </Button>

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

export default Login;