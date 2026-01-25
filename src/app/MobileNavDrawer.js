import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

export default function MobileNavDrawer({
  open,
  onClose,
  // Navigation State
  volume,
  onVolumeChange,
  volumes,
  chapter,
  onChapterChange,
  chapterOptions,
  chapters,
  section,
  onSectionChange,
  sectionOptions,
  sections,
  showSection,
  paragraph,
  onParagraphChange,
  paragraphs,
  showParagraph,
  // Translation State
  translation,
  onTranslationChange,
  secondTranslation,
  onSecondTranslationChange,
  thirdTranslation,
  onThirdTranslationChange,
  availableTranslations,
  Translation, // Passed to get labels
}) {
  return (
    <Drawer
      anchor='left'
      open={open}
      onClose={onClose}
      variant='temporary'
      PaperProps={{
        sx: { width: '85%', maxWidth: 360, p: 2 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6' fontWeight='bold'>
          Navigation
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Stack spacing={3}>
        <Stack spacing={2}>
          <Autocomplete
            options={Object.keys(volumes || {})}
            getOptionLabel={key => (volumes && volumes[key] ? `${key} ${volumes[key]}` : key)}
            value={volume}
            onChange={onVolumeChange}
            renderInput={params => <TextField {...params} label='Volume' variant='outlined' size='small' />}
            disableClearable
          />

          <Autocomplete
            options={chapterOptions || []}
            getOptionLabel={key => (chapters && chapters[key] ? `${key} ${chapters[key]}` : key)}
            value={chapter}
            onChange={onChapterChange}
            renderInput={params => <TextField {...params} label='Chapter' variant='outlined' size='small' />}
            disableClearable
          />

          {showSection && (
            <Autocomplete
              options={sectionOptions || []}
              getOptionLabel={key => (sections && sections[key] ? `${key} ${sections[key]}` : key)}
              value={section}
              onChange={onSectionChange}
              renderInput={params => <TextField {...params} label='Section' variant='outlined' size='small' />}
            />
          )}

          {showParagraph && (
            <Autocomplete
              options={Object.keys(paragraphs || {})}
              getOptionLabel={key => key}
              value={paragraph}
              onChange={onParagraphChange}
              renderInput={params => <TextField {...params} label='Paragraph' variant='outlined' size='small' />}
              disableClearable
            />
          )}
        </Stack>

        <Divider />

        <Box>
          <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>
            Translations
          </Typography>
          <Stack spacing={2}>
            <Autocomplete
              options={availableTranslations || []}
              getOptionLabel={key => Translation?.[key] || key}
              value={translation}
              onChange={onTranslationChange}
              renderInput={params => <TextField {...params} label='Primary' variant='outlined' size='small' />}
              disableClearable
            />

            <Autocomplete
              options={['_NONE', ...(availableTranslations || [])]}
              getOptionLabel={key => (key === '_NONE' ? 'None' : Translation?.[key] || key)}
              value={secondTranslation}
              onChange={onSecondTranslationChange}
              renderInput={params => <TextField {...params} label='Secondary' variant='outlined' size='small' />}
              disableClearable
            />

            <Autocomplete
              options={['_NONE', ...(availableTranslations || [])]}
              getOptionLabel={key => (key === '_NONE' ? 'None' : Translation?.[key] || key)}
              value={thirdTranslation}
              onChange={onThirdTranslationChange}
              renderInput={params => <TextField {...params} label='Tertiary' variant='outlined' size='small' />}
              disableClearable
            />
          </Stack>
        </Box>
      </Stack>
    </Drawer>
  );
}
