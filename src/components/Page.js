import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';

const Page = ({ content, theme }) => {
  const muiTheme = useTheme();
  const isDarkMode = theme === 'dark';

  // Dynamic styles based on theme
  const pageBackground = isDarkMode
    ? 'linear-gradient(to right, #1a1a1a, #212121, #1a1a1a)'
    : 'linear-gradient(to right, #f5f5f5, #fff, #f5f5f5)';

  const scrollbarTrackColor = isDarkMode ? '#333' : '#f1f1f1';
  const scrollbarThumbColor = isDarkMode ? '#555' : '#888';

  const textColor = isDarkMode ? '#e0e0e0' : '#333';
  const titleColor = isDarkMode ? '#f5f5f5' : '#222';
  const subtitleColor = isDarkMode ? '#bdbdbd' : '#555';
  const borderColor = isDarkMode ? '#444' : '#ccc';
  const footerColor = isDarkMode ? '#757575' : '#888';

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: '5px',
        background: pageBackground,
        position: 'absolute',
        padding: 4,
        overflow: 'auto',
        backfaceVisibility: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isDarkMode
          ? '0 0 15px rgba(0,0,0,0.4)'
          : '0 0 15px rgba(0,0,0,0.2)',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: scrollbarTrackColor,
        },
        '&::-webkit-scrollbar-thumb': {
          background: scrollbarThumbColor,
          borderRadius: '4px',
        },
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
      className="book-page"
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        fontFamily: 'Georgia, serif',
        lineHeight: 1.6,
        color: textColor,
      }}>
        {content && (
          <>
            {content.title && (
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontFamily: 'Georgia, serif',
                  fontWeight: 'bold',
                  color: titleColor,
                  borderBottom: `1px solid ${borderColor}`,
                  paddingBottom: 1,
                  marginBottom: 2,
                  transition: 'color 0.3s ease, border-color 0.3s ease',
                }}
              >
                {content.title}
              </Typography>
            )}
            {content.subtitle && (
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  color: subtitleColor,
                  marginBottom: 2,
                  transition: 'color 0.3s ease',
                }}
              >
                {content.subtitle}
              </Typography>
            )}
            {content.paragraphs && content.paragraphs.map((paragraph, index) => (
              <Typography
                key={index}
                paragraph
                sx={{
                  marginBottom: 2,
                  color: textColor,
                  transition: 'color 0.3s ease',
                }}
              >
                {paragraph}
              </Typography>
            ))}
          </>
        )}
      </Box>
      <Box
        sx={{
          marginTop: 'auto',
          alignSelf: 'center',
          color: footerColor,
          fontSize: '0.8rem',
          fontStyle: 'italic',
          transition: 'color 0.3s ease',
        }}
      >
        — Symptoms —
      </Box>
    </Paper>
  );
};

export default Page;
