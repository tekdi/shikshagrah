'use client';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

export const FilterForm = ({
  filter,
  language,
  selectedSubjects,
  selectedContentTypes,
  sort,
  onLanguageChange,
  onSubjectsChange,
  onContentTypeChange,
  onSortChange,
  onApply,
  filterValues,
  _formControl,
}: {
  filterValues?: any;
  filter?: {
    sort?: boolean;
    language?: string[];
    subject?: string[];
    contentType?: string[];
  };
  language?: string;
  selectedSubjects?: string[];
  selectedContentTypes?: string[];
  sort?: any;
  onLanguageChange?: (language: string) => void;
  onSubjectsChange?: (subjects: string[]) => void;
  onContentTypeChange?: (contentType: string[]) => void;
  onSortChange?: (sort: any) => void;
  onApply?: (data: any) => void;
  _formControl?: any;
}) => {
  // Manage the selected values for each category
  const [selectedValues, setSelectedValues] = useState(filterValues ?? {}); // Initialize as an empty object

  const handleChange = (event: any, filterCode: any) => {
    const { value } = event.target;
    setSelectedValues((prev: any) => ({
      ...prev,
      [filterCode]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const [frameworkFilter, setFrameworkFilter] = useState<any>(null);

  useEffect(() => {
    const fetchFramework = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_MIDDLEWARE_URL}/api/framework/v1/read/${process.env.NEXT_PUBLIC_FRAMEWORK_ID}`;
        const frameworkData = await fetch(url).then((res) => res.json());
        const frameworks = frameworkData?.result?.framework;
        setFrameworkFilter(frameworks);
      } catch (error) {
        console.error('Error fetching board data:', error);
      }
    };
    fetchFramework();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* new filter frameworkFilter */}
      <FrameworkFilterComponent
        frameworkFilter={frameworkFilter}
        selectedValues={selectedValues}
        handleChange={handleChange}
        _formControl={_formControl}
      />
      {/* Sort By */}
      {filter?.sort && (
        <>
          <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
            Sort By
          </Typography>
          <FormControl>
            <RadioGroup
              onChange={(e) => {
                const value = e.target.value;
                onSortChange?.(value);
              }}
              value={sort?.sortBy ?? 'asc'}
            >
              <FormControlLabel
                value="asc"
                label="A to Z"
                control={<Radio />}
              />
              <FormControlLabel
                value="desc"
                label="Z to A"
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>
        </>
      )}
      {/* Language */}
      {filter?.language && filter.language.length > 0 && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Language</InputLabel>
          <Select
            label="Language"
            onChange={(e) => onLanguageChange?.(e.target.value)}
            value={language}
          >
            {filter.language.map((lang) => (
              <MenuItem value={lang} key={lang}>
                {lang}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {/* Subject */}
      {filter?.subject && filter.subject.length > 0 && (
        <FormControl margin="normal" fullWidth>
          <InputLabel>Subject</InputLabel>
          <Select
            multiple
            label="Subject"
            value={selectedSubjects ?? []}
            renderValue={(selected) => (selected as string[]).join(', ')} // Join array values for display
            onChange={(e) => {
              const value = e.target.value as string[];
              onSubjectsChange?.(value);
            }}
          >
            {filter.subject.map((subject) => (
              <MenuItem value={subject} key={subject}>
                <Checkbox
                  checked={(selectedSubjects ?? []).indexOf(subject) > -1}
                />
                <ListItemText primary={subject} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {/* Content Type */}
      {filter?.contentType && filter.contentType.length > 0 && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Content Type</InputLabel>
          <Select
            renderValue={(selected) => (selected as string[]).join(', ')}
            label="Content Type"
            multiple
            value={selectedContentTypes ?? []}
            onChange={(e) => {
              const value = e.target.value as string[];
              onContentTypeChange?.(value);
            }}
          >
            {filter.contentType.map((type) => (
              <MenuItem key={type} value={type}>
                <Checkbox
                  checked={(selectedContentTypes ?? []).indexOf(type) > -1}
                />
                <ListItemText primary={type} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {/* Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
        <Button
          onClick={() => {
            onApply?.({});
            setSelectedValues({});
          }}
          variant="outlined"
        >
          Clear All
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onApply?.(selectedValues);
          }}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
};

const RenderCategories = React.memo(
  ({ categories, selectedValues, handleChange, _formControl }: any) => {
    const componentKey = `multi-checkbox-label_${categories?.identifier}`;
    const options = categories?.terms.map((term: any) => ({
      label: term.name,
      value: term.code,
    }));

    const currentSelectedValues =
      selectedValues[`se_${categories?.code}s`] ?? [];

    return (
      <FormControl
        key={componentKey}
        sx={{ maxWidth: '350px' }}
        {..._formControl}
      >
        <InputLabel id={componentKey}>{categories?.name}</InputLabel>
        <Select
          multiple
          labelId={componentKey}
          input={<OutlinedInput label={categories?.name} />}
          value={currentSelectedValues}
          renderValue={(selected) =>
            (selected as string[])
              .map((selectedValue: any) => {
                const selectedOption = options.find(
                  (option: any) => option.value === selectedValue
                );
                return selectedOption ? selectedOption.label : '';
              })
              .join(', ')
          }
          onChange={(event) => handleChange(event, `se_${categories?.code}s`)}
          sx={{ maxWidth: '100%' }}
        >
          {options.map((option: any) => (
            <MenuItem value={option.value} key={option.value}>
              <Checkbox
                checked={currentSelectedValues.includes(option.value)}
              />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
);

RenderCategories.displayName = 'RenderCategories';

const FrameworkFilterComponent = ({
  frameworkFilter,
  selectedValues,
  handleChange,
  _formControl,
}: any) => {
  return frameworkFilter?.categories?.map((categories: any) => {
    return (
      <RenderCategories
        key={categories?.identifier}
        categories={categories}
        selectedValues={selectedValues}
        handleChange={handleChange}
        _formControl={_formControl}
      />
    );
  });
};
