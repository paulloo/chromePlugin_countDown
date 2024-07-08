import type { PlasmoMessaging } from "@plasmohq/messaging"
import { usePort } from "@plasmohq/messaging/hook";
import { getPort } from "@plasmohq/messaging/port";
import { Storage } from "@plasmohq/storage"
import axios from "axios";
import dayjs from "dayjs";
const storage = new Storage()


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    
    async function goDonePage() {
      chrome.tabs.create({
        url: "./tabs/delta-flyer.html",
      });
    }

    const port = getPort("capture")
    port.postMessage({
      screenshotUrl: req.body.screenshotUrl,
      width: req.body.width,
      height: req.body.height,
    })
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