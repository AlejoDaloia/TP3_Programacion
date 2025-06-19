import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Autocomplete,
  CircularProgress, Snackbar, Alert, Paper, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import jsPDF from 'jspdf';

const Transfer = () => {
  const navigate = useNavigate();
  const [alias, setAlias] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [detalle, setDetalle] = useState('');
  const [codigo, setCodigo] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({ open: false, message: '', severity: 'info' });
  const [comprobante, setComprobante] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [comprobanteVisible, setComprobanteVisible] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData'));

  const handleSnackbar = (message, severity = 'info') => {
    setAlerta({ open: true, message, severity });
  };
  const tipoDescripcion = {
    sent: 'Transferencia Enviada',
    received: 'Transferencia Recibida',
    award: 'Premio Recibido',
  };

  const generarPDF = async (comprobante) => {
    try {
      const response = await fetch('/logo.jpg');
      const blob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = () => {
        const base64Logo = reader.result;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setTextColor('#d4ac0d');
        doc.text('RauloCoin', 105, 15, { align: 'center' });

        const imageProps = doc.getImageProperties(base64Logo);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const logoWidth = 40;
        const ratio = imageProps.height / imageProps.width;
        const logoHeight = logoWidth * ratio;
        const x = (pdfWidth - logoWidth) / 2;
        doc.addImage(base64Logo, 'JPG', x, 20, logoWidth, logoHeight);

        const currentY = 20 + logoHeight + 10;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Comprobante de Transferencia', 105, currentY, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.line(20, currentY + 5, 190, currentY + 5);

        doc.setFontSize(12);
        const datos = [
          ['Enviado por:', comprobante.fromName || '-'],
          ['Recibido por:', comprobante.toName || comprobante.awardedBy || '-'],
          ['Monto:', `${comprobante.amount} R$`],
          ['Descripción:', comprobante.description],
          ['Fecha:', new Date(comprobante.createdAt * 1000).toLocaleString()],
          ['Tipo:', tipoDescripcion[comprobante.type] || comprobante.type],
        ];

        let y = currentY + 15;
        datos.forEach(([label, value], index) => {
          doc.text(label, 20, y);
          doc.text(value, 80, y);
          y += 10;
          if (index < datos.length - 1) {
            doc.setDrawColor(200);
            doc.line(20, y - 5, 190, y - 5);
          }
        });
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      };
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
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

        const comprobanteGenerado = {
          fromName: userData.name,
          toName: transferRes.data.transfer.to.name || alias,
          amount: cantidad,
          description: detalle,
          createdAt: Math.floor(Date.now() / 1000),
          type: 'sent',
        };
        setComprobante(comprobanteGenerado);
        generarPDF(comprobanteGenerado);
        setComprobanteVisible(true);
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
      <Dialog open={comprobanteVisible} onClose={() => setComprobanteVisible(false)}>
        <DialogTitle>Comprobante de transferencia</DialogTitle>
        <DialogContent dividers>
          {pdfUrl ? (
            <Box>
              <iframe
                title="Comprobante PDF"
                src={pdfUrl}
                width="100%"
                height="400px"
                style={{ border: 'none' }}
              />
            </Box>
          ) : (
            <Typography>Cargando comprobante...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              const link = document.createElement('a');
              link.href = pdfUrl;
              link.download = `comprobante_transferencia.pdf`;
              link.click();
            }}
            disabled={!pdfUrl}
          >
            Descargar PDF
          </Button>
          <Button onClick={() => setComprobanteVisible(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Transfer;