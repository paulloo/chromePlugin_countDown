import "@plasmohq/messaging/background"
import { init } from "@plasmohq/selector/background"

import { startHub } from "@plasmohq/messaging/pub-sub"

init({
    monitorId: process.env.PLASMO_PUBLIC_ITERO_SELECTOR_MONITOR_ID
})
console.log(`BGSW - Starting Hub`)
startHub()
