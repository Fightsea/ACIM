import React, { useState, useMemo, Fragment } from 'react';
import { useUpdateEffect } from 'react-use';
import { useDebouncedCallback } from 'use-debounce';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import NotesIcon from '@mui/icons-material/Notes';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import useContent from '../raw/useContent';
import { generateParagraphId, parseParagraphId, parseHtmlSentence } from '../raw/utils';
import { Translation, TranslationColor } from './Def';
import Dictionary from './Dictionary';

const TranslationKeys = Object.keys(Translation) ?? [];

export default function Reader() {
  const [volume, setVolume] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [section, setSection] = useState(null);
  const [paragraph, setParagraph] = useState(null);
  const [translation, setTranslation] = useState('_EN');
  const [availableTranslations, setAvailableTranslations] = useState(TranslationKeys);

  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedwordAnchorEl, setSelectedWordAnchorEl] = useState(null);

  const { volumes, chapters, sections, paragraphs, sentences, showSection, showParagraph, ready, lastRead, editNote, toggleHightlight } =
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
      }
    } else if (volume === 'M') {
      if (chapter === '4' && value === 'I-A') {
        p = '3';
      }
    }
    setSection(value);
    setParagraph(p);
  };
  const handleParagraphChange = (e, value) => setParagraph(value);
  const handleTranChange = (e, value) => setTranslation(value);
  const handleAvailableTranslationsChange = (e, value) => setAvailableTranslations(value);

  const handleSelectWord = e => {
    const w = window.getSelection().toString().trim();
    setSelectedWord(Boolean(w) ? w : null);
    setSelectedWordAnchorEl(Boolean(e) ? e.target : null);
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
      <Grid container rowSpacing={2} columnSpacing={1} sx={{ m: 1, width: 1024 }}>
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

        <Grid item xs={6}></Grid>

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

        <Grid item xs={3}>
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

        <Grid item xs={3}>
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

        <Grid item xs={6}>
          <Autocomplete
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
          />
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ color: 'text.secondary', overflow: 'auto', height: 540, pt: 1 }}>
            {sentences.map((s, idx) => (
              <Sentence
                key={`sentences-${idx}`}
                sentence={s}
                translation={translation}
                availableTranslations={availableTranslations}
                onSelectWord={handleSelectWord}
                onEditNote={note => editNote(idx + 1, note)}
                onToggleHightlight={() => toggleHightlight(idx + 1)}
              />
            ))}
          </Paper>
        </Grid>
      </Grid>
      <Dictionary word={selectedWord} anchorEl={selectedwordAnchorEl} onClose={() => handleSelectWord(null)} />
    </>
  );
}

function Sentence({ sentence, translation, availableTranslations, onSelectWord, onEditNote, onToggleHightlight }) {
  const isHighlighted = Boolean(sentence._highlight);
  const note = sentence._note;

  const [isEditing, setIsEditing] = useState(false);
  const debounced = useDebouncedCallback(value => onEditNote(value), 1000);

  return (
    <>
      <ListItem
        sx={{
          p: 0,
          mb: 1,
          bgcolor: isHighlighted ? 'Linen' : 'inherit',
          '&:hover': { bgcolor: 'LemonChiffon' },
          '& .MuiListItemSecondaryAction-root': { right: '8px' },
        }}
        secondaryAction={
          <>
            <Tooltip
              arrow
              placement='left-start'
              slotProps={{ tooltip: { sx: { '&.MuiTooltip-tooltipArrow': { minWidth: 640, bgcolor: 'DarkKhaki' } } } }}
              title={<Multilingual sentence={sentence} availableTranslations={availableTranslations} onSelectWord={onSelectWord} />}
            >
              <IconButton onClick={() => setIsEditing(true)} sx={{ color: isHighlighted ? 'DarkGoldenRod' : 'inherit' }}>
                <NotesIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={onToggleHightlight}
              sx={{
                color: isHighlighted ? 'DarkGoldenRod' : 'inherit',
                opacity: isHighlighted ? 1 : 0.15,
                '&:hover': { opacity: 1 },
              }}
            >
              {isHighlighted ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </>
        }
      >
        <Typography variant='h6' sx={{ pl: 2, pr: 12, fontWeight: 500 }} onDoubleClick={onSelectWord}>
          {parseHtmlSentence(sentence, translation)}
        </Typography>
      </ListItem>
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
  return (
    <Card sx={{ bgcolor: 'Ivory', maxHeight: 540, overflow: 'auto' }}>
      <CardContent>
        <Grid container columnSpacing={0.5} rowSpacing={1.5}>
          {availableTranslations.map(t => (
            <Fragment key={`Multilingual-${t}`}>
              <Grid item xs={2}>
                <Chip variant='outlined' label={Translation[t]} sx={{ '& .MuiChip-label': { fontSize: 14 }, color: TranslationColor[t] }} />
              </Grid>
              <Grid item xs={10}>
                <Typography variant='h6' sx={{ fontWeight: 500 }} onDoubleClick={onSelectWord} color={TranslationColor[t]}>
                  {parseHtmlSentence(sentence, t)}
                </Typography>
              </Grid>
            </Fragment>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
