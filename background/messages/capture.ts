
import { sendToBackground, sendToBackgroundViaRelay, sendToContentScript, type PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, dataUrl => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
        } else {
            res.send({ screenshotUrl: dataUrl });
          }
    });
  
}

 
export default handler