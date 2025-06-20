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
import { ArrowBack, Edit, CheckCircle, Cancel } from '@mui/icons-material';

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
        setApplication(response.data || null);
        setStatus(response.data?.status || '');
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

  const handleConfirmDialog = () => {
    setOpenDialog(false);
    handleSaveStatus();
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status) {
      case 'APPLIED': return 'default';
      case 'UNDER_REVIEW': return 'info';
      case 'SHORTLISTED': return 'primary';
      case 'REJECTED': return 'error';
      case 'ACCEPTED': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const renderCandidateName = () => {
    const firstName = application?.candidate_profile?.first_name || '';
    const lastName = application?.candidate_profile?.last_name || '';
    if (!firstName && !lastName) return 'N/A';
    return `${firstName} ${lastName}`.trim();
  };

  const renderOnlineProfiles = () => {
    if (!application?.online_profiles) return null;
    
    const profiles = [];
    const profileFields = [
      { key: 'leetcode_url', label: 'LeetCode' },
      { key: 'hackerrank_url', label: 'HackerRank' },
      { key: 'codeforces_url', label: 'Codeforces' },
      { key: 'codechef_url', label: 'CodeChef' },
      { key: 'linkedin_url', label: 'LinkedIn' },
      { key: 'github_url', label: 'GitHub' }
    ];

    profileFields.forEach(({ key, label }) => {
      if (application.online_profiles[key]) {
        profiles.push({
          platform: label,
          url: application.online_profiles[key]
        });
      }
    });

    if (profiles.length === 0) return null;

    return (
      <>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Online Profiles
        </Typography>
        <List>
          {profiles.map((profile, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={profile.platform}
                secondary={
                  <Link href={profile.url} target="_blank" rel="noopener">
                    {profile.url}
                  </Link>
                }
              />
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  const renderEducation = () => {
    if (!application?.resume?.education?.length) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Education
        </Typography>
        <List>
          {application.resume.education.map((edu, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${edu.degree || ''}${edu.stream ? ` in ${edu.stream}` : ''}`.trim() || 'Education'}
                secondary={
                  <>
                    {edu.college_or_school_name || 'N/A'}<br />
                    {edu.start_year ? `${edu.start_year} - ${edu.end_year || 'Present'}` : 'N/A'}<br />
                    {edu.performance_type && `${edu.performance_type}: ${edu.performance_score || 'N/A'}`}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderWorkExperience = () => {
    if (!application?.resume?.work_experiences?.length) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Work Experience
        </Typography>
        <List>
          {application.resume.work_experiences.map((exp, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${exp.designation || 'Role'} at ${exp.organization || 'Company'}`}
                secondary={
                  <>
                    {exp.profile && `${exp.profile} | `}
                    {formatDate(exp.start_date)} - {exp.currently_working ? 'Present' : formatDate(exp.end_date) || 'N/A'}<br />
                    {exp.location && `${exp.location_type === 'ON_SITE' ? 'On Site' : 'Remote'} | ${exp.location}`}<br />
                    {exp.description || 'No description provided'}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderSkills = () => {
    if (!application?.resume?.skills?.length) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Skills
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {application.resume.skills.map((skill, index) => (
            <Chip key={index} label={skill.name || 'Skill'} />
          ))}
        </Box>
      </Box>
    );
  };

  const renderAcademicProjects = () => {
    if (!application?.resume?.academic_projects?.length) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Academic Projects
        </Typography>
        <List>
          {application.resume.academic_projects.map((project, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={project.title || 'Untitled Project'}
                secondary={
                  <>
                    {formatDate(project.start_date)} - {project.currently_ongoing ? 'Ongoing' : formatDate(project.end_date) || 'N/A'}<br />
                    {project.description || 'No description provided'}<br />
                    {project.project_link && (
                      <Link href={project.project_link} target="_blank" rel="noopener">
                        Project Link
                      </Link>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderScreeningAnswers = () => {
    if (!application?.screening_answers?.length) return null;
    
    return (
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
              <ListItemText primary={answer || 'No answer provided'} />
            </ListItem>
          ))}
        </List>
      </>
    );
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
            src={application.candidate_profile?.profile_picture_url || ''}
            sx={{ width: 80, height: 80, mr: 3 }}
          >
            {renderCandidateName().charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {renderCandidateName()}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {application.candidate_email || 'N/A'}
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
                label={application.status || 'N/A'}
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
              secondary={application.candidate_profile?.candidate_type || 'N/A'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Current City"
              secondary={application.candidate_profile?.current_city || 'N/A'}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Applied On"
              secondary={formatDate(application.applied_at)}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Last Updated"
              secondary={formatDate(application.updated_at)}
            />
          </ListItem>
        </List>

        {application.resume && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Resume Details
            </Typography>

            {application.resume.career_objective && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Career Objective
                </Typography>
                <Typography>{application.resume.career_objective}</Typography>
              </Box>
            )}

            {renderEducation()}
            {renderWorkExperience()}
            {renderSkills()}
            {renderAcademicProjects()}

            {application.resume.extra_curricular_activities?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Extra Curricular Activities
                </Typography>
                <List>
                  {application.resume.extra_curricular_activities.map((activity, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={activity.description || 'Activity'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {application.resume.trainings_courses?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Trainings & Courses
                </Typography>
                <List>
                  {application.resume.trainings_courses.map((course, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={course.training_program || 'Training Program'}
                        secondary={
                          <>
                            {formatDate(course.start_date)} - {course.currently_ongoing ? 'Ongoing' : formatDate(course.end_date) || 'N/A'}<br />
                            {course.organization && `Organization: ${course.organization}`}<br />
                            {course.description}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {application.resume.portfolio_work_samples?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Portfolio Work Samples
                </Typography>
                <List>
                  {application.resume.portfolio_work_samples.map((sample, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={sample.name || 'Work Sample'}
                        secondary={
                          <Link href={sample.url} target="_blank" rel="noopener">
                            {sample.url}
                          </Link>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {application.resume.accomplishments?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Accomplishments
                </Typography>
                <List>
                  {application.resume.accomplishments.map((accomplishment, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={accomplishment.additional_details || 'Accomplishment'}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}

        {renderScreeningAnswers()}
        {renderOnlineProfiles()}
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