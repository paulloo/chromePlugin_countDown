import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["https://www.baidu.com/*"]
}

window.addEventListener("load", () => {
  document.body.style.background = "#c7edcc"

  const hotsearchWrapperEle = document.querySelector('#s-hotsearch-wrapper') as HTMLElement;
  hotsearchWrapperEle.style.display = 'none';
  const htmlBodyEle = document.querySelector('html body') as HTMLElement;
  htmlBodyEle.style.color = "#000000";
  htmlBodyEle.style.backgroundColor = "#c7edcc";

  const appContentEle = document.querySelector('.app_content') as HTMLElement;
  appContentEle.style.color = "#000000";
  appContentEle.style.backgroundColor = "#c7edcc";

  const readerTopBarEle = document.querySelector('.readerTopBar') as HTMLElement;
  readerTopBarEle.style.color = "#000000";
  readerTopBarEle.style.backgroundColor = "#c7edcc";
})


async function sendBk() {
  const resp = await sendToBackground({
    name: "ping",
    body: {
      id: 123
    },
    // extensionId: process.env.PLASMO_PUBLIC_EXTENSION_ID // find this in chrome's extension manager
    extensionId: 'dibhfckmodmfeoiopkjfabppkkkhkmie'
  })
  console.log('baidu res: ', resp)
}

sendBk()
