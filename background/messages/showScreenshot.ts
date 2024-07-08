
import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import axios from "axios";
import dayjs from "dayjs";
import { isEmpty } from "radash";
const storage = new Storage()


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    console.log("showScreenshot.ts", req.body)

    chrome.windows.create({
        url: req.body.screenshotUrl,
        type: 'popup',
        width: req.body.width,
        height: req.body.height
      });
}

 
export default handler