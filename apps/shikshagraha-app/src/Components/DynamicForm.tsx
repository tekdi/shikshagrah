// @ts-nocheck
import React, { useState, useEffect, useRef, use } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { Box, Button } from '@mui/material';
import {
  TextField,
  Container,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import _ from 'lodash'; // Lodash for deep comparison
import CustomMultiSelectWidget from './RJSFWidget/CustomMultiSelectWidget';
import CustomCheckboxWidget from './RJSFWidget/CustomCheckboxWidget';
import CustomDateWidget from './RJSFWidget/CustomDateWidget';
import SearchTextFieldWidget from './RJSFWidget/SearchTextFieldWidget';
import CustomSingleSelectWidget from './RJSFWidget/CustomSingleSelectWidget';
import CustomRadioWidget from './RJSFWidget/CustomRadioWidget';
import CustomTextFieldWidget from './RJSFWidget/CustomTextFieldWidget';
import {
  calculateAgeFromDate,
  toPascalCase,
  transformLabel,
} from '../utils/Helper';
import UdiaseWithButton from './RJSFWidget/UdiaseWithButton';
import CustomEmailWidget from './RJSFWidget/CustomEmailWidget';
import {
  authenticateLoginUser,
  authenticateUser,
  fetchTenantData,
  schemaRead,
  signin,
  registerUserService,
  sendOtp,
  verifyOtpService,
} from '../services/LoginService';
import { useRouter } from 'next/navigation';
import OTPDialog from './OTPDialog';

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const { uiSchema } = props;
  const { norender } = getSubmitButtonOptions(uiSchema);
  if (norender) {
    return null;
  }
  return <button type="submit" style={{ display: 'none' }}></button>;
};

const DynamicForm = ({
  schema,
  uiSchema,
  SubmitaFunction,
  isCallSubmitInHandle,
  prefilledFormData,
  FormSubmitFunction,
  extraFields,
  hideSubmit,
  onChange,
  fieldIdMapping,
}: any) => {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const [formSchema, setFormSchema] = useState(schema);
  const [formUiSchemaOriginal, setFormUiSchemaOriginal] = useState(uiSchema);
  const [formUiSchema, setFormUiSchema] = useState(uiSchema);
  const [formData, setFormData] = useState({});
  const [dependentSchema, setDependentSchema] = useState([]);
  const [isInitialCompleted, setIsInitialCompleted] = useState(false);
  const [hideAndSkipFields, setHideAndSkipFields] = useState({});
  const [isRenderCompleted, setIsRenderCompleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [isTouched, setIsTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmailMobileError, setShowEmailMobileError] = useState('');
  const [requestData, setRequestData] = useState<any>({});
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [isOpenOTP, setIsOpenOTP] = useState(false);
  const [registerData, setRegisterData] = useState<any>({});
  const [hashCode, setHashCode] = useState('');
  //custom validation on formData for learner fields hide on dob
  useEffect(() => {
    if (formData?.dob) {
      let age = calculateAgeFromDate(formData?.dob);
      let oldFormSchema = formSchema;
      let oldFormUiSchema = formUiSchema;
      let requiredArray = oldFormSchema?.required;
      let requiredKeys = ['parent_phone', 'guardian_relation', 'guardian_name'];

      //if learner form then only apply
      if (oldFormSchema?.properties?.guardian_relation) {
        if (age < 18) {
          // Merge only missing items from required2 into required1
          requiredKeys.forEach((item) => {
            if (!requiredArray.includes(item)) {
              requiredArray.push(item);
            }
          });
          //set ui schema show
          const updatedUiSchema = { ...oldFormUiSchema };
          // Clone each key's config and set widget to 'hidden'
          requiredKeys.forEach((key) => {
            if (updatedUiSchema.hasOwnProperty(key)) {
              updatedUiSchema[key] = {
                ...updatedUiSchema[key],
                'ui:widget': 'CustomTextFieldWidget',
              };
            }
          });
          oldFormUiSchema = updatedUiSchema;
        } else {
          // remove from required
          requiredArray = requiredArray.filter(
            (key) => !requiredKeys.includes(key)
          );
          //set ui schema hide
          const updatedUiSchema = { ...oldFormUiSchema };
          // Clone each key's config and set widget to 'hidden'
          requiredKeys.forEach((key) => {
            if (updatedUiSchema.hasOwnProperty(key)) {
              updatedUiSchema[key] = {
                ...updatedUiSchema[key],
                'ui:widget': 'hidden',
              };
            }
          });
          oldFormUiSchema = updatedUiSchema;
        }
        oldFormSchema.required = requiredArray;
        setFormSchema(oldFormSchema);
        setFormUiSchema(oldFormUiSchema);
      }
    }
    if (formData?.roles === 'HT & Officials') {
      const updatedFormSchema = {
        ...formSchema,
        required: formSchema.required?.filter((key) => key !== 'roles'),
      };

      const updatedFormUiSchema = {
        ...formUiSchema,
        subRoles: {
          ...formUiSchema.subRoles,
          'ui:widget': 'CustomMultiSelectWidget',
        },
      };

      setFormSchema(updatedFormSchema);
      setFormUiSchema(updatedFormUiSchema);
    } else {
      const updatedFormSchema = {
        ...formSchema,
        required: formSchema.required?.filter((key) => key !== 'roles'),
      };

      const updatedFormUiSchema = {
        ...formUiSchema,
        subRoles: {
          ...formUiSchema.subRoles,
          'ui:widget': 'hidden',
        },
      };

      setFormSchema(updatedFormSchema);
      setFormUiSchema(updatedFormUiSchema);
    }
    // if (formData?.email && formUiSchema?.mobile) {
    //   setFormUiSchema((prev) => ({
    //     ...prev,
    //     mobile: {
    //       ...prev.mobile,
    //       'ui:widget': 'hidden',
    //     },
    //   }));
    // } else if (formData?.mobile && formUiSchema?.email) {
    //   setFormUiSchema((prev) => ({
    //     ...prev,
    //     email: {
    //       ...prev.email,
    //       'ui:widget': 'hidden',
    //     },
    //   }));
    // }
  }, [formData]);
  const handleFieldError = (fieldName: string, hasError: boolean) => {
    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: hasError,
    }));
  };

  const hasFormErrors = Object.values(fieldErrors).some(Boolean);
  const widgets = {
    CustomMultiSelectWidget,
    CustomCheckboxWidget,
    CustomDateWidget,
    SearchTextFieldWidget,
    CustomSingleSelectWidget,
    CustomRadioWidget,
    CustomTextFieldWidget,
    UdiaseWithButton: (props) => (
      <UdiaseWithButton {...props} onFetchData={handleFetchData} />
    ),
    CustomEmailWidget,
  };

  useEffect(() => {
    if (isInitialCompleted === true) {
      // setFormData;
      renderPrefilledForm();
    }
  }, [isInitialCompleted]);

  useEffect(() => {
    if (isCallSubmitInHandle) {
      SubmitaFunction(formData);
    }
  }, [formData]);

  useEffect(() => {
    if (isRenderCompleted === true) {
      // handleChange({ formData: prefilledFormData });
    }
  }, [isRenderCompleted]);

  useEffect(() => {
    function extractSkipAndHide(schema: any): Record<string, any> {
      const skipAndHideMap: Record<string, any> = {};

      Object.entries(schema.properties).forEach(
        ([key, value]: [string, any]) => {
          if (value.extra?.skipAndHide) {
            skipAndHideMap[key] = value.extra.skipAndHide;
          }
        }
      );

      return skipAndHideMap;
    }
    const extractedSkipAndHide = extractSkipAndHide(schema);
    setHideAndSkipFields(extractedSkipAndHide);
  }, [schema]);

  const prevFormData = useRef({});

  useEffect(() => {
    const fetchApiData = async (schema) => {
      const initialApis = extractApiProperties(schema, 'initial');
      const dependentApis = extractApiProperties(schema, 'dependent');
      setDependentSchema(dependentApis);
      // // console.log('!!!', initialApis);
      try {
        const apiRequests = initialApis.map((field) => {
          const { api } = field;
          // If header exists, replace values with localStorage values
          let customHeader = api?.header
            ? {
                tenantId:
                  api.header.tenantId === '**'
                    ? localStorage.getItem('tenantId') || ''
                    : api.header.tenantId,
                Authorization:
                  api.header.Authorization === '**'
                    ? `Bearer ${localStorage.getItem('token') || ''}`
                    : api.header.Authorization,
                academicyearid:
                  api.header.academicyearid === '**'
                    ? localStorage.getItem('academicYearId') || ''
                    : api.header.academicyearid,
              }
            : {};
          const config = {
            method: api.method,
            url: api.url,
            headers: { 'Content-Type': 'application/json', ...customHeader },
            ...(api.method === 'POST' && { data: api.payload }),
          };
          return axios(config)
            .then((response) => ({
              fieldKey: field.key,
              data: getNestedValue(response.data, api.options.optionObj),
            }))
            .catch((error) => ({
              error: error,
              fieldKey: field.key,
            }));
        });

        const responses = await Promise.all(apiRequests);

        // Update schema dynamically
        if (!responses[0]?.error) {
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            responses.forEach(({ fieldKey, data }) => {
              let label = prevSchema.properties[fieldKey].api.options.label;
              let value = prevSchema.properties[fieldKey].api.options.value;
              if (updatedProperties[fieldKey]?.isMultiSelect === true) {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  items: {
                    type: 'string',
                    enum: data
                      ? data?.map((item) => item?.[value].toString())
                      : ['Select'],
                    enumNames: data
                      ? data?.map((item) =>
                          transformLabel(item?.[label].toString())
                        )
                      : ['Select'],
                  },
                };
              } else {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  enum: data
                    ? data?.map((item) => item?.[value].toString())
                    : ['Select'],
                  enumNames: data
                    ? data?.map((item) =>
                        transformLabel(item?.[label].toString())
                      )
                    : ['Select'],
                };
              }
            });
            return { ...prevSchema, properties: updatedProperties };
          });
        } else {
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            let fieldKey = responses[0]?.fieldKey;
            if (updatedProperties[fieldKey]?.isMultiSelect === true) {
              updatedProperties[fieldKey] = {
                ...updatedProperties[fieldKey],
                items: {
                  type: 'string',
                  enum: ['Select'],
                  enumNames: ['Select'],
                },
              };
            } else {
              updatedProperties[fieldKey] = {
                ...updatedProperties[fieldKey],
                enum: ['Select'],
                enumNames: ['Select'],
              };
            }
            return { ...prevSchema, properties: updatedProperties };
          });
        }

        setIsInitialCompleted(true);
      } catch (error) {
        // console.error("Error fetching API data:", error);
      }
    };

    const getNestedValue = (obj, path) => {
      if (path === '') {
        return obj;
      } else {
        return path.split('.').reduce((acc, key) => acc && acc[key], obj);
      }
    };

    // Call the function
    fetchApiData(schema);

    //replace title with language constant
    const updateSchemaTitles = (schema, t) => {
      if (!schema || typeof schema !== 'object') return schema;

      const updatedSchema = { ...schema };

      if (updatedSchema.title) {
        updatedSchema.title = t(updatedSchema.title);
      }

      if (updatedSchema.properties) {
        updatedSchema.properties = Object.keys(updatedSchema.properties).reduce(
          (acc, key) => {
            acc[key] = updateSchemaTitles(updatedSchema.properties[key], t);
            return acc;
          },
          {}
        );
      }

      return updatedSchema;
    };
    // Dynamically update schema titles
    // const translatedSchema = updateSchemaTitles(formSchema, t);
    // setFormSchema(translatedSchema);
  }, []);

  // console.log('schema', schema)
  const extractApiProperties = (schema, callType) => {
    return Object.entries(schema.properties)
      .filter(([_, value]) => value.api && value.api.callType === callType)
      .map(([key, value]) => ({ key, ...value }));
  };

  const renderPrefilledForm = () => {
    const temp_prefilled_form = { ...prefilledFormData };
    const dependentApis = extractApiProperties(schema, 'dependent');
    const initialApis = extractApiProperties(schema, 'initial');

    if (dependentApis.length > 0 && initialApis.length > 0) {
      let initialKeys = initialApis.map((item) => item.key);
      let dependentKeys = dependentApis.map((item) => item.key);
      dependentKeys = [...initialKeys, ...dependentKeys];

      const removeDependentKeys = (formData, keysToRemove) => {
        const updatedData = { ...formData };
        keysToRemove.forEach((key) => delete updatedData[key]);
        return updatedData;
      };
      let updatedFormData = removeDependentKeys(
        temp_prefilled_form,
        dependentKeys
      );
      setFormData(updatedFormData);

      //prefill other dependent keys
      const filterDependentKeys = (
        formData: Record<string, any>,
        keysToKeep: string[]
      ) => {
        return Object.fromEntries(
          Object.entries(formData).filter(([key]) => keysToKeep.includes(key))
        );
      };
      let filteredFormData = filterDependentKeys(
        temp_prefilled_form,
        dependentKeys
      );
      const filteredFormDataKey = Object.keys(filteredFormData);
      let filterDependentApis = [];
      for (let i = 0; i < filteredFormDataKey.length; i++) {
        filterDependentApis.push({
          key: filteredFormDataKey[i],
          data: schema.properties[filteredFormDataKey[i]],
        });
      }
      //dependent calls
      const workingSchema = filterDependentApis;

      const getNestedValue = (obj, path) => {
        if (path === '') {
          return obj;
        } else {
          return path.split('.').reduce((acc, key) => acc && acc[key], obj);
        }
      };

      const fetchDependentApis = async () => {
        // Filter only the dependent APIs based on the changed field
        const dependentApis = workingSchema;
        try {
          const apiRequests = dependentApis.map((realField) => {
            const field = realField?.data;
            const { api } = realField?.data;
            const key = realField?.key;

            const changedField = field?.api?.dependent;
            const changedFieldValue = temp_prefilled_form[changedField];
            let isMultiSelect = field?.isMultiSelect;
            let updatedPayload = replaceControllingField(
              api.payload,
              changedFieldValue,
              isMultiSelect
            );

            let customHeader = api?.header
              ? {
                  tenantId:
                    api.header.tenantId === '**'
                      ? localStorage.getItem('tenantId') || ''
                      : api.header.tenantId,
                  Authorization:
                    api.header.Authorization === '**'
                      ? `Bearer ${localStorage.getItem('token') || ''}`
                      : api.header.Authorization,
                  academicyearid:
                    api.header.academicyearid === '**'
                      ? localStorage.getItem('academicYearId') || ''
                      : api.header.academicyearid,
                }
              : {};
            const config = {
              method: api.method,
              url: api.url,
              headers: { 'Content-Type': 'application/json', ...customHeader },
              ...(api.method === 'POST' && { data: updatedPayload }),
            };
            if (key) {
              const changedField = key;

              const workingSchema1 = dependentSchema?.filter(
                (item) => item.api && item.api.dependent === changedField
              );
              if (workingSchema1.length > 0) {
                const changedFieldValue = temp_prefilled_form[changedField];

                const getNestedValue = (obj, path) => {
                  if (path === '') {
                    return obj;
                  } else {
                    return path
                      .split('.')
                      .reduce((acc, key) => acc && acc[key], obj);
                  }
                };

                const fetchDependentApis = async () => {
                  // Filter only the dependent APIs based on the changed field
                  const dependentApis = workingSchema1;
                  try {
                    const apiRequests = dependentApis.map((field) => {
                      const { api, key } = field;

                      let isMultiSelect = field?.isMultiSelect;
                      let updatedPayload = replaceControllingField(
                        api.payload,
                        changedFieldValue,
                        isMultiSelect
                      );

                      // If header exists, replace values with localStorage values
                      let customHeader = api?.header
                        ? {
                            tenantId:
                              api.header.tenantId === '**'
                                ? localStorage.getItem('tenantId') || ''
                                : api.header.tenantId,
                            Authorization:
                              api.header.Authorization === '**'
                                ? `Bearer ${
                                    localStorage.getItem('token') || ''
                                  }`
                                : api.header.Authorization,
                            academicyearid:
                              api.header.academicyearid === '**'
                                ? localStorage.getItem('academicYearId') || ''
                                : api.header.academicyearid,
                          }
                        : {};
                      const config = {
                        method: api.method,
                        url: api.url,
                        headers: {
                          'Content-Type': 'application/json',
                          ...customHeader,
                        },
                        ...(api.method === 'POST' && { data: updatedPayload }),
                      };
                      return axios(config)
                        .then((response) => ({
                          fieldKey: field.key,
                          data: getNestedValue(
                            response.data,
                            api.options.optionObj
                          ),
                        }))
                        .catch((error) => ({
                          error: error,
                          fieldKey: field.key,
                        }));
                    });

                    const responses = await Promise.all(apiRequests);
                    if (!responses[0]?.error) {
                      setFormSchema((prevSchema) => {
                        const updatedProperties = { ...prevSchema.properties };
                        responses.forEach(({ fieldKey, data }) => {
                          let label =
                            prevSchema.properties[fieldKey].api.options.label;
                          let value =
                            prevSchema.properties[fieldKey].api.options.value;
                          if (
                            updatedProperties[fieldKey]?.isMultiSelect === true
                          ) {
                            updatedProperties[fieldKey] = {
                              ...updatedProperties[fieldKey],
                              items: {
                                type: 'string',
                                enum: data?.map((item) =>
                                  item?.[value].toString()
                                ),
                                enumNames: data?.map((item) =>
                                  transformLabel(item?.[label].toString())
                                ),
                              },
                            };
                          } else {
                            updatedProperties[fieldKey] = {
                              ...updatedProperties[fieldKey],
                              enum: data?.map((item) =>
                                item?.[value].toString()
                              ),
                              enumNames: data?.map((item) =>
                                transformLabel(item?.[label].toString())
                              ),
                            };
                          }
                        });

                        return { ...prevSchema, properties: updatedProperties };
                      });
                    } else {
                      setFormSchema((prevSchema) => {
                        const updatedProperties = { ...prevSchema.properties };
                        let fieldKey = responses[0]?.fieldKey;
                        if (
                          updatedProperties[fieldKey]?.isMultiSelect === true
                        ) {
                          updatedProperties[fieldKey] = {
                            ...updatedProperties[fieldKey],
                            items: {
                              type: 'string',
                              enum: ['Select'],
                              enumNames: ['Select'],
                            },
                          };
                        } else {
                          updatedProperties[fieldKey] = {
                            ...updatedProperties[fieldKey],
                            enum: ['Select'],
                            enumNames: ['Select'],
                          };
                        }
                        return { ...prevSchema, properties: updatedProperties };
                      });
                    }
                  } catch (error) {
                    console.error('Error fetching dependent APIs:', error);
                  }
                };

                // Call the function
                fetchDependentApis();
              }
            }

            return axios(config).then((response) => ({
              fieldKey: key,
              data: getNestedValue(response.data, api.options.optionObj),
            }));
          });

          const responses = await Promise.all(apiRequests);
          setFormSchema((prevSchema) => {
            const updatedProperties = { ...prevSchema.properties };
            responses.forEach(({ fieldKey, data }) => {
              let label = prevSchema.properties[fieldKey].api.options.label;
              let value = prevSchema.properties[fieldKey].api.options.value;
              if (updatedProperties[fieldKey]?.isMultiSelect === true) {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  items: {
                    type: 'string',
                    enum: data?.map((item) => item?.[value].toString()),
                    enumNames: data?.map((item) =>
                      transformLabel(item?.[label].toString())
                    ),
                  },
                };
              } else {
                updatedProperties[fieldKey] = {
                  ...updatedProperties[fieldKey],
                  enum: data?.map((item) => item?.[value].toString()),
                  enumNames: data?.map((item) =>
                    transformLabel(item?.[label].toString())
                  ),
                };
              }
            });

            return { ...prevSchema, properties: updatedProperties };
          });
        } catch (error) {
          console.error('Error fetching dependent APIs:', error);
        }
      };

      // Call the function
      fetchDependentApis();

      //setFormData
      setFormData(temp_prefilled_form);

      function getSkipKeys(skipHideObject, formData) {
        let skipKeys = [];

        Object.keys(skipHideObject).forEach((key) => {
          if (formData[key] && skipHideObject[key][formData[key]]) {
            skipKeys = skipKeys.concat(skipHideObject[key][formData[key]]);
          }
        });

        return skipKeys;
      }

      const skipKeys = getSkipKeys(hideAndSkipFields, temp_prefilled_form);
      let updatedUISchema = formUiSchemaOriginal;
      function hideFieldsInUISchema(uiSchema, fieldsToHide) {
        const updatedUISchema = { ...uiSchema };

        fieldsToHide.forEach((field) => {
          if (updatedUISchema[field]) {
            updatedUISchema[field] = {
              ...updatedUISchema[field],
              originalWidget: updatedUISchema[field]['ui:widget'], // Store original widget type
              'ui:widget': 'hidden',
            };
          }
        });

        return updatedUISchema;
      }
      const hiddenUISchema = hideFieldsInUISchema(updatedUISchema, skipKeys);
      setFormUiSchema(hiddenUISchema);
    }
    //Code patch: bug solved for prefilled dependent field options render
    setIsRenderCompleted(true);
  };

  const getDependentKeys = (schema, startKey) => {
    const properties = schema.properties;
    const dependentKeys = [];

    const findDependencies = (key) => {
      Object.keys(properties).forEach((propKey) => {
        const field = properties[propKey];
        if (field.api && field.api.dependent === key) {
          dependentKeys.push(propKey);
          findDependencies(propKey); // Recursively check deeper dependencies
        }
      });
    };

    findDependencies(startKey);
    return dependentKeys;
  };

  const hasObjectChanged = (oldObj, newObj) => {
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (let key of keys) {
      const oldValue = oldObj[key] || [];
      const newValue = newObj[key] || [];

      // Handle array comparison
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (oldValue.length !== newValue.length) return true;
        const isDifferent = oldValue.some(
          (val, index) => val !== newValue[index]
        );
        if (isDifferent) return true;
      }
      // Handle normal value comparison
      else if (oldValue !== newValue) {
        return true;
      }
    }

    return false;
  };

  const replaceControllingField = (
    payload,
    changedFieldValue,
    isMultiSelect
  ) => {
    // Deep clone to avoid modifying the original object
    const updatedPayload = JSON.parse(JSON.stringify(payload));
    // Determine new value based on type
    const newValue = isMultiSelect
      ? Array.isArray(changedFieldValue)
        ? [...changedFieldValue]
        : [changedFieldValue]
      : changedFieldValue;

    // Recursive function to replace ** in nested objects/arrays
    const replaceNested = (obj) => {
      if (Array.isArray(obj)) {
        // If array, iterate through each element
        obj.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            replaceNested(item); // Recursive call for nested objects/arrays
          } else if (item === '**') {
            obj[index] = newValue;
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        // If object, iterate through keys
        Object.keys(obj).forEach((key) => {
          if (obj[key] === '**') {
            obj[key] = newValue;
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            replaceNested(obj[key]); // Recursive call for nested objects/arrays
          }
        });
      }
    };

    // Start recursion from the root
    replaceNested(updatedPayload);

    return updatedPayload;
  };
  const getChangedField = (
    formData: Record<string, any>,
    prevFormData: Record<string, any>
  ) => {
    return Object.keys(formData).find((key) => {
      const newValue = formData[key];
      const oldValue = prevFormData[key];

      if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        // Check if arrays have different elements (added/removed values)
        return (
          newValue.length !== oldValue.length ||
          !newValue.every((val) => oldValue.includes(val))
        );
      } else {
        // Check for primitive value changes
        return newValue !== oldValue;
      }
    });
  };

  const handleChange = async ({
    formData,
    errors,
  }: {
    formData: any;
    errors: any;
  }) => {
    setFormData(formData);

    const firstName = (formData?.firstName || '').trim();
    const lastName = (formData?.lastName || '').trim();

    // And optionally prevent cases like "___" when names are empty strings:
    if ((firstName || lastName) && !(firstName === '' && lastName === '')) {
      formData.Username = `${firstName}_${lastName}`.toLowerCase();
    } else {
      formData.Username = undefined;
    }

    if (formData.email) {
      setShowEmailMobileError(
        "Contact number is optional since you've provided an email"
      );
    } else if (formData.mobile) {
      setShowEmailMobileError(
        "Email is optional since you've provided an Contact number"
      );
    }

   
    setFormData(formData);
    setFormUiSchema(formUiSchema);

    // console.log(
    //   'hasObjectChanged hasObjectChanged(prevFormData.current, formData)',
    //   hasObjectChanged(prevFormData.current, formData)
    // );
    // console.log('hasObjectChanged changedField', changedField);

    // if (hasObjectChanged(prevFormData.current, formData)) {
    //   console.log('hasObjectChanged in 1 formData', formData);
    //   if (changedField) {
    //     //error set
    //     console.log('errors', errors);
    //     setSubmitted(false);
    //     //find out all dependent keys
    //     const dependentKeyArray = getDependentKeys(schema, changedField);
    //     console.log('hasObjectChanged in 2 formData', formData);
    //     // console.log('hasObjectChanged dependent keys:', dependentKeyArray);
    //     dependentKeyArray.forEach((key) => {
    //       delete formData[key]; // Remove the key from formData
    //     });
    //     // console.log('hasObjectChanged formData', formData);

    //     setFormSchema((prevSchema) => {
    //       const updatedProperties = { ...prevSchema.properties };

    //       dependentKeyArray.forEach((key) => {
    //         if (updatedProperties[key]) {
    //           if (updatedProperties[key]?.isMultiSelect === true) {
    //             updatedProperties[key] = {
    //               ...updatedProperties[key],
    //               items: {
    //                 type: 'string',
    //                 enum: ['Select'], // Clear the enum
    //                 enumNames: ['Select'], // Clear the enumNames
    //               },
    //             };
    //           } else {setUiSchema
    //             updatedProperties[key] = {
    //               ...updatedProperties[key],
    //               enum: ['Select'], // Clear the enum
    //               enumNames: ['Select'], // Clear the enumNames
    //             };
    //           }
    //         }
    //       });

    //       return { ...prevSchema, properties: updatedProperties };
    //     });

    //     // // console.log(`Field changed: ${chansetUiSchemagedField}, New Value: ${formData[changedField]}`);
    //     // // console.log('dependentSchema', dependentSchema);
    //     const workingSchema = dependentSchema?.filter(
    //       (item) => item.api && item.api.dependent === changedField
    //     );
    //     // // console.log('workingSchema', workingSchema);
    //     if (workingSchema.length > 0) {
    //       const changedFieldValue = formData[changedField];

    //       const getNestedValue = (obj, path) => {
    //         if (path === '') {
    //           return obj;
    //         } else {
    //           return path.split('.').reduce((acc, key) => acc && acc[key], obj);
    //         }
    //       };

    //       const fetchDependentApis = async () => {
    //         // Filter only the dependent APIs based on the changed field
    //         const dependentApis = workingSchema;
    //         try {
    //           const apiRequests = dependentApis.map((field) => {
    //             const { api, key } = field;
    //             let isMultiSelect = field?.isMultiSelect;
    //             let updatedPayload = replaceControllingField(
    //               api.payload,
    //               changedFieldValue,
    //               isMultiSelect
    //             );
    //             // console.log('updatedPayload', updatedPayload);

    //             // let changedFieldValuePayload = changedFieldValue;
    //             // if (field?.isMultiSelect == true) {
    //             //   // changedFieldValuePayload
    //             // }
    //             // // console.log(
    //             //   'field multiselect changedFieldValuePayload',
    //             //   changedFieldValuePayload
    //             // );
    //             // // console.log('field multiselect api.payload', api.payload);

    //             // // Replace "**" in the payload with changedFieldValue
    //             // const updatedPayload = JSON.parse(
    //             //   JSON.stringify(api.payload).replace(
    //             //     /\*\*/g,
    //             //     changedFieldValuePayload
    //             //   )
    //             // );

    //             // If header exists, replace values with localStorage values
    //             let customHeader = api?.header
    //               ? {
    //                   tenantId:
    //                     api.header.tenantId === '**'
    //                       ? localStorage.getItem('tenantId') || ''
    //                       : api.header.tenantId,
    //                   Authorization:
    //                     api.header.Authorization === '**'
    //                       ? `Bearer ${localStorage.getItem('token') || ''}`
    //                       : api.header.Authorization,
    //                   academicyearid:
    //                     api.header.academicyearid === '**'
    //                       ? localStorage.getItem('academicYearId') || ''
    //                       : api.header.academicyearid,
    //                 }
    //               : {};
    //             const config = {
    //               method: api.method,
    //               url: api.url,
    //               headers: {
    //                 'Content-Type': 'application/json',
    //                 ...customHeader,
    //               },
    //               ...(api.method === 'POST' && { data: updatedPayload }),
    //             };
    //             return axios(config)
    //               .then((response) => ({
    //                 fieldKey: field.key,
    //                 data: getNestedValue(response.data, api.options.optionObj),
    //               }))
    //               .catch((error) => ({ error: error, fieldKey: field.key }));
    //           });

    //           const responses = await Promise.all(apiRequests);
    //           // console.log('State API Responses:', responses);
    //           if (!responses[0]?.error) {
    //             setFormSchema((prevSchema) => {
    //               const updatedProperties = { ...prevSchema.properties };
    //               responses.forEach(({ fieldKey, data }) => {
    //                 // // console.log('Data:', data);
    //                 // // console.log('fieldKey:', fieldKey);
    //                 let label =
    //                   prevSchema.properties[fieldKey].api.options.label;
    //                 let value =
    //                   prevSchema.properties[fieldKey].api.options.value;
    //                 if (updatedProperties[fieldKey]?.isMultiSelect === true) {
    //                   updatedProperties[fieldKey] = {
    //                     ...updatedProperties[fieldKey],
    //                     items: {
    //                       type: 'string',
    //                       enum: data?.map((item) => item?.[value].toString()),
    //                       enumNames: data?.map((item) =>
    //                         transformLabel(item?.[label].toString())
    //                       ),
    //                     },
    //                   };
    //                 } else {
    //                   updatedProperties[fieldKey] = {
    //                     ...updatedProperties[fieldKey],
    //                     enum: data?.map((item) => item?.[value].toString()),
    //                     enumNames: data?.map((item) =>
    //                       transformLabel(item?.[label].toString())
    //                     ),
    //                   };
    //                 }
    //               });

    //               return { ...prevSchema, properties: updatedProperties };
    //             });
    //           } else {
    //             setFormSchema((prevSchema) => {
    //               const updatedProperties = { ...prevSchema.properties };
    //               let fieldKey = responses[0]?.fieldKey;
    //               if (updatedProperties[fieldKey]?.isMultiSelect === true) {
    //                 updatedProperties[fieldKey] = {
    //                   ...updatedProperties[fieldKey],
    //                   items: {
    //                     type: 'string',
    //                     enum: ['Select'],
    //                     enumNames: ['Select'],
    //                   },
    //                 };
    //               } else {
    //                 updatedProperties[fieldKey] = {
    //                   ...updatedProperties[fieldKey],
    //                   enum: ['Select'],
    //                   enumNames: ['Select'],
    //                 };
    //               }
    //               return { ...prevSchema, properties: updatedProperties };
    //             });
    //           }
    //         } catch (error) {
    //           console.error('Error fetching dependent APIs:', error);
    //         }
    //       };

    //       // Call the function
    //       fetchDependentApis();
    //     }
    //   }

    //   prevFormData.current = formData;
    //   // console.log('Form data changed:', formData);
    //   // live error
    //   setFormData(formData);

    //   function getSkipKeys(skipHideObject, formData) {
    //     let skipKeys = [];

    //     Object.keys(skipHideObject).forEach((key) => {
    //       if (formData[key] && skipHideObject[key][formData[key]]) {
    //         skipKeys = skipKeys.concat(skipHideObject[key][formData[key]]);
    //       }
    //     });

    //     return skipKeys;
    //   }

    //   const skipKeys = getSkipKeys(hideAndSkipFields, formData);
    //   // console.log('skipKeys', skipKeys);
    //   let updatedUISchema = formUiSchemaOriginal;
    //   function hideFieldsInUISchema(uiSchema, fieldsToHide) {
    //     const updatedUISchema = { ...uiSchema };

    //     fieldsToHide.forEach((field) => {
    //       if (updatedUISchema[field]) {
    //         updatedUISchema[field] = {
    //           ...updatedUISchema[field],
    //           originalWidget: updatedUISchema[field]['ui:widget'], // Store original widget type
    //           'ui:widget': 'hidden',
    //         };
    //       }
    //     });

    //     return updatedUISchema;
    //   }
    //   const hiddenUISchema = hideFieldsInUISchema(updatedUISchema, skipKeys);
    //   setFormUiSchema(hiddenUISchema);
    // }
  };
  const handleSubmit = ({ formData }: { formData: any }) => {
    //step-1 : Check and remove skipped Data
    function filterFormData(skipHideObject, formData) {
      const updatedFormData = { ...formData };

      Object.keys(skipHideObject).forEach((key) => {
        if (formData[key] && skipHideObject[key][formData[key]]) {
          skipHideObject[key][formData[key]].forEach((fieldToRemove) => {
            delete updatedFormData[fieldToRemove];
          });
        }
      });

      return updatedFormData;
    }
    const filteredData = filterFormData(hideAndSkipFields, formData);
    const cleanedData = Object.fromEntries(
      Object.entries(filteredData).filter(
        ([_, value]) => !Array.isArray(value) || value.length > 0
      )
    );
    //step-2 : Validate the form data
    function transformFormData(
      formData: Record<string, any>,
      schema: any,
      extraFields: Record<string, any> = {} // Optional root-level custom fields
    ) {
      const transformedData: Record<string, any> = {
        ...extraFields, // Add optional root-level custom fields dynamically
        customFields: [],
      };

      for (const key in formData) {
        if (schema.properties[key]) {
          const fieldSchema = schema.properties[key];

          if (fieldSchema.coreField === 0 && fieldSchema.fieldId) {
            // Use fieldId for custom fields
            transformedData.customFields.push({
              fieldId: fieldSchema.fieldId,
              value: formData[key] || '',
            });
          } else {
            // Use the field name for core fields
            transformedData[key] = formData[key] || '';
          }
        }
      }

      return transformedData;
    }

    // Optional extra root-level fields
    // Extra Field for cohort creation

    const transformedFormData = transformFormData(
      cleanedData,
      schema,
      extraFields
    );

    //add name in always lower case
    if (transformedFormData?.name) {
      transformedFormData.name = transformedFormData.name.toLowerCase();
    }

    if (!isCallSubmitInHandle) {
      FormSubmitFunction(cleanedData, transformedFormData);
    }

    //live validate error fix
    setSubmitted(true);
    // Get first error field and scroll into view
    setTimeout(() => {
      const errorField = document.querySelector('.field-error');
      if (errorField) {
        errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };
  // console.log(formSchema);

  // Regex to Error Mapping
  const patternErrorMessages = {
    '^(?=.*[a-zA-Z])[a-zA-Z ]+$':
      'Numbers and special characters are not allowed',
    '^[a-zA-Z][a-zA-Z ]*[a-zA-Z]$':
      'Numbers and special characters are not allowed',
    '^[a-zA-Z0-9.@]+$': 'Space and special characters are not allowed',
    '^[0-9]{10}$': 'Enter a valid Mobile Number',
    '^d{10}$': 'Characters and special characters are not allowed',
  };

  // Dynamic custom validation
  const customValidate = (formData, errors) => {
    Object.keys(formSchema.properties).forEach((key) => {
      const field = formSchema.properties[key];
      const value = formData[key];
      // Ensure errors[key] is defined
      if (!errors[key]) {
        errors[key] = {};
      }

      // ✅ Clear error if field is empty or invalid
      if (!value || value === '' || value === null || value === undefined) {
        if (errors[key]?.__errors) {
          errors[key].__errors = []; // ✅ Clear existing errors
        }
        delete errors[key]; // ✅ Completely remove errors if empty
      } else if (field.pattern) {
        // ✅ Validate pattern only if the field has a value
        const patternRegex = new RegExp(field.pattern);
        if (!patternRegex.test(value)) {
          const errorMessage =
            patternErrorMessages?.[field.pattern] ||
            `Invalid format for ${field.title || key}.`;

          // ✅ Add only if pattern does not match
          if (!errors[key].__errors) {
            errors[key].__errors = [];
          }
          errors[key].__errors = [errorMessage];
        } else {
          // ✅ Clear errors if pattern matches
          if (errors[key]?.__errors) {
            errors[key].__errors = [];
          }
          delete errors[key]; // ✅ Remove errors if valid
        }
      }
    });

    return errors;
  };

  const transformErrors = (errors) => {
    let updatedError = errors;

    if (!submitted) {
      return [];
    }

    return updatedError;
  };
  const handleFetchData = (response: any) => {
    // Example: Update specific fields from API response
    setFormData((prev) => ({
      ...prev,
      state: {
        _id: response?.state?._id || '',
        name: response?.state?.name || '',
      },
      district: {
        _id: response?.district?._id || '',
        name: response?.district?.name || '',
      },
      block: {
        _id: response?.block?._id || '',
        name: response?.block?.name || '',
      },
      cluster: {
        _id: response?.cluster?._id || '',
        name: response?.cluster?.name || '',
      },
      school: {
        _id: response?.school?._id || '',
        name: response?.school?.name || '',
      },
      udise: response?.udise || '',
    }));
  };
  const validateForm = () => {
    const isValid = !!(formData.email || formData.mobile);
    setShowEmailMobileError(!isValid);
    return isValid;
  };
  const handleSendOtp = async () => {
    const customFields = Object.entries(fieldIdMapping).flatMap(
      ([name, fieldId]) => {
        let fieldValue = formData[name] ?? '';

        // Skip subRoles if not present or empty
        if (name === 'subRoles') {
          if (
            !fieldValue ||
            (Array.isArray(fieldValue) && fieldValue.length === 0)
          ) {
            return []; // Skip this field
          }
          // Ensure it's an array
          fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
          return [{ fieldId, value: fieldValue }];
        }

        // Ensure roles is an array
        if (name === 'roles') {
          fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
          return [{ fieldId, value: fieldValue }];
        }

        // For other fields, stringify if object
        if (typeof fieldValue === 'object' && fieldValue !== null) {
          return [
            {
              fieldId,
              value: JSON.stringify({
                id: fieldValue._id ?? fieldValue.id ?? '',
                name: fieldValue.name ?? '',
              }),
            },
          ];
        }

        // For primitives
        return [{ fieldId, value: fieldValue }];
      }
    );

    const userName = formData.firstName;
    const payload = {
      name: formData.firstName,
      username: `${formData.firstName}_${formData.lastName}`,
      password: formData.password,
      gender: formData.gender ?? 'male',
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      email: formData.email,
      tenantCohortRoleMapping: [
        {
          tenantId: 'ebae40d1-b78a-4f73-8756-df5e4b060436',
          roleId: 'ac21322c-9c7c-4a39-8c56-4b5722f14c04',
        },
      ],
      customFields,
    };
    setRegisterData(payload);
    let otpPayload;
    if (formData.email) {
      otpPayload = {
        email: formData.email,
        reason: 'signup',
        firstName: formData.firstName,
        key: 'SendOtpOnMail',
        replacements: {
          '{eventName}': 'Shiksha Graha OTP',
          '{programName}': 'Shiksha Graha',
        },
      };
    } else if (formData.mobile) {
      otpPayload = {
        mobile: formData.mobile,
        reason: 'signup',
      };
    } else {
      setShowError(true);
      setErrorMessage('Either email or mobile must be provided');
      return;
    }

    const registrationResponse = await sendOtp(otpPayload);
    if (
      registrationResponse?.params?.successmessage === 'OTP sent successfully'
    ) {
      setRequestData({
        usercreate: {
          request: {
            userName: registrationResponse?.result?.userData?.username,
          },
        },
      });
      setHashCode(registrationResponse?.result?.data?.hash);
      setErrorMessage(registrationResponse.message);
      setIsOpenOTP(true);
    } else {
      setShowError(true);
      setErrorMessage(
        registrationResponse.data && registrationResponse.data.params.err
      );
    }
  };
  const handleRegister = async (otp: string) => {
    if (!formData.email && !formData.mobile) {
      setShowEmailMobileError(
        'Please provide either an email or a mobile number.'
      );
      return;
    }
    setIsOpenOTP(false);
    const customFields = Object.entries(fieldIdMapping).flatMap(
      ([name, fieldId]) => {
        let fieldValue = formData[name] ?? '';

        // Skip subRoles if not present or empty
        if (name === 'subRoles') {
          if (
            !fieldValue ||
            (Array.isArray(fieldValue) && fieldValue.length === 0)
          ) {
            return []; // Skip this field
          }
          // Ensure it's an array
          fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
          return [{ fieldId, value: fieldValue }];
        }

        // Ensure roles is an array
        if (name === 'roles') {
          fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];
          return [{ fieldId, value: fieldValue }];
        }

        // For other fields, stringify if object
        if (typeof fieldValue === 'object' && fieldValue !== null) {
          return [
            {
              fieldId,
              value: JSON.stringify({
                id: fieldValue._id ?? fieldValue.id ?? '',
                name: fieldValue.name ?? '',
              }),
            },
          ];
        }

        // For primitives
        return [{ fieldId, value: fieldValue }];
      }
    );

    const userName = formData.firstName;
    const payload = {
      name: formData.firstName,
      username: `${formData.firstName}_${formData.lastName}`,
      password: formData.password,
      gender: formData.gender ?? 'male',
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      email: formData.email,
      tenantCohortRoleMapping: [
        {
          tenantId: 'ebae40d1-b78a-4f73-8756-df5e4b060436',
          roleId: 'ac21322c-9c7c-4a39-8c56-4b5722f14c04',
        },
      ],
      customFields,
    };
    setRegisterData(payload);
    let verifyOTPpayload;
    if (formData.email) {
      verifyOTPpayload = {
        email: formData.email,
        reason: 'signup',
        otp: otp,
        hash: hashCode,
      };
    } else {
      verifyOTPpayload = {
        mobile: formData.mobile,
        reason: 'signup',
        otp: otp,
        hash: hashCode,
      };
    }

    const verifyOtpResponse = await verifyOtpService(verifyOTPpayload);
    if (
      verifyOtpResponse?.params?.successmessage === 'OTP validation Sucessfully'
    ) {
      const registrationResponse = await registerUserService(payload);
      if (
        registrationResponse?.params?.successmessage ===
        'User created successfully'
      ) {
        setRequestData({
          usercreate: {
            request: {
              userName: registrationResponse?.result?.userData?.username,
            },
          },
        });
        setErrorMessage(registrationResponse.message);
        setDialogOpen(true);
      } else {
        setShowError(true);
        setErrorMessage(
          registrationResponse.data && registrationResponse.data.params.err
        );
      }
    } else {
      console.log('verifyOtpResponse', verifyOtpResponse);
      setShowError(true);
      setErrorMessage(
        verifyOtpResponse.data && verifyOtpResponse.data.params.err
      );
    }
  };

  const handleDialogClose = async () => {
    setDialogOpen(false);
    try {
      const response = await signin({
        username: `${formData.firstName}_${formData.lastName}`,
        password: formData.password,
      });

      if (response?.result?.access_token) {
        localStorage.setItem('accToken', response?.result?.access_token);
        localStorage.setItem('refToken', response?.result?.refresh_token);
        const tenantResponse = await authenticateLoginUser({
          token: response?.result?.access_token,
        });
        localStorage.setItem('firstname', tenantResponse?.result?.firstName);
        console.log('reasssss', tenantResponse);
        console.log('User status:', tenantResponse?.result?.status);

        if (tenantResponse?.result?.status === 'archived') {
          setShowError(true);
          setErrorMessage('The user is decativated please contact admin');
          return;
        } else {
          if (tenantResponse?.result?.tenantData?.[0]?.tenantId) {
            localStorage.setItem('userId', tenantResponse?.result?.userId);
            const tenantIdToCompare =
              tenantResponse?.result?.tenantData?.[0]?.tenantId;
            if (tenantIdToCompare) {
              localStorage.setItem(
                'headers',
                JSON.stringify({
                  'org-id': tenantIdToCompare,
                })
              );
            }

            const tenantData = await fetchTenantData({
              token: response?.result?.access_token,
            });
            if (tenantIdToCompare) {
              const matchedTenant = tenantData?.result?.find(
                (tenant) => tenant.tenantId === tenantIdToCompare
              );
              localStorage.setItem('channelId', matchedTenant?.channelId);
              localStorage.setItem(
                'frameworkname',
                matchedTenant?.contentFramework
              );
              if (tenantIdToCompare === process.env.NEXT_PUBLIC_ORGID) {
                const redirectUrl = '/home';
                router.push(redirectUrl);
              } else {
                setShowError(true);
                setErrorMessage(
                  'The user does not belong to the same organization.'
                );
              }
            }
          }
        }

        // Check rootOrgId and route or show error
      } else {
        setShowError(true);
        setErrorMessage('Login failed. Invalid Username or Password.');
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage(error?.message ?? 'Login failed. Please try again.');
    } finally {
      // setLoading(false);
    }
    // router.push('/');
    // localStorage.clear();
  };
  return (
    <>
      {!isCallSubmitInHandle ? (
        <Form
          ref={formRef}
          schema={formSchema}
          uiSchema={formUiSchema}
          formData={formData}
          formContext={{ formData }}
          onChange={handleChange}
          // onChange={(data) => setFormData(data)}
          // onSubmit={handleSubmit}

          onSubmit={({ formData, errors }) => {
            if (errors.length > 0 || (!formData.email && !formData.mobile)) {
              setShowEmailMobileError(
                'Please provide either an email or a mobile number.'
              );
              return;
            }
            handleSubmit({ formData });
          }}
          validator={validator}
          //noHtml5Validate //disable auto error pop up to field location
          showErrorList={false} // Hides the error list card at the top
          liveValidate //all validate live
          // liveValidate={submitted} // Only validate on submit or typing
          // onChange={() => setSubmitted(true)} // Show validation when user starts typing
          // customValidate={customValidate} // Dynamic Validation
          transformErrors={transformErrors} // ✅ Suppress default pattern errors
          widgets={widgets}
          id="dynamic-form-id"
        >
          {showEmailMobileError && (
            <Snackbar
              open={showEmailMobileError}
              autoHideDuration={4000}
              onClose={() => setShowEmailMobileError(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setShowEmailMobileError(false)}
              >
                Please provide either email or mobile number
              </Alert>
            </Snackbar>
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
              onClick={handleSendOtp}
              disabled={
                !formData?.firstName ||
                !formData?.lastName ||
                !formData?.password ||
                (!formData?.email && !formData?.mobile) ||
                !formData?.confirm_password ||
                !formData.roles ||
                (formData?.roles.includes('HT & Officials') &&
                  !formData?.subRoles?.length) ||
                !formData?.udise
              }
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
                '&.Mui-disabled': {
                  bgcolor: '#BDBDBD', // light grey when disabled
                  color: '#FFFFFF',
                },
                width: '50%',
              }}
            >
              Send OTP
            </Button>
          </Box>
        </Form>
      ) : (
        <Grid container spacing={2}>
          {Object.keys(formSchema.properties).map((key) => (
            <Grid item xs={12} md={4} lg={3} key={key} sx={{ mb: '-40px' }}>
              <Form
                ref={formRef}
                schema={{
                  type: 'object',
                  properties: { [key]: formSchema.properties[key] },
                }}
                uiSchema={{ [key]: formUiSchema[key] }}
                formData={formData}
                fields={fields}
                // onChange={handleChange}
                onChange={(data) => setFormData(data)}
                onSubmit={handleSubmit}
                validator={validator}
                // showErrorList={false} // Hides the error list card at the top
                liveValidate //all validate live
                customValidate={customValidate} // Dynamic Validation
                // transformErrors={transformErrors} // ✅ Suppress default pattern errors
                widgets={widgets}
              >
                {!isCallSubmitInHandle ? null : (
                  <button type="submit" style={{ display: 'none' }}>
                    Submit
                  </button>
                )}
              </Form>
            </Grid>
          ))}
        </Grid>
      )}
      <OTPDialog
        open={isOpenOTP}
        data={registerData}
        onClose={() => setIsOpenOTP(false)}
        onSubmit={handleRegister}
      />
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Registration Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Welcome,
            <span style={{ fontWeight: 'bold' }}>
              {' '}
              {requestData?.usercreate?.request?.userName}{' '}
            </span>{' '}
            Your account has been successfully registered. Please use your
            username to login.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
    </>
  );
};

export default DynamicForm;
