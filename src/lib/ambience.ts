// Soft rain ambience synthesized with the Web Audio API, so the site ships no audio files.
// A filtered brown-noise bed gives the steady "shhh", and randomly scheduled short noise
// bursts through narrow band-pass filters give individual droplets.

const VOLUME = 0.32;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let dropBuffer: AudioBuffer | null = null;
let dropTimer: ReturnType<typeof setTimeout> | null = null;

function noiseBuffer(ac: AudioContext, seconds: number, brown: boolean) {
  const length = Math.floor(ac.sampleRate * seconds);
  const buffer = ac.createBuffer(2, length, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
  }
  return buffer;
}

function loop(ac: AudioContext, buffer: AudioBuffer, ...chain: AudioNode[]) {
  const src = ac.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  [src, ...chain].reduce((a, b) => (a.connect(b), b));
  src.start();
  return src;
}

function build(ac: AudioContext) {
  master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);

  // Steady low rain bed, with a very slow swell so it never sounds static.
  const bedFilter = ac.createBiquadFilter();
  bedFilter.type = "lowpass";
  bedFilter.frequency.value = 1100;
  const bedGain = ac.createGain();
  bedGain.gain.value = 0.55;
  const swell = ac.createOscillator();
  swell.frequency.value = 0.06;
  const swellDepth = ac.createGain();
  swellDepth.gain.value = 0.12;
  swell.connect(swellDepth).connect(bedGain.gain);
  swell.start();
  loop(ac, noiseBuffer(ac, 6, true), bedFilter, bedGain, master);

  // Airy high hiss of rain hitting surfaces.
  const hissFilter = ac.createBiquadFilter();
  hissFilter.type = "bandpass";
  hissFilter.frequency.value = 2800;
  hissFilter.Q.value = 0.5;
  const hissGain = ac.createGain();
  hissGain.gain.value = 0.045;
  loop(ac, noiseBuffer(ac, 4, false), hissFilter, hissGain, master);

  dropBuffer = noiseBuffer(ac, 0.08, false);
}

function scheduleDrop() {
  if (!ctx || !master || !dropBuffer) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = dropBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1400 + Math.random() * 4200;
  filter.Q.value = 6 + Math.random() * 8;
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.random() * 1.6 - 0.8;
  const env = ctx.createGain();
  const peak = Math.random() < 0.08 ? 0.35 : 0.06 + Math.random() * 0.12;
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(peak, now + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 0.05 + Math.random() * 0.04);
  src.connect(filter).connect(env).connect(pan).connect(master);
  src.start(now);
  src.stop(now + 0.1);

  dropTimer = setTimeout(scheduleDrop, 20 + Math.random() * 110);
}

export async function startAmbience() {
  if (!ctx) {
    ctx = new AudioContext();
    build(ctx);
  }
  if (ctx.state === "suspended") await ctx.resume();
  const now = ctx.currentTime;
  master!.gain.cancelScheduledValues(now);
  master!.gain.setValueAtTime(master!.gain.value, now);
  master!.gain.linearRampToValueAtTime(VOLUME, now + 2.5);
  if (!dropTimer) scheduleDrop();
}

export function stopAmbience() {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 0.5);
  if (dropTimer) clearTimeout(dropTimer);
  dropTimer = null;
  const ac = ctx;
  setTimeout(() => {
    if (!dropTimer) ac.suspend();
  }, 600);
}
