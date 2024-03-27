import * as Tone from 'tone'
import { createEffect } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

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

const tracks = []
for (let id=0; id < 26; id++) {
  tracks.push({
      id,
      instrument: initialnstrument,
      muted: false,
      note: getArrayElement(BASE_SCALE),
      ticks: new Array(TRACK_LENGTH).fill(0),
  })
}

const [store, setStore] = createStore({
  bpm: 85,
  colorScheme: 0,
  createdWith: version,
  currentColor: 1,
  initiated: false,
  playing: false,
  saved: true,
  steps: new Array(TRACK_LENGTH).fill(0),
  tracks,
})

const initContext = () => {
  Tone.setContext(new Tone.Context({ latencyHint: 'playback' }))
}

const loop = (time) => {
  for (let trackId = 0; trackId < store.tracks.length; trackId++) {
    let step = index % 32
    const currentTrack = store.tracks[trackId]
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

  index++
}

const nextColor = () => {
  let currentColor = store.currentColor
  if (currentColor > 8) {
    currentColor = 1
  } else {
    currentColor++
  }
  setStore('currentColor', currentColor)
}

const toggleTick = async (trackId, tickId, color) => {
  setStore(
    'tracks',
    (tracks) => tracks.id === trackId,
    produce((track) => {
      if (track.ticks[tickId] === color) {
        track.ticks[tickId] = 0
      } else {
        track.ticks[tickId] = color
      }
    })
  )
}

const handleTickClick = (trackId, tickId, color, keys) => {
  // First, pick the color of the clicked tick
  const baseColor = store.tracks[trackId].ticks[tickId]
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
      counter = counter + stepSize
      if (tickId - counter < 0) {
        togglePrev = false
      }
      if (tickId + counter === TRACK_LENGTH) {
        toggleNext = false
      }
      if (togglePrev) {
        let prevTick = store.tracks[trackId].ticks[tickId - counter]
        if (prevTick === baseColor) {
          toggleTick(trackId, tickId - counter, color)
        } else {
          togglePrev = false
        }
      }
      if (toggleNext) {
        let nextTick = store.tracks[trackId].ticks[tickId + counter]
        if (nextTick === baseColor) {
          toggleTick(trackId, tickId + counter, color)
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
      counter = counter + stepSize
      if (trackId - counter < 0) {
        togglePrev = false
      }
      if (trackId + counter === store.tracks.length) {
        toggleNext = false
      }
      if (togglePrev) {
        let prevTick = store.tracks[trackId - counter].ticks[tickId]
        if (prevTick === baseColor) {
          toggleTick(trackId - counter, tickId, color)
        } else {
          togglePrev = false
        }
      }
      if (toggleNext) {
        let nextTick = store.tracks[trackId + counter].ticks[tickId]
        if (nextTick === baseColor) {
          toggleTick(trackId + counter, tickId, color)
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

const resetSteps = () => {
  const steps = new Array(TRACK_LENGTH).fill(0)
  setStore('steps', steps)
}

const saveStore = () => {
  Tone.Transport.stop()
  resetSteps()
  setStore(
    produce((store) => {
      store.initiated = false
      store.playing = false
      store.saved = true
    })
  )
  stash(store)
  save()
}

const initAndPlay = () => {
  Tone.start()
  Tone.Transport.bpm.value = store.bpm
  Tone.Transport.scheduleRepeat(loop, '16n')
  Tone.Transport.start()

  setStore(
    produce((store) => {
      store.initiated = true
      store.playing = true
    })
  )
}

const togglePlay = () => {
  if (store.playing) {
    Tone.Transport.stop()
    index = 0
    resetSteps()
    setStore('playing', false)
  } else {
    resetSteps()
    if (store.initiated) {
      Tone.Transport.start()
      setStore('playing', true)
    } else {
      initAndPlay()
    }
  }
}

const setColorScheme = (scheme) => {
  setStore('colorScheme', scheme)
}

const reset = () => {
  location.href = '.'
}

const actions = {
  handleTickClick,
  initAndPlay,
  initContext,
  nextColor,
  reset,
  saveStore,
  setBpm,
  setColorScheme,
  toggleMute,
  togglePlay,
}

export { TRACK_LENGTH, actions, loop, setStore, store }
