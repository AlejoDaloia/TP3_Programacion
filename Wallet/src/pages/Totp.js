import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';

const Totp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const totpSetup = location.state;

  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(totpSetup.manualSetupCode);
    setOpenSnackbar(true);
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
          <Typography variant="h5" gutterBottom>
            Autenticación TOTP
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={2}>
            Escanea este código QR con tu aplicación de autenticación
          </Typography>

          <Box mt={2} mb={2}>
            <img
              src={totpSetup.qrCodeUrl}
              alt="TOTP QR Code"
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
            Ingresar
          </Button>
        </Paper>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" variant="filled">
          Copiado al portapapeles
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Totp;