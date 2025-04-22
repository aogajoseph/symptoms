import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  Slide,
  useTheme, 
  useMediaQuery
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSpring, animated } from '@react-spring/web';
import Page from './Page';
import TableOfContents from './TableOfContents';
import { chapters } from '../data/bookContent';

const Book = ({ onToggleTheme, currentTheme }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [direction, setDirection] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  const [lastReadPage, setLastReadPage] = useState(() => {
    const savedPage = localStorage.getItem('lastReadPage');
    return savedPage ? parseInt(savedPage, 10) : 0;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  const bookRef = useRef(null);
  const pageFlipSound = useRef(new Audio('/page-flip.mp3'));
  const bookmarkSound = useRef(new Audio('/bookmark.mp3'));

  // Load the audio files
  useEffect(() => {
    // Create audio elements
    const pageFlip = new Audio();
    pageFlip.src = 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3';
    pageFlipSound.current = pageFlip;

    const bookmark = new Audio();
    bookmark.src = 'https://cdn.freesound.org/previews/411/411460_5121236-lq.mp3';
    bookmarkSound.current = bookmark;

    // Preload audio
    pageFlip.load();
    bookmark.load();
  }, []);

  // Save bookmarks and last read page to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('lastReadPage', currentPage.toString());
    setLastReadPage(currentPage);
  }, [currentPage]);

  // On initial load, check if there's a last read page
  useEffect(() => {
    if (lastReadPage > 0 && currentPage === 0) {
      showAlert(`Resuming from page ${lastReadPage + 1}`, 'info');
      setCurrentPage(lastReadPage);
    }
  }, []);

  const totalPages = chapters.reduce((sum, chapter) => sum + chapter.pages.length, 0);

  // Find chapter and page info based on current page index
  const getCurrentChapterAndPage = () => {
    let pageCount = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (currentPage < pageCount + chapters[i].pages.length) {
        return {
          chapterIndex: i,
          pageInChapter: currentPage - pageCount,
          chapterTitle: chapters[i].title
        };
      }
      pageCount += chapters[i].pages.length;
    }
    return { chapterIndex: 0, pageInChapter: 0, chapterTitle: chapters[0].title };
  };

  const { chapterIndex, pageInChapter, chapterTitle } = getCurrentChapterAndPage();
  const currentContent = chapters[chapterIndex].pages[pageInChapter];

  // Function to show alert
  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  // Animation for page turning
  const pageAnimation = useSpring({
    transform: direction === 'next'
      ? `perspective(1200px) rotateY(${currentPage === totalPages - 1 ? 0 : -180}deg)`
      : direction === 'prev'
        ? `perspective(1200px) rotateY(${currentPage === 0 ? 0 : 180}deg)`
        : 'perspective(1200px) rotateY(0deg)',
    from: {
      transform: direction === 'next'
        ? 'perspective(1200px) rotateY(0deg)'
        : direction === 'prev'
          ? 'perspective(1200px) rotateY(0deg)'
          : 'perspective(1200px) rotateY(0deg)'
    },
    config: { mass: 5, tension: 500, friction: 80 },
    onRest: () => setDirection(null),
  });

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection('next');
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage + 1);
        try {
          pageFlipSound.current.currentTime = 0;
          pageFlipSound.current.play();
        } catch (err) {
          console.error("Error playing sound:", err);
        }
      }, 300);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setDirection('prev');
      setTimeout(() => {
        setCurrentPage(prevPage => prevPage - 1);
        try {
          pageFlipSound.current.currentTime = 0;
          pageFlipSound.current.play();
        } catch (err) {
          console.error("Error playing sound:", err);
        }
      }, 300);
    }
  };

  const goToPage = (chapterIdx, pageIdx) => {
    let targetPage = 0;
    for (let i = 0; i < chapterIdx; i++) {
      targetPage += chapters[i].pages.length;
    }
    targetPage += pageIdx;

    if (targetPage !== currentPage) {
      setDirection(targetPage > currentPage ? 'next' : 'prev');
      setTimeout(() => {
        setCurrentPage(targetPage);
        try {
          pageFlipSound.current.currentTime = 0;
          pageFlipSound.current.play();
        } catch (err) {
          console.error("Error playing sound:", err);
        }
      }, 300);
    }
    setDrawerOpen(false);
  };

  // Bookmark functionality
  const isCurrentPageBookmarked = bookmarks.some(bookmark => bookmark.page === currentPage);

  const toggleBookmark = () => {
    if (isCurrentPageBookmarked) {
      setBookmarks(bookmarks.filter(bookmark => bookmark.page !== currentPage));
      showAlert('Bookmark removed');
    } else {
      const { chapterTitle } = getCurrentChapterAndPage();
      const newBookmark = {
        page: currentPage,
        chapterTitle,
        pageTitle: currentContent.title || `Page ${pageInChapter + 1}`,
        date: new Date().toISOString()
      };
      setBookmarks([...bookmarks, newBookmark]);
      showAlert('Bookmark added');
    }

    try {
      bookmarkSound.current.currentTime = 0;
      bookmarkSound.current.play();
    } catch (err) {
      console.error("Error playing bookmark sound:", err);
    }
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    chapters.forEach((chapter, chapterIdx) => {
      chapter.pages.forEach((page, pageIdx) => {
        const content = [
          page.title,
          page.subtitle,
          ...(page.paragraphs || [])
        ].filter(Boolean).join(' ').toLowerCase();

        if (content.includes(query)) {
          let globalPageIdx = 0;
          for (let i = 0; i < chapterIdx; i++) {
            globalPageIdx += chapters[i].pages.length;
          }
          globalPageIdx += pageIdx;

          results.push({
            chapterTitle: chapter.title,
            pageTitle: page.title || `Page ${pageIdx + 1}`,
            page: globalPageIdx,
            excerpt: findExcerpt(content, query)
          });
        }
      });
    });

    setSearchResults(results);
  };

  const findExcerpt = (content, query) => {
    const index = content.indexOf(query);
    if (index === -1) return '';

    const start = Math.max(0, index - 40);
    const end = Math.min(content.length, index + query.length + 40);
    let excerpt = content.substring(start, end);

    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';

    return excerpt;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Navigate to search result
  const goToSearchResult = (page) => {
    goToPage(
      getCurrentChapterAndPageFromGlobalIndex(page).chapterIndex,
      getCurrentChapterAndPageFromGlobalIndex(page).pageInChapter
    );
    setSearchOpen(false);
  };

  // Get chapter and page from global page index
  const getCurrentChapterAndPageFromGlobalIndex = (globalIndex) => {
    let pageCount = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (globalIndex < pageCount + chapters[i].pages.length) {
        return {
          chapterIndex: i,
          pageInChapter: globalIndex - pageCount
        };
      }
      pageCount += chapters[i].pages.length;
    }
    return { chapterIndex: 0, pageInChapter: 0 };
  };

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      backgroundColor: 'background.default',
      color: 'text.primary',
      overflow: 'hidden',
    }}>
      <TableOfContents
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chapters={chapters}
        currentChapter={chapterIndex}
        currentPage={pageInChapter}
        onSelect={goToPage}
        theme={currentTheme}
      />

      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}>
        
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => setDrawerOpen(true)} size="small">
              <MenuIcon fontSize="small" />
            </IconButton>

            <Typography
              variant="h6"
              component="div"
              sx={{
                ml: { xs: 1, sm: 2 }
              }}
            >
              {chapterTitle}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={isCurrentPageBookmarked ? "Remove bookmark" : "Add bookmark"}>
              <IconButton onClick={toggleBookmark} color={isCurrentPageBookmarked ? "primary" : "default"} size="small">
                {isCurrentPageBookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="View all bookmarks">
              <IconButton onClick={() => setBookmarkDialogOpen(true)} size="small">
                <BookmarkIcon fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {bookmarks.length}
                </Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title={currentTheme === 'light' ? "Switch to dark mode" : "Switch to light mode"}>
              <IconButton onClick={onToggleTheme} size="small">
                {currentTheme === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Search">
              <IconButton onClick={() => setSearchOpen(true)} size="small">
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box
          ref={bookRef}
          sx={{
            width: '100%',
            maxWidth: 800,
            height: '80vh',
            perspective: '1200px',
            position: 'relative',
          }}
        >
          <animated.div
            style={{
              ...pageAnimation,
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%',
            }}
          >
            <Page
              content={currentContent}
              theme={currentTheme}
            />
          </animated.div>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <IconButton onClick={prevPage} disabled={currentPage === 0}>
            <ChevronLeft />
          </IconButton>
          <Typography>
            {currentPage + 1} / {totalPages}
          </Typography>
          <IconButton onClick={nextPage} disabled={currentPage === totalPages - 1}>
            <ChevronRight />
          </IconButton>
        </Stack>
      </Box>

      {/* Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Search
          <IconButton
            aria-label="close"
            onClick={() => setSearchOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="search"
            label="Search book content"
            type="text"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="search book"
                    onClick={handleSearch}
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {searchResults.length > 0 && (
            <List sx={{ mt: 2 }}>
              {searchResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    button
                    onClick={() => goToSearchResult(result.page)}
                    alignItems="flex-start"
                  >
                    <ListItemText
                      primary={`${result.pageTitle} (${result.chapterTitle})`}
                      secondary={result.excerpt}
                      primaryTypographyProps={{
                        fontWeight: 'bold',
                      }}
                    />
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
          {searchQuery && searchResults.length === 0 && (
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>
              No results found for "{searchQuery}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Bookmarks Dialog */}
      <Dialog
        open={bookmarkDialogOpen}
        onClose={() => setBookmarkDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Your Bookmarks
          <IconButton
            aria-label="close"
            onClick={() => setBookmarkDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {bookmarks.length > 0 ? (
            <List>
              {bookmarks
                .sort((a, b) => a.page - b.page)
                .map((bookmark, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      button
                      onClick={() => {
                        goToPage(
                          getCurrentChapterAndPageFromGlobalIndex(bookmark.page).chapterIndex,
                          getCurrentChapterAndPageFromGlobalIndex(bookmark.page).pageInChapter
                        );
                        setBookmarkDialogOpen(false);
                      }}
                    >
                      <ListItemText
                        primary={bookmark.pageTitle}
                        secondary={`${bookmark.chapterTitle} - Page ${bookmark.page + 1}`}
                      />
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookmarks(bookmarks.filter((_, i) => i !== index));
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </ListItem>
                    {index < bookmarks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
            </List>
          ) : (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>
              You haven't added any bookmarks yet. Click the bookmark icon while reading to save your spot.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookmarkDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity={alertSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Book;
