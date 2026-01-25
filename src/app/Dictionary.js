import { useState, Fragment } from 'react';
import { useUpdateEffect } from 'react-use';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import axios from 'axios';
import { parse } from 'node-html-parser';
import DOMPurify from 'dompurify';

const timeout = 3000; // ms

const cambridgeDictionary = async word => {
  try {
    if (Boolean(word.trim())) {
      const res = await axios.get(`https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${word}`, { timeout });
      if (res.status === 200) {
        const root = parse(res.data);
        return [...root.querySelectorAll('span.us.dpron-i'), ...root.querySelectorAll('div.ddef_b')]; // root.querySelectorAll('div.di-body')
      }
    }
  } catch (e) {}
};

const drEyeDictionary = async word => {
  try {
    if (Boolean(word.trim())) {
      const res = await axios.get(`https://yun.dreye.com/dict_new/dict_min.php?w=${word}&hidden_codepage=01`, { timeout });
      if (res.status === 200) {
        const root = parse(res.data);
        return [...root.querySelectorAll('span.phonetic'), ...root.querySelectorAll('div.content')];
      }
    }
  } catch (e) {}
};

const eudicDictionary = async word => {
  try {
    if (Boolean(word.trim())) {
      const res = await axios.get(`https://dict.eudic.net/dicts/en/${word}`, { timeout });
      if (res.status === 200) {
        const root = parse(res.data);
        return [...root.querySelectorAll('span.phonitic-line'), ...root.querySelectorAll('div.explain_wrap')];
      }
    }
  } catch (e) {}
};

const dictionaries = [drEyeDictionary, cambridgeDictionary, eudicDictionary]; // search by order

const DictionaryContent = ({ word, definitions, prefersDarkMode, mobile }) => (
  <Card
    sx={{
      width: mobile ? '100%' : 600,
      maxHeight: mobile ? '50vh' : 320,
      overflow: 'auto',
      wordBreak: 'break-word',
      color: 'Black',
      bgcolor: prefersDarkMode ? 'DarkGray' : 'AliceBlue',
      outline: mobile ? 'none' : `3px solid ${prefersDarkMode ? 'DimGray' : 'LightSkyBlue'}`,
      borderRadius: mobile ? '16px 16px 0 0' : 1,
    }}
  >
    <CardContent>
      <Typography
        variant={mobile ? 'h5' : 'h6'}
        sx={{
          fontWeight: mobile ? 'normal' : undefined,
          fontSize: mobile ? '1.5625rem' : undefined,
          lineHeight: mobile ? 1.4 : undefined,
        }}
      >
        {word}
      </Typography>
      {definitions ? (
        definitions.length > 0 ? (
          definitions.map((element, idx) => (
            <Fragment key={`Dictionary-definitions-${idx}`}>
              <Box
                sx={{ my: 1, fontSize: mobile ? '1.25rem' : undefined }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(element) }}
              ></Box>
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
);

export default function Dictionary({ word, anchorEl, onClose, mobile }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [definitions, setDefinitions] = useState(null);

  useUpdateEffect(() => {
    if (word) {
      const getDefinitions = async () => {
        setDefinitions(null);
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

  if (mobile) {
    return (
      <SwipeableDrawer
        anchor='bottom'
        open={Boolean(word)}
        onClose={onClose}
        onOpen={() => {}}
        disableSwipeToOpen={false}
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            borderRadius: '16px 16px 0 0',
          },
        }}
        sx={{ zIndex: 'tooltip' }}
      >
        <DictionaryContent word={word} definitions={definitions} prefersDarkMode={prefersDarkMode} mobile={true} />
      </SwipeableDrawer>
    );
  }

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
            <Box>
              <DictionaryContent word={word} definitions={definitions} prefersDarkMode={prefersDarkMode} mobile={false} />
            </Box>
          </Grow>
        </ClickAwayListener>
      )}
    </Popper>
  );
}
