/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { Layout } from '@shared-lib';
import {
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  FormHelperText,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { updateProfile } from '../../services/ProfileService'; // Import the service

export default function ProfileEdit() {
  const router = useRouter();

  const [frameworkFilter, setFrameworkFilter] = useState(null);
  const [selectedValues, setSelectedValues] = useState({
    board: [],
    medium: [],
    gradeLevel: [],
    subject: [],
  });
  const [validationErrors, setValidationErrors] = useState({
    board: false,
    medium: false,
    gradeLevel: false,
    subject: false,
  });

  useEffect(() => {
    const prefillData = {
      board: (localStorage.getItem('selectedBoard')?.split(',') || []).map(
        (val) => val.trim()
      ),
      medium: (localStorage.getItem('selectedMedium')?.split(',') || []).map(
        (val) => val.trim()
      ),
      gradeLevel: (
        localStorage.getItem('selectedGradeLevel')?.split(',') || []
      ).map((val) => val.trim()),
      subject: (localStorage.getItem('selectedSubject')?.split(',') || []).map(
        (val) => val.trim()
      ),
    };
    setSelectedValues(prefillData);
    fetchFramework();
  }, []);

  const fetchFramework = async () => {
    try {
      const frameworkId = localStorage.getItem('frameworkname');
      if (!frameworkId) {
        console.error('Framework ID not found in localStorage');
        return;
      }
      const url = `${process.env.NEXT_PUBLIC_SSUNBIRD_BASE_URL}/api/framework/v1/read/${frameworkId}`;
      const response = await fetch(url);
      const frameworkData = await response.json();
      setFrameworkFilter(frameworkData?.result?.framework || {});
    } catch (error) {
      console.error('Error fetching framework data:', error);
    }
  };

  const handleChange = (event, filterCode) => {
    const { value, checked } = event.target;
    setSelectedValues((prev) => {
      const currentValues = prev[filterCode] || [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      return {
        ...prev,
        [filterCode]: newValues,
      };
    });

    // Clear validation error on change
    setValidationErrors((prev) => ({
      ...prev,
      [filterCode]: false,
    }));
  };

  const handleSave = async () => {
    const newValidationErrors = {
      board: selectedValues.board.length === 0,
      medium: selectedValues.medium.length === 0,
      gradeLevel: selectedValues.gradeLevel.length === 0,
      subject: selectedValues.subject.length === 0,
    };

    setValidationErrors(newValidationErrors);

    const hasErrors = Object.values(newValidationErrors).some((error) => error);

    if (hasErrors) {
      console.error('Validation failed:', newValidationErrors);
      return;
    }

    try {
      const userId = localStorage.getItem('userId'); // Replace with actual user ID
      const response = await updateProfile(userId, selectedValues);
      router.push('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

 const renderCategorySelect = (category) => {
   const filterCode = category.code;
   const options = category.terms.map((term) => ({
     label: term.name,
     value: String(term.code),
   }));
   const currentSelectedValues = selectedValues[filterCode] || [];

   return (
     <FormControl
       fullWidth
       key={`${category.code}-${category.name}`}
       sx={{ mb: 2 }}
       error={validationErrors[filterCode]}
     >
       <InputLabel>{category.name}</InputLabel>
       <Select
         multiple
         value={currentSelectedValues}
         onChange={(e) => handleChange(e, filterCode)}
         input={<OutlinedInput label={category.name} />}
         renderValue={(selected) =>
           selected
             .map((value) => {
               const option = options.find((option) => option.label === value);
               return option ? option.label : value;
             })
             .join(', ')
         }
       >
         {options.map((option) => (
           <MenuItem key={option.label} value={option.label}>
             <Checkbox
               checked={currentSelectedValues.includes(option.label)}
               onChange={(e) => handleChange(e, filterCode)}
               value={option.label}
             />
             <ListItemText primary={option.label} />
           </MenuItem>
         ))}
       </Select>
       {validationErrors[filterCode] && (
         <FormHelperText>{`${category.name} is required`}</FormHelperText>
       )}
     </FormControl>
   );
 };
  const isFormValid = () => {
    return (
      selectedValues.board.length > 0 &&
      selectedValues.medium.length > 0 &&
      selectedValues.gradeLevel.length > 0 &&
      selectedValues.subject.length > 0
    );
  };

return (
  <Layout
    showTopAppBar={{
      title: 'Framework Edit',
      showMenuIcon: true,
    }}
    isFooter={true}
  >
    <Box sx={{ paddingTop: '20px', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography
        variant="h5"
        color="#582E92"
        fontWeight="bold"
        sx={{ textAlign: 'center', mb: 2 }}
      >
        Edit Profile
      </Typography>

      {frameworkFilter?.categories ? (
        <Box sx={{ mx: 3, mt: 2 }}>
          {/* Render categories in the correct sequence */}
          {['board', 'medium', 'gradeLevel', 'subject'].map((key) =>
            frameworkFilter.categories
              .filter((category) => category.code === key)
              .map((category) => renderCategorySelect(category))
          )}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!isFormValid()} // Disable button if form is invalid
              sx={{
                bgcolor: isFormValid() ? '#582E92' : '#ccc',
                '&:hover': { bgcolor: isFormValid() ? '#472273' : '#ccc' },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 3 }}>
          Loading...
        </Typography>
      )}
    </Box>
  </Layout>
);

}
