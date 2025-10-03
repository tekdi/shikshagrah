// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { WidgetProps } from '@rjsf/utils';
import { fetchContentOnUdise } from '../../services/LoginService';

// Type definitions
interface LocationEntity {
  _id?: string;
  name?: string;
  externalId?: string;
}

interface ParentInformation {
  state?: LocationEntity[];
  district?: LocationEntity[];
  block?: LocationEntity[];
  cluster?: LocationEntity[];
}

interface MetaInformation {
  externalId?: string;
  name?: string;
}

interface RegistryDetails {
  code?: string;
  locationId?: string;
}

interface LocationInfo {
  _id?: string;
  entityType?: string;
  metaInformation?: MetaInformation;
  registryDetails?: RegistryDetails;
  parentInformation?: ParentInformation;
}

interface FetchDataResponse {
  udise: string;
  school: LocationEntity;
  state: LocationEntity;
  district: LocationEntity;
  block: LocationEntity;
  cluster: LocationEntity;
}

interface UdiaseWithButtonProps extends WidgetProps {
  onFetchData: (data: FetchDataResponse) => void;
}

// Helper functions
const validateSchoolEntity = (
  locationInfo: LocationInfo | undefined,
  inputValue: string
): { isValid: boolean; schoolCode: string } => {
  const inputLower = String(inputValue || '').toLowerCase();
  const isSchool = locationInfo?.entityType === 'school';

  const schoolCode = String(
    locationInfo?.metaInformation?.externalId ||
      locationInfo?.registryDetails?.code ||
      locationInfo?.registryDetails?.locationId ||
      ''
  ).toLowerCase();

  const hasParentInfo =
    Array.isArray(locationInfo?.parentInformation?.state) &&
    locationInfo.parentInformation.state.length > 0 &&
    Array.isArray(locationInfo?.parentInformation?.district) &&
    locationInfo.parentInformation.district.length > 0 &&
    Array.isArray(locationInfo?.parentInformation?.block) &&
    locationInfo.parentInformation.block.length > 0 &&
    Array.isArray(locationInfo?.parentInformation?.cluster) &&
    locationInfo.parentInformation.cluster.length > 0;

  return {
    isValid: isSchool && schoolCode === inputLower && hasParentInfo,
    schoolCode,
  };
};

const getEmptyLocationData = (): FetchDataResponse => ({
  udise: '',
  school: { _id: '', name: '', externalId: '' },
  state: { _id: '', name: '', externalId: '' },
  district: { _id: '', name: '', externalId: '' },
  block: { _id: '', name: '', externalId: '' },
  cluster: { _id: '', name: '', externalId: '' },
});

const extractLocationData = (
  locationInfo: LocationInfo,
  udiseCode: string
): FetchDataResponse => {
  const getFirstEntity = (
    entities: LocationEntity[] | undefined
  ): LocationEntity => ({
    _id: entities?.[0]?._id || '',
    name: entities?.[0]?.name || '',
    externalId: entities?.[0]?.externalId || '',
  });

  return {
    udise: udiseCode,
    school: {
      _id: locationInfo?._id || '',
      name: locationInfo?.metaInformation?.name || '',
      externalId: udiseCode,
    },
    state: getFirstEntity(locationInfo?.parentInformation?.state),
    district: getFirstEntity(locationInfo?.parentInformation?.district),
    block: getFirstEntity(locationInfo?.parentInformation?.block),
    cluster: getFirstEntity(locationInfo?.parentInformation?.cluster),
  };
};

const UdiaseWithButton: React.FC<UdiaseWithButtonProps> = ({
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
}) => {
  const [localValue, setLocalValue] = useState<string>(value ?? '');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value when prop changes
  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  const displayErrors = rawErrors.filter(
    (error) => !error.toLowerCase().includes('required')
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setLocalValue(val);
    onChange(val === '' ? undefined : val);
    if (val) {
      setErrorMessage('');
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(id, value);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(id, event.target.value);
  };

  const handleFetch = async (): Promise<void> => {
    if (!localValue.trim()) {
      setErrorMessage('Please enter a UDISE Code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetchContentOnUdise(localValue);

      // Handle API response errors
      if (!response || response?.status === 500) {
        setErrorMessage('Server error. Please try again later.');
        onFetchData(getEmptyLocationData());
        return;
      }

      if (!response?.result || response.result.length === 0) {
        setErrorMessage('No school found. Please enter a valid UDISE Code.');
        onFetchData(getEmptyLocationData());
        return;
      }

      const locationInfo: LocationInfo = response.result[0];
      const validation = validateSchoolEntity(locationInfo, localValue);

      if (!validation.isValid) {
        setErrorMessage('No school found. Please enter a valid UDISE Code.');
        onFetchData(getEmptyLocationData());
        return;
      }

      // Success case - extract and send location data
      const locationData = extractLocationData(locationInfo, localValue);
      onFetchData(locationData);
      setErrorMessage('');
    } catch (error: any) {
      console.error('UDISE fetch error:', error);
      setErrorMessage(
        error?.message || 'Something went wrong. Please try again later.'
      );
      onFetchData(getEmptyLocationData());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" flexDirection="row" alignItems="flex-start" gap={1}>
        {/* TextField */}
        <Box sx={{ flex: 1 }}>
          <TextField
            fullWidth
            id={id}
            label={
              <>
                {label} <span style={{ color: 'red' }}>*</span>
              </>
            }
            value={localValue}
            required={required}
            disabled={disabled || readonly || isLoading}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            error={displayErrors.length > 0 || !!errorMessage}
            variant="outlined"
            size="small"
            inputRef={inputRef}
            InputProps={{
              sx: {
                '& .MuiInputBase-input': {
                  padding: '10px 12px',
                  fontSize: '12px !important',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  WebkitAppearance: 'none',
                  borderRadius: '0',
                  '@media screen and (-webkit-min-device-pixel-ratio: 0)': {
                    fontSize: '12px !important',
                  },
                },
                '& .MuiInputBase-root': {
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                },
              },
            }}
            InputLabelProps={{
              sx: {
                fontSize: '12px',
                '@supports (-webkit-touch-callout: none)': {
                  '&.MuiInputLabel-shrink': {
                    transform: 'translate(12px, -9px) scale(0.75) !important',
                    backgroundColor: '#fff',
                    padding: '0 4px',
                  },
                },
                '&.Mui-focused': {
                  color: '#000000 !important',
                },
                '&.Mui-focused.MuiInputLabel-shrink': {
                  color: '#000000 !important',
                },
              },
            }}
          />
        </Box>

        {/* Fetch Button */}
        <Button
          variant="contained"
          size="small"
          onClick={handleFetch}
          disabled={!localValue.trim() || isLoading}
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
            height: '40px',
            minWidth: '80px',
            mt: '1px',
          }}
        >
          {isLoading ? '...' : 'Fetch'}
        </Button>
      </Box>

      {/* Error/Helper Text */}
      {(displayErrors.length > 0 || errorMessage) && (
        <Box mt={0.5} ml={0.5}>
          <Typography variant="caption" color="error" sx={{ fontSize: '11px' }}>
            {errorMessage || displayErrors.join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UdiaseWithButton;
