import parse from 'html-react-parser';
import { WorkbookChapters } from '../app/Def';

const WorkbookChaptersMap = Object.entries(WorkbookChapters).filter(([k, v]) => Boolean(v));
const pureCS = ['1-50', '61-80', '91-110', '121-140', '151-170', '181-200'];

export function isShowSection({ v, c }) {
  if (v === 'Preface') {
    return false;
  }
  if (v === 'W') {
    if (['pI', 'pII'].includes(c)) {
      return false;
    }
  }
  if (v === 'M') {
    if (!['4', '5'].includes(c)) {
      return false;
    }
  }
  if (v === 'C') {
    return false;
  }
  if (v === 'P') {
    if (c === '1') {
      return false;
    }
  }
  if (c?.endsWith('in') || c?.endsWith('ep')) {
    return false;
  }
  return true;
}

export function isShowParagraph({ v, c }) {
  if (v === 'W') {
    if (['pI', 'pII'].includes(c)) {
      return false;
    }
  }
  return true;
}

export function generateParagraphId({ v, c, s, p }) {
  let prefix = `${v}-${c}.`;
  if (v === 'W' && WorkbookChapters[c]) {
    if (pureCS.includes(c) || (!pureCS.includes(c) && s !== 'in')) {
      prefix = `${v}-`;
    }
  }
  return isShowSection({ v, c }) ? `${prefix}${s?.endsWith('-i') ? s.substring(0, s.length - 2) : s}.${p}.` : `${prefix}${p}.`;
}

export function parseParagraphId(id) {
  const v = id.substring(0, id.indexOf('-'));

  const cStart = id.indexOf('-') + 1;
  const cEnd = id.indexOf('.', cStart);
  let c = id.substring(cStart, cEnd);

  const lastIndex = id.length - 1;
  let sStart = null;
  let sEnd = null;
  let pStart = null;
  let pEnd = null;

  if (isShowSection({ v, c })) {
    if (cEnd !== lastIndex) {
      sStart = cEnd + 1;
      sEnd = id.indexOf('.', sStart);
      if (sEnd !== lastIndex) {
        pStart = sEnd + 1;
        pEnd = id.indexOf('.', pStart);
      }
    }
  } else {
    if (cEnd !== lastIndex) {
      pStart = cEnd + 1;
      pEnd = id.indexOf('.', pStart);
    }
  }

  let s = sStart ? id.substring(sStart, sEnd) : null;
  let p = pStart ? id.substring(pStart, pEnd) : null;

  if (v === 'W') {
    if (!isNaN(c)) {
      for (const [chapterKey, [startIdx, endIdx]] of WorkbookChaptersMap) {
        if (c >= startIdx && c <= endIdx) {
          p = s;
          s = c;
          c = chapterKey;
        }
      }
    } else if (c === '361-5') {
      p = s;
      s = c;
      c = 'fl';
    }
  }

  return { v, c, s, p };
}

export function parseHtmlSentence(sentence, translation) {
  let st = sentence?.[translation] ?? '';
  if (translation === '_EN') {
    st = st.split('_');
    st = st.reduce((str, t, idx) => {
      if (parseInt(idx) % 2 === 0 && idx < st.length - 1) {
        str += t + '<b><i>';
      } else {
        str += t + '</i></b>';
      }
      return str;
    }, '');
    st = st.split('**');
    st = st.reduce((str, t, idx) => {
      if (parseInt(idx) % 2 === 0 && idx < st.length - 1) {
        str += t + '<b style="color:Brown;"><i>';
      } else {
        str += t + '</i></b>';
      }
      return str;
    }, '');
  }
  return parse(st);
}
