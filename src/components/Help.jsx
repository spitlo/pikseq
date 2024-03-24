import { createEffect, createSignal, Show } from 'solid-js'
import { version } from '../utils'
import { storage } from '../storage'

import './Help.css'

const Help = () => {
  let createdWith = version

  const [showVersionWarning, setShowVersionWarning] = createSignal(false)

  createEffect(() => {
    if (storage && storage.createdWith) {
      // This is a saved composition, compare versions
      createdWith = storage.createdWith
      const createdWithParts = createdWith.split('.')
      const currentVersionParts = version.split('.')

      // Do some heavy handed semver logic
      if (currentVersionParts[1] === '0') {
        // Semver minor is still 0, warn on patch version mismatch
        if (createdWithParts[2] !== currentVersionParts[2]) {
          setShowVersionWarning(true)
        }
      } else {
        // Semver minor is > 0, show warning on minor and major mismatch.
        // This logic probably has some pitfalls but it’s good enough for us.
        if (
          createdWithParts[1] !== currentVersionParts[1] ||
          createdWithParts[0] !== currentVersionParts[0]
        ) {
          setShowVersionWarning(true)
        }
      }
    }
  })

  return (
    <div class="help">
      <h1>Help!</h1>
      <p>
        PIKSEQ is a mix between a pixel art editor and a sequencer.
      </p>
      <p>
        Pick a color by clicking the color button or pressing keys <code>1</code>-<code>9</code>.
        Then start painting! You can only paint by clicking a pixel at a time, sorry :(
      </p>
      <p>
        To help you, there are some keyboard modifiers. If you press <code>alt</code>/<code>option</code> while
        painting a pixel, you will get a horizontal line. If you press <code>shift</code> while painting
        a pixel, you will get a vertical line. Lines extend through all pixels of the same
        color, so you can put a start and end pixel and the line will cover the area between
        them. If you press <code>windows</code>/<code>command</code>/<code>meta</code> (depending on your OS) the line will only
        paint every other pixel.
      </p>
      <p>
        Use keys <code>a</code>-<code>y</code> to mute tracks.
      </p>
      <p>
        Save works OK but I wouldn’t trust it with my life. It saves the current
        state of your composition in the URL, just copy it from the address bar
        to share it.
      </p>
      {/*
      <p>
        1: Kick
        2: Snare
        3: Hi-hat
        4: Synth 2
        5: Pluck 2
        6: Duo 1
        7: Sampler 1
        8: Mono 2
        9: Fun 2
      </p>
      */}
      <p>Version: {version}</p>
      <Show when={showVersionWarning()}>
        <p class="warning">
          The current composition is saved with version {createdWith}. PIKSEQ
          is running version {version}. Some sounds may not represent what the
          original composer intended.
        </p>
      </Show>
    </div>
  )
}

export default Help
