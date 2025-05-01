// @ts-nocheck
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { WidgetProps } from '@rjsf/utils';
import { fetchContentOnUdise } from '../../services/LoginService';

const UdiaseWithButton = ({
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
  onFetchData,
}: WidgetProps & { onFetchData: (data: string) => void }) => {
  const [udiseCode, setUdiasecode] = useState(value ?? '');
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value.replace(/\s/g, '');

    setUdiasecode(val);
    // onChange(val === '' ? undefined : val);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, event.target.value);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    onFocus(id, event.target.value);

  const handleClick = async () => {
    // You can place API call logic here
    if (!udiseCode) {
      return console.log('Please enter a valid UDISE Code');
    }
    try {
      const response = await fetchContentOnUdise(udiseCode);
      const locationInfo = response.result[0];
      console.log('locationInfo', response);
      const sampleResponse = {
        udise: udiseCode,
        school: {
          _id: locationInfo?._id || '',
          name: locationInfo?.metaInformation?.name || '',
        },
        state: {
          _id: locationInfo?.parentInformation?.state?.[0]?._id || '',
          name: locationInfo?.parentInformation?.state?.[0]?.name || '',
        },
        district: {
          _id: locationInfo?.parentInformation?.district?.[0]?._id || '',
          name: locationInfo?.parentInformation?.district?.[0]?.name || '',
        },
        block: {
          _id: locationInfo?.parentInformation?.block?.[0]?._id || '',
          name: locationInfo?.parentInformation?.block?.[0]?.name || '',
        },
        cluster: {
          _id: locationInfo?.parentInformation?.cluster?.[0]?._id || '',
          name: locationInfo?.parentInformation?.cluster?.[0]?.name || '',
        },
      };

      onFetchData(sampleResponse);
      setUdiasecode(sampleResponse.udise);
    } catch (e) {
      console.log(e);
    }
  };

  const displayErrors = rawErrors.filter(
    (error) => !error.toLowerCase().includes('required')
  );

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TextField
        fullWidth
        id={id}
        label={
          <>
            {label} <span style={{ color: 'red' }}>*</span>
          </>
        }
        value={udiseCode ?? ''}
        required={required}
        disabled={disabled || readonly}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        error={displayErrors.length > 0}
        // helperText={displayErrors.length > 0 ? displayErrors[0] : ''}
        variant="outlined"
        size="small"
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
      <Button
        variant="contained"
        size="small"
        onClick={handleClick}
        disabled={!udiseCode}
        sx={{
          whiteSpace: 'nowrap',
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
          width: '20%',
        }}
      >
        Fetch
      </Button>
    </Box>
  );
};

export default UdiaseWithButton;
