import React from 'react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TransferProof = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/account');
    return null;
  }

  const { from, to, amount, date } = state;

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#0F1B26',
        backgroundImage: 'url("/assets/background-image-waves.svg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        fontFamily: 'Poppins, sans-serif',
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 600 }}
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: { xs: 600, sm: 500 },
            bgcolor: 'rgba(250, 243, 236, 0.95)',
            borderRadius: 4,
            p: { xs: 0.5, sm: 4 },
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: { xs: '75dvh', sm: '90dvh' },
            overflowY: 'auto',
          }}
        >
          <Box>
            <Typography
              variant="h5"
              align="center"
              fontWeight={700}
              color="#032340"
              gutterBottom
              sx={{ fontSize: { xs: '1.4rem', sm: '2rem' } }}
            >
              Comprobante de Transferencia
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ mb: 1.5 }}><strong>De:</strong> {from}</Typography>
            <Typography sx={{ mb: 1.5 }}><strong>Para:</strong> {to}</Typography>
            <Typography sx={{ mb: 1.5 }}><strong>Cantidad:</strong> R$ {amount}</Typography>
            <Typography><strong>Fecha:</strong> {new Date(date).toLocaleString()}</Typography>
          </Box>

          <Box mt={4} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/transfer')}
              sx={{
                borderColor: '#A61F43',
                color: '#A61F43',
                '&:hover': {
                  borderColor: '#F26938',
                  color: '#F26938',
                },
                flex: 1,
              }}
            >
              Nueva Transferencia
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/account', { state: { reload: true, clearToken: true } })}
              sx={{
                backgroundColor: '#A61F43',
                '&:hover': {
                  backgroundColor: '#D93240',
                  transform: 'scale(1.02)',
                },
                boxShadow: '0 4px 12px rgba(166, 31, 67, 0.4)',
                transition: 'all 0.2s ease-in-out',
                flex: 1,
              }}
            >
              Ir a Cuenta
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default TransferProof;