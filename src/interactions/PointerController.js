export class PointerController {
  constructor(element, onActivate) {
    this.element = element;
    this.onActivate = onActivate;
    element.addEventListener('pointerup', onActivate);
  }

  dispose() { this.element.removeEventListener('pointerup', this.onActivate); }
}
