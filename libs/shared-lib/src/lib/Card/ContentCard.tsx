import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import { Box, useTheme } from '@mui/material';
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
  leafNodes?: [{}];
}

interface TrackDataItem {
  courseId: string;
  completed_list: any[];
  completed: boolean;
  status?: string;
  percentage?: number;
  enrolled?: boolean;
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
  orientation?: string;
  minheight?: string;
  TrackData?: TrackDataItem[];
  item: ContentItem[];
  type: string;
  onClick?: () => void;
  _card?: any;
}

interface StatusProps {
  trackProgress?: number;
  status?: string;
  type?: string;
}

export const ContentCard: React.FC<CommonCardProps> = ({
  avatarLetter,
  avatarColor = red[500],
  title,
  subheader,
  image,
  imageAlt,
  content,
  children,
  orientation,
  minheight,
  TrackData,
  type,
  item,
  onClick,
  _card,
}) => {
  const [statusBar, setStatusBar] = React.useState<StatusProps>();

  const getLeafNodes = (node: any) => {
    const result = [];

    if (node?.leafNodes) {
      result.push(...node.leafNodes);
    }

    if (node?.children) {
      node.children.forEach((child: any) => {
        result.push(...getLeafNodes(child));
      });
    }

    return result;
  };

  React.useEffect(() => {
    const init = () => {
      try {
        if (TrackData) {
          const result = TrackData?.find(
            (e) => e.courseId === (item as any[])[0]?.identifier
          );

          const newObj = {
            type,
            status:
              result?.status?.toLowerCase() === 'completed'
                ? 'Completed'
                : result?.status?.toLowerCase() === 'in progress'
                ? 'In Progress'
                : result?.enrolled === true
                ? 'Enrolled, not started'
                : 'Not Started',
          };

          if (type === 'Course') {
            const leafNodes = getLeafNodes(item?.[0] ?? {});
            const completedCount = result?.completed_list?.length ?? 0;
            const percentage =
              leafNodes.length > 0
                ? Math.round((completedCount / leafNodes.length) * 100)
                : result?.percentage ?? 0;

            if (!_card?.isHideProgress) {
              setStatusBar({
                ...newObj,
                trackProgress: percentage,
              });
            } else {
              setStatusBar(newObj);
            }
          } else {
            setStatusBar({
              ...newObj,
              trackProgress: result?.completed ? 100 : 0,
            });
          }
        }
      } catch (e) {
        console.log('error', e);
      }
    };
    init();
  }, [TrackData, item, type, _card?.isHideProgress]);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        height: minheight ?? '100%',
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: 'background.paper',
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
        },
        '@media (max-width: 600px)': {
          flexDirection: 'column',
        },
        ..._card?.sx,
      }}
      onClick={onClick}
    >
      {/* Image and Progress Overlay */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <CardMedia
          component="img"
          image={image ?? '/assets/images/default.png'}
          alt={imageAlt || 'Image'}
          sx={{
            width: '100%',
            height: orientation === 'horizontal' ? '140px' : 'auto',
            aspectRatio: '176/118',
            objectFit: 'cover',
            borderBottom: '1px solid rgba(0,0,0,0.1)',
            '@media (max-width: 600px)': {
              height: '140px',
            },
            ..._card?._cardMedia?.sx,
          }}
        />

        {/* Status Bar */}
        {statusBar && (
          <StatusBar
            trackProgress={statusBar.trackProgress}
            status={statusBar.status}
            type={statusBar.type}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardHeader
          sx={{
            pb: 0,
            pt: 1,
            ..._card?._cardHeader?.sx,
          }}
          avatar={
            avatarLetter && (
              <Avatar
                sx={{
                  bgcolor: avatarColor,
                  ..._card?._avatar?.sx,
                }}
                aria-label="avatar"
              >
                {avatarLetter}
              </Avatar>
            )
          }
          title={
            <Typography
              title={title}
              sx={{
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '24px',
                whiteSpace: 'wrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                ..._card?._titleText?.sx,
              }}
            >
              {title}
            </Typography>
          }
          subheader={
            subheader && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '14px',
                  color: 'text.secondary',
                  ..._card?._subheaderText?.sx,
                }}
              >
                {subheader}
              </Typography>
            )
          }
        />

        {content && (
          <CardContent sx={{ pt: 0.5, pb: 0, ..._card?._cardContent?.sx }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '20px',
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                ..._card?._contentText?.sx,
              }}
            >
              {content}
            </Typography>
          </CardContent>
        )}

        {children && (
          <CardContent sx={{ ..._card?._childrenContent?.sx }}>
            {children}
          </CardContent>
        )}
      </Box>
    </Card>
  );
};

const StatusBar: React.FC<StatusProps> = ({ trackProgress, status, type }) => {
  const theme = useTheme();

  const getStatusIcon = () => {
    switch (status) {
      case 'Completed':
        return (
          <CheckCircleIcon
            sx={{ color: theme.palette.success.main, fontSize: '16px' }}
          />
        );
      case 'Enrolled, not started':
      case 'Not Started':
        return (
          <ErrorIcon
            sx={{ color: theme.palette.warning.main, fontSize: '16px' }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        ...(type === 'Course' ? { top: 0 } : { bottom: 0 }),
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          pl: type === 'Course' ? '6px' : '8px',
          pr: '8px',
          py: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {type === 'Course' ? (
          <CircularProgressWithLabel
            value={trackProgress ?? 0}
            _text={{
              sx: {
                color: [
                  'Completed',
                  'In Progress',
                  'Enrolled, not started',
                ].includes(status ?? '')
                  ? theme.palette.success.main
                  : theme.palette.common.white,
                fontSize: '10px',
              },
            }}
            color={
              ['Completed', 'In Progress', 'Enrolled, not started'].includes(
                status ?? ''
              )
                ? 'success'
                : 'inherit'
            }
            size={35}
            thickness={2}
          />
        ) : null}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {getStatusIcon()}
          <Typography
            variant="caption"
            sx={{
              fontSize: '12px',
              fontWeight: 'bold',
              lineHeight: '16px',
              letterSpacing: '0.1px',
              color: [
                'Completed',
                'In Progress',
                'Enrolled, not started',
              ].includes(status ?? '')
                ? theme.palette.success.main
                : theme.palette.common.white,
            }}
          >
            {status}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
