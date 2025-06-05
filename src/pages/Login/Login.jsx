// Update the handleSubmit function in Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const { data } = await login({ email, password });

    // Store tokens
    localStorage.setItem('authToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    
    // Notify other components about auth state change
    window.dispatchEvent(new Event('storage'));
    
    onClose?.();
    
    // Navigate based on user type
    if (isStudent) {
      navigate('/dashboard/student');
    } else {
      navigate('/dashboard/employee');
    }
  } catch (err) {
    console.error('Login error:', err);
    setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
};

export default handleSubmit