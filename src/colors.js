import { actions } from './store'

const colorSchemes = [
 {
  name: 'Standard',
  colors: [
    '#221616',
    '#fffaf2',
    '#d93934',
    '#808000',
    '#ed872d',
    '#556CBC',
    '#10EDF5',
    '#F99FD4',
    '#6b6361',
  ],
 },
 {
  name: 'Basic',
  colors: [
    'black',
    'white',
    'red',
    'green',
    'yellow',
    'blue',
    'cyan',
    'magenta',
    'grey',
  ],
 },
 {
  name: 'Sunset',
  colors: [
    '#00202e',
    '#003f5c',
    '#2c4875',
    '#8a508f',
    '#bc5090',
    '#ff6361',
    '#ff8531',
    '#ffa600',
    '#ffd380',
  ],
 },
 {
  name: '9 shades',
  colors: [
    '#161618',
    '#353537',
    '#525253',
    '#6f6f70',
    '#8c8c8d',
    '#a8a8a9',
    '#c5c5c6',
    '#e2e2e2',
    '#ffffff',
  ],
 },
 {
  name: 'The Blues',
  colors: [
    '#0d1822',
    '#1b3146',
    '#294b6b',
    '#36648f',
    '#447eb4',
    '#5297d8',
    '#a9cbec',
    '#d4e5f6',
    '#eaf2fb',
  ],
 },
 {
  name: 'PICO-4',
  colors: [
    '#1D2B53',
    '#7E2553',
    '#008751',
    '#AB5236',
    '#FFF1E8',
    '#FF004D',
    '#FFA300',
    '#29ADFF',
    '#FF77A8',
  ],
 }
]

const setColorScheme = (scheme) => {
  actions.setColorScheme(scheme)

  const colorScheme = colorSchemes[scheme]

  for (let i = 0; i < 9; i++) {
    const color = colorScheme.colors[i]
    document.documentElement.style.setProperty(`--color-${i + 1}`, color)
  }
}

export { colorSchemes, setColorScheme }
