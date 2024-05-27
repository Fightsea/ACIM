export function parseParagraphId(id) {
  const cStart = id.indexOf('-') + 1;
  const cEnd = id.indexOf('.', cStart);
  const sStart = cEnd + 1;
  const sEnd = id.indexOf('.', sStart);
  const pStart = sEnd + 1;
  const pEnd = id.indexOf('.', pStart);

  const v = id[0];
  const c = id.substring(cStart, cEnd);
  const s = id.substring(sStart, sEnd);
  const p = v !== 'W' ? id.substring(pStart, pEnd) : id.substring(pStart, pEnd);
  return { v, c, s, p };
}
