import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Autocomplete,
  CircularProgress, Snackbar, Alert, Paper, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const Transfer = () => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [detalle, setDetalle] = useState('');
  const [codigo, setCodigo] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({ open: false, message: '', severity: 'info' });

  const userData = JSON.parse(localStorage.getItem('userData'));

  const handleSnackbar = (message, severity = 'info') => {
    setAlerta({ open: true, message, severity });
  };

  const buscarUsuarios = async (texto) => {
    if (!texto) return setSugerencias([]);
    try {
      const res = await axios.get(`https://raulocoin.onrender.com/api/search-users?q=${texto}`);
      setSugerencias(res.data.users || []);
    } catch {
      setSugerencias([]);
    }
  };

  const handleTransfer = async () => {
    if (!alias || !cantidad || !detalle || !codigo) {
      return handleSnackbar('Completa todos los campos.', 'error');
    }

    setLoading(true);
    try {
      const verifyRes = await axios.post('https://raulocoin.onrender.com/api/verify-totp', {
        username: userData.username,
        totpToken: codigo,
      });

      if (!verifyRes.data.success) {
        return handleSnackbar('Código incorrecto.', 'error');
      }

      const transferRes = await axios.post('https://raulocoin.onrender.com/api/transfer', {
        fromUsername: userData.username,
        toUsername: alias,
        amount: cantidad,
        description: detalle,
        operationToken: verifyRes.data.operationToken,
      });

      if (transferRes.data.success) {
        userData.balance = transferRes.data.transfer.from.newBalance;
        localStorage.setItem('userData', JSON.stringify(userData));
        navigate('/transfer-proof', {
          state: {
            from: userData.username,
            to: alias,
            amount: cantidad,
            date: new Date().toISOString(),
          }
        });
      } else {
        handleSnackbar(transferRes.data.message || 'Error en la transferencia.', 'error');
      }
    } catch (err) {
      console.error(err);
      handleSnackbar('Error en la transferencia.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0F1B26',
        backgroundImage: 'url("/assets/background-image-waves.svg")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 500 }}
      >
        <Paper
          elevation={6}
          sx={{
            bgcolor: 'rgba(250, 243, 236, 0.96)',
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            backdropFilter: 'blur(6px)',
          }}
        >
          <Typography
            variant="h5"
            align="center"
            fontWeight={700}
            color="#032340"
            gutterBottom
          >
            Transferencia
          </Typography>

          <Autocomplete
            freeSolo
            options={sugerencias.map(u => u.username)}
            onInputChange={(e, value) => { setAlias(value); buscarUsuarios(value); }}
            onChange={(e, value) => setAlias(value)}
            renderInput={(params) => (
              <TextField {...params} label="Alias (ej: juan.123)" margin="normal" fullWidth />
            )}
          />

          <TextField
            label="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value.replace(/\D/g, ''))}
            margin="normal"
            fullWidth
            error={!cantidad}
            helperText={!cantidad ? 'Requerido' : ''}
          />

          <TextField
            label="Detalle"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            margin="normal"
            fullWidth
            error={!detalle}
            helperText={!detalle ? 'Requerido' : ''}
          />

          <TextField
            label="Código TOTP"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            margin="normal"
            fullWidth
            error={!codigo}
            helperText={!codigo ? 'Requerido' : ''}
          />

          <Box my={3}>
            <Divider />
          </Box>

          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2}
            justifyContent="space-between"
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleTransfer}
              disabled={loading}
              endIcon={loading && <CircularProgress size={20} />}
              sx={{
                backgroundColor: '#C62368',
                '&:hover': {
                  backgroundColor: '#D93240',
                  transform: 'scale(1.02)',
                },
                boxShadow: '0 4px 12px rgba(198, 35, 104, 0.4)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Transferir
            </Button>
            <Button
              fullWidth
              onClick={() => navigate('/account', { state: { reload: true, clearToken: true } })}
              variant="outlined"
              sx={{
                borderColor: '#A61F43',
                color: '#A61F43',
                '&:hover': {
                  borderColor: '#F26938',
                  color: '#F26938',
                },
              }}
            >
              Volver
            </Button>
          </Box>

          <Snackbar
            open={alerta.open}
            autoHideDuration={4000}
            onClose={() => setAlerta({ ...alerta, open: false })}
          >
            <Alert severity={alerta.severity}>{alerta.message}</Alert>
          </Snackbar>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Transfer;