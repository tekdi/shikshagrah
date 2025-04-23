import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import { Box } from '@mui/material';
import { Progress } from '../Progress/Progress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
interface ContentItem {
  name: string;
  gradeLevel: string[];
  language: string[];
  artifactUrl: string;
  identifier: string;
  appIcon: string;
  contentType: string;
  mimeType: string;
  description: string;
  posterImage: string;
  children: [{}];
}
interface CommonCardProps {
  title: string;
  avatarLetter?: string;
  avatarColor?: string;
  subheader?: string;
  image?: string;
  imageAlt?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
  minheight?: string;

  TrackData?: never[];
  item: ContentItem[];
  type: string;
  onClick?: () => void;
}

export const ContentCard: React.FC<CommonCardProps> = ({
  avatarLetter,
  avatarColor = red[500],
  title,
  subheader,
  image,
  imageAlt,
  children,
  orientation,
  minheight,

  onClick,
}) => {
  const getLeafNodes = (node: any) => {
    let result = [];

    // If the node has leafNodes, add them to the result array
    if (node.leafNodes) {
      result.push(...node.leafNodes);
    }

    // If the node has children, iterate through them and recursively collect leaf nodes
    if (node.children) {
      node.children.forEach((child: any) => {
        result.push(...getLeafNodes(child));
      });
    }

    return result;
  };

  return (
    <Card
      sx={{
        height: '100%',
        
        boxShadow: 'none',
        background: 'transparent',
      }}
      onClick={onClick}
    >
      {/* Image and Progress Overlay */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <CardMedia
          component="img"
          image={image}
          alt={imageAlt || 'Image'}
          sx={{
            width: '100%',
            height: 'auto',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.1)',
            aspectRatio: '176/118',
          }}
        />
      </Box>

      <CardHeader
        avatar={
          avatarLetter && (
            <Avatar sx={{ bgcolor: avatarColor }} aria-label="avatar">
              {avatarLetter}
            </Avatar>
          )
        }
        title={
          <Typography
            sx={{
              fontSize: '16px',
              whiteSpace: 'wrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              paddingLeft: '5px',
            }}
          >
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="h6" sx={{ fontSize: '14px' }}>
            {subheader}
          </Typography>
        }
      />

      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
};
