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
  content,
  actions,
  children,
  orientation,
  minheight,

  TrackData,
  item,
  type,
  onClick,
}) => {
  const [trackCompleted, setTrackCompleted] = React.useState(0);
  const [trackProgress, setTrackProgress] = React.useState(0);

  React.useEffect(() => {
    fetchDataTrack();
  }, []);
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
  const fetchDataTrack = async () => {
    try {
      //@ts-ignore
      if (TrackData && item?.children) {
        for (let i = 0; i < TrackData.length; i++) {
          //@ts-ignore
          if (TrackData[i]?.courseId) {
            //merge offlien and online
            //@ts-ignore
            const mergedArray = [...TrackData[i]?.completed_list];
            const uniqueArray = [...new Set(mergedArray)];
            let completed_list = uniqueArray;

            //merge offlien and online
            //@ts-ignore
            const mergedArray_progress = [...TrackData[i]?.in_progress_list];
            const uniqueArray_progress = [...new Set(mergedArray_progress)];
            let in_progress_list = uniqueArray_progress;

            //fetch all content in unit
            let unit_content_list = getLeafNodes(item);
            let unit_content_completed_list = [];
            if (unit_content_list && completed_list) {
              if (unit_content_list.length > 0 && completed_list.length > 0) {
                for (let ii = 0; ii < unit_content_list.length; ii++) {
                  let temp_item = unit_content_list[ii];
                  if (completed_list.includes(temp_item)) {
                    unit_content_completed_list.push(temp_item);
                  }
                }
                let totalContent = unit_content_list.length;
                let completed = unit_content_completed_list.length;
                let percentageCompleted = (completed / totalContent) * 100;
                percentageCompleted = Math.round(percentageCompleted);

                setTrackCompleted(percentageCompleted);
              }
            }
            let unit_content_in_progress_list = [];
            if (unit_content_list && in_progress_list) {
              if (unit_content_list.length > 0 && in_progress_list.length > 0) {
                for (let ii = 0; ii < unit_content_list.length; ii++) {
                  let temp_item = unit_content_list[ii];
                  if (in_progress_list.includes(temp_item)) {
                    unit_content_in_progress_list.push(temp_item);
                  }
                }
                let totalContent = unit_content_list.length;
                let in_progress = unit_content_in_progress_list.length;
                let percentageInProgress = (in_progress / totalContent) * 100;
                percentageInProgress = Math.round(percentageInProgress);
                setTrackProgress(percentageInProgress);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('error', e);
    }
  };
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'column' : 'row',
        height: minheight || 'auto',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '12px',
        bgcolor: '#FEF7FF',
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
        },
        '@media (max-width: 600px)': {
          flexDirection: 'column',
        },
      }}
      onClick={onClick}
    >
      {/* Image and Progress Overlay */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        {image && (
          <CardMedia
            component="img"
            image={image || '/assets/images/default.png'}
            alt={imageAlt || 'Image'}
            sx={{
              width: '100%',
              height: orientation === 'horizontal' ? '297px' : 'auto',
              objectFit: 'cover', //set contain
              '@media (max-width: 600px)': {
                height: '200px',
              },
            }}
          />
        )}

        {/* Progress Bar Overlay */}
        {trackProgress >= 0 && (
          <Box
            sx={{
              position: 'absolute',
              height: '40px',
              top: 0,
              width: '100%',
              display: 'flex',
              // justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {type === 'course' ? (
              <>
                <Progress
                  variant="determinate"
                  value={100}
                  size={30}
                  thickness={5}
                  sx={{
                    color: '#fff8fb',
                    position: 'absolute',
                    left: '10px',
                  }}
                />
                <Progress
                  variant="determinate"
                  value={trackCompleted}
                  size={30}
                  thickness={5}
                  sx={{
                    color: trackCompleted === 100 ? '#21A400' : '#FFB74D',
                    position: 'absolute',
                    left: '10px',
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginLeft: '12px',
                    color: trackCompleted === 100 ? '#21A400' : '#FFB74D',
                    position: 'absolute',
                    left: '50px',
                  }}
                >
                  {trackCompleted >= 100
                    ? 'Completed'
                    : trackCompleted > 0
                    ? 'Inprogress'
                    : trackProgress > 0
                    ? `${trackProgress}% progress`
                    : `${trackProgress}% Enrolled`}
                </Typography>
              </>
            ) : (
              <Box
                sx={{
                  position: 'absolute',
                  height: '40px',
                  top: 0,
                  width: '100%',
                  display: 'flex',
                  // justifyContent: 'center',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                {trackCompleted >= 100 ? (
                  <>
                    <CheckCircleIcon sx={{ color: '#21A400' }} />
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginLeft: '12px',
                        color: trackCompleted === 100 ? '#21A400' : '#FFB74D',
                        position: 'absolute',
                        left: '50px',
                      }}
                    >
                      {' '}
                      Completed
                    </Typography>
                  </>
                ) : (
                  <>
                    <ErrorIcon sx={{ color: '#FFB74D' }} />
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginLeft: '12px',
                        color: trackCompleted === 100 ? '#21A400' : '#FFB74D',
                        position: 'absolute',
                        left: '20px',
                      }}
                    >
                      {' '}
                      Inprogress
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </Box>
        )}
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
      {content && (
        <CardContent
          sx={{
            display: 'flex',
            paddingBottom: 0,
            overflow: 'hidden',
            maxWidth: '100%',
            // height: '50px',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700 }}>
                Description:
              </span>{' '}
              {content}
            </Typography>
          </Box>
        </CardContent>
      )}
      {children && <CardContent>{children}</CardContent>}
      {actions && (
        <CardActions
          disableSpacing
          sx={{
            border: '1px solid #79747E',
            borderRadius: '8px',
            width: '80px',
            display: 'flex',
            justifyContent: 'center',
            margin: '12px',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#073763',
            }}
          >
            {actions}
          </Typography>
        </CardActions>
      )}
    </Card>
  );
};
