import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.plasmo.com/*"]
}

window.addEventListener("load", () => {
  document.body.style.background = "pink"
})

console.log(
    "You may find that having is not so pleasing a thing as wanting. This is not logical, but it is often true."
  )