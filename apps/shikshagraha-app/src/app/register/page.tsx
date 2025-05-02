'use client';
import { useEffect, useState } from 'react';
import { generateRJSFSchema } from '../../utils/generateSchemaFromAPI';
import DynamicForm from '../../Components/DynamicForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Box, Button, Grid, Typography } from '@mui/material';
import { schemaRead } from '../../services/LoginService';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formSchema, setFormSchema] = useState<any>();
  const [uiSchema, setUiSchema] = useState<any>();
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [formData, setFormData] = useState({ roles: '' });
  const [udiseData, setUdiaseData] = useState<any>(null);
  const [fieldNameToFieldIdMapping, setFieldNameToFieldIdMapping] = useState(
    {}
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await schemaRead(); // replace with your API endpoint
        // const data = await response.json();
        const { schema, uiSchema, fieldNameToFieldIdMapping } =
          generateRJSFSchema(response?.result?.fields, formData.roles); // your conversion logic
        setFormSchema(schema);
        setUiSchema(uiSchema);
        setFieldNameToFieldIdMapping(fieldNameToFieldIdMapping);
      } catch (error) {
        console.error('Error fetching schema:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
    setIsAuthenticated(!!localStorage.getItem('accToken'));
  }, [formData.roles]);
  const handleSubmit = ({ formData }: any) => {
    console.log('Form Data:', formData);
    setFormData(formData);
  };

  const handleUdiaseData = (data: any) => {
    setUdiaseData(data); // Store the UDISE data in state
  };

  const handleBack = () => {
    router.push(`${process.env.NEXT_PUBLIC_LOGINPAGE}`);
  };

  if(!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
          // Allow scrolling if content is large
          paddingBottom: '60px',
          margin:'-1rem'
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
            ></Grid>
          </Grid>
        </Box>
        <Box sx={{ mx: 'auto', p: 2, width: '100%', maxWidth: 400 }}>
          <Box>
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
                hideSubmit={false}
                onChange={(data: any) => setFormData(data.formData)}
                fieldIdMapping={fieldNameToFieldIdMapping}
              />
            )}
          </Box>
        </Box>
      </Box>
    );
  }
  else {
    const redirectUrl = '/home';
    router.push(redirectUrl);
  }
}
