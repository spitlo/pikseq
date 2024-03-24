import {
  AMSynth,
  AutoFilter,
  Destination,
  DuoSynth,
  FMSynth,
  Filter,
  MembraneSynth,
  MetalSynth,
  MonoSynth,
  NoiseSynth,
  PluckSynth,
  PolySynth,
  Reverb,
  Sampler,
  Synth,
} from 'tone'

const SAMPLE_BASE_URL = './sounds/'

// Add reverb to master channel
const destinationReverb = new Reverb({
  decay: 0.05,
  wet: 0.5,
})
Destination.chain(destinationReverb)

// Set up reverb and auto filter for DuoSynths
const duoReverb = new Reverb({
  decay: 0.3,
  wet: 0.7,
})
const duoFilter = new AutoFilter('4n').toDestination().start()

// Low pass filter for snare
const lowPass = new Filter({
  frequency: 11000,
}).toDestination()

const hihat = {
  name: 'Hi-Hat',
  shortName: 'HHat',
  engine: new NoiseSynth({ volume: -18, type: 'white' }).sync().toDestination(),
}

const snare = {
  name: 'Snare',
  shortName: 'Snre',
  engine: new NoiseSynth({
    volume: -4,
    noise: {
      type: 'pink',
      playbackRate: 3,
    },
    envelope: {
      attack: 0.001,
      decay: 0.13,
      sustain: 0,
      release: 0.03,
    },
  })
    .connect(lowPass)
    .sync()
    .toDestination(),
}

const kick = {
  name: 'Kick',
  octave: 2,
  engine: new MembraneSynth({ volume: -6 }).sync().toDestination(),
}

const tom1 = {
  name: 'Tom Lo',
  shortName: 'Tom1',
  octave: 3,
  engine: new MembraneSynth({
    volume: -3,
    pitchDecay: 0.008,
    envelope: { attack: 0.01, decay: 0.5, sustain: 0 },
  })
    .sync()
    .toDestination(),
}

const tom2 = {
  name: 'Tom Mid',
  shortName: 'Tom2',
  engine: new MembraneSynth({
    volume: -3,
    pitchDecay: 0.008,
    envelope: { attack: 0.01, decay: 0.5, sustain: 0 },
  })
    .sync()
    .toDestination(),
}

const mono1 = {
  name: 'Mono 1',
  shortName: 'Mon1',
  engine: new MonoSynth({
    volume: -8,
    oscillator: {
      type: 'square8',
    },
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.4,
      release: 0.8,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.7,
      sustain: 0.1,
      release: 0.8,
      baseFrequency: 300,
      octaves: 4,
    },
  })
    .sync()
    .toDestination(),
}

const mono2 = {
  name: 'Mono 2',
  shortName: 'Mon2',
  engine: new MonoSynth({
    volume: -8,
    oscillator: {
      type: 'sine2',
    },
    envelope: {
      attack: 0.2,
      decay: 0.2,
      sustain: 0.2,
      release: 0.2,
    },
    filterEnvelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.1,
      release: 0.2,
      baseFrequency: 300,
      octaves: 4,
    },
  })
    .sync()
    .toDestination(),
}

const fm1 = {
  name: 'FM 1',
  octave: 3,
  engine: new FMSynth({
    volume: -6,
    modulationIndex: 12.22,
    envelope: {
      attack: 0.01,
      decay: 0.2,
    },
    modulation: {
      type: 'square',
    },
    modulationEnvelope: {
      attack: 0.2,
      decay: 0.01,
    },
  })
    .sync()
    .toDestination(),
}

const fm2 = {
  name: 'FM 2',
  octave: 2,
  engine: new FMSynth({
    volume: -3,
    modulationIndex: 12.22,
    envelope: {
      attack: 0.5,
      decay: 0.2,
    },
    modulation: {
      type: 'sine',
    },
    modulationEnvelope: {
      attack: 0.2,
      decay: 0.1,
    },
  })
    .sync()
    .toDestination(),
}

const synth1 = {
  name: 'Synth 1',
  shortName: 'Snt1',
  octave: 1,
  engine: new Synth({
    oscillator: {
      type: 'amtriangle',
      harmonicity: 0.5,
      modulationType: 'square',
    },
    envelope: {
      attackCurve: 'exponential',
      attack: 0,
      decay: 0.3,
      sustain: 0.1,
      release: 1,
    },
    portamento: 0,
    volume: -6,
  })
    .sync()
    .toDestination(),
}

const synth2 = {
  name: 'Synth 2',
  shortName: 'Snt2',
  octave: 2,
  engine: new Synth({
    oscillator: {
      type: 'amtriangle',
      harmonicity: 2.5,
      modulationType: 'sine',
    },
    envelope: {
      attackCurve: 'exponential',
      attack: 0.05,
      decay: 0.2,
      sustain: 0.2,
      release: 1.5,
    },
    portamento: 0.05,
    volume: -6,
  })
    .sync()
    .toDestination(),
}

const synth3 = {
  name: 'Synth 3',
  shortName: 'Snt3',
  octave: 3,
  engine: new Synth({ volume: -6 }).sync().toDestination(),
}

const pluck1 = {
  name: 'Pluck 1',
  shortName: 'Plk1',
  engine: new PluckSynth({ volume: -6 }).sync().toDestination(),
}

const pluck2 = {
  name: 'Pluck 2',
  shortName: 'Plk2',
  engine: new PluckSynth({ volume: -4 }).sync().toDestination(),
}

const am1 = {
  name: 'AM 1',
  engine: new AMSynth({ volume: -3 }).sync().toDestination(),
}

const am2 = {
  name: 'AM 2',
  engine: new AMSynth({
    volume: 0,
    harmonicity: 3.2,
    oscillator: {
      type: 'fatsawtooth',
    },
    envelope: {
      attack: 0,
      decay: 0.1,
      sustain: 0.1,
      release: 0.5,
    },
    modulation: {
      type: 'sine2',
    },
    modulationEnvelope: {
      attack: 0.05,
      decay: 0.01,
    },
  })
    .sync()
    .toDestination(),
}

const metal1 = {
  name: 'Metal 1',
  shortName: 'Mtl1',
  engine: new MetalSynth({
    harmonicity: 12,
    resonance: 1200,
    modulationIndex: 16,
    envelope: {
      decay: 0.2,
    },
    volume: -12,
  })
    .sync()
    .toDestination(),
}

const metal2 = {
  name: 'Metal 2',
  shortName: 'Mtl1',
  engine: new MetalSynth({
    harmonicity: 8,
    resonance: 300,
    modulationIndex: 22,
    envelope: {
      decay: 0.5,
    },
    volume: -14,
  })
    .sync()
    .toDestination(),
}

const fun1 = {
  name: 'Fun 1',
  engine: new Synth({
    volume: -6,
    oscillator: {
      type: 'fatsawtooth',
      harmonicity: 4,
      modulationType: 'amtriangle',
    },
  })
    .sync()
    .toDestination(),
}

const fun2 = {
  name: 'Fun 2',
  engine: new Synth({
    volume: -6,
    oscillator: {
      type: 'sine',
      harmonicity: 0.5,
      modulationType: 'fatsawtooth',
    },
  })
    .sync()
    .toDestination(),
}

const fat = {
  name: 'Fat',
  octave: 2,
  engine: new PolySynth(Synth, {
    oscillator: {
      type: 'fatsawtooth',
      count: 3,
      spread: 30,
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.4,
      attackCurve: 'exponential',
    },
  })
    .sync()
    .toDestination(),
}

const sampler1 = {
  name: 'Sampler 1',
  shortName: 'Smp1',
  engine: new Sampler({
    urls: {
      C4: 'uh.mp3',
    },
    baseUrl: SAMPLE_BASE_URL,
  })
    .sync()
    .toDestination(),
}

const sampler2 = {
  name: 'Sampler 2',
  shortName: 'Smp2',
  engine: new Sampler({
    urls: {
      C4: 'yeah.mp3',
    },
    baseUrl: SAMPLE_BASE_URL,
  })
    .sync()
    .toDestination(),
}

const duo1 = {
  name: 'Duo 1',
  octave: 2,
  engine: new DuoSynth({
    volume: -6,
    portamento: 0.5,
    vibratoAmount: 1,
    vibratoRate: 1,
  })
    .sync()
    .chain(duoFilter, duoReverb, Destination),
}

const duo2 = {
  name: 'Duo 2',
  octave: 1,
  engine: new DuoSynth({
    volume: -6,
    portamento: 0,
    vibratoAmount: 0.5,
    vibratoRate: 0.5,
  })
    .sync()
    .chain(duoFilter, duoReverb, Destination),
}

const instruments = [
    undefined, // Reserved for falsy
    kick, //black
    snare, //white
    hihat, //red
    synth2, //green
    pluck2, //yellow
    duo1, //blue
    sampler1, //cyan
    mono2, //magenta
    fun2, //gray
]

export default instruments
