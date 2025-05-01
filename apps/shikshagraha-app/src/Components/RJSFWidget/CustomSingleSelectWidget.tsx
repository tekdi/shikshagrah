import React, { useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { useTranslation } from 'react-i18next';
import { FormHelperText } from '@mui/material';

const CustomSingleSelectWidget = ({
  id,
  options,
  value = '',
  required,
  label,
  onChange,
  schema,
  uiSchema,
  rawErrors = [],
}: WidgetProps) => {
  const { enumOptions = [] } = options;
  const { t } = useTranslation();
  const [subRolesVisible, setSubRolesVisible] = useState(false);

  const isDisabled = uiSchema?.['ui:disabled'] === true;
  const isEmptyOptionIncluded = schema?.allowEmptyOption || false;
  const lowerLabel = label?.toLowerCase();
  const isRoleField = lowerLabel === 'roles';
  const helperText = ' Please select a role.';
  const handleChange = (event: any) => {
    const selected = event.target.value;
    onChange(selected);

    // Check if the selected role is 'administrator' and toggle the visibility of subRoles
    if (selected === 'administrator') {
      setSubRolesVisible(true);
    } else {
      setSubRolesVisible(false);
    }
  };

  useEffect(() => {
    // Check if the current value is 'administrator' on component mount
    if (value === 'administrator') {
      setSubRolesVisible(true);
    }
  }, [value]);

  return (
    <>
      <FormControl
        fullWidth
        // required={required}
        // error={rawErrors.length > 0}
        size="small"
        disabled={isDisabled}
      >
        <InputLabel
          id={`${id}-label`}
          sx={{
            fontSize: '12px',
            '&.Mui-focused': {
              transform: 'translate(14px, -6px) scale(0.75)',
              color: '#582E92',
            },
            '&.MuiInputLabel-shrink': {
              transform: 'translate(14px, -6px) scale(0.75)',
              color: '#582E92',
            },
          }}
        >
          {isRoleField ? (
            <>
              {label}
              <span style={{ color: 'red' }}> *</span>
            </>
          ) : (
            label
          )}
        </InputLabel>

        <Select
          id={id}
          labelId={`${id}-label`}
          value={value}
          onChange={handleChange}
          displayEmpty
          label={value ? label : ''}
          size="small"
          sx={{
            '& .MuiSelect-select': {
              padding: '10px 12px',
              fontSize: '12px',
            },
          }}
        >
          {isEmptyOptionIncluded && (
            <MenuItem value="">
              <em>
                {t('FORM.Select')}
                {required && '*'}
              </em>
            </MenuItem>
          )}

          {enumOptions
            .filter((option) => option.value !== 'Select')
            .map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {t(`FORM.${option.label}`, { defaultValue: option.label })}
              </MenuItem>
            ))}
        </Select>
        {helperText && !value && (
          <FormHelperText
            sx={{
              color: 'red',
              fontSize: '11px',
              marginLeft: '0px',
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </>
  );
};

export default CustomSingleSelectWidget;