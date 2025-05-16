import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useRouter } from 'next/router'; // Use Next.js router for navigation
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import LensOutlinedIcon from '@mui/icons-material/LensOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { CircularProgressWithLabel, Progress } from '@shared-lib';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
// Types for nested data structure and actions
interface NestedItem {
  identifier: string;
  name: string;
  mimeType: string;
  children?: NestedItem[];
}

interface CommonAccordionProps {
  identifier: string;
  title: string;
  data: NestedItem[];
  actions?: { label: string; onClick: () => void }[];
  defaultExpanded?: boolean;
  status?: 'Not started' | 'Completed' | 'In progress' | string;
  progress?: number;
}

const getIconByMimeType = (mimeType?: string): React.ReactNode => {
  const icons = {
    'application/pdf': <PictureAsPdfOutlinedIcon />,
    'video/mp4': <PlayCircleOutlineOutlinedIcon />,
    'video/webm': <PlayCircleOutlineOutlinedIcon />,
    'video/x-youtube': <PlayCircleOutlineOutlinedIcon />,
    'application/vnd.sunbird.questionset': <TextSnippetOutlinedIcon />,
  };
  //@ts-ignore
  return icons[mimeType] || <TextSnippetOutlinedIcon />;
};

const RenderNestedData: React.FC<{
  data: NestedItem[];
  expandedItems: Set<string>;
  status?: 'Not started' | 'Completed' | 'In progress' | string;
  progressNumber?: number;
  toggleExpanded: (identifier: string) => void;
}> = ({ data, expandedItems, toggleExpanded, progressNumber }) => {
  const router = useRouter();

  return (
    <>
      {data?.map((item) => {
        const isExpanded = expandedItems.has(item.identifier);
        const childrenCount = item.children?.length || 0;

        const handleItemClick = (identifier: string) => {
          const path =
            childrenCount >= 1 &&
            item.mimeType === 'application/vnd.ekstep.content-collection'
              ? `/details/${identifier}`
              : `/player/${item.identifier}`;
          router.push(path);
        };

        return (
          <Box
            key={item.identifier}
            sx={{
              borderBottom: '1px solid #ccc',
              borderRadius: '4px',
              margin: '8px 0',
              padding: '8px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Box
                onClick={() => handleItemClick(item.identifier)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1, // Take remaining space
                }}
              >
                {childrenCount === 0 && getIconByMimeType(item.mimeType)}
                <Typography variant="body1" fontSize={'14px'} fontWeight={400}>
                  {item.name}
                </Typography>

                {childrenCount > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        color: '#65558F',
                        textDecoration: 'underline',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {childrenCount} Units <ArrowForwardOutlinedIcon />
                    </Typography>
                  </Box>
                )}
                {progressNumber !== undefined && (
                  <Box
                    sx={{
                      // display: 'flex',
                      // alignItems: 'center',
                      // gap: '12px',
                      // marginLeft: '100%',
                      // position: 'relative',
                      // bottom: '32px',
                      minWidth: '40px',
                    }}
                  >
                    <CircularProgressWithLabel
                      color2={'#e8d7b4'}
                      value={progressNumber ?? 0}
                      _text={{
                        sx: {
                          color: progressNumber === 100 ? '#21A400' : '#FFB74D',
                        },
                      }}
                      sx={{
                        color: progressNumber === 100 ? '#21A400' : '#FFB74D',
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            {isExpanded && item.children?.length && (
              <Box sx={{ marginTop: '8px', paddingLeft: '16px' }}>
                <RenderNestedData
                  data={item.children}
                  expandedItems={expandedItems}
                  toggleExpanded={toggleExpanded}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
};

export const CommonCollapse: React.FC<CommonAccordionProps> = ({
  identifier,
  title,
  data,
  actions = [],
  progress,
  status,
  defaultExpanded = false,
}) => {
  const router = useRouter();
  const theme = useTheme();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const toggleExpanded = (identifier: string) => {
    setExpandedItems((prev) => {
      const newExpandedItems = new Set(prev);
      if (newExpandedItems.has(identifier)) {
        newExpandedItems.delete(identifier);
      } else {
        newExpandedItems.add(identifier);
      }
      return newExpandedItems;
    });
  };

  const handleItemClick = (identifier: string) => {
    const path = `/player/${identifier}`;
    router.push(path);
  };
  return (
    <Box sx={{ margin: '10px' }}>
      {data?.length > 0 ? (
        <Box
          sx={{
            backgroundColor: theme.palette.custom?.secondaryBackground,
            padding: '8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <LensOutlinedIcon sx={{ fontSize: '17px' }} />
          <Typography variant="h6" fontSize={'12px'} fontWeight={500}>
            {title}
          </Typography>
          {progress !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                // marginLeft: 'auto',
                position: 'relative',
              }}
            >
              <CircularProgressWithLabel
                color2={'#e8d7b4'}
                value={progress ?? 0}
                _text={{
                  sx: {
                    color: progress === 100 ? '#21A400' : '#FFB74D',
                  },
                }}
                sx={{
                  color: progress === 100 ? '#21A400' : '#FFB74D',
                }}
              />
            </Box>
          )}
          <Box
            sx={{ marginLeft: 'auto' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(identifier);
            }}
          >
            {expandedItems.has(identifier) ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            // justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onClick={() => handleItemClick(identifier)}
        >
          <Typography variant="body1" fontSize={'14px'} fontWeight={400}>
            {/* @ts-ignore */}
            {getIconByMimeType(data?.mimeType)} {title}
          </Typography>
        </Box>
      )}

      <Box sx={{ marginTop: '8px' }}>
        {expandedItems.has(identifier) && (
          <RenderNestedData
            data={data}
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
            progressNumber={progress}
          />
        )}
      </Box>

      {actions.length > 0 && (
        <Box sx={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          {actions.map((action) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              variant="contained"
            >
              {action.label}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommonCollapse;
