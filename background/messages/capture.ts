
import { sendToBackground, sendToBackgroundViaRelay, sendToContentScript, type PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import axios from "axios";
import dayjs from "dayjs";
import { isEmpty } from "radash";
import windowChange from "~background/injected-helper";
const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {

    console.log("req: ", req)

    chrome.tabs.captureVisibleTab(null, { format: 'png' }, dataUrl => {
        res.send({ screenshotUrl: dataUrl });
    });
  
}

 
export default handler