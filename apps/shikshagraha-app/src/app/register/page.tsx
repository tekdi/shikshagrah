'use client';
import { useEffect, useState } from 'react';
import { generateRJSFSchema } from '../../utils/generateSchemaFromAPI';
import DynamicForm from '../../Components/DynamicForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { Box, Button, Grid, Typography } from '@mui/material';
import {
  fetchRoleData,
  getSubroles,
  schemaRead,
} from '../../services/LoginService';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
export default function Register() {
  const [formSchema, setFormSchema] = useState<any>();
  const [uiSchema, setUiSchema] = useState<any>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [formData, setFormData] = useState();
  const [fieldNameToFieldIdMapping, setFieldNameToFieldIdMapping] = useState(
    {}
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [domain, setDomain] = useState<string>('');
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [subRoles, setSubRoles] = useState<any[]>([]);
  const previousRole = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // const currentDomain = window.location.hostname;
      const currentDomain = 'shikshagraha-qa.tekdinext.com';
      localStorage.setItem('origin', currentDomain);
      setDomain(currentDomain);
      console.log('Current domain:', currentDomain); // Debug
    }
  }, []);
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoading(true);

        // Fetch roles first
        const rolesResponse = await fetchRoleData();
        const rolesData = rolesResponse?.result || [];
        setRolesList(rolesData);

        const response = await schemaRead();
        // SAFETY CHECK: Ensure fields exist in response
        const fields = response?.result?.data?.fields?.result || [];
        if (fields.length === 0) {
          throw new Error('No form fields received from API');
        }

        // Fetch subroles if needed
        let subrolesData = [];
        const selectedRoleObj = rolesData.find((role: any) => role.externalId);
        if (selectedRoleObj) {
          const subrolesResponse = await getSubroles(selectedRoleObj._id);
          subrolesData = subrolesResponse.result || [];
          setSubRoles(subrolesData);
        }

        // Generate RJSF schema with proper fields
        const { schema, uiSchema, fieldNameToFieldIdMapping } =
          generateRJSFSchema(
            fields, // Now guaranteed to be an array
            selectedRoleObj,
            rolesData,
            subrolesData
          );

        setFormSchema(schema);
        setUiSchema(uiSchema);
        setFieldNameToFieldIdMapping(fieldNameToFieldIdMapping);
      } catch (error) {
        console.error('Error fetching schema:', error);
        // setError('Failed to load form. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
    setIsAuthenticated(!!localStorage.getItem('accToken'));
  }, []);
  const handleSubmit = ({ formData }: any) => {
    setFormData(formData);
  };
  // const handleRoleChange = async (selectedRole: string) => {
  //   try {
  //     setLoading(true);

  //     // Fetch subroles for the selected role
  //     let subrolesData = [];
  //     const selectedRoleObj = rolesList.find(
  //       (role) => role.externalId === selectedRole
  //     );

  //     if (selectedRoleObj) {
  //       const subrolesResponse = await getSubroles(selectedRoleObj._id);
  //       subrolesData = subrolesResponse.result || [];
  //       console.log('subrolesData', selectedRoleObj._id);
  //       setSubRoles(subrolesData);
  //     }

  //     // Regenerate schema with new role and subroles
  //     const response = await schemaRead();
  //     const fields = response?.result?.data?.fields?.result || [];

  //     const { schema, uiSchema, fieldNameToFieldIdMapping } =
  //       generateRJSFSchema(fields, selectedRole, rolesList, subrolesData);

  //     setFormSchema(schema);
  //     setUiSchema(uiSchema);
  //     setFieldNameToFieldIdMapping(fieldNameToFieldIdMapping);

  //     // Reset Sub-Role when role changes
  //     setFormData((prev) => ({
  //       ...prev,
  //       Role: selectedRole,
  //       'Sub-Role': '',
  //     }));
  //   } catch (error) {
  //     console.error('Error handling role change:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleBack = () => {
    router.push('/');
  };
  useEffect(() => {
    if (formSchema && uiSchema) {
      console.log('Final Role field schema:', {
        schema: formSchema.properties?.Role,
        uiSchema: uiSchema?.Role,
        rolesList,
      });
    }
  }, [formSchema, uiSchema]);
  const StaticHeader = () => (
    <Box
      sx={{
        p: 2,
        borderBottom: '2px solid #FFD580',
        boxShadow: '0px 2px 4px rgba(255, 153, 17, 0.2)',
        backgroundColor: '#FFF7E6',
        borderRadius: '0 0 25px 25px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
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
          xs={8}
          textAlign="center"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: '#572E91', fontWeight: 'bold' }}
          >
            Shikshagraha
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
  //addeed
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5',
          // Allow scrolling if content is large
          paddingBottom: '60px',
          // margin:'-1rem'
        }}
      >
        <StaticHeader />
        <Box sx={{ mx: 'auto', width: '100%', maxWidth: 400, mt: 4, px: 2 }}>
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
              Welcome to Shikshagraha
            </Typography>

            {formSchema && (
              <DynamicForm
                schema={formSchema}
                uiSchema={uiSchema}
                SubmitaFunction={handleSubmit}
                hideSubmit={false}
                onChange={({ formData }) => {
                  if (formData.Role) {
                    // Clear subroles when role changes
                    setFormData((prev) => ({ ...prev, 'Sub-Role': [] }));
                  }
                }}
                fieldIdMapping={fieldNameToFieldIdMapping}
              />
            )}
          </Box>
        </Box>
      </Box>
    );
  } else {
    const redirectUrl = '/home';
    router.push(redirectUrl);
  }
}
