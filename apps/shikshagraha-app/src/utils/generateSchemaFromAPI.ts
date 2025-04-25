export const generateRJSFSchema = (fields: any[]) => {
  const schema: any = {
    type: 'object',
    properties: {},
    required: [],
  };

  const uiSchema: any = {};

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
      } = field;

      const fieldSchema: any = {
        title: label || name,
        type: 'string',
      };
      if (type === 'Drop Down') {
        fieldSchema.enum = options.map((option: any) => option.value); // Use options to populate the enum
        // if (isMultiSelect) {
        fieldSchema.items = {
          type: 'select',
          // };
        };
      }
      if (pattern) {
        fieldSchema.pattern = pattern;
      }

      schema.properties[name] = fieldSchema;

      if (isRequired) {
        schema.required.push(name);
      }

      uiSchema[name] = {
        // 'ui:placeholder': placeholder ? placeholder : null,
        'ui:disabled': field.isEditable === false,
        'ui:widget':
          type === 'Drop Down'
            ? 'select'
            : type === 'email'
            ? 'email'
            : type === 'password'
            ? 'password'
            : 'text',
      };
      // if (isMultiSelect) {
      //   uiSchema[name]['ui:options'] = { multiple: true };
      // }
      if (dependsOn) {
        uiSchema['ui:options'] = {
          ...uiSchema['ui:options'],
          // You can extend this with custom logic
          condition: {
            field: dependsOn,
            value: visibleIf || true, // Default to true if not explicitly defined
          },
        };

        // Optionally hide it initially, and handle in custom logic
        uiSchema['ui:hide'] = true;
      }
    });

  uiSchema['ui:options'] = {
    submitButtonOptions: {
      norender: true,
    },
  };
  return { schema, uiSchema };
};
