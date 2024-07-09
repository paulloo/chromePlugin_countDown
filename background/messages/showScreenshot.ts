import type { PlasmoMessaging } from "@plasmohq/messaging"
import { usePort } from "@plasmohq/messaging/hook";
import { getPort } from "@plasmohq/messaging/port";
import { Storage } from "@plasmohq/storage"
import axios from "axios";
import dayjs from "dayjs";
const storage = new Storage({
  area: "local"
})


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    
    async function goDonePage() {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0].id;

      chrome.tabs.create({
        url: "./tabs/delta-flyer.html",
      }, async (tab) => {
        const captureData = {
          screenshotUrl: req.body.screenshotUrl,
          width: req.body.width,
          height: req.body.height,
        }
        await storage.set('captureData', captureData)

        // chrome.tabs.onUpdated.addListener(async function listener(tabId, changeInfo, tab) {
        //   if(tabId === tab.id && changeInfo.status === 'complete') {
           
        //     // chrome.tabs.sendMessage(tab.id, {
        //     //   type: 'CAPTURE_DATA',
        //     //   data: captureData
        //     // })

        //     // chrome.tabs.onUpdated.removeListener(listener)
        //   }
        // })
      });
    }

    // const port = getPort("capture")
    // port.postMessage({
    //   screenshotUrl: req.body.screenshotUrl,
    //   width: req.body.width,
    //   height: req.body.height,
    // })



    // chrome.windows.create({
    //   url: req.body.screenshotUrl,
    //   type: 'popup',
    //   width: req.body.width,
    //   height: req.body.height
    // });
    goDonePage()

    res.send({
      status: "success"
    })

}

 
export default handler