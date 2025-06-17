import { useState, useEffect } from 'react';
import '../pageStyles/Login.css';
import {
  Box,
  Button,
  Typography,
  Link,  
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  useAuth0,
} from '@auth0/auth0-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Definición de dependencias de Auth0
  const { 
    isAuthenticated,
    user,
    getAccessTokenSilently,
    getIdTokenClaims,
    loginWithRedirect,
  } = useAuth0();
  const [authProcessed, setAuthProcessed] = useState(false);

  // Llamada al endpoint de autenticación
  const auth0Authenticate = async (data) => {
    try {
      const res = await axios.post(`https://raulocoin.onrender.com/api/auth0/authenticate`, data)
      return res.data;
    } catch {
      console.log("Error en la autenticación");
      return null;
    }
  };

  // Función de login
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
        if (!isAuthenticated || !user || authProcessed) return;

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
            nickname: user.nickname,
            given_name: user.given_name,
            family_name: user.family_name
          },
          auth0_tokens: {
            access_token: accessToken,
            id_token: idTokenClaims.__raw,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'openid profile email'
          },
        };

        const res = await auth0Authenticate(data);
        console.log("Respuesta backend auth:", res);


        if (!res) {
          setSnackbar({
            open: true,
            message: 'No se pudo autenticar. Por favor, intentá más tarde.',
            severity: 'error',
          });
          return;
        }

        localStorage.setItem('userData', JSON.stringify({
          id: res.user.id,
          name: res.user.name,
          username: res.user.username,
          email: res.user.email,
          balance: res.user.balance,
          isVerified: res.user.isVerified,
          totpVerified: res.user.totpVerified,
          needsTotpSetup: res.needsTotpSetup,
          existingUser: res.existingUser
        }));

        setAuthProcessed(true);

      if (res.needsTotpSetup) {
        if (!res.existingUser && res.totpSetup) {
          // Usuario nuevo que necesita configurar TOTP
          navigate('/totp', {
            state: {
              email: res.user.email,
              username: res.user.username,
              totpSetup: res.totpSetup
            }
          });
        } else {
          // Usuario existente que necesita verificación o usuario sin QR
          navigate('/verify-account', {
            state: {
              email: res.user.email,
              username: res.user.username
            }
          });
        }
      } else if (res.user.totpVerified && res.user.isVerified) {
        // Usuario ya verificado y TOTP confirmado
        const getBalance = await axios.post('https://raulocoin.onrender.com/api/auth0/balance', { email: res.user.email });
        const userRes = getBalance.data;
        if (userRes.success && userRes.user) {
          localStorage.setItem('userData', JSON.stringify({
            name: userRes.user.name,
            username: userRes.user.username,
            balance: userRes.user.balance,
            email: userRes.user.email,
          }));
          navigate('/account');
        } else {
          setSnackbar({ open: true, message: 'No se pudieron obtener los datos del usuario.', severity: 'error' });
        }
      } else {
        // Usuario sin TOTP que debe verificar cuenta
        navigate('/verify-account', {
          state: {
            email: res.user.email,
            username: res.user.username
          }
        });
      }
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
  }, [isAuthenticated, user, authProcessed, getAccessTokenSilently, getIdTokenClaims, navigate]);

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

              <Box textAlign="center" sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/regenerate-totp" underline="hover" color="#C62368">
                  Recuperar TOTP
                </Link>
              </Box>

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