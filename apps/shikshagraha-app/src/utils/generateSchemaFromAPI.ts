const toCamelCase = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+|\-|\_|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[\-_]+/g, '');
};
interface SubroleData {
  data: any[];
}
export const generateRJSFSchema = (
  fields: any[],
  rolesValue: string,
  rolesData?: any[],
  subrolesData?: SubroleData[]
) => {
  const schema: any = {
    type: 'object',
    properties: {},
    required: [],
  };

  const uiSchema: any = {};
  const fieldNameToFieldIdMapping: Record<string, string> = {};

  if (!Array.isArray(fields)) {
    console.error('Expected fields to be an array, got:', fields);
    return { schema, uiSchema, fieldNameToFieldIdMapping };
  }

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
        fieldId,
        isEditable,
      } = field;

      const fieldSchema: any = {
        title: label || name,
        type: isMultiSelect ? 'array' : 'string',
      };
      // Handle Role field
      if (name === 'Role') {
        if (!rolesData || !rolesData.length) {
          console.error('Missing or empty rolesData for Role field');
          return;
        }

        const validRoles = rolesData.filter((role) => role.externalId);
        const roleEnums = validRoles.map((role) => role.externalId);

        fieldSchema.enum = roleEnums;

        const defaultRole =
          validRoles.find((r) => r.externalId === rolesValue) || validRoles[0];
        if (defaultRole) {
          fieldSchema.default = defaultRole.externalId;
        }

        schema.properties[name] = fieldSchema;

        uiSchema[name] = {
          'ui:widget': 'CustomSingleSelectWidget',
          'ui:options': {
            enumOptions: validRoles.map((role) => ({
              value: role.externalId,
              label: role.name,
              _originalData: role,
            })),
          },
        };

        return; // Done handling Role
      }

      // Handle Sub-Role field
      if (name === 'Sub-Role') {
        // Make it an array type for multiselect
        fieldSchema.type = 'array';
        fieldSchema.items = {
          type: 'string',
        };
        fieldSchema.uniqueItems = true;

        // Only show if a role is selected
        if (rolesValue) {
          uiSchema[name] = {
            'ui:widget': 'CustomMultiSelectWidget',
            'ui:options': {
              enumOptions:
                subrolesData?.data?.map((subrole: any) => ({
                  value: subrole._id || subrole.externalId,
                  label: subrole.name,
                  _originalData: subrole, // Keep original data if needed
                })) || [],
            },
          };
        } else {
          uiSchema[name] = {
            'ui:widget': 'hidden',
          };
        }

        schema.properties[name] = fieldSchema;
        return;
      }

      // Handle generic drop_down field
      if (type === 'drop_down') {
        const enumValues = options?.map((option: any) => option.value) || [];
        const enumNames =
          options?.map(
            (option: any) =>
              option.value.charAt(0).toUpperCase() + option.value.slice(1)
          ) || [];

        if (isMultiSelect) {
          fieldSchema.items = {
            type: 'drop_down',
            enum: enumValues,
            enumNames: enumNames,
          };
          fieldSchema.uniqueItems = true;
        } else {
          fieldSchema.enum = enumValues;
        }
      }

      // Handle pattern
      if (pattern) {
        fieldSchema.pattern = pattern;
      }

      schema.properties[name] = fieldSchema;

      // Configure UI widget
      uiSchema[name] = {
        'ui:disabled': isEditable === false,
        'ui:readonly': [
          'School',
          'Cluster',
          'District',
          'Block',
          'State',
        ].includes(name),
        'ui:widget':
          name === 'Udise'
            ? 'UdiaseWithButton'
            : type === 'password'
            ? 'password'
            : isMultiSelect
            ? 'CustomMultiSelectWidget'
            : type === 'drop_down'
            ? 'CustomSingleSelectWidget'
            : 'CustomTextFieldWidget',
      };
      // Track field ID
      if (fieldId) {
        fieldNameToFieldIdMapping[name] = fieldId;
      }

      // Required fields
      // if (isRequired) {
      //   schema.required.push(name);
      // }
    });

  uiSchema['ui:options'] = {
    submitButtonOptions: {
      norender: true,
    },
  };

  return { schema, uiSchema, fieldNameToFieldIdMapping };
};
