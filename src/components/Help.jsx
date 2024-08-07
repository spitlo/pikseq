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
        PIKSEQ is a <del>stupid</del> fun mix between a pixel art editor and a
        sequencer. It also does animation.
      </p>

      <hr />

      <details>
        <summary>Painting</summary>
        <p>
          Pick a color by clicking the colored squares in the top toolbar or
          pressing keys <code>1</code>-<code>9</code>. Then start painting! You
          can only paint by clicking a pixel at a time, sorry{' '}
          <i class="emoticon sad" />
        </p>
        <p>
          If you don’t enjoy the palette, you can pick another one in the
          dropdown next to the COLOR button.
        </p>
        <p>
          To help you paint faster, there are some keyboard modifiers. If you
          press <code>alt</code>/<code>option</code> while painting a pixel, you
          will get a horizontal line. If you press <code>shift</code> while
          painting a pixel, you will get a vertical line. Lines extend through
          all pixels of the same color, so you can put a start and end pixel and
          the line will cover the area between them. If you hold down
          <code>windows</code>/<code>command</code>/<code>meta</code> (depending
          on your OS) as well while paint a line, the line will only paint every
          other pixel.
        </p>
        <p>
          You can also cycle through colors by pressing the COLOR button or
          hitting keys <code>-</code> or <code>+</code>
        </p>
      </details>

      <hr />

      <details>
        <summary>Sounds</summary>
        <p>
          Each color represent a specific sound. For non-drum sounds, the note
          of the sound is controlled by the track it is painted on. The note of
          the track is indicated in the column to the left of the track.
        </p>
        <p>
          You can use keys <code>a</code>-<code>z</code> to mute tracks. The
          mute letter of the track is indicated in the column to the right of
          the track.
        </p>
      </details>

      <hr />

      <details>
        <summary>Animation</summary>
        <p>
          If you want to, you can create multiple frames, which you can then
          animate between. Get started by clicking the <code>+</code> button on
          the Frames toolbar next to the color buttons.
        </p>
        <p>
          For convenience, you can click <code>C</code> instead, to clone the
          current frame into a new frame. This might help if only parts of your
          frame is animated. NOTE: The new frame is always placed as the last
          frame, no matter what frame you copy.
        </p>
        <p>
          To delete the current frame, click the <code>X</code> button.
        </p>
        <p>
          You could also use frames for song parts: Disable animation by
          clicking the checkbox and switch between frames manually by using the
          arrow buttons or hitting keys <code>,</code> or <code>.</code>.
        </p>
        <p>
          When using frames, be aware that the note for a specific track changes
          per frame, to keep everything fun and random. Track mutes are also per
          frame.
        </p>
      </details>

      <hr />

      <details>
        <summary>Saving</summary>
        <p>
          Save works OK but I wouldn’t trust it with my life. It saves the
          current state of your composition in the URL, just copy it from the
          address bar to share it.
        </p>
        <p>
          If you don’t get any sound when you click PLAY, try hitting SAVE and
          reloading your browser.
        </p>
      </details>

      <hr />

      <details>
        <summary>How do I stop this thing?!?</summary>
        <p>
          I’m trying to get Tone.js’ start/stop mechanism functioning reliably,
          but I’ve not had any success so far. Until I get it to work reliably
          and consistently, I don’t want to put a STOP button in the UI at all.
        </p>
        <p>
          For now, do what I do: Save, then reload you browser. This also
          encourages you to save often, so... you’re welcome!{' '}
          <i class="emoticon nerd" />
        </p>
      </details>

      <hr />

      <details>
        <summary>Credits</summary>
        <p>
          Icons from{' '}
          <a
            href="https://emoji.serenityos.net/"
            target="_blank"
            rel="noopener noreferrer"
          >
            SerenityOS
          </a>
        </p>
        <p>
          Fonts by{' '}
          <a
            href="https://github.com/pixeldroid/fonts"
            target="_blank"
            rel="noopener noreferrer"
          >
            pixeldroid
          </a>
        </p>
        <p>
          Sounds by{' '}
          <a
            href="https://tonejs.github.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tone.js
          </a>
        </p>
        <p>
          Looks by{' '}
          <a
            href="https://picocss.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pico CSS
          </a>
        </p>
        <p>
          Reactivity by{' '}
          <a
            href="https://www.solidjs.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Solid
          </a>{' '}
          and{' '}
          <a
            href="https://primitives.solidjs.community/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Solid Primitives
          </a>
        </p>
        <p>
          URL Compression by{' '}
          <a
            href="https://github.com/pieroxy/lz-string"
            target="_blank"
            rel="noopener noreferrer"
          >
            lz-string
          </a>
        </p>
      </details>

      <hr />

      <p>Version: {version}</p>
      <Show when={showVersionWarning()}>
        <p class="warning">
          The current composition is saved with version {createdWith}. PIKSEQ is
          running version {version}. Some sounds may not represent what the
          original composer intended. <i class="emoticon scream" />
        </p>
      </Show>
    </div>
  )
}

export default Help
