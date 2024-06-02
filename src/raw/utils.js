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
  if (translation === '_EN') {
    const starIdx = st.lastIndexOf('*');
    if (starIdx !== -1) {
      st = '<b><i>' + st.substring(0, starIdx) + '</i></b>';
    } else {
      st = st.split('_');
      st = st.reduce((str, t, idx) => {
        if (parseInt(idx) % 2 === 0 && idx < st.length - 1) {
          str += t + '<b><i>';
        } else {
          str += t + '</i></b>';
        }
        return str;
      }, '');
    }
  }
  return parse(st);
}
