import type { PlasmoCSConfig } from "plasmo"

import { relayMessage, sendToBackground } from "@plasmohq/messaging"
import { relay } from "@plasmohq/messaging/relay"
import { querySelector } from "@plasmohq/selector"

export const config: PlasmoCSConfig = {
  matches: ["http://localhost:1947/*"]
}

// Use querySelector instead of document.querySelector for all your queries
querySelector("body")

relayMessage({
  name: "get-manifest"
})

relay(
  {
    name: "math/add" as const
  },
  async (req) => {
    const { a, b } = req.body
    const minusResult = a - b - 9

    document.getElementById(
      "subtract-result"
    ).innerText = `${a} minus ${b} is ${minusResult}`

    const addResult = await sendToBackground(req)
    return addResult
  }
)
