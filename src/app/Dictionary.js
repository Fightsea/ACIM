import { useState, Fragment } from 'react';
import { useUpdateEffect } from 'react-use';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { parse } from 'node-html-parser';

const cambridgeDictionary = async word => {
  try {
    if (Boolean(word.trim())) {
      const res = await axios.get(`https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${word}`);
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
      const res = await axios.get(`https://yun.dreye.com/dict_new/dict_min.php?w=${word}&hidden_codepage=01`);
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
      const res = await axios.get(`https://dict.eudic.net/dicts/en/${word}`);
      if (res.status === 200) {
        const root = parse(res.data);
        return [...root.querySelectorAll('span.phonitic-line'), ...root.querySelectorAll('div.explain_wrap')];
      }
    }
  } catch (e) {}
};

export default function Dictionary({ word, anchorEl, onClose }) {
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
