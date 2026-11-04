import { gsap } from 'gsap';

export class AnimationController {
  constructor(state, onUpdate, reducedMotion) {
    Object.assign(this, { state, onUpdate, reducedMotion });
    this.timeline = null;
  }

  play() {
    this.timeline?.kill();
    if (this.reducedMotion.matches) {
      Object.assign(this.state, { growth: 1, bloom: 1 });
      this.onUpdate();
      return;
    }
    Object.assign(this.state, { growth: 0, bloom: 0 });
    this.onUpdate();
    this.timeline = gsap.timeline({ onUpdate: this.onUpdate });
    this.timeline.to(this.state, { growth: 1, duration: 2.8, ease: 'power1.inOut' })
      .to(this.state, { bloom: 1, duration: 3.5, ease: 'power2.out' }, '-=0.35');
  }

  dispose() { this.timeline?.kill(); }
}
