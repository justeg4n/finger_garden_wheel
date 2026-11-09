// Clip the source pixels explicitly. A viewBox alone leaves neighbouring
// sprites visible in the letterbox when the destination has another ratio.
// Bounds follow the white gutters; the rabbit/cat border has a small step
// to preserve both the rabbit's whiskers and the cat's tail independently.
const animals = [
  { box:[0,145,448,450], points:'0,130 448,130 448,600 0,600' },
  { box:[465,65,372,550], points:'465,55 837,55 837,399 823,420 823,620 465,620' },
  { box:[829,110,411,505], points:'837,100 1240,100 1240,620 829,620 829,420 837,399' },
  { box:[1255,192,450,405], points:'1255,185 1705,185 1705,610 1255,610' },
  { box:[1713,165,459,420], points:'1713,155 2172,155 2172,595 1713,595' },
];
const hands = [
  [45,40,295,674], [470,45,267,669], [870,40,312,674],
  [1255,45,328,669], [1685,40,487,674],
];
let nextId = 0;

export function art(kind, index, className = '', label = '', placement = '') {
  const box = kind === 'hands' ? hands[index] : animals[index].box;
  const [x,y,width,height] = box;
  const id = `art-clip-${++nextId}`;
  const shape = kind === 'hands'
    ? `<rect x="${x}" y="${y}" width="${width}" height="${height}"/>`
    : `<polygon points="${animals[index].points}"/>`;
  return `<svg class="${placement ? 'wheel-art' : 'art-svg'} ${className}" ${placement} viewBox="${box.join(' ')}" preserveAspectRatio="xMidYMid meet" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse">${shape}</clipPath></defs><image href="assets/${kind}.png" width="2172" height="724" clip-path="url(#${id})"/></svg>`;
}
