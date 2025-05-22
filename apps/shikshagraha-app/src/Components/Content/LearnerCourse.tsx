import dynamic from 'next/dynamic';
import React, { useState, useCallback, memo, useEffect } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { CommonDialog } from '@shared-lib';
import { FilterAltOutlined } from '@mui/icons-material';
import SearchComponent from './SearchComponent';
import FilterComponent from './FilterComponent';

interface LearnerCourseProps {
  title?: string;
  _content?: any;
}

const Content = dynamic(() => import('@Content'), {
  ssr: false,
});

export default memo(function LearnerCourse({
  title,
  _content,
}: LearnerCourseProps) {
  const [filterState, setFilterState] = useState<any>({ limit: 10 });
  const [isOpen, setIsOpen] = useState(false);
  // const { t } = useTranslation();
  const { staticFilter, filterFramework } = _content ?? {};

  useEffect(() => {
    if (_content?.filters) {
      setFilterState((prevState: any) => ({
        ...prevState,
        ..._content?.filters,
      }));
    }
  }, [_content?.filters]);

  const handleTabChange = useCallback((tab: any) => {
    setFilterState((prevState: any) => ({
      ...prevState,
      query: '',
    }));
  }, []);
  const handleSearchClick = useCallback((searchValue: string) => {
    setFilterState((prevState: any) => ({
      ...prevState,
      query: searchValue,
    }));
  }, []);

  const handleFilterChange = (newFilterState: typeof filterState) => {
    setFilterState((prevState: any) => ({
      ...prevState,
      filters: newFilterState,
    }));
    setIsOpen(false);
  };

  return (
    <Stack sx={{ p: { xs: 1, md: 4 }, gap: 4 }}>
      {title && (
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          sx={{
            gap: { xs: 2, md: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              fontSize: '22px',
              lineHeight: '28px',
            }}
          >
            {title ?? 'LEARNER_APP.COURSE.GET_STARTED'}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <SearchComponent
              onSearch={handleSearchClick}
              value={filterState?.query}
            />
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Button
                variant="outlined"
                onClick={() => setIsOpen(true)}
                size="large"
              >
                <FilterAltOutlined />
              </Button>
            </Box>
          </Box>
        </Box>
      )}
      <Stack direction="row" sx={{ gap: 4 }}>
        {/* <CommonDialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Filters">
          <FilterComponent
            filterFramework={filterFramework}
            staticFilter={staticFilter}
            filterState={filterState}
            handleFilterChange={handleFilterChange}
          />
        </CommonDialog> */}

        <Box
          flex={35}
          sx={{
            display: { xs: 'none', md: 'flex' },
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start',
          }}
        >
          <FilterComponent
            filterFramework={filterFramework}
            staticFilter={staticFilter}
            filterState={filterState}
            handleFilterChange={handleFilterChange}
          />
        </Box>
        <Box flex={127}>
          {!title && (
            <Box
              display="flex"
              justifyContent="space-between"
              gap={2}
              sx={{ mb: 2 }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {filterState?.filters
                  ? Object.keys(filterState.filters)
                      .filter(
                        (e) =>
                          ![
                            'limit',
                            ...Object.keys(staticFilter ?? {}),
                          ].includes(e)
                      )
                      .map((key, index) => (
                        <Chip
                          key={`${key}-${index}`}
                          label={
                            <Typography
                              noWrap
                              variant="body2"
                              sx={{ maxWidth: 300, mb: 0 }}
                            >
                              {`${key}: ${filterState.filters[key]}`}
                            </Typography>
                          }
                          onDelete={() => {
                            const { [key]: _, ...rest } =
                              filterState.filters ?? {};
                            handleFilterChange(rest);
                          }}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))
                  : null}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <SearchComponent
                  onSearch={handleSearchClick}
                  value={filterState?.query}
                />
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsOpen(true)}
                    size="large"
                  >
                    <FilterAltOutlined />
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
          <Content
            isShowLayout={false}
            contentTabs={['Course']}
            showFilter={true}
            showSearch={false}
            showHelpDesk={false}
            {..._content}
            _config={{
              tabChange: handleTabChange,
              default_img: '/images/image_ver.png',
              _card: { isHideProgress: true },
              _subBox: {
                overflowY: 'scroll',
                maxHeight: 'calc(100vh - 200px)', // Adjust height as needed
              },
              ..._content?._config,
            }}
            filters={{
              ...filterState,
              filters: {
                ...filterState.filters,
                ...staticFilter,
              },
            }}
          />
        </Box>
      </Stack>
    </Stack>
  );
});
