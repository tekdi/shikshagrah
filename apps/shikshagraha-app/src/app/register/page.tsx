'use client';
import { useEffect, useState } from 'react';
import Form from '@rjsf/core';
import { generateRJSFSchema } from '../../utils/generateSchemaFromAPI';

import validator from '@rjsf/validator-ajv8';
import DynamicForm from '../../Components/DynamicForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { SubmitButtonProps, getSubmitButtonOptions } from '@rjsf/utils';
import { registerUserService, schemaRead } from '../../services/LoginService';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formSchema, setFormSchema] = useState<any>();
  const [uiSchema, setUiSchema] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await schemaRead(); // replace with your API endpoint
        // const data = await response.json();
        const { schema, uiSchema } = generateRJSFSchema(
          response?.result?.fields
        ); // your conversion logic
        setFormSchema(schema);
        setUiSchema(uiSchema);
      } catch (error) {
        console.error('Error fetching schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);
  const handleSubmit = ({ formData }: any) => {
    console.log('Form Data:', formData);
  };
  //   if (loading) return <p>Loading form...</p>;
  //   if (!formSchema) return <p>Failed to load form.</p>;
  const handleRegister = async () => {
    // const registrationResponse = await registerUserService();
    // if (registrationResponse.success === true) {
    //   setErrorMessage(registrationResponse.message);
    //   setDialogOpen(true);
    // } else {
    //   setErrorMessage(
    //     registrationResponse.data
    //       ? registrationResponse.data.error.params.errmsg
    //       : registrationResponse.error.params.errmsg
    //   );
    // }
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    // router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
    // localStorage.clear();
  };
  const handleBack = () => {
    router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
        // Allow scrolling if content is large
        paddingBottom: '60px',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '2px solid #FFD580', // Light shade of #FF9911 for the bottom border
          boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)', // Subtle shadow
          backgroundColor: '#FFF7E6', // Light background derived from #FF9911
          borderRadius: '0 0 25px 25px', // Rounded corners only on the bottom left and right
        }}
      >
        <Grid container alignItems="center">
          <Grid item xs={2}>
            <Button
              onClick={handleBack}
              sx={{
                color: '#572E91',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                },
              }}
            >
              <ArrowBackIcon sx={{ marginRight: '4px' }} />
              Back
            </Button>
          </Grid>
          <Grid
            item
            xs={12}
            textAlign="center"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#572E91',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                textTransform: 'uppercase',
              }}
            >
              Registration
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ mx: 'auto', p: 2, width: '100%', maxWidth: 400 }}>
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 3,
              bgcolor: '#f5f5f5',
            }}
          >
            <Box
              component="img"
              src="assets/images/SG_Logo.png"
              alt="logo"
              sx={{
                width: '30%',
                height: '30%',
                bgcolor: '#f5f5f5',
                objectFit: 'cover',
              }}
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              color: '#572E91',
              fontWeight: 'bold',
              mb: 1,
              textAlign: 'center',
            }}
          >
            Welcome to Shikshalokam
          </Typography>

          {formSchema && (
            <DynamicForm
              schema={formSchema}
              uiSchema={uiSchema}
              SubmitaFunction={handleSubmit}
              hideSubmit={true}
            />
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              //   onClick={handleRegister}
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
                width: '50%',
              }}
            >
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Registration Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Welcome, Your account has been successfully registered. Please use
            your username to login.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
