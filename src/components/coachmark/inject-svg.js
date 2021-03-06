let injected = false;

export default function injectSVG(svg) {
  if (injected) return;

  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  s.setAttribute('width', 0);
  s.setAttribute('height', 0);
  s.innerHTML = svg;
  document.body.insertBefore(s, document.body.firstChild);

  injected = true;

  return s;
}
