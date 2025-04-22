import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Box,
  IconButton,
  ListSubheader,
  Collapse,
  useTheme
} from '@mui/material';
import { ChevronLeft, ExpandLess, ExpandMore } from '@mui/icons-material';

const TableOfContents = ({
  open,
  onClose,
  chapters,
  currentChapter,
  currentPage,
  onSelect,
  theme
}) => {
  const muiTheme = useTheme();
  const isDarkMode = theme === 'dark';
  const [expandedChapters, setExpandedChapters] = React.useState({});

  // Dynamic styles based on theme
  const drawerBackground = isDarkMode
    ? 'linear-gradient(to bottom, #1e1e1e, #212121)'
    : 'linear-gradient(to bottom, #f8f8f8, #fff)';

  const borderColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)';
  const selectedBgColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  const headerColor = isDarkMode ? '#b0b0b0' : '#555';

  React.useEffect(() => {
    // Initialize with current chapter expanded
    if (currentChapter !== undefined) {
      setExpandedChapters(prev => ({ ...prev, [currentChapter]: true }));
    }
  }, [currentChapter]);

  const handleChapterToggle = (index) => {
    setExpandedChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundImage: drawerBackground,
          color: 'text.primary',
          transition: 'background-image 0.3s ease',
        },
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderBottom: `1px solid ${borderColor}`
      }}>
        <Typography
          variant="h6"
          sx={{
            flex: 1,
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold'
          }}
        >
          Symptoms
        </Typography>
        <IconButton onClick={onClose} color="inherit">
          <ChevronLeft />
        </IconButton>
      </Box>

      <List
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
          pt: 0
        }}
        component="nav"
        subheader={
          <ListSubheader
            component="div"
            sx={{
              bgcolor: 'background.paper',
              fontFamily: 'Georgia, serif',
              fontSize: '1rem',
              color: headerColor,
              transition: 'color 0.3s ease'
            }}
          >
            Table of Contents
          </ListSubheader>
        }
      >
        {chapters.map((chapter, chapterIndex) => (
          <React.Fragment key={chapterIndex}>
            <ListItemButton
              onClick={() => handleChapterToggle(chapterIndex)}
              selected={chapterIndex === currentChapter}
              sx={{
                pl: 2,
                '&.Mui-selected': {
                  bgcolor: selectedBgColor,
                }
              }}
            >
              <ListItemText
                primary={chapter.title}
                primaryTypographyProps={{
                  fontFamily: 'Georgia, serif',
                  fontWeight: chapterIndex === currentChapter ? 'bold' : 'normal'
                }}
              />
              {expandedChapters[chapterIndex] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={expandedChapters[chapterIndex]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {chapter.pages.map((page, pageIndex) => (
                  <ListItemButton
                    key={pageIndex}
                    sx={{ pl: 4 }}
                    selected={chapterIndex === currentChapter && pageIndex === currentPage}
                    onClick={() => onSelect(chapterIndex, pageIndex)}
                  >
                    <ListItemText
                      primary={page.title || `Page ${pageIndex + 1}`}
                      primaryTypographyProps={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.9rem',
                        fontWeight: (chapterIndex === currentChapter && pageIndex === currentPage) ? 'bold' : 'normal'
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            {chapterIndex < chapters.length - 1 && <Divider sx={{ bgcolor: borderColor }} />}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default TableOfContents;
