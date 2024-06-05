import React, { useState, useMemo } from 'react';
import { useUpdateEffect } from 'react-use';
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
import NotesIcon from '@mui/icons-material/Notes';
import useContent from '../raw/useContent';
import { parseParagraphId, parseHtmlSentence } from '../raw/utils';
import { Translation } from './Def';
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

  const { volumes, chapters, sections, paragraphs, sentences, showSection, ready, lastRead, toggleHightlight } = useContent({
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

  const handleVolumeChange = (e, value) => {
    const v = value;
    setVolume(value);
    if (v && lastRead?.[v]) {
      const { c, s, p } = parseParagraphId(lastRead[v]);
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
    setParagraph(value === 'in' ? '1' : null);
  };
  const handleSectionChange = (e, value) => {
    setSection(value);
    setParagraph(value ? '1' : null);
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
      handleSectionChange(null, Object.keys(sections)[0] ?? null);
    }
  }, [sections, paragraph]);

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

        <Grid item xs={volume === 'W' ? 12 : 6}>
          <Autocomplete
            disablePortal
            disableClearable
            id='chapter'
            options={chapterOptions}
            value={chapter}
            renderInput={params => <TextField {...params} label='Chapter' />}
            renderOption={(props, opt) => (
              <li {...props} key={props.key}>
                {chapters[opt][translation] ?? `${volume}-${opt}.`}
              </li>
            )}
            getOptionLabel={opt => chapters[opt][translation] ?? `${volume}-${opt}.`}
            onChange={handleChapterChange}
          />
        </Grid>

        <Grid item xs={6}>
          {showSection && (
            <Autocomplete
              disablePortal
              disableClearable
              id='section'
              options={Object.keys(sections)}
              value={section}
              renderInput={params => <TextField {...params} label='Section' />}
              renderOption={(props, opt) => (
                <li {...props} key={props.key}>
                  {sections[opt][translation] ?? `${volume}-${chapter}.${opt}`}
                </li>
              )}
              getOptionLabel={opt => sections[opt][translation] ?? `${volume}-${chapter}.${opt}`}
              onChange={handleSectionChange}
            />
          )}
        </Grid>

        <Grid item xs={3}>
          <Autocomplete
            disablePortal
            disableClearable
            id='paragraph'
            options={Object.keys(paragraphs)}
            value={paragraph}
            renderInput={params => <TextField {...params} label='Paragraph' />}
            renderOption={(props, opt) => (
              <li {...props} key={props.key}>
                {showSection ? `${volume}-${chapter}.${section}.${opt}.` : `${volume}-${chapter}.${opt}.`}
              </li>
            )}
            getOptionLabel={opt => (showSection ? `${volume}-${chapter}.${section}.${opt}.` : `${volume}-${chapter}.${opt}.`)}
            onChange={handleParagraphChange}
          />
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
          <Paper elevation={3} sx={{ color: 'text.secondary', overflow: 'auto', height: 600 }}>
            {sentences.map((s, idx) => (
              <Sentence
                key={`sentences-${idx}`}
                sentence={s}
                translation={translation}
                availableTranslations={availableTranslations}
                onSelectWord={handleSelectWord}
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

function Sentence({ sentence, translation, availableTranslations, onSelectWord, onToggleHightlight }) {
  return (
    <ListItem
      sx={{ p: 0, px: 2, mt: 1, bgcolor: Boolean(sentence._highlight) ? 'Linen' : 'inherit', '&:hover': { bgcolor: 'LemonChiffon' } }}
      secondaryAction={
        <Tooltip
          arrow
          placement='left-start'
          slotProps={{ tooltip: { sx: { '&.MuiTooltip-tooltipArrow': { minWidth: 640, bgcolor: 'DarkKhaki' } } } }}
          title={<Multilingual sentence={sentence} availableTranslations={availableTranslations} onSelectWord={onSelectWord} />}
        >
          <IconButton onClick={onToggleHightlight} sx={{ pt: 1, color: Boolean(sentence._highlight) ? 'DarkGoldenRod' : 'inherit' }}>
            <NotesIcon />
          </IconButton>
        </Tooltip>
      }
    >
      <Typography variant='h6' sx={{ pr: 6 }} onDoubleClick={onSelectWord}>
        {parseHtmlSentence(sentence, translation)}
      </Typography>
    </ListItem>
  );
}

function Multilingual({ sentence, availableTranslations, onSelectWord }) {
  return (
    <Card sx={{ bgcolor: 'Ivory' }}>
      <CardContent>
        {availableTranslations.map(t => (
          <Grid key={`Multilingual-${t}`} container columnSpacing={0.5}>
            <Grid item xs={2}>
              <Chip variant='outlined' label={Translation[t]} sx={{ '& .MuiChip-label': { fontSize: 11 } }} />
            </Grid>
            <Grid item xs={10}>
              <Typography variant='h6' onDoubleClick={onSelectWord}>
                {parseHtmlSentence(sentence, t)}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </CardContent>
    </Card>
  );
}
