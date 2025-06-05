// Update the handleOtpSubmit function in StudentRegister.jsx
const handleOtpSubmit = async (e) => {
  e.preventDefault();
  
  if (otp.length !== 6) {
    setOtpError('Please enter a 6-digit OTP');
    return;
  }

  setIsSubmitting(true);
  
  try {
    const { data } = await verifyOTP({
      email: formData.email,
      code: otp
    });

    // Store tokens in localStorage for persistence
    localStorage.setItem('authToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);

    // Redirect to dashboard
    navigate('/dashboard/student');
  } catch (error) {
    console.error('OTP verification error:', error);
    setOtpError(error.response?.data?.detail || 'Invalid or expired OTP');
  } finally {
    setIsSubmitting(false);
  }
};