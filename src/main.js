import './styles/main.css';
import { CanvasManager } from './canvas/CanvasManager.js';
import { Renderer } from './canvas/Renderer.js';
import { Bouquet } from './entities/Bouquet.js';
import { AnimationController } from './animation/AnimationController.js';
import { PointerController } from './interactions/PointerController.js';

const gen = new URLSearchParams(window.location.search).get('gen');
const isReview = /^(?:[1-9]|1[0-2])$/.test(gen || '');
let dispose;

if (isReview) {
  const experience = document.querySelector('.experience');
  experience.classList.add('experience--review');
  experience.lang = 'en';
  experience.replaceChildren();

  const header = document.createElement('header');
  header.className = 'review__header';
  const title = document.createElement('h1');
  title.textContent = 'Digital Rose';
  const description = document.createElement('p');
  description.textContent = 'Twelve bouquets, each one different.';
  const regenerate = document.createElement('button');
  regenerate.className = 'experience__replay';
  regenerate.type = 'button';
  regenerate.textContent = 'Grow twelve new bouquets';
  header.append(title, description, regenerate);

  const grid = document.createElement('section');
  grid.className = 'review__grid';
  grid.setAttribute('aria-label', 'Bouquet gallery');
  experience.append(header, grid);

  const entries = [];
  for (let i = 0; i < 12; i++) {
    const card = document.createElement('article');
    card.className = 'review__card';
    const label = document.createElement('h2');
    label.textContent = `Bouquet ${String(i + 1).padStart(2, '0')}`;
    const canvas = document.createElement('canvas');
    canvas.className = 'review__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'review__regenerate';
    button.textContent = 'Grow another';
    button.setAttribute('aria-label', `Grow another bouquet for position ${i + 1}`);
    card.append(label, canvas, button);
    grid.append(card);

    let renderer;
    const manager = new CanvasManager(canvas, () => renderer?.requestRender());
    renderer = new Renderer(manager, new Bouquet(), { growth: 1, bloom: 1 });
    const createNew = () => {
      renderer.bouquet = new Bouquet();
      renderer.requestRender();
    };
    button.addEventListener('click', createNew);
    renderer.requestRender();
    entries.push({ manager, renderer, button, createNew });
  }
  // Mede novamente após todos os cartões definirem o layout final da grade.
  entries.forEach(({ manager }) => manager.resize());
  const createAll = () => entries.forEach((entry) => entry.createNew());
  regenerate.addEventListener('click', createAll);
  dispose = () => {
    regenerate.removeEventListener('click', createAll);
    entries.forEach(({ manager, renderer, button, createNew }) => {
      button.removeEventListener('click', createNew);
      renderer.dispose();
      manager.dispose();
    });
  };
} else {
  const canvas = document.querySelector('.experience__canvas');
  const replay = document.querySelector('.experience__replay');
  const save = document.querySelector('.experience__save');
  const saveMenu = document.querySelector('.experience__save-menu');
  const saveStatus = document.querySelector('.experience__save-status');
  const copyButton = document.querySelector('[data-save="text"]');
  const pngButton = document.querySelector('[data-save="png"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = { growth: 0, bloom: 0 };
  let renderer;
  const canvasManager = new CanvasManager(canvas, () => renderer?.requestRender());
  renderer = new Renderer(canvasManager, new Bouquet(), state, { emphasize: true });
  const animation = new AnimationController(state, () => renderer.requestRender(), reducedMotion);
  const play = () => animation.play();
  const newBouquet = () => {
    renderer.bouquet = new Bouquet();
    play();
  };
  const setMenu = (open) => {
    saveMenu.hidden = !open;
    save.setAttribute('aria-expanded', String(open));
    if (open) saveStatus.textContent = '';
  };
  const toggleMenu = () => setMenu(saveMenu.hidden);
  const dismissMenu = (event) => {
    if (!saveMenu.hidden && !saveMenu.contains(event.target) && !save.contains(event.target)) setMenu(false);
  };
  const closeOnEscape = (event) => {
    if (event.key === 'Escape' && !saveMenu.hidden) {
      setMenu(false);
      save.focus();
    }
  };
  const copyBouquet = async () => {
    const text = renderer.toText();
    if (!text) {
      saveStatus.textContent = 'Aguarde o buquê aparecer.';
      return;
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      saveStatus.textContent = 'Copiado!';
    } catch {
      // Fallback para navegadores sem Clipboard API em contexto seguro.
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.left = '-9999px';
      document.body.append(field);
      field.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Exibir erro abaixo. */ }
      field.remove();
      copyButton.focus();
      saveStatus.textContent = copied ? 'Copiado!' : 'Não foi possível copiar neste navegador.';
    }
  };
  const saveBouquet = () => {
    if (!renderer.cells.length) {
      saveStatus.textContent = 'Aguarde o buquê aparecer.';
      return;
    }
    const bounds = renderer.getArtBounds();
    // Caracteres são desenhados novamente, não ampliados como pixels existentes.
    const factor = Math.min(3, 8192 / Math.max(bounds.width, bounds.height), Math.sqrt(24000000 / (bounds.width * bounds.height)));
    const image = document.createElement('canvas');
    image.width = Math.ceil(bounds.width * factor);
    image.height = Math.ceil(bounds.height * factor);
    const context = image.getContext('2d');
    if (!context) {
      saveStatus.textContent = 'Não foi possível criar a imagem.';
      return;
    }
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim() || '#090909';
    context.fillRect(0, 0, image.width, image.height);
    context.setTransform(factor, 0, 0, factor, -bounds.x * factor, -bounds.y * factor);
    renderer.paint(context);
    const link = document.createElement('a');
    link.download = 'buque.png';
    link.href = image.toDataURL('image/png');
    document.body.append(link);
    link.click();
    link.remove();
    setMenu(false);
    save.focus();
  };
  const pointer = new PointerController(canvas, newBouquet);
  replay.addEventListener('click', newBouquet);
  save.addEventListener('click', toggleMenu);
  copyButton.addEventListener('click', copyBouquet);
  pngButton.addEventListener('click', saveBouquet);
  document.addEventListener('click', dismissMenu);
  document.addEventListener('keydown', closeOnEscape);
  reducedMotion.addEventListener('change', play);
  play();
  dispose = () => {
    replay.removeEventListener('click', newBouquet);
    save.removeEventListener('click', toggleMenu);
    copyButton.removeEventListener('click', copyBouquet);
    pngButton.removeEventListener('click', saveBouquet);
    document.removeEventListener('click', dismissMenu);
    document.removeEventListener('keydown', closeOnEscape);
    reducedMotion.removeEventListener('change', play);
    pointer.dispose();
    animation.dispose();
    renderer.dispose();
    canvasManager.dispose();
  };
}

if (import.meta.hot) import.meta.hot.dispose(dispose);
