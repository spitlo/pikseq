import * as Tone from 'tone'
import { createEffect, For, onCleanup, onMount } from 'solid-js'
import { useKeyDownEvent, useKeyDownList } from '@solid-primitives/keyboard'
import { writeClipboard } from '@solid-primitives/clipboard'

import Help from './components/Help'
import Track from './components/Track'
import createModal from './components/Modal'
import instruments from './instruments'
import { actions, setStore, store } from './store'
import { colorSchemes, setColorScheme } from './colors'
import { load, storage } from './storage'

import './App.css'

function App() {
  const initApp = async () => {
    load()
    if (storage && storage.bpm) {
      setStore(storage)
      setColorScheme(storage.colorScheme)
    }
  }

  const cleanup = () => {
    Tone.Transport.dispose()
  }

  const kdEvent = useKeyDownEvent()
  const kdList = useKeyDownList()

  const [SaveModal, toggleSaveModal] = createModal()

  createEffect(() => {
    console.log(store) /* eslint-disable-line */
    const e = kdEvent()
    if (e && e.key) {
      const charCode = e.key.charCodeAt()
      if (charCode > 96 && charCode < 123) {
        // Letters a-z
        const trackId = charCode - 97
        actions.toggleMute(trackId)
      } else if (charCode > 48 && charCode < 58) {
        // Numbers 1-9. Change current color
        setStore('currentColor', Number(e.key))
      } else if (charCode === 45) {
        // This triggers an infinite loop, investigate
        // actions.prevColor()
      } else if (charCode === 43) {
        // actions.nextColor()
      }
      // e.preventDefault()
    }
  })

  onMount(initApp)
  onCleanup(cleanup)

  return (
    <>
      <div class="container">
        <div></div>
        <div class="header">
          <For each={colorSchemes[store.colorScheme].colors}>
            {(color, index) => (
              <button
                class={`palette color-${index() + 1} ${index() + 1 === store.currentColor ? ' active' : ''}`}
                onClick={() => {
                  setStore('currentColor', index() + 1)
                }}
                data-tooltip={instruments[index() + 1].name}
                data-placement="bottom"
              />
            )}
          </For>
          <button
            class="animation"
            disabled={store.playing || store.frame === 0}
            onClick={actions.prevFrame}
          >
            {'<'}
          </button>
          <span class="animation-indicator">Frame {store.frame + 1}</span>
          <button
            class="animation"
            disabled={store.playing || store.frame === store.frames.length - 1}
            onClick={actions.nextFrame}
          >
            {'>'}
          </button>
          <button
            class="animation"
            disabled={store.frames.length > 7}
            onClick={actions.addFrame}
          >
            {'+'}
          </button>
          <button
            class="animation"
            disabled={store.frames.length > 7}
            onClick={actions.dupeFrame}
          >
            {'C'}
          </button>
          <label class="animation-animate">
            <input
              type="checkbox"
              disabled={store.frames.length === 1}
              checked={store.animate}
              onClick={() => {
                setStore('animate', !store.animate)
              }}
            />{' '}
            Animate
          </label>
        </div>

        <For each={store.frames[store.frame]}>
          {(track, trackIndex) => {
            const { id, ticks } = track
            return (
              <Track
                class={`track ${track.muted ? 'muted' : ''}`}
                track={track}
              >
                <For each={ticks}>
                  {(tick, tickIndex) => {
                    return (
                      <input
                        type="checkbox"
                        checked={tick}
                        onChange={() => {
                          actions.handleTickClick(
                            track.id,
                            tickIndex(),
                            store.currentColor,
                            kdList()
                          )
                          return false
                        }}
                        class={`${
                          store.steps[trackIndex()] === tickIndex()
                            ? 'onstep'
                            : 'offstep'
                        } color-${tick}`}
                      />
                    )
                  }}
                </For>
              </Track>
            )
          }}
        </For>

        <div></div>
        <div class="grid toolbar">
          <button
            onClick={(e) => {
              actions.saveStore()
              toggleSaveModal()
            }}
            disabled={store.saved}
          >
            Save
          </button>
          <button onClick={actions.initAndPlay} disabled={store.playing}>
            Play
          </button>
          <input
            disabled
            type="number"
            value={store.bpm}
            step="5"
            onChange={(e) => {
              actions.setBpm(e.target.value)
            }}
          />
          <button onClick={actions.reset}>Reset</button>
          <button
            onClick={actions.nextColor}
            class={`color-button color-${store.currentColor}`}
          >
            Color
          </button>
          <select
            value={store.colorScheme}
            onChange={(e) => {
              setColorScheme(e.target.value)
            }}
          >
            <For each={colorSchemes}>
              {(color, index) => <option value={index()}>{color.name}</option>}
            </For>
          </select>
        </div>

        <div></div>
        <Help />
      </div>

      <SaveModal
        title="Saved!"
        secondaryButton={{
          text: 'Copy',
          onClick: () => {
            writeClipboard(location.href)
            toggleSaveModal()
          },
        }}
      >
        <p>
          This project is now saved in the URL. You can copy the URL and share
          with a friend, or keep it for yourself. Click "Copy" to put the URL in
          your clipboard.
        </p>
        <p>
          To update the URL after you have done some changes, just hit "Save"
          again.
        </p>
      </SaveModal>
    </>
  )
}

export default App
