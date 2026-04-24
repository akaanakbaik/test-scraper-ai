let debugMode = false

export const setDebug = value => {
  debugMode = Boolean(value)
}

export const isDebug = () => debugMode

export const debugLog = (...args) => {
  if (debugMode) console.log(...args)
}