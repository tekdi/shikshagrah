const toCamelCase = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+|\-|\_|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[\-_]+/g, '');
};

export const generateRJSFSchema = (
  fields: any[],
  rolesValue: string
  // emailValue: string,
  // contactNumberValue: string
) => {
  const schema: any = {
    type: 'object',
    properties: {},
    required: [],
  };

  const uiSchema: any = {};
  const fieldNameToFieldIdMapping: Record<string, string> = {};
  fields
    .filter((f) => f.coreField === 1 || f.coreField === 0)
    .sort((a, b) => Number(a.order) - Number(b.order))
    .forEach((field) => {
      const {
        name,
        label,
        type,
        isRequired,
        placeholder,
        pattern,
        options,
        isMultiSelect,
        dependsOn,
        visibleIf,
        fieldId,
      } = field;

      const fieldSchema: any = {
        title: label || name,
        type: isMultiSelect ? 'array' : 'string',
      };
      if (type === 'drop_down') {
        const enumValues = options?.map((option: any) => option.value) || [];
        const enumNames =
          options?.map(
            (option: any) =>
              option.value.charAt(0).toUpperCase() + option.value.slice(1)
          ) || [];

        if (isMultiSelect) {
          fieldSchema.items = {
            type: 'string',
            enum: enumValues,
            enumNames: enumNames,
          };
          fieldSchema.uniqueItems = true;
        } else {
          fieldSchema.enum = enumValues;
          fieldSchema.enumNames = enumNames;
        }
      }

      if (type === 'drop_down') {
        const enumValues = options?.map((option: any) => option.value) || [];
        const enumNames =
          options?.map(
            (option: any) =>
              option.value.charAt(0).toUpperCase() + option.value.slice(1)
          ) || [];
        if (isMultiSelect) {
          fieldSchema.items = {
            type: 'string',
            enum: enumValues,
            enumNames: enumNames,
          };
          fieldSchema.uniqueItems = true;
        } else {
          fieldSchema.enum = enumValues;
        }
      }
      if (pattern) {
        fieldSchema.pattern = pattern;
      }

      schema.properties[name] = fieldSchema;

      // if (isRequired) {
      //   schema.required.push(name);
      // }
      // const emailEntered = !!emailValue;
      // const contactEntered = !!contactNumberValue;

      // const shouldHideEmail = name === 'email' && contactEntered;
      // const shouldHideContact = name === 'mobile' && emailEntered;
      // console.log('name', rolesValue);
      // if (
      //   (name === 'email' && contactEntered) ||
      //   (name === 'mobile' && emailEntered)
      // ) {
      //   uiSchema[name] = {
      //     'ui:widget': 'hidden',
      //   };
      // } else
      if (name === 'subRoles' && rolesValue !== 'HT & Officials') {
        uiSchema[name] = {
          'ui:widget': 'hidden',
        };
      } else {
        uiSchema[name] = {
          'ui:disabled': field.isEditable === false,
          'ui:readonly': [
            'school',
            'cluster',
            'district',
            'block',
            'state',
          ].includes(name),
          'ui:widget':
            name === 'udise'
              ? 'UdiaseWithButton'
              : name === 'roles'
              ? 'CustomSingleSelectWidget'
              : name == 'subRoles'
              ? 'CustomMultiSelectWidget'
              : type === 'password'
              ? 'password'
              : 'CustomTextFieldWidget',
          // ...(shouldHideEmail || shouldHideContact
          //   ? { 'ui:widget': 'hidden' }
          //   : {}),
        };
      }
      if (fieldId) {
        fieldNameToFieldIdMapping[name] = fieldId;
      }
    });

  uiSchema['ui:options'] = {
    submitButtonOptions: {
      norender: true,
    },
  };
  return { schema, uiSchema, fieldNameToFieldIdMapping };
};
