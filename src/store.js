import * as Tone from 'tone'
import { createEffect, untrack } from 'solid-js'
import { createStore, produce, unwrap } from 'solid-js/store'

import instruments from './instruments'
import { load, save, stash, storage } from './storage'
import {
  getArrayElement,
  getRandomInt,
  getRandomIntExcept,
  version,
} from './utils'

const BASE_SCALE = ['E', 'F#', 'G#', 'A', 'B', 'C', 'D'] // Aeolian Dominant scale
const INSTRUMENT_AMOUNT = instruments.length
const TRACK_LENGTH = 32

const initialnstrument = getRandomInt(0, instruments.length - 1)

let index = 0

const generateTtracks = () => {
  const tracks = []
  for (let id = 0; id < 26; id++) {
    tracks.push({
      id,
      muted: false,
      // Should we keep this like it is? Or do we want consistent
      // notes across frames?
      note: getArrayElement(BASE_SCALE),
      ticks: new Array(TRACK_LENGTH).fill(0),
    })
  }
  return tracks
}

const [store, setStore] = createStore({
  animate: false,
  bpm: 85,
  colorScheme: 0,
  createdWith: version,
  currentColor: 1,
  frame: 0,
  frames: [generateTtracks()],
  initiated: false,
  playing: false,
  saved: true,
  steps: new Array(TRACK_LENGTH).fill(0),
})

const initContext = () => {
  Tone.setContext(new Tone.Context({ latencyHint: 'playback' }))
}

const loop = (time) => {
  for (let trackId = 0; trackId < store.frames[store.frame].length; trackId++) {
    let step = index % 32
    const currentTrack = store.frames[store.frame][trackId]
    if (!currentTrack.muted) {
      if (currentTrack.ticks[step]) {
        const instrumentId = currentTrack.ticks[step]
        if (instruments[instrumentId]) {
          const instrument = instruments[instrumentId]
          const engine = instrument.engine
          const octave = instrument.octave || 4
          if (engine) {
            if (engine.name === 'NoiseSynth') {
              engine.triggerAttackRelease('32n', time)
            } else if (engine.name === 'MembraneSynth') {
              engine.triggerAttackRelease('C1', '32n', time)
            } else {
              engine.triggerAttackRelease(
                `${currentTrack.note}${octave}`,
                '32n',
                time
              )
            }
          }
        }
      }
    }

    Tone.Draw.schedule(() => {
      const steps = store.steps
      setStore('steps', trackId, step)
    }, time)
  }

  if (store.animate) {
    if (index % 2 === 0) {
      let nextFrame = store.frame + 1
      if (nextFrame > store.frames.length - 1) {
        nextFrame = 0
      }
      setStore('frame', nextFrame)
    }
  }

  index++
}

const prevColor = () => {
  let currentColor = untrack(() => store.currentColor)
  if (currentColor < 2) {
    currentColor = 9
  } else {
    currentColor--
  }
  setStore('currentColor', currentColor)
}

const nextColor = () => {
  let currentColor = untrack(() => store.currentColor)
  if (currentColor > 8) {
    currentColor = 1
  } else {
    currentColor++
  }
  setStore('currentColor', currentColor)
}

const toggleTick = async (trackId, tickId, color) => {
  setStore(
    'frames',
    store.frame,
    produce((frame) => {
      if (frame[trackId].ticks[tickId] === color) {
        frame[trackId].ticks[tickId] = 0
      } else {
        frame[trackId].ticks[tickId] = color
      }
    })
  )
}

const handleTickClick = (trackId, tickId, color, keys) => {
  // First, pick the color of the clicked tick
  const baseColor = store.frames[store.frame][trackId].ticks[tickId]
  // Then toggle the clicked tick
  toggleTick(trackId, tickId, color)

  // If META is pressed, only paint every other tick
  let stepSize = 1
  if (keys.includes('META')) {
    stepSize = 2
  }

  // Now check if this is a line click
  if (keys.includes('ALT')) {
    // Horizontal line
    let togglePrev = true
    let toggleNext = true
    let counter = 0
    // Loop until we reach a stop on bothe sides
    while (togglePrev || toggleNext) {
      counter++
      if (tickId - counter < 0) {
        togglePrev = false
      }
      if (tickId + counter === TRACK_LENGTH) {
        toggleNext = false
      }
      if (togglePrev) {
        let prevTick =
          store.frames[store.frame][trackId].ticks[tickId - counter]
        if (prevTick === baseColor) {
          if (counter % stepSize === 0) {
            toggleTick(trackId, tickId - counter, color)
          }
        } else {
          togglePrev = false
        }
      }
      if (toggleNext) {
        let nextTick =
          store.frames[store.frame][trackId].ticks[tickId + counter]
        if (nextTick === baseColor) {
          if (counter % stepSize === 0) {
            toggleTick(trackId, tickId + counter, color)
          }
        } else {
          toggleNext = false
        }
      }
    }
  } else if (keys.includes('SHIFT')) {
    // Vertical line
    let togglePrev = true
    let toggleNext = true
    let counter = 0
    while (togglePrev || toggleNext) {
      counter++
      if (trackId - counter < 0) {
        togglePrev = false
      }
      if (trackId + counter === store.frames[store.frame].length) {
        toggleNext = false
      }
      if (togglePrev) {
        let prevTick =
          store.frames[store.frame][trackId - counter].ticks[tickId]
        if (prevTick === baseColor) {
          if (counter % stepSize === 0) {
            toggleTick(trackId - counter, tickId, color)
          }
        } else {
          togglePrev = false
        }
      }
      if (toggleNext) {
        let nextTick =
          store.frames[store.frame][trackId + counter].ticks[tickId]
        if (nextTick === baseColor) {
          if (counter % stepSize === 0) {
            toggleTick(trackId + counter, tickId, color)
          }
        } else {
          toggleNext = false
        }
      }
    }
  }

  setStore('saved', false)
}

const toggleMute = (trackId) => {
  setStore(
    'tracks',
    (tracks) => tracks.id === trackId,
    produce((track) => {
      track.muted = !track.muted
    })
  )
  setStore('saved', false)
}

const setBpm = (newBpm) => {
  Tone.Transport.bpm.value = newBpm
  setStore(
    produce((store) => {
      store.bpm = newBpm
      store.saved = false
    })
  )
}

const saveStore = async () => {
  await Tone.Transport.stop()
  const steps = new Array(store.steps.length).fill(0)
  setStore(
    produce((store) => {
      store.initiated = false
      store.playing = false
      store.saved = true
      store.steps = steps
      store.createdWith = version
    })
  )
  stash(store)
  save()
}

const initAndPlay = async () => {
  await Tone.start()
  Tone.Transport.bpm.value = store.bpm
  Tone.Transport.scheduleRepeat(loop, '16n')
  await Tone.Transport.start()

  setStore(
    produce((store) => {
      store.initiated = true
      store.playing = true
    })
  )
}

const setColorScheme = (scheme) => {
  setStore('colorScheme', scheme)
}

const reset = () => {
  location.href = '.'
}

const prevFrame = () => {
  let frame = untrack(() => store.frame) - 1
  const frames = untrack(() => store.frames)
  if (frame < 0) {
    frame = frames.length - 1
  }
  setStore('frame', frame)
}

const nextFrame = () => {
  let frame = untrack(() => store.frame) + 1
  const frames = untrack(() => store.frames)
  if (frame > frames.length - 1) {
    frame = 0
  }
  setStore('frame', frame)
}

const addFrame = () => {
  // If this is the first added frame, enable animation
  if (store.frames.length === 1) {
    setStore('animate', true)
  }

  const newTrack = generateTtracks()
  if (store.frames.length < 8) {
    setStore(
      produce((store) => {
        store.frames.push(newTrack)
        store.frame = store.frame + 1
      })
    )
  }
}

const dupeFrame = () => {
  // If this is the first added frame, enable animation
  if (store.frames.length === 1) {
    setStore('animate', true)
  }

  const currentTrack = store.frames[store.frame]
  // We use unwrap so that we can use structuredClone to make a copy
  const newTrack = structuredClone(unwrap(currentTrack))
  if (store.frames.length < 8) {
    setStore(
      produce((store) => {
        store.frames.push(newTrack)
        store.frame = store.frame + 1
      })
    )
  }
}

const deleteFrame = () => {
  const currentFrame = store.frame
  prevFrame()
  setStore(
    produce((store) => {
      store.frames.splice(currentFrame, 1)
    })
  )
}

const actions = {
  addFrame,
  deleteFrame,
  dupeFrame,
  handleTickClick,
  initAndPlay,
  initContext,
  nextColor,
  nextFrame,
  prevColor,
  prevFrame,
  reset,
  saveStore,
  setBpm,
  setColorScheme,
  toggleMute,
}

export { TRACK_LENGTH, actions, loop, setStore, store }
