import type { AvatarSpec } from '../lib/avatar';
import { CLASS, IDENTITY_ATTR } from './dom';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Drawn as an inline SVG rather than a styled <div>: a viewBox scales the
 * letter automatically, so the same element works for the 40px avatar on a
 * top-level comment and the 24px one on a reply without measuring anything.
 */
export function createAvatarElement(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add(CLASS.avatar);

  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', '20');
  circle.setAttribute('cy', '20');
  circle.setAttribute('r', '20');

  const text = document.createElementNS(SVG_NS, 'text');
  text.setAttribute('x', '20');
  text.setAttribute('y', '20');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'central');
  text.setAttribute('font-size', '19');
  text.setAttribute('font-weight', '500');
  text.setAttribute('fill', '#ffffff');
  text.setAttribute('font-family', 'Roboto, Arial, sans-serif');

  svg.append(circle, text);
  return svg;
}

export function paintAvatarElement(svg: SVGSVGElement, spec: AvatarSpec, identity: string): void {
  const circle = svg.firstElementChild;
  const text = svg.lastElementChild;
  if (!circle || !text) return;

  circle.setAttribute('fill', spec.color);
  text.textContent = spec.letter;
  svg.setAttribute(IDENTITY_ATTR, identity);
}
