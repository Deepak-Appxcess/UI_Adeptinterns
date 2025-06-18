import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchApplications } from '../../../services/api';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';

const ApplicationViewPage = () => {
  const { jobId, internshipId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(
    jobId ? 'job' : internshipId ? 'internship' : 'all'
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (jobId) {
          params.job_id = jobId;
        } else if (internshipId) {
          params.internship_id = internshipId;
        } else {
          // When viewing all applications, explicitly set view_all
          params.view_all = true;
          if (tabValue === 'jobs') {
            params.job_only = true;
          } else if (tabValue === 'internships') {
            params.internship_only = true;
          }
        }

        const response = await fetchApplications(params);
        setApplications(response.data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError(err.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, internshipId, tabValue, location.key]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 'all') {
      navigate('/applications');
    } else if (newValue === 'jobs') {
      navigate('/applications/jobs');
    } else if (newValue === 'internships') {
      navigate('/applications/internships');
    }
  };

  const handleViewApplication = (appId) => {
    navigate(`/applications/${appId}`);
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

  if (loading) {
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
            Only employers can view applications. Please switch to an employer account.
            <Button onClick={() => navigate('/profile')} sx={{ ml: 2 }}>
              Go to Profile
            </Button>
          </>
        ) : error.includes('must be provided') ? (
          <>
            Please select either a job or internship to view applications.
            <Button onClick={() => navigate('/jobs')} sx={{ ml: 2 }}>
              Browse Jobs
            </Button>
            <Button onClick={() => navigate('/internships')} sx={{ ml: 1 }}>
              Browse Internships
            </Button>
          </>
        ) : (
          error
        )}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {jobId ? 'Job Applications' :
         internshipId ? 'Internship Applications' : 'All Applications'}
      </Typography>

      {!jobId && !internshipId && (
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="All Applications" value="all" />
          <Tab label="Job Applications" value="jobs" />
          <Tab label="Internship Applications" value="internships" />
        </Tabs>
      )}

      {applications.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No applications found</Typography>
          <Typography variant="body1" color="text.secondary">
            {jobId ? 'This job has no applications yet.' :
             internshipId ? 'This internship has no applications yet.' :
             'There are no applications matching your current filters.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applied On</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    {app.candidate_profile?.first_name} {app.candidate_profile?.last_name}
                  </TableCell>
                  <TableCell>
                    {app.job_title || app.internship_title}
                  </TableCell>
                  <TableCell>
                    {app.job_id ? 'Job' : 'Internship'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewApplication(app.id)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    {app.resume?.url && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Download />}
                        onClick={() => window.open(app.resume.url, '_blank')}
                      >
                        Resume
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ApplicationViewPage;