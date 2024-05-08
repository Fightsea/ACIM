import React, { useState, useMemo } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Translation } from './Def';
import { getRawFromDB, getRawFromFile } from '../raw/raw';

const TranslationKeys = Object.keys(Translation) ?? [];

// const { Content } = await getRawFromDB();
const Content = await getRawFromFile();

export default function Reader() {
  const [volume, setVolume] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [section, setSection] = useState(null);
  const [paragraph, setParagraph] = useState(null);
  const [translation, setTranslation] = useState('_EN');
  const [availableTranslations, setAvailableTranslations] = useState(TranslationKeys);

  const volumes = Object.keys(Content).reduce((res, v) => {
    res[v] = {};
    TranslationKeys.forEach(t => {
      res[v][t] = Content[v][t];
    });
    return res;
  }, {});

  const [chapters, sections, paragraphs] = useMemo(() => {
    let cs = [];
    let ss = [];
    let ps = [];
    if (volume) {
      cs = Object.keys(Content[volume]).reduce((res, c) => {
        if (!TranslationKeys.includes(c)) {
          res[c] = {};
          TranslationKeys.forEach(t => {
            res[c][t] = Content[volume][c][t];
          });
        }
        return res;
      }, {});

      if (chapter) {
        if (volume !== 'W') {
          ss = Object.keys(Content[volume][chapter]).reduce((res, s) => {
            if (!TranslationKeys.includes(s)) {
              res[s] = {};
              TranslationKeys.forEach(t => {
                res[s][t] = Content[volume][chapter][s][t];
              });
            }
            return res;
          }, {});
          if (section) {
            ps = Object.keys(Content[volume][chapter][section]).reduce((res, p) => {
              if (!TranslationKeys.includes(p)) {
                res[p] = {};
                TranslationKeys.forEach(t => {
                  res[p][t] = Content[volume][chapter][section][p][t];
                });
              }
              return res;
            }, {});
          }
        } else {
          ps = Object.keys(Content[volume][chapter]).reduce((res, p) => {
            if (!TranslationKeys.includes(p)) {
              res[p] = {};
              TranslationKeys.forEach(t => {
                res[p][t] = Content[volume][chapter][p][t];
              });
            }
            return res;
          }, {});
        }
      }
    }
    return [cs, ss, ps];
  }, [volume, chapter, section]);

  const sentences = useMemo(() => {
    let sts = [];
    const p = volume !== 'W' ? Content?.[volume]?.[chapter]?.[section]?.[paragraph] : Content?.[volume]?.[chapter]?.[paragraph];
    if (p) {
      sts = Array(p._sentences ?? 0)
        .fill('')
        .map((_, idx) => {
          const st = {};
          TranslationKeys.forEach(t => {
            const pt = p[t] ?? '';
            if (pt) {
              const start = idx === 0 ? 0 : pt.indexOf(String(idx + 1));
              const end = idx === p._sentences - 1 ? pt.length : pt.indexOf(String(idx + 2));
              st[t] = pt.substring(start, end);
            }
          });
          return st;
        });
    }
    return sts;
  }, [volume, chapter, section, paragraph, availableTranslations]);

  const handleVolumeChange = (e, value) => {
    setVolume(value);
    setChapter(null);
    setSection(null);
    setParagraph(null);
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
            renderOption={(props, opt) => <li {...props}>{`${volumes[opt][translation] ?? ''}`}</li>}
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
            renderOption={(props, opt) => <li {...props}>{`${volume}-${opt}. ${chapters[opt][translation] ?? ''}`}</li>}
            getOptionLabel={opt => `${volume}-${opt}. ${chapters[opt][translation] ?? ''}`}
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
              renderOption={(props, opt) => <li {...props}>{`${volume}-${chapter}.${opt}. ${sections[opt][translation] ?? ''}`}</li>}
              getOptionLabel={opt => `${volume}-${chapter}.${opt}. ${sections[opt][translation] ?? ''}`}
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
              <li {...props}>{volume !== 'W' ? `${volume}-${chapter}.${section}.${opt}.` : `${volume}-${chapter}.${opt}.`}</li>
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
            renderOption={(props, opt) => <li {...props}>{`${Translation[opt]}`}</li>}
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
            renderOption={(props, opt) => <li {...props}>{`${Translation[opt]}`}</li>}
            onChange={handleAvailableTranslationsChange}
            renderTags={(value, getTagProps) =>
              value.map((opt, index) => (
                <Chip variant='outlined' label={Translation[opt]} {...getTagProps({ index })} key={`availableTranslations-${opt}`} />
              ))
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ color: 'text.secondary', overflow: 'auto', p: 2, height: 600 }}>
            {sentences.map((s, idx) => (
              <Sentense key={`sentences-${idx}`} sentense={s} translation={translation} availableTranslations={availableTranslations} />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

function Sentense({ sentense, translation, availableTranslations }) {
  return (
    <Tooltip
      arrow
      placement='right-start'
      slotProps={{ tooltip: { sx: { '&.MuiTooltip-tooltipArrow': { maxWidth: 500, bgcolor: 'DarkKhaki' } } } }}
      title={
        <Card sx={{ bgcolor: 'Ivory' }}>
          <CardContent>
            {availableTranslations.map(t => (
              <Grid key={`availableTranslations-${t}`} container columnSpacing={0.5}>
                <Grid item xs={2}>
                  <Chip variant='outlined' label={Translation[t]} sx={{ '& .MuiChip-label': { fontSize: 11 } }} />
                </Grid>
                <Grid item xs={10}>
                  <Typography variant='h6'>{sentense[t]}</Typography>
                </Grid>
              </Grid>
            ))}
          </CardContent>
        </Card>
      }
    >
      <Typography
        // paragraph
        variant='h6'
        sx={{ '&:hover': { bgcolor: 'LemonChiffon' } }}
      >
        {sentense[translation]}
      </Typography>
    </Tooltip>
  );
}
