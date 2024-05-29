import parse from 'html-react-parser';

export function parseParagraphId(id) {
  const lastIndex = id.length - 1;
  const cStart = id.indexOf('-') + 1;
  const cEnd = id.indexOf('.', cStart);
  let sStart = null;
  let sEnd = null;
  let pStart = null;
  let pEnd = null;

  if (cEnd !== lastIndex) {
    sStart = cEnd + 1;
    sEnd = id.indexOf('.', sStart);
    if (sEnd !== lastIndex) {
      pStart = sEnd + 1;
      pEnd = id.indexOf('.', pStart);
    }
  }

  const v = id[0];
  const c = id.substring(cStart, cEnd);
  const s = sStart ? id.substring(sStart, sEnd) : null;
  const p = pStart ? (v !== 'W' ? id.substring(pStart, pEnd) : id.substring(pStart, pEnd)) : null;

  return { v, c, s, p };
}

export function parseHtmlSentence(sentence, translation) {
  let st = sentence?.[translation] ?? '';
  // Replace _xxxxx_ to <b><i>xxxxx</i></b>
  if (translation === '_EN') {
    st = st.split('_ ').reduce((str, t) => {
      str += t.replace('_', '<b><i>');
      str += '</i></b> ';
      return str;
    }, '');
  }
  return parse(st);
}
