import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';

const OTPDialog = ({ open, onClose, onSubmit, onResendOtp }: any) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState<number>(0);

  // Start countdown timer when timer > 0
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setOtp(Array(6).fill(''));
      setTimer(0);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
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
    const otpString = otp.join('');
    onSubmit(otpString);
    setOtp(Array(6).fill(''));
  };

  const handleClose = () => {
    setOtp(Array(6).fill(''));
    setTimer(0);
    onClose();
  };

  const handleResend = () => {
    if (onResendOtp) {
      onResendOtp(); // Trigger resend from parent
      setTimer(30); // Restart timer
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: { xs: '90%', sm: '400px', md: '500px' },
          bgcolor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          borderRadius: '16px',
          padding: { xs: 2, sm: 3 },
          textAlign: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            padding: '4px',
            background: 'linear-gradient(to right, #FF9911 50%, #582E92 50%)',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          },
        },
      }}
    >
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
                sx: {
                  textAlign: 'center',
                  fontSize: { xs: 10, sm: 20 },
                  width: { xs: 30, sm: 40 },
                },
              }}
            />
          ))}
        </Box>

        {/* Resend OTP Section */}
        <Box mt={2} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            Didn’t receive the code?
          </Typography>
          <Button
            onClick={handleResend}
            disabled={timer > 0}
            variant="text"
            sx={{
              color: timer > 0 ? 'grey' : '#582E92',
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '14px',
            }}
          >
            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          sx={{
            bgcolor: '#582E92',
            color: '#FFFFFF',
            borderRadius: '30px',
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': {
              bgcolor: '#543E98',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={otp.some((d) => d === '')}
          sx={{
            bgcolor: '#582E92',
            color: '#FFFFFF',
            borderRadius: '30px',
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': {
              bgcolor: '#543E98',
            },
          }}
        >
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OTPDialog;
