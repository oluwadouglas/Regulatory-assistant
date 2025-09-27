import React, { useState, useEffect } from "react";
import { 
  Container, Box, TextField, Button, Typography, 
  Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, CircularProgress, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Grid, Divider, Alert, Snackbar
} from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
  },
});

const API_BASE_URL = "http://localhost:5000"; 

function App() {
  const [report, setReport] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(`Failed to load reports: ${err.message}`);
      setSnackbar({ 
        open: true, 
        message: `Failed to load reports: ${err.message}`,
        severity: 'error' 
      });
    }
  };

  // Fetch all reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/process-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process report');
      }

      const data = await response.json();
      setResult(data);
      setReport(""); // Clear textbox after submit
      // Refresh the reports list
      fetchReports();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to process report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (text, lang) => {
    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target_lang: lang }),
      });

      if (!response.ok) throw new Error('Translation failed');
      const data = await response.json();
      return data.translated_text;
    } catch (err) {
      console.error('Translation error:', err);
      setSnackbar({ open: true, message: 'Translation failed', severity: 'error' });
      return text; // Return original text on error
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReport(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Prepare data for charts
  const severityData = reports.reduce((acc, report) => {
    const severity = report.severity || 'Unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  const outcomeData = reports.reduce((acc, report) => {
    const outcome = report.outcome || 'Unknown';
    acc[outcome] = (acc[outcome] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Severity', ...severityData },
    { name: 'Outcome', ...outcomeData }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
            Regulatory Report Assistant
          </Typography>
          
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="New Report" />
            <Tab label="Report History" />
            <Tab label="Analytics" />
          </Tabs>

          {tabValue === 0 && (
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>Submit New Report</Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder="Paste your medical report here..."
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  error={!!error}
                  helperText={error}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={loading || !report.trim()}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Processing...' : 'Process Report'}
                </Button>
              </form>
            </Paper>
          )}

          {tabValue === 1 && (
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>Report History</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Drug</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Outcome</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.length > 0 ? (
                      reports.map((r) => (
                        <TableRow key={r.id} hover>
                          <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                          <TableCell>{r.drug || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={r.severity || 'Unknown'}
                              color={
                                r.severity === 'severe' ? 'error' : 
                                r.severity === 'moderate' ? 'warning' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{r.outcome || 'Unknown'}</TableCell>
                          <TableCell>
                            <Button 
                              size="small" 
                              onClick={() => handleViewReport(r)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No reports found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {tabValue === 2 && (
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>Analytics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" align="center" gutterBottom>Severity Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(severityData).map(([name, count]) => ({ name, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" align="center" gutterBottom>Outcome Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(outcomeData).map(([name, count]) => ({ name, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#dc004e" />
                    </BarChart>
                  </ResponsiveContainer>
                 
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>

        {/* Report Details Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Report Details</DialogTitle>
          <DialogContent>
            {selectedReport && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Original Report</Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                  <Typography>{selectedReport.original_report}</Typography>
                </Paper>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Drug</Typography>
                    <Typography gutterBottom>{selectedReport.drug || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Severity</Typography>
                    <Chip 
                      label={selectedReport.severity || 'Unknown'} 
                      color={
                        selectedReport.severity === 'severe' ? 'error' : 
                        selectedReport.severity === 'moderate' ? 'warning' : 'default'
                      }
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Adverse Events</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {selectedReport.adverse_events && selectedReport.adverse_events.length > 0 ? (
                        selectedReport.adverse_events.map((event, index) => (
                          <Chip key={index} label={event} variant="outlined" />
                        ))
                      ) : (
                        <Typography>None reported</Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Outcome</Typography>
                    <Typography>{selectedReport.outcome || 'Unknown'}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={async () => {
                          const translated = await handleTranslate(selectedReport.outcome, 'fr');
                          setTranslatedText({ text: translated, lang: 'fr' });
                        }}
                      >
                        Translate to French
                      </Button>
                      {translatedText && translatedText.lang === 'fr' && (
                        <Typography sx={{ ml: 1 }} color="primary">{translatedText.text}</Typography>
                      )}
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={async () => {
                          const translated = await handleTranslate(selectedReport.outcome, 'sw');
                          setTranslatedText({ text: translated, lang: 'sw' });
                        }}
                      >
                        Translate to Swahili
                      </Button>
                      {translatedText && translatedText.lang === 'sw' && (
                        <Typography sx={{ ml: 1 }} color="primary">{translatedText.text}</Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Reported On</Typography>
                    <Typography>{new Date(selectedReport.created_at).toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
