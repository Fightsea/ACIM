import React, { useState, Fragment } from 'react';
import { useUpdateEffect } from 'react-use';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import NotesIcon from '@mui/icons-material/Notes';
import useContent from '../raw/useContent';
import { parseParagraphId, parseHtmlSentence } from '../raw/utils';
import { Translation } from './Def';
import { cambridgeDictionary, drEyeDictionary, eudicDictionary } from './Dictionary';
import parse from 'html-react-parser';

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

  const { volumes, chapters, sections, paragraphs, sentences, lastRead } = useContent({ volume, chapter, section, paragraph });

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
    setParagraph(null);
  };
  const handleSectionChange = (e, value) => {
    setSection(value);
    setParagraph(null);
  };
  const handleParagraphChange = (e, value) => setParagraph(value);
  const handleTranChange = (e, value) => setTranslation(value);
  const handleAvailableTranslationsChange = (e, value) => setAvailableTranslations(value);

  const handleSelectWord = e => {
    const w = window.getSelection().toString().trim();
    setSelectedWord(Boolean(w) ? w : null);
    setSelectedWordAnchorEl(Boolean(e) ? e.target : null);
  };

  return (
    <>
      <Grid container rowSpacing={2} columnSpacing={1} sx={{ m: 1, width: 1024 }}>
        <Grid item xs={6}>
          <Autocomplete
            disablePortal
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
            id='chapter'
            options={Object.keys(chapters)}
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

        {volume !== 'W' && (
          <Grid item xs={6}>
            <Autocomplete
              disablePortal
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
          </Grid>
        )}
        <Grid item xs={3}>
          <Autocomplete
            disablePortal
            id='paragraph'
            options={Object.keys(paragraphs)}
            value={paragraph}
            renderInput={params => <TextField {...params} label='Paragraph' />}
            renderOption={(props, opt) => (
              <li {...props} key={props.key}>
                {volume !== 'W' ? `${volume}-${chapter}.${section}.${opt}.` : `${volume}-${chapter}.${opt}.`}
              </li>
            )}
            getOptionLabel={opt => (volume !== 'W' ? `${volume}-${chapter}.${section}.${opt}.` : `${volume}-${chapter}.${opt}.`)}
            onChange={handleParagraphChange}
          />
        </Grid>

        <Grid item xs={3}>
          <Autocomplete
            disablePortal
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
              />
            ))}
          </Paper>
        </Grid>
      </Grid>
      <Dictionary word={selectedWord} anchorEl={selectedwordAnchorEl} onClose={() => handleSelectWord(null)} />
    </>
  );
}

function Sentence({ sentence, translation, availableTranslations, onSelectWord }) {
  return (
    <ListItem
      sx={{ p: 0, px: 2, mt: 1, '&:hover': { bgcolor: 'LemonChiffon' } }}
      secondaryAction={
        <Tooltip
          arrow
          placement='left-start'
          slotProps={{ tooltip: { sx: { '&.MuiTooltip-tooltipArrow': { minWidth: 640, bgcolor: 'DarkKhaki' } } } }}
          title={<Multilingual sentence={sentence} availableTranslations={availableTranslations} onSelectWord={onSelectWord} />}
        >
          <IconButton sx={{ pt: 1, '&:hover': { color: 'DarkGoldenRod' } }}>
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

function Dictionary({ word, anchorEl, onClose }) {
  const [definitions, setDefinitions] = useState(null);

  useUpdateEffect(() => {
    if (word) {
      const getDefinitions = async () => {
        setDefinitions(null);
        const dictionaries = [drEyeDictionary, eudicDictionary, cambridgeDictionary];
        let defs = null;
        for (const dict of dictionaries) {
          defs = await dict(word);
          if (!defs?.length) {
            continue;
          } else {
            break;
          }
        }
        setDefinitions(defs);
      };
      getDefinitions();
    }
  }, [word]);

  return (
    <Popper
      open={Boolean(word) && Boolean(anchorEl)}
      anchorEl={anchorEl}
      transition
      placement='bottom'
      sx={{ zIndex: 'tooltip' }}
      modifiers={[
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            altBoundary: true,
            tether: false,
          },
        },
        {
          name: 'flip',
          enabled: false,
        },
      ]}
    >
      {({ TransitionProps }) => (
        <ClickAwayListener onClickAway={onClose}>
          <Grow {...TransitionProps}>
            <Card
              sx={{
                width: 600,
                maxHeight: 320,
                overflow: 'auto',
                wordBreak: 'break-word',
                bgcolor: 'AliceBlue',
                outline: '3px solid LightSkyBlue',
              }}
            >
              <CardContent>
                <Typography variant='h6'>{word}</Typography>
                {definitions ? (
                  definitions.length > 0 ? (
                    definitions.map((element, idx) => (
                      <Fragment key={`Dictionary-definitions-${idx}`}>
                        <Box sx={{ my: 1 }} dangerouslySetInnerHTML={{ __html: element }}></Box>
                        <Divider />
                      </Fragment>
                    ))
                  ) : (
                    <Typography>No definition found.</Typography>
                  )
                ) : (
                  <Box sx={{ height: 40, mt: 1 }}>
                    <CircularProgress size={30} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        </ClickAwayListener>
      )}
    </Popper>
  );
}
