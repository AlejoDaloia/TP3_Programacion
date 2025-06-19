import React, { useEffect, useState } from 'react';
import {
  Box, Typography, IconButton, Button, CircularProgress, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useAuth0 } from '@auth0/auth0-react';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData] = useState(() => JSON.parse(localStorage.getItem('userData')));
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [allMovimientos, setAllMovimientos] = useState([]);
  const [filters, setFilters] = useState({
    tipo: '',
    desde: '',
    hasta: '',
    alias: '',
  });
  const [comprobante, setComprobante] = useState(null);
  const [comprobanteOpen, setComprobanteOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const { logout } = useAuth0();

  useEffect(() => {
    const fetchMovimientos = async () => {
      if (!userData) return;
      setLoading(true);
      try {
        const { email } = userData;
        const res = await axios.post('https://raulocoin.onrender.com/api/auth0/transactions', {
          email
        });
        setMovimientos(res.data.transactions || []);
      } catch (error) {
        console.error('Error al cargar movimientos:', error);
        setMovimientos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovimientos();
  }, [userData, location.state?.reload]);

  const HandleLogout = () => {
    localStorage.removeItem('userData');
    logout({ returnTo: window.location.origin });
  };

  const handleTransfer = () => navigate('/transfer');
  const HandleProfile = () => navigate('/profile');

  const tipo = {
    sent: 'TRANSFERENCIA ENVIADA',
    received: 'TRANSFERENCIA RECIBIDA',
    award: 'TRANSFERENCIA RECIBIDA',
  };

  const movimientosFiltrados = movimientos
    .filter(m => ['sent', 'received', 'award'].includes(m.type))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  if (!userData) return null;

  const handleOpenModal = async () => {
    try {
      const { email } = userData;
      const res = await axios.post('https://raulocoin.onrender.com/api/auth0/transactions', {
        email,
      });
      setAllMovimientos(res.data.transactions || []);
      setModalOpen(true);
    } catch (error) {
      console.error('Error al cargar todas las transacciones:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFilters({ tipo: '', desde: '', hasta: '' });
  };

  const handleVerComprobante = (mov) => {
    setComprobante(mov);
    generarPDF(mov);
    setComprobanteOpen(true);
  };


  const handleCloseComprobante = () => {
    setComprobante(null);
    setComprobanteOpen(false);
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
          ['Monto:', `${Math.abs(comprobante.amount)} R$`],
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

        const finalBlob = doc.output('blob');
        const finalUrl = URL.createObjectURL(finalBlob);
        setPdfUrl(finalUrl);
      };
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundImage: 'url(/assets/background-image-waves.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        p: 2,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: { xs: 4, md: 0 },
        }}
      >
        <Paper
          elevation={5}
          sx={{
            width: '100%',
            maxWidth: 500,
            aspectRatio: '16 / 9',
            bgcolor: '#032340',
            color: 'white',
            borderRadius: 4,
            p: 5,
            display: 'flex',
            flexDirection: 'center',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="subtitle1" color="#F26938">
                Nombre
              </Typography>
              <Typography variant="h5" gutterBottom>
                {userData.name}
              </Typography>
              <Typography variant="subtitle1" color="#F26938">
                Alias
              </Typography>
              <Typography variant="h5" gutterBottom>
                {userData.username}
              </Typography>
              <Typography variant="subtitle1" color="#F26938">
                Email
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                {userData.email}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="subtitle1" color="#F26938">
                Saldo disponible
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                R$ {userData.balance}
              </Typography>
            </Box>
          </Box>
          <Box>
            <IconButton
              onClick={HandleProfile}
              sx={{ color: 'white', backgroundColor: '#F26938', '&:hover': { backgroundColor: '#D85A2B' }, p: 2 }}
              size="large"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>
      <Box
        sx={{
          flex: 1,
          ml: { md: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="white">Hola, {userData.name}</Typography>
          <IconButton onClick={HandleLogout} sx={{ color: 'white' }}>
            <LogoutIcon />
          </IconButton>
        </Box>
        <Button
          variant="contained"
          onClick={handleTransfer}
          sx={{
            bgcolor: '#A61F43',
            '&:hover': { bgcolor: '#7e1833' },
            color: 'white',
            mb: 2,
          }}
        >
          Transferir
        </Button>
        <Typography variant="h6" color="white">
          Últimos movimientos
        </Typography>
        <Box
          sx={{
            maxHeight: { xs: 300, md: 'calc(100vh - 180px)' },
            overflowY: 'auto',
            pr: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center"><CircularProgress color="inherit" /></Box>
          ) : movimientosFiltrados.length === 0 ? (
            <Typography color="white">No hay movimientos disponibles.</Typography>
          ) : (
            movimientosFiltrados.map((mov, i) => (
              <Paper key={i} elevation={3} sx={{
                p: 2,
                borderLeft: '25px solid',
                borderLeftColor: mov.type === 'sent' ? 'error.main' : 'success.main',
                borderRadius: 2,
                bgcolor: '#FAF3EC',
              }}>
                <Typography fontWeight="bold">{tipo[mov.type] || mov.type}</Typography>
                <Typography color={mov.amount >= 0 ? 'green' : 'red'}>
                  {mov.amount >= 0 ? '+' : ''}{mov.amount} R$
                </Typography>
                <Typography>{mov.description}</Typography>
                {mov.type === 'sent' && <Typography>Enviado a: {mov.toName}</Typography>}
                {mov.type === 'received' && <Typography>Recibido de: {mov.fromName}</Typography>}
                {mov.type === 'award' && <Typography>Recibido de: {mov.awardedBy || 'Sistema'}</Typography>}
                <Typography fontSize={12} color="gray">
                  Fecha: {new Date(mov.createdAt * 1000).toLocaleString()}
                </Typography>
              </Paper>
            ))
          )}
        </Box>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            bgcolor: '#032340',
            '&:hover': { bgcolor: '#7e1833' },
            color: 'white',
            mb: 2,
          }}
        >
          VER MÁS MOVIMIENTOS
        </Button>
      </Box>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Historial de movimientos</DialogTitle>
        {/* FILTROS */}
        <DialogContent dividers>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Desde"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.desde}
              onChange={(e) => setFilters({ ...filters, desde: e.target.value })}
              fullWidth
            />

            <TextField
              label="Hasta"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.hasta}
              onChange={(e) => setFilters({ ...filters, hasta: e.target.value })}
              fullWidth
            />

            <TextField
              select
              label="Tipo"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              fullWidth
              Select
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="sent">Enviados</MenuItem>
              <MenuItem value="received">Recibidos</MenuItem>
              <MenuItem value="award">Premios</MenuItem>

            </TextField>

            <TextField
              label="Alias"
              placeholder="Ingresá alias"
              value={filters.alias}
              onChange={(e) => setFilters({ ...filters, alias: e.target.value })}
              fullWidth
            />
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            {allMovimientos
              .filter((mov) => {
                const fecha = new Date(mov.createdAt * 1000);
                const desde = filters.desde ? new Date(filters.desde) : null;
                const hasta = filters.hasta ? new Date(filters.hasta) : null;
                const tipoOk = filters.tipo ? mov.type === filters.tipo : true;
                const fechaOk =
                  (!desde || fecha >= desde) && (!hasta || fecha <= hasta);
                const alias = (filters.alias || '').toLowerCase();
                const aliasOk =
                  !alias ||
                  (mov.fromUsername && mov.fromUsername.toLowerCase().includes(alias)) ||
                  (mov.toUsername && mov.toUsername.toLowerCase().includes(alias)) ||
                  (mov.awardedByUsername && mov.awardedByUsername.toLowerCase().includes(alias));

                return tipoOk && fechaOk && aliasOk;
              })
              .map((mov, i) => (
                <Paper
                  key={i}
                  elevation={2}
                  sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: '12px solid',
                    borderLeftColor:
                      mov.type === 'sent' ? '#C62828' : mov.type === 'received' || mov.type === 'award' ? '#2E7D32' : 'gray',
                    borderRadius: 2,
                    bgcolor: '#f5f5f5',
                  }}
                >
                  <Box>
                    <Typography fontWeight="bold" color="#121212">
                      {tipo[mov.type] || mov.type}
                    </Typography>

                    <Typography
                      sx={{ fontWeight: 600 }}
                      color={mov.amount >= 0 ? 'green' : 'red'}
                    >
                      {mov.amount >= 0 ? `+${mov.amount}` : `${Math.abs(mov.amount)}`} R$
                    </Typography>

                    <Typography>{mov.description}</Typography>

                    {mov.type === 'sent' && <Typography>Enviado a: {mov.toName}</Typography>}
                    {mov.type === 'received' && <Typography>Recibido de: {mov.fromName}</Typography>}
                    {mov.type === 'award' && <Typography>Recibido de: {mov.awardedBy || 'Sistema'}</Typography>}

                    <Typography fontSize={12} color="#3b3b3b">
                      Fecha: {new Date(mov.createdAt * 1000).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* BOTÓN VER COMPROBANTEE */}
                  <Box sx={{ ml: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleVerComprobante(mov)}
                      sx={{
                        borderColor: '#34495e',
                        color: '#34495e',
                        '&:hover': {
                          borderColor: '#C62828',
                          color: '#C62828',
                        },
                      }}
                    >
                      VER COMPROBANTE
                    </Button>
                  </Box>
                </Paper>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ color: '#032340' }}>
            CERRAR
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={comprobanteOpen} onClose={handleCloseComprobante}>
        <DialogTitle>Comprobante de Transferencia</DialogTitle>
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
              link.download = `comprobante_${comprobante.id || 'transferencia'}.pdf`;
              link.click();
            }}
            disabled={!pdfUrl}
          >
            Descargar PDF
          </Button>

          <Button onClick={handleCloseComprobante}>Cerrar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );

};

export default Account;