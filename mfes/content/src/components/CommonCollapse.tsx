import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useRouter } from 'next/router'; // Use Next.js router for navigation
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import LensOutlinedIcon from '@mui/icons-material/LensOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
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
}

// Icon rendering function based on MIME type
const getIconByMimeType = (mimeType?: string): React.ReactNode => {
  const icons = {
    'application/pdf': <PictureAsPdfOutlinedIcon />,
    'video/mp4': <PlayCircleOutlineOutlinedIcon />,
    'video/webm': <PlayCircleOutlineOutlinedIcon />,
    'application/vnd.sunbird.questionset': <TextSnippetOutlinedIcon />,
  };
  return icons[mimeType] || <TextSnippetOutlinedIcon />;
};

// Recursive component to render nested data
const RenderNestedData: React.FC<{
  data: NestedItem[];
  expandedItems: Set<string>;
  toggleExpanded: (identifier: string) => void;
}> = ({ data, expandedItems, toggleExpanded }) => {
  const router = useRouter();

  return (
    <>
      {data?.map((item) => {
        const isExpanded = expandedItems.has(item.identifier);
        const childrenCount = item.children?.length || 0;

        // Navigate on item click
        const handleItemClick = () => {
          const path =
            childrenCount >= 1 &&
            item.mimeType === 'application/vnd.ekstep.content-collection'
              ? `/details/${item.identifier}`
              : `/content-details/${item.identifier}`;
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
              }}
              onClick={() =>
                childrenCount > 0 && toggleExpanded(item.identifier)
              } // Toggle only if children exist
            >
              <Box onClick={handleItemClick}>
                <Typography variant="body1" fontSize={'14px'} fontWeight={400}>
                  {getIconByMimeType(item.mimeType)} {item.name}
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
                      {childrenCount} Resources <ArrowForwardOutlinedIcon />
                    </Typography>
                  </Box>
                )}
              </Box>
              {childrenCount > 0 &&
                (isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
            </Box>

            {isExpanded && item.children && (
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

// Main Collapse component
export const CommonCollapse: React.FC<CommonAccordionProps> = ({
  identifier,
  title,
  data,
  actions = [],
  defaultExpanded = false,
}) => {
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    defaultExpanded ? new Set(data.map((item) => item.identifier)) : new Set()
  );

  // Detect identifier change in URL
  useEffect(() => {
    const { identifier: identifierFromURL } = router.query; // Access query params using Next.js router
    if (identifier) {
      console.log(`Updated identifier: ${identifier}`);
    }
  }, [router.query]);

  // Toggle the expanded state of a given item
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

  // Handle title click for direct navigation
  const handleTitleClick = () => {
    console.log(`Updated identifier`);
    router.push(`/content-details/${identifier}`); // Use Next.js router.push for navigation
  };

  return (
    <Box sx={{ margin: '10px' }}>
      <Box
        sx={{
          backgroundColor: '#E9DDFF',
          padding: '8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {' '}
        <LensOutlinedIcon />
        <Typography variant="h6" fontSize={'12px'} fontWeight={500}>
          {data?.length > 0 ? (
            title
          ) : (
            <span onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
              {title}
            </span>
          )}
        </Typography>
      </Box>

      <Box sx={{ marginTop: '8px' }}>
        <RenderNestedData
          data={data}
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
        />
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
