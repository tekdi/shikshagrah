// @ts-nocheck
import React, { useState } from 'react';
import { TextField } from '@mui/material';
import { WidgetProps } from '@rjsf/utils';

const CustomEmailWidget = ({
  id,
  label,
  value,
  required,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
  rawErrors = [],
  placeholder,
}: WidgetProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (!emailRegex.test(val)) {
      setLocalError('Enter a valid email address');
    } else {
      setLocalError(null); // ✅ Clear error when valid
    }
    onChange(val === '' ? undefined : val);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, event.target.value);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    onFocus(id, event.target.value);

  const displayErrors = rawErrors.filter(
    (error) => !error.toLowerCase().includes('required')
  );

  return (
    <TextField
      fullWidth
      type="email"
      id={id}
      label={
        <span>
          {label} 
        </span>
      }
      value={value ?? ''}
      required={required}
      disabled={disabled || readonly}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder || 'Enter your email'}
      error={displayErrors.length > 0}
      helperText={
        localError || (displayErrors.length > 0 ? displayErrors[0] : '')
      }
      variant="outlined"
      size="small"
      FormHelperTextProps={{
        sx: {
          color: 'red',
          fontSize: '11px',
          marginLeft: '0px',
        },
      }}
      InputProps={{
        sx: {
          '& .MuiInputBase-input': {
            padding: '10px 12px',
            fontSize: '12px',
          },
        },
      }}
      InputLabelProps={{
        sx: {
          fontSize: '12px',
          '&.Mui-focused': {
            transform: 'translate(14px, -6px) scale(0.75)',
            color: '#582E92',
          },
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75)',
            color: '#582E92',
          },
        },
      }}
    />
  );
};

export default CustomEmailWidget;
