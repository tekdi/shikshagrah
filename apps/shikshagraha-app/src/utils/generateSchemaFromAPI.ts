const toCamelCase = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+|\-|\_|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[\-_]+/g, '');
};

export const generateRJSFSchema = (fields: any[], rolesValue: string) => {
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
        type: 'string',
      };
      if (type === 'drop_down') {
        fieldSchema.enum = options.map((option: any) => option.value); // Use options to populate the enum
        // if (isMultiSelect) {
        fieldSchema.items = {
          type: 'select',
          // };
        };
      }

      if (type === 'drop_down') {
        const enumValues = options?.map((option: any) => option.value) || [];
        if (isMultiSelect) {
          fieldSchema.items = { type: 'string', enum: enumValues };
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

      if (name === 'subRoles' && rolesValue !== 'administrator') {
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
              : type === 'email'
              ? 'CustomEmailWidget'
              : type === 'password'
              ? 'password'
              : 'CustomTextFieldWidget',
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
