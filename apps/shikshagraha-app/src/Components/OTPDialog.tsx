import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';

const OTPDialog = ({ open, onClose, onSubmit, data }: any) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto focus to next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };
  const handleSubmit = () => {
    const otpString = otp.join(''); // Combine the OTP digits into a single string
    onSubmit(otpString); // Pass the OTP string to the parent component
    setOtp(Array(6).fill(''));
  };
  const handleClose = () => {
    // Clear OTP fields when dialog is closed
    setOtp(Array(6).fill(''));
    onClose();
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Enter OTP</DialogTitle>
      <DialogContent>
        <Box display="flex" gap={1} justifyContent="center" mt={2}>
          {otp.map((digit, index) => (
            <TextField
              key={index}
              id={`otp-${index}`}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{
                maxLength: 1,
                style: { textAlign: 'center', fontSize: '20px', width: '40px' },
              }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={otp.some((d) => d === '')}
        >
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OTPDialog;
