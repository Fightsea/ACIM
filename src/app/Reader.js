import React, { useState, useMemo, useRef } from 'react';
import { useUpdateEffect } from 'react-use';
import { useDebouncedCallback } from 'use-debounce';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MenuIcon from '@mui/icons-material/Menu';
import NotesIcon from '@mui/icons-material/Notes';
import SearchIcon from '@mui/icons-material/Search';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import useContent from '../raw/useContent';
import { generateParagraphId, parseParagraphId, parseHtmlSentence } from '../raw/utils';
import { Translation, TranslationColor, TranslationColorDark } from './Def';
import Dictionary from './Dictionary';
import MobileNavDrawer from './MobileNavDrawer';

const TranslationKeys = Object.keys(Translation) ?? [];

export default function Reader() {
  const sentencesRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [volume, setVolume] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [section, setSection] = useState(null);
  const [paragraph, setParagraph] = useState(null);
  const [translation, setTranslation] = useState('_EN');
  const [secondTranslation, setSecondTranslation] = useState('_NONE');
  const [thirdTranslation, setThirdTranslation] = useState('_NONE');
  const [availableTranslations, setAvailableTranslations] = useState(TranslationKeys);

  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedwordAnchorEl, setSelectedWordAnchorEl] = useState(null);
  const [searchID, setSearchID] = useState('');

  const { volumes, chapters, sections, paragraphs, sentences, showSection, showParagraph, ready, lastRead, editNote, toggleHighlight } =
    useContent({
      volume,
      chapter,
      section,
      paragraph,
    });

  const chapterOptions = useMemo(() => {
    const keys = Object.keys(chapters);
    if (keys.includes('in')) {
      keys.splice(keys.indexOf('in'), 1);
      return ['in', ...keys];
    } else {
      return keys;
    }
  }, [chapters]);

  const sectionOptions = useMemo(() => {
    const keys = Object.keys(sections);
    if (keys.includes('in')) {
      keys.splice(keys.indexOf('in'), 1);
      return ['in', ...keys];
    } else {
      return keys;
    }
  }, [sections]);

  const handleVolumeChange = (e, value) => {
    setVolume(value);
    if (value && lastRead?.[value]) {
      const { c, s, p } = parseParagraphId(lastRead[value]);
      setChapter(c);
      setSection(s);
      setParagraph(p);
    } else {
      setChapter(null);
      setSection(null);
      setParagraph(null);
    }
  };

  const handleChapterChange = (e, value) => {
    setChapter(value);
    setSection(null);
    let p = null;
    if (
      volume === 'Preface' ||
      volume === 'C' ||
      (volume === 'M' && !['4', '5'].includes(value)) ||
      (volume === 'P' && value === '1') ||
      value.endsWith('in') ||
      value.endsWith('ep')
    ) {
      p = '1';
    }
    setParagraph(p);
  };

  const handleSectionChange = (e, value) => {
    let p = value ? '1' : null;
    if (volume === 'T') {
      switch (value) {
        // T-2.
        case 'V-A':
          p = '11';
          break;
        // T-19.
        case 'IV-A-i':
          p = '10';
          break;
        case 'IV-B-i':
          p = '9';
          break;
        case 'IV-C-i':
          p = '3';
          break;
        case 'IV-D-i':
          p = '8';
          break;
        default:
          break;
      }
    } else if (volume === 'M') {
      if (chapter === '4' && value === 'I-A') {
        p = '3';
      }
    }
    setSection(value);
    setParagraph(p);
  };

  const handleParagraphChange = (e, value) => {
    setParagraph(value);
    sentencesRef.current.scrollTo(0, 0); // back to top
  };

  const handleTranChange = (e, value) => {
    setTranslation(value);
    if (value === secondTranslation) {
      setSecondTranslation('_NONE');
    }
    if (value === thirdTranslation) {
      setThirdTranslation('_NONE');
    }
  };

  const handleSecTranChange = (e, value) => setSecondTranslation(value);
  const handleThirdTranChange = (e, value) => setThirdTranslation(value);
  const handleAvailableTranslationsChange = (e, value) => setAvailableTranslations(value);
  const handleSelectWord = e => {
    const w = window.getSelection().toString().trim();
    setSelectedWord(Boolean(w) ? w : null);
    setSelectedWordAnchorEl(Boolean(e) ? e.target : null);
  };

  const handleSearchID = () => {
    if (searchID) {
      const id = searchID.trim().endsWith('.') ? searchID : `${searchID}.`;
      const { v, c, s, p } = parseParagraphId(id);
      if (v && c) {
        setVolume(v);
        setChapter(c);
        setSection(s);
        setParagraph(p);
      }
    }
  };

  useUpdateEffect(() => {
    if (!paragraph) {
      handleSectionChange(null, sectionOptions[0] ?? null);
    }
  }, [sectionOptions, paragraph]);

  if (!ready) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress size={30} sx={{ mr: 2 }} />
        <Typography variant='h5'>Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      {isMobile && (
        <React.Fragment key='mobile-controls'>
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton onClick={() => setMobileOpen(true)} size='large'>
              <MenuIcon />
            </IconButton>
          </Box>
          <MobileNavDrawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            volumes={volumes}
            chapter={chapter}
            onChapterChange={handleChapterChange}
            chapterOptions={chapterOptions}
            chapters={chapters}
            section={section}
            onSectionChange={handleSectionChange}
            sectionOptions={sectionOptions}
            sections={sections}
            showSection={showSection}
            paragraph={paragraph}
            onParagraphChange={handleParagraphChange}
            paragraphs={paragraphs}
            showParagraph={showParagraph}
            translation={translation}
            onTranslationChange={handleTranChange}
            secondTranslation={secondTranslation}
            onSecondTranslationChange={handleSecTranChange}
            thirdTranslation={thirdTranslation}
            onThirdTranslationChange={handleThirdTranChange}
            availableTranslations={availableTranslations}
            Translation={Translation}
            searchID={searchID}
            onSearchIDChange={setSearchID}
            onSearch={handleSearchID}
          />
        </React.Fragment>
      )}
      <Grid
        container
        rowSpacing={isMobile ? 0 : 2}
        columnSpacing={isMobile ? 0 : 1}
        sx={{
          m: isMobile ? 0 : 1,
          width: isMobile ? '100%' : 1024,
          mt: isMobile ? 0 : 1,
          px: isMobile ? 1 : 0,
        }}
      >
        {!isMobile && (
          <React.Fragment key='desktop-nav'>
            <Grid item xs={6}>
              <Autocomplete
                disablePortal
                disableClearable
                id='volume'
                options={Object.keys(volumes)}
                value={volume}
                renderInput={params => <TextField {...params} label='Volume' />}
                renderOption={(props, opt) => <li {...props} key={props.key}>{`${volumes[opt][translation] ?? ''}`}</li>}
                getOptionLabel={opt => `${volumes[opt][translation] ?? ''}`}
                onChange={handleVolumeChange}
              />
            </Grid>

            <Grid item xs={3}></Grid>

            <Grid item xs={3}>
              <TextField
                fullWidth
                label='Search by ID'
                value={searchID}
                onChange={e => setSearchID(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handleSearchID} edge='end'>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={volume === 'W' ? 4 : 6}>
              <Autocomplete
                disablePortal
                disableClearable
                id='chapter'
                options={chapterOptions}
                value={chapter}
                renderInput={params => <TextField {...params} label='Chapter' />}
                renderOption={(props, opt) => (
                  <li {...props} key={props.key}>
                    {`${['-', 'r'].some(i => opt.includes(i)) ? '　' : ''}${chapters[opt][translation] ?? `${volume}-${opt}.`}`}
                  </li>
                )}
                getOptionLabel={opt => chapters[opt][translation] ?? `${volume}-${opt}.`}
                getOptionDisabled={opt => volume === 'W' && ['pI', 'pII'].includes(opt)}
                onChange={handleChapterChange}
              />
            </Grid>

            <Grid item xs={volume === 'W' ? 8 : 6}>
              {showSection && (
                <Autocomplete
                  disablePortal
                  disableClearable
                  id='section'
                  options={sectionOptions}
                  value={section}
                  renderInput={params => <TextField {...params} label='Section' />}
                  renderOption={(props, opt) => (
                    <li {...props} key={props.key}>
                      {`${['-A', '-B', '-C', '-D'].some(t => opt.endsWith(t)) ? '　' : ''}${opt.endsWith('-i') ? '　　' : ''}${
                        sections[opt][translation] ?? `${volume}-${chapter}.${opt}.`
                      }`}
                    </li>
                  )}
                  getOptionLabel={opt => sections[opt][translation] ?? `${volume}-${chapter}.${opt}.`}
                  onChange={handleSectionChange}
                />
              )}
            </Grid>

            <Grid item xs={2}>
              {showParagraph && (
                <Autocomplete
                  disablePortal
                  disableClearable
                  id='paragraph'
                  options={Object.keys(paragraphs)}
                  value={paragraph}
                  renderInput={params => <TextField {...params} label='Paragraph' />}
                  renderOption={(props, opt) => (
                    <li {...props} key={props.key}>
                      {generateParagraphId({ v: volume, c: chapter, s: section, p: opt })}
                    </li>
                  )}
                  getOptionLabel={opt => generateParagraphId({ v: volume, c: chapter, s: section, p: opt })}
                  onChange={handleParagraphChange}
                />
              )}
            </Grid>

            <Grid item xs={2}>
              <Autocomplete
                disablePortal
                disableClearable
                id='translation'
                options={availableTranslations}
                value={translation}
                renderInput={params => <TextField {...params} label='Translation' />}
                renderOption={(props, opt) => <li {...props} key={props.key}>{`${Translation[opt]}`}</li>}
                getOptionLabel={opt => `${Translation[opt]}`}
                onChange={handleTranChange}
              />
            </Grid>

            <Grid item xs={2}>
              <Autocomplete
                disablePortal
                disableClearable
                id='secondTranslation'
                options={['_NONE', ...availableTranslations.filter(t => t !== translation)]}
                value={secondTranslation}
                renderInput={params => <TextField {...params} label='Second Translation' />}
                renderOption={(props, opt) => <li {...props} key={props.key}>{`${Translation[opt] ?? 'None'}`}</li>}
                getOptionLabel={opt => `${Translation[opt] ?? 'None'}`}
                onChange={handleSecTranChange}
              />
            </Grid>

            <Grid item xs={2}>
              <Autocomplete
                disablePortal
                disableClearable
                id='thirdTranslation'
                options={['_NONE', ...availableTranslations.filter(t => ![translation, secondTranslation].includes(t))]}
                value={thirdTranslation}
                renderInput={params => <TextField {...params} label='Third Translation' />}
                renderOption={(props, opt) => <li {...props} key={props.key}>{`${Translation[opt] ?? 'None'}`}</li>}
                getOptionLabel={opt => `${Translation[opt] ?? 'None'}`}
                onChange={handleThirdTranChange}
              />
            </Grid>

            <Grid item xs={4}>
              {/* <Autocomplete
            multiple
            disablePortal
            disableClearable
            id='availableTranslations'
            options={TranslationKeys}
            value={availableTranslations}
            renderInput={params => <TextField {...params} label='Available Translation' />}
            renderOption={(props, opt) => <li {...props} key={props.key}>{`${Translation[opt]}`}</li>}
            onChange={handleAvailableTranslationsChange}
            renderTags={(value, getTagProps) =>
              value.map((opt, index) => (
                <Chip variant='outlined' label={Translation[opt]} {...getTagProps({ index })} key={`availableTranslations-${opt}`} />
              ))
            }
          /> */}
            </Grid>
          </React.Fragment>
        )}

        <Grid item xs={12}>
          <Paper
            ref={sentencesRef}
            elevation={3}
            sx={{
              color: 'text.secondary',
              bgcolor: prefersDarkMode ? 'Black' : 'inherit',
              overflow: 'auto',
              height: isMobile ? 'calc(100vh - 80px)' : 540,
              pt: 1,
              mb: isMobile ? 2 : 0,
            }}
          >
            {sentences.map((s, idx) => (
              <Sentence
                key={`sentences-${idx}`}
                sentence={s}
                translation={translation}
                secondTranslation={secondTranslation}
                thirdTranslation={thirdTranslation}
                availableTranslations={availableTranslations}
                onSelectWord={handleSelectWord}
                onEditNote={note => editNote(idx + 1, note)}
                onToggleHighlight={() => toggleHighlight(idx + 1)}
              />
            ))}
          </Paper>
        </Grid>
      </Grid>
      <Dictionary word={selectedWord} anchorEl={selectedwordAnchorEl} onClose={() => handleSelectWord(null)} mobile={isMobile} />
    </>
  );
}

function Sentence({
  sentence,
  translation,
  secondTranslation,
  thirdTranslation,
  availableTranslations,
  onSelectWord,
  onEditNote,
  onToggleHighlight,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const isHighlighted = Boolean(sentence._highlight);
  const note = sentence._note;

  const [isEditing, setIsEditing] = useState(false);
  const [mobileTransOpen, setMobileTransOpen] = useState(false);
  const debounced = useDebouncedCallback(value => onEditNote(value), 1000);

  const handleTap = e => {
    if (isMobile) {
      let range;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      }

      if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        selection.modify('move', 'backward', 'word');
        selection.modify('extend', 'forward', 'word');

        const word = selection.toString().trim();
        if (word) {
          onSelectWord(e);
        }
      }
    }
  };

  return (
    <>
      <ListItem
        sx={{
          p: 0,
          mb: 1,
          color: isHighlighted ? 'Black' : 'inherit',
          bgcolor: isHighlighted ? (prefersDarkMode ? 'Gray' : 'Linen') : 'inherit',
          '&:hover': { color: 'Black', bgcolor: prefersDarkMode ? 'DarkGray' : 'LemonChiffon' },
          '& .MuiListItemSecondaryAction-root': { right: '8px' },
        }}
        secondaryAction={
          <>
            <IconButton
              onClick={onToggleHighlight}
              sx={{
                color: isHighlighted ? (prefersDarkMode ? 'SaddleBrown' : 'DarkGoldenRod') : 'inherit',
                opacity: isHighlighted ? 1 : prefersDarkMode ? 0.25 : 0.15,
                '&:hover': { opacity: 1 },
              }}
            >
              {isHighlighted ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
            <Tooltip
              arrow
              placement='right-start'
              slotProps={{
                tooltip: {
                  sx: { '&.MuiTooltip-tooltipArrow': { minWidth: 380, maxWidth: 580, bgcolor: prefersDarkMode ? 'DimGray' : 'DarkKhaki' } },
                },
              }}
              title={
                !isMobile ? (
                  <Multilingual sentence={sentence} availableTranslations={availableTranslations} onSelectWord={onSelectWord} />
                ) : null
              }
            >
              <IconButton
                onClick={() => (isMobile ? setMobileTransOpen(true) : setIsEditing(true))}
                sx={{ color: isHighlighted ? (prefersDarkMode ? 'SaddleBrown' : 'DarkGoldenRod') : 'inherit' }}
              >
                <NotesIcon />
              </IconButton>
            </Tooltip>
          </>
        }
      >
        <Stack direction={'column'}>
          <Typography variant='h6' sx={{ pl: 2, pr: 12, fontWeight: 500 }} onMouseUp={onSelectWord} onClick={handleTap}>
            {parseHtmlSentence(sentence, translation)}
          </Typography>
          {secondTranslation !== '_NONE' && (
            <Typography variant='h6' sx={{ pl: 2, pr: 12, fontWeight: 500 }} onMouseUp={onSelectWord} onClick={handleTap}>
              {parseHtmlSentence(sentence, secondTranslation)}
            </Typography>
          )}
          {thirdTranslation !== '_NONE' && (
            <Typography variant='h6' sx={{ pl: 2, pr: 12, fontWeight: 500 }} onMouseUp={onSelectWord} onClick={handleTap}>
              {parseHtmlSentence(sentence, thirdTranslation)}
            </Typography>
          )}
        </Stack>
      </ListItem>
      {isMobile && (
        <SwipeableDrawer
          anchor='bottom'
          open={mobileTransOpen}
          onClose={() => setMobileTransOpen(false)}
          onOpen={() => setMobileTransOpen(true)}
          disableSwipeToOpen={false}
          PaperProps={{
            sx: {
              borderRadius: '16px 16px 0 0',
              maxHeight: '60vh',
              bgcolor: prefersDarkMode ? 'rgb(30,30,30)' : 'white',
            },
          }}
        >
          <Box sx={{ p: 2, pb: 4 }}>
            <Box
              sx={{ width: 40, height: 4, bgcolor: 'grey.400', borderRadius: 2, mx: 'auto', mb: 2 }}
              onClick={() => setMobileTransOpen(false)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Chip
                icon={<EditIcon />}
                label={translation === '_EN' ? 'Edit Note' : '編輯筆記'}
                onClick={() => {
                  setMobileTransOpen(false);
                  setIsEditing(true);
                }}
                variant='outlined'
                sx={{ width: '100%' }}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Multilingual sentence={sentence} availableTranslations={availableTranslations} onSelectWord={onSelectWord} />
          </Box>
        </SwipeableDrawer>
      )}
      {!isEditing && note && (
        <Typography variant='subtitle2' sx={{ mt: -1, pl: 8, pr: 16, color: 'RosyBrown' }}>
          {note}
          <Tooltip arrow title={translation === '_EN' ? 'Edit' : '編輯'}>
            <IconButton sx={{ opacity: 0.15, '&:hover': { opacity: 1 } }} onClick={() => setIsEditing(true)}>
              <EditIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={translation === '_EN' ? 'Delete' : '刪除'}>
            <IconButton sx={{ ml: -1.5, opacity: 0.15, '&:hover': { opacity: 1, color: 'FireBrick' } }} onClick={() => debounced('')}>
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Typography>
      )}
      {isEditing && (
        <ClickAwayListener onClickAway={() => setIsEditing(false)}>
          <TextField
            variant='standard'
            sx={{ ml: 8, mb: 1, width: '80%' }}
            multiline
            maxRows={2}
            placeholder='Write notes here ...'
            defaultValue={note ?? ''}
            onChange={e => debounced(e.target.value)}
          />
        </ClickAwayListener>
      )}
    </>
  );
}

function Multilingual({ sentence, availableTranslations, onSelectWord }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const transColor = prefersDarkMode ? TranslationColorDark : TranslationColor;

  return (
    <Card sx={{ bgcolor: prefersDarkMode ? 'DarkGray' : 'Ivory', maxHeight: 800, overflow: 'auto' }}>
      <CardContent>
        <Stack direction='column' spacing={2}>
          {availableTranslations.map(t => (
            <Typography
              key={`Multilingual-${t}`}
              variant='h6'
              sx={{ fontWeight: 500, display: 'grid' }}
              onMouseUp={onSelectWord}
              color={transColor[t]}
            >
              <Chip
                variant='outlined'
                label={Translation[t]}
                sx={{ '& .MuiChip-label': { fontSize: 14 }, color: transColor[t], maxWidth: 80 }}
              />
              {parseHtmlSentence(sentence, t)}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
