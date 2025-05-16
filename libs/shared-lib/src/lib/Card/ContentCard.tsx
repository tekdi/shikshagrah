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
import { CircularProgressWithLabel } from '../Progress/CircularProgressWithLabel';
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
interface TrackDataItem {
  courseId: string;
  completed_list: any[];
  completed: boolean;
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

  TrackData?: TrackDataItem[];
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
  TrackData,
  type,
  item,
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
  const [trackCompleted, setTrackCompleted] = React.useState(0);
  const [trackProgress, setTrackProgress] = React.useState(100);

  React.useEffect(() => {
    const init = () => {
      try {
        //@ts-ignore
        if (TrackData) {
          const result = TrackData?.find(
            (e) => e.courseId === (item as any[])[0].identifier
          );
          if (type === 'Course') {
            const leafNodes = getLeafNodes(item ?? []);
            const completedCount = result?.completed_list?.length ?? 0;
            const percentage =
              leafNodes.length > 0
                ? Math.round((completedCount / leafNodes.length) * 100)
                : 0;
            setTrackProgress(percentage);
            setTrackCompleted(percentage);
          } else {
            setTrackCompleted(result?.completed ? 100 : 0);
          }
        }
      } catch (e) {
        console.log('error', e);
      }
    };
    init();
  }, [TrackData, item, type]);

  let statusIcon;
  let statusText;

  if (type === 'Course') {
    if (trackCompleted >= 100) {
      statusIcon = <CheckCircleIcon sx={{ color: '#21A400' }} />;
      statusText = 'Completed';
    } else if (trackProgress > 0 && trackProgress < 100) {
      statusText = 'In progress';
    } else {
      statusText = 'Enrolled';
    }
  } else {
    if (trackCompleted >= 100) {
      statusIcon = <CheckCircleIcon sx={{ color: '#21A400' }} />;
      statusText = 'Completed';
    } else {
      statusIcon = <ErrorIcon sx={{ color: '#FFB74D' }} />;
      statusText = 'Enrolled';
    }
  }
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
      {trackProgress >= 0 && (
        <Box
          sx={{
            position: 'absolute',
            height: '40px',
            top: 0,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box
            sx={{
              p: '0px 5px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: trackCompleted === 100 ? '#21A400' : '#FFB74D',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {type === 'Course' && (
              <CircularProgressWithLabel
                value={trackProgress ?? 0}
                _text={{
                  sx: {
                    color: trackCompleted === 100 ? '#21A400' : '#FFB74D',
                    fontSize: '10px',
                  },
                }}
                sx={{
                  color: trackCompleted === 100 ? '#21A400' : '#FFB74D',
                }}
                size={35}
                thickness={2}
              />
            )}
            {statusIcon}
            {statusText}
          </Box>
        </Box>
      )}
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
