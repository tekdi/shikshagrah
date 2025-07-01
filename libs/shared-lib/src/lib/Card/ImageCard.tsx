import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShareIcon from '@mui/icons-material/Share';

interface ItemData {
  img: string;
  title: string;
  author: string;
  rows?: number;
  cols?: number;
  featured?: boolean;
}

const itemData: ItemData[] = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
    author: '@bkristastucchio',
    rows: 2,
    cols: 2,
    featured: true,
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
    author: '@rollelflex_graphy726',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    author: '@helloimnik',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
    author: '@nolanissac',
    cols: 2,
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
    author: '@hjrc33',
    cols: 2,
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
    author: '@arwinneil',
    rows: 2,
    cols: 2,
    featured: true,
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
    author: '@tjdragotta',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
    author: '@katie_wasserman',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
    author: '@silverdalex',
    rows: 2,
    cols: 2,
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
    author: '@shelleypauls',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
    author: '@peterlaster',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Bike',
    author: '@southside_customs',
    cols: 2,
  },
];

interface ImageCardProps {
  showAvatar?: boolean;
  showIcons?: boolean;
}

export const ImageCard = ({
  showAvatar = false,
  showIcons = false,
}: ImageCardProps): JSX.Element => {
  return (
    <ImageList>
      <ImageListItem key="Subheader" cols={2}>
        {/* <ListSubheader component="div">December</ListSubheader> */}
      </ImageListItem>
      {itemData.map((item) => (
        <ImageListItem key={item.img}>
          <img
            srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
            src={`${item.img}?w=248&fit=crop&auto=format`}
            alt={item.title}
            loading="lazy"
          />

          <ImageListItemBar
            sx={{
              background: showAvatar ? 'none' : 'rgba(0, 0, 0, 0.6)',
              backdropFilter: showAvatar ? 'none' : 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingX: 1,
            }}
            position={showAvatar ? undefined : 'below'}
            title={
              showAvatar ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent={'center'}
                  flexGrow={1}
                >
                  <Avatar
                    src={item.title}
                    alt={item.title}
                    sx={{ width: 30, height: 30, marginRight: 1 }}
                  />
                  <Box
                    sx={{
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </Box>
                </Box>
              ) : (
                item.title
              )
            }
            subtitle={showAvatar ? undefined : `by: ${item.author}`}
            actionIcon={
              !showAvatar && (
                <Box display="flex">
                  <IconButton sx={{ color: 'white' }} aria-label="favorite">
                    <StarBorderIcon />
                  </IconButton>
                  <IconButton sx={{ color: 'white' }} aria-label="share">
                    <ShareIcon />
                  </IconButton>
                </Box>
              )
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

//  <ImageCard showAvatar={true} showIcons={true} />

//  <ImageCard showAvatar={false} showIcons={false} />
