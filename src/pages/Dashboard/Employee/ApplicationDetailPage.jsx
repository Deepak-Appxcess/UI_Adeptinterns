import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApplicationDetails, updateApplicationStatus } from '../../../services/api';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Download, ArrowBack, Edit, CheckCircle, Cancel } from '@mui/icons-material';

const statusOptions = [
  { value: 'APPLIED', label: 'Applied' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ACCEPTED', label: 'Accepted' }
];

const ApplicationDetailPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchApplicationDetails(appId);
        setApplication(response.data);
        setStatus(response.data.status);
      } catch (err) {
        console.error('Failed to fetch application details:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to fetch application details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appId]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    try {
      setLoading(true);
      await updateApplicationStatus(appId, { status });
      setApplication(prev => ({ ...prev, status }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = () => {
    if (application?.resume?.url) {
      window.open(application.resume.url, '_blank');
    }
  };

  const handleConfirmDialog = () => {
    setOpenDialog(false);
    handleSaveStatus();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return 'default';
      case 'UNDER_REVIEW': return 'info';
      case 'SHORTLISTED': return 'primary';
      case 'REJECTED': return 'error';
      case 'ACCEPTED': return 'success';
      default: return 'default';
    }
  };

  if (loading && !application) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error.includes('Only employers') ? (
          <>
            Only employers can view application details. Please switch to an employer account.
            <Button onClick={() => navigate('/profile')} sx={{ ml: 2 }}>
              Go to Profile
            </Button>
          </>
        ) : (
          error
        )}
      </Alert>
    );
  }

  if (!application) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        Application not found
        <Button onClick={() => navigate(-1)} sx={{ ml: 2 }}>
          Go Back
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Applications
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Application Details
          </Typography>
          {!isEditing ? (
            <Button
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              variant="outlined"
            >
              Edit Status
            </Button>
          ) : (
            <Box>
              <Button
                startIcon={<Cancel />}
                onClick={() => {
                  setIsEditing(false);
                  setStatus(application.status);
                }}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button
                startIcon={<CheckCircle />}
                onClick={() => setOpenDialog(true)}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <Avatar
            src={application.candidate_profile?.profile_picture_url}
            sx={{ width: 80, height: 80, mr: 3 }}
          />
          <Box>
            <Typography variant="h5">
              {application.candidate_profile?.first_name} {application.candidate_profile?.last_name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {application.candidate_email}
            </Typography>
            {isEditing ? (
              <FormControl sx={{ mt: 2, minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={handleStatusChange}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Chip
                label={application.status}
                color={getStatusColor(application.status)}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Position Details
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Position"
              secondary={application.job_title || application.internship_title || 'N/A'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Type"
              secondary={application.job_id ? 'Job' : 'Internship'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Applied On"
              secondary={new Date(application.created_at).toLocaleDateString()}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Last Updated"
              secondary={new Date(application.updated_at).toLocaleDateString()}
            />
          </ListItem>
        </List>

        {application.resume && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Resume
            </Typography>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadResume}
            >
              Download Resume
            </Button>
          </>
        )}

        {application.screening_answers?.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Screening Questions
            </Typography>
            <List>
              {application.screening_answers.map((answer, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{index + 1}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={answer} />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {application.cover_letter && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Cover Letter
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Typography>{application.cover_letter}</Typography>
            </Paper>
          </>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the application status from{' '}
            <Chip label={application.status} color={getStatusColor(application.status)} size="small" />{' '}
            to{' '}
            <Chip label={status} color={getStatusColor(status)} size="small" />?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDialog} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationDetailPage;