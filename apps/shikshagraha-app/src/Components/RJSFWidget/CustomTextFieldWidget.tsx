// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import { WidgetProps } from '@rjsf/utils';
import { Visibility, VisibilityOff } from '@mui/icons-material';
const CustomTextFieldWidget = (props: WidgetProps) => {
  const {
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
    formContext,
  } = props;
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const formData = formContext?.formData || {};
  const isPasswordField = label?.toLowerCase() === 'password';
  const isEmailField = label?.toLowerCase() === 'email';
  const isMobileField =
    label?.toLowerCase() === 'mobile' ||
    label?.toLowerCase() === 'contact number';

  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*()_+`\-={}:":;'<>?,./\\]).{8,}$/;
  const nameRegex = /^[a-zA-Z]+$/;
  const contactRegex = /^[6-9]\d{9}$/;
  const udiseRegex = /^\d{11}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const lowerLabel = label?.toLowerCase();
  // useEffect(() => {
  //   if (label === 'First Name' || label === 'Last Name') {
  //     const fnameValue = value; // Current field value (fname or lname)
  //     const lnameValue = value; // Current field value (fname or lname)

  //     if (fnameValue && lnameValue) {
  //       const Username = `${fnameValue}_${lnameValue}`;
  //       // Triggering change for username field
  //       onChange(Username);
  //     }
  //   }
  // }, [value, label, onChange]);
  const isOptional = () => {
    if (isEmailField && formData.mobile) return true;
    if (isMobileField && formData.email) return true;
    return false;
  };
  const isActuallyRequired = () => {
    if (isEmailField) return !formData.mobile && required;
    if (isMobileField) return !formData.email && required;
    return required;
  };
  const validateField = (field: string, val: string): string | null => {
    if (isOptional() && !val) return null;
    switch (field.toLowerCase()) {
      case 'first name':
      case 'last name':
        if (!nameRegex.test(val)) return 'Only letters are allowed.';
        break;
      case 'contact number':
        if (!contactRegex.test(val))
          return 'Enter a valid 10-digit mobile number.';
        break;
      case 'email':
        if (!emailRegex.test(val)) return 'Enter a valid email address.';
        break;
      case 'password':
        if (!passwordRegex.test(val))
          return 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
        break;
    }
    return null;
  };
  const shouldShowHelperText = () => {
    // Always show for non-email/mobile fields
    if (!isEmailField && !isMobileField) return true;

    // For email field - only show if mobile isn't entered
    if (isEmailField) return !formData.mobile;

    // For mobile field - only show if email isn't entered
    if (isMobileField) return !formData.email;

    return true;
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (isMobileField) {
      // Remove any non-digit characters
      const numericValue = val.replace(/\D/g, '');
      // Limit to 10 digits
      const limitedValue = numericValue.slice(0, 10);

      const error = validateField(label ?? '', limitedValue);
      setLocalError(error);
      onChange(limitedValue === '' ? undefined : limitedValue);
      return;
    }
    const error = validateField(label ?? '', val);
    setLocalError(error);
    // if (isPasswordField) {
    //   if (!passwordRegex.test(val)) {
    //     setLocalError(
    //       'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
    //     );
    //   } else {
    //     setLocalError(null);
    //   }
    // }
    onChange(val === '' ? undefined : val);
    // if (onErrorChange) {
    //   onErrorChange(!!error);
    // }
  };

  const handleBlur = () => {
    if (onBlur) onBlur(id, value);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    onFocus(id, event.target.value);

  // Filter out 'is a required property' messages
  const displayErrors = rawErrors.filter(
    (error) => !error.toLowerCase().includes('required')
  );
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const renderLabel = () => {
    if (
      ['first name', 'last name', 'username', 'password'].includes(
        lowerLabel ?? ''
      )
    ) {
      return (
        <>
          {label} <span style={{ color: 'red' }}>*</span>
        </>
      );
    }

    if (isEmailField || isMobileField) {
      return (
        <>
          {label}
          {isActuallyRequired() && <span style={{ color: 'red' }}>*</span>}
          {isOptional() && (
            <span style={{ color: 'gray', fontSize: '0.8em' }}>
              {' '}
              (optional)
            </span>
          )}
        </>
      );
    }

    return label;
  };

  return (
    <TextField
      fullWidth
      id={id}
      label={renderLabel()}
      value={
        typeof value === 'object' && value !== null ? value.name : value ?? ''
      }
      type={isPasswordField && !showPassword ? 'password' : 'text'}
      required={required}
      disabled={disabled || readonly}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      error={displayErrors.length > 0}
      helperText={
        shouldShowHelperText()
          ? localError || (displayErrors.length > 0 ? displayErrors[0] : '')
          : ''
      }
      variant="outlined"
      size="small"
      FormHelperTextProps={{
        sx: {
          color: 'red', // ✅ helperText color set manually
          fontSize: '11px',
          marginLeft: '0px',
        },
      }}
      InputProps={{
        inputMode: isMobileField ? 'numeric' : 'text',
        pattern: isMobileField ? '[0-9]*' : undefined,
        sx: {
          '& .MuiInputBase-input': {
            padding: '10px 12px',
            fontSize: '12px',
          },
        },
        endAdornment: isPasswordField && (
          <InputAdornment position="end">
            <IconButton onClick={toggleShowPassword} edge="end" size="small">
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      InputLabelProps={{
        sx: {
          fontSize: '12px', // Label font size
          '&.Mui-focused': {
            transform: 'translate(14px, -6px) scale(0.75)', // Shrink the label when focused
            color: '#582E92', // Optional: change label color on focus
          },
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -6px) scale(0.75)', // Shrink when filled or focused
            color: '#582E92', // Optional: change label color when filled
          },
        },
      }}
      //   margin="normal"
    />
  );
};

export default CustomTextFieldWidget;
