// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  TextField,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material';
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
  const fieldSchema: any = (props as any)?.schema || {};
  const fieldPatternString: string | undefined = fieldSchema?.pattern;
  const fieldPolicyMsg: string | undefined = fieldSchema?.policyMsg;
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const formData = formContext?.formData || {};
  const isPasswordField = label?.toLowerCase() === 'password';
  const isConfirmPasswordField = label
    ?.toLowerCase()
    .includes('confirm password');
  const isEmailField = label?.toLowerCase() === 'email';
  const isMobileField =
    label?.toLowerCase() === 'mobile' ||
    label?.toLowerCase() === 'contact number';

  // Default regex patterns (fallback when no pattern is provided in schema)
  const defaultPatterns = {
    name: /^[a-zA-Z]+$/,
    contact: /^[6-9]\d{9}$/,
    udise: /^\d{11}$/,
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    username: /^(?:[a-z0-9_-]{3,40}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})$/,
    registrationCode: /^\w+$/,
    // Simplified to reduce cognitive complexity while enforcing the same policy
    password:
      /^(?=.*[A-Z].*[A-Z])(?=.*\d.*\d)(?=.*[!@#%$&()\-`.+,].*[!@#%$&()\-`.+,].*[!@#%$&()\-`.+,]).{11,}$/, // NOSONAR - validation pattern, not a credential
  };

  // Default error messages (fallback when no policyMsg is provided)
  const defaultErrorMessages = {
    password:
      'Password must have at least two uppercase letters, two numbers, three special characters, and be at least 11 characters long.', // NOSONAR
    name: 'Only letters are allowed.',
    contact: 'Enter a valid 10-digit mobile number',
    email: 'Enter a valid email address',
    username:
      'Please enter a valid username. It can be either a valid email address or a custom username (3-40 characters, lowercase letters and numbers only, with hyphens and underscores allowed)',
    registrationCode:
      'Registration code may only contain letters, numbers and underscore.',
    confirmPassword: 'Password and confirm password must be the same.', // NOSONAR
    requiredField: 'This field is required.',
    eitherRequired: 'Either email or contact number is required',
  };

  const lowerLabel = label?.toLowerCase();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Helper function to get the appropriate pattern for a field
  const getFieldPattern = (fieldKey: string): RegExp | null => {
    // If form config has a pattern, use it
    if (fieldPatternString) {
      try {
        return new RegExp(fieldPatternString);
      } catch (error) {
        console.warn(
          `Invalid regex pattern in form config: ${fieldPatternString}`,
          error
        );
        // Fall back to default pattern if form config pattern is invalid
      }
    }

    // Fall back to default patterns based on field type
    const defaultPatternMap: Record<string, RegExp> = {
      'first name': defaultPatterns.name,
      'last name': defaultPatterns.name,
      username: defaultPatterns.username,
      'registration code': defaultPatterns.registrationCode,
      password: defaultPatterns.password,
      email: defaultPatterns.email,
      'contact number': defaultPatterns.contact,
      mobile: defaultPatterns.contact,
      udise: defaultPatterns.udise,
    };

    return defaultPatternMap[fieldKey] || null;
  };

  // Helper function to get the appropriate error message for a field
  const getFieldErrorMessage = (fieldKey: string): string => {
    // If form config has a policy message, use it
    if (fieldPolicyMsg) {
      return fieldPolicyMsg;
    }

    // Fall back to default error messages based on field type
    const defaultErrorMessageMap: Record<string, string> = {
      'first name': defaultErrorMessages.name,
      'last name': defaultErrorMessages.name,
      username: defaultErrorMessages.username,
      'registration code': defaultErrorMessages.registrationCode,
      password: defaultErrorMessages.password,
      'confirm password': defaultErrorMessages.confirmPassword,
      email: defaultErrorMessages.email,
      'contact number': defaultErrorMessages.contact,
      mobile: defaultErrorMessages.contact,
      required: defaultErrorMessages.requiredField,
      eitherRequired: defaultErrorMessages.eitherRequired,
    };

    return (
      defaultErrorMessageMap[fieldKey] || defaultErrorMessages.requiredField
    );
  };

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

  // Helpers
  const validateWithPattern = (
    val: string,
    pattern: RegExp,
    errorMessage: string
  ): string | null => {
    if (val && !pattern.test(val)) {
      return errorMessage;
    }
    return null;
  };

  const validateRequired = (fieldKey: string, input: string): string | null => {
    if (isOptional() && !input) return null;
    if (isActuallyRequired() && !input) return getFieldErrorMessage('required');
    if (fieldKey === 'last name' && !input) return null;
    return null;
  };

  const validateSchema = (input: string, fieldKey: string): string | null => {
    if (!input) return null;

    const fieldPattern = getFieldPattern(fieldKey);
    const fieldErrorMessage = getFieldErrorMessage(fieldKey);

    if (fieldPattern) {
      const schemaErr = validateWithPattern(
        input,
        fieldPattern,
        fieldErrorMessage
      );
      if (schemaErr) return schemaErr;
    }

    // Short-circuit for complex fields
    if (
      [
        'first name',
        'last name',
        'username',
        'registration code',
        'password',
        'confirm password',
      ].includes(fieldKey)
    ) {
      return validatePasswordFields(fieldKey, input);
    }

    return null;
  };

  const validatePasswordFields = (
    fieldKey: string,
    input: string
  ): string | null => {
    if (fieldKey === 'confirm password') {
      if (input.includes(' ')) return 'Confirm password cannot contain spaces.';
      if (input !== formData.password)
        return getFieldErrorMessage('confirm password');
    }

    if (fieldKey === 'password' && input.includes(' ')) {
      return 'Password cannot contain spaces.';
    }

    return null;
  };

  const fieldValidators: Record<string, (val: string) => string | null> = {
    'first name': (val) => {
      const pattern = getFieldPattern('first name');
      const errorMessage = getFieldErrorMessage('first name');
      return validateWithPattern(val, pattern!, errorMessage);
    },
    'last name': (val) => {
      if (!val) return null;
      const pattern = getFieldPattern('last name');
      const errorMessage = getFieldErrorMessage('last name');
      return validateWithPattern(val, pattern!, errorMessage);
    },
    username: (val) => {
      const pattern = getFieldPattern('username');
      const errorMessage = getFieldErrorMessage('username');
      return validateWithPattern(val, pattern!, errorMessage);
    },
    'registration code': (val) => {
      const pattern = getFieldPattern('registration code');
      const errorMessage = getFieldErrorMessage('registration code');
      return validateWithPattern(val, pattern!, errorMessage);
    },
    password: (val) => {
      if (val.includes(' ')) return 'Password cannot contain spaces.';
      const pattern = getFieldPattern('password');
      const errorMessage = getFieldErrorMessage('password');
      return validateWithPattern(val, pattern!, errorMessage);
    },
    'confirm password': (val) =>
      validatePasswordFields('confirm password', val),
    'contact number': (val) => {
      if (!val) return null;
      const pattern = getFieldPattern('contact number');
      const errorMessage = getFieldErrorMessage('contact number');
      return validateWithPattern(val, pattern!, errorMessage);
    },
    email: (val) => {
      if (val) {
        const pattern = getFieldPattern('email');
        const errorMessage = getFieldErrorMessage('email');
        const emailError = validateWithPattern(val, pattern!, errorMessage);
        if (emailError) return emailError;
      }
      if (!val && !formData.mobile)
        return getFieldErrorMessage('eitherRequired');
      return null;
    },
  };

  const validateField = (field: string, val: string): string | null => {
    const input = val ?? '';
    const fieldKey = field.toLowerCase();

    // Step 1: Required checks
    const requiredError = validateRequired(fieldKey, input);
    if (requiredError) return requiredError;

    // Step 2: Schema checks
    const schemaError = validateSchema(input, fieldKey);
    if (schemaError) return schemaError;

    // Step 3: Field-specific fallback
    if (fieldValidators[fieldKey]) {
      return fieldValidators[fieldKey](val);
    }

    // Step 4: Generic fallback
    if (required && !val) return getFieldErrorMessage('required');

    return null;
  };

  useEffect(() => {
    if (isIOS) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const originalContent = viewportMeta.getAttribute('content');
        viewportMeta.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );

        return () => {
          if (originalContent) {
            viewportMeta.setAttribute('content', originalContent);
          }
        };
      }
    }
  }, []);

  useEffect(() => {
    if (isConfirmPasswordField && value) {
      const error = validateField(label ?? '', value);
      setLocalError(error);
    }
  }, [formData.password]);

  const shouldShowHelperText = () => {
    if (displayErrors.length > 0 || localError) {
      return true;
    }

    if (!isEmailField && !isMobileField) return true;

    if (isEmailField) return !formData.mobile || (value && localError);
    if (isMobileField) return !formData.email || (value && localError);

    return true;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;

    if (isMobileField) {
      const numericValue = val.replace(/\D/g, '');
      const limitedValue = numericValue.slice(0, 10);
      const error = validateField(label ?? '', limitedValue);
      setLocalError(error);
      onChange(limitedValue === '' ? undefined : limitedValue);
      if (limitedValue && formData.email) {
        props.onClearError?.('email');
      }
      return;
    }

    if (isEmailField) {
      const error = validateField(label ?? '', val);
      setLocalError(error);
      onChange(val === '' ? undefined : val);
      if (val && formData.mobile) {
        props.onClearError?.('mobile');
      }
      return;
    }

    // Handle username field - limit to 40 characters
    if (lowerLabel === 'username') {
      const limitedValue = val.slice(0, 40);
      const error = validateField(label ?? '', limitedValue);
      setLocalError(error);
      onChange(limitedValue === '' ? undefined : limitedValue);
      if (props.onErrorChange) {
        props.onErrorChange(!!error);
      }
      return;
    }

    // Handle password fields - remove all spaces
    if (isPasswordField || isConfirmPasswordField) {
      const noSpaceVal = val.replace(/\s/g, '');
      const error = validateField(label ?? '', noSpaceVal);
      setLocalError(error);
      onChange(noSpaceVal === '' ? undefined : noSpaceVal);
      if (props.onErrorChange) {
        props.onErrorChange(!!error);
      }
      return;
    }

    // Handle all other fields
    const error = validateField(label ?? '', val);
    setLocalError(error);
    onChange(val === '' ? undefined : val);
    if (props.onErrorChange) {
      props.onErrorChange(!!error);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur(id, value);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus(id, event.target.value);
  };

  // Filter out 'is a required property' messages
  const displayErrors = rawErrors.filter(
    (error) => !error.toLowerCase().includes('required')
  );

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const renderLabel = () => {
    if (
      [
        'first name',
        'username',
        'password',
        'confirm password',
        'registration code',
      ].includes(lowerLabel ?? '')
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

    if (isConfirmPasswordField) {
      return (
        <>
          {label}
          {formData.password && <span style={{ color: 'red' }}>*</span>}
        </>
      );
    }

    return label;
  };

  const shouldShrinkLabel = isFocused || Boolean(value);

  return (
    <>
      <input
        type="text"
        name="prevent_autofill_username"
        style={{ display: 'none' }}
      />
      <input
        type="password"
        name="prevent_autofill_password"
        style={{ display: 'none' }}
      />

      <TextField
        fullWidth
        id={id}
        label={renderLabel()}
        value={
          typeof value === 'object' && value !== null ? value.name : value ?? ''
        }
        type={
          (isPasswordField || isConfirmPasswordField) && !showPassword
            ? 'password'
            : 'text'
        }
        required={required}
        disabled={disabled || readonly}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        error={displayErrors.length > 0 || !!localError}
        helperText={
          shouldShowHelperText()
            ? localError || (displayErrors.length > 0 ? displayErrors[0] : '')
            : ''
        }
        variant="outlined"
        size="small"
        autoComplete={
          isPasswordField || isConfirmPasswordField ? 'new-password' : 'off'
        }
        FormHelperTextProps={{
          sx: {
            color:
              displayErrors.length > 0 || localError
                ? 'error.main'
                : 'text.secondary',
            fontSize: '11px',
            marginLeft: '0px',
          },
        }}
        InputProps={{
          notched: shouldShrinkLabel,
          readOnly: readonly,
          inputMode: isMobileField ? 'numeric' : 'text',
          pattern: isMobileField ? '[0-9]*' : undefined,
          autoComplete:
            isPasswordField || isConfirmPasswordField ? 'new-password' : 'off',
          name:
            isPasswordField || isConfirmPasswordField
              ? 'login-password'
              : 'login-username',
          sx: {
            '& .MuiInputBase-input': {
              padding: '10px 12px',
              fontSize: isIOS ? '16px !important' : '12px !important',
              color: readonly ? '#000000' : undefined,
              backgroundColor: readonly ? '#f5f5f5' : undefined,
              WebkitTextFillColor: readonly ? '#000000' : undefined,
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              WebkitAppearance: 'none',
              borderRadius: '0',
              '@media screen and (-webkit-min-device-pixel-ratio: 0)': {
                fontSize: isIOS ? '16px !important' : '12px !important',
              },
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: readonly ? 'rgba(0, 0, 0, 0.23)' : undefined,
            },
            '& .MuiInputBase-root': {
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
            },
          },
          endAdornment: (isPasswordField || isConfirmPasswordField) && (
            <InputAdornment position="end">
              <IconButton onClick={toggleShowPassword} edge="end" size="small">
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        InputLabelProps={{
          shrink: shouldShrinkLabel,
          sx: {
            fontSize: isIOS ? '16px' : '12px',
            backgroundColor: shouldShrinkLabel ? '#fefefe' : 'transparent',
            padding: shouldShrinkLabel ? '0 4px' : '0',
            '&.Mui-focused': {
              color: '#000000 !important',
            },
            '&.MuiInputLabel-shrink': {
              transform: 'translate(12px, -9px) scale(0.75) !important',
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline > legend': {
              maxWidth: '0.01px',
              transition: 'max-width 150ms ease',
            },
            '& .MuiInputLabel-shrink + .MuiOutlinedInput-notchedOutline > legend':
              {
                maxWidth: '1000px',
              },
          },
        }}
      />

      {(isEmailField || isMobileField) &&
        !value &&
        !localError &&
        !displayErrors.length && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: '#666',
              fontSize: '11px',
              marginTop: '4px',
              marginLeft: '12px',
            }}
          >
            {isEmailField
              ? 'Enter email'
              : isMobileField
              ? 'Enter contact number'
              : 'Enter either Email or Contact number'}
          </Typography>
        )}
    </>
  );
};

export default CustomTextFieldWidget;
