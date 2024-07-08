
import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import axios from "axios";
import dayjs from "dayjs";
import { isEmpty } from "radash";
import { countDown } from "~utils";
const storage = new Storage()

function formatDuration(
  days: number,
  hours: number,
  minutes: number,
  seconds: number
): string {
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

let intervalId = null;
let progressTimer = null;

function goDonePage() {
    
  chrome.tabs.create({
    url: "./tabs/alarm.html",
  });
}


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    let deadLine = req.body.deadLine

    const countDownType = req.body.type

    if(countDownType === 'seconds') {
      
      const _dayTime = dayjs()
      deadLine = _dayTime.add(req.body.seconds, 'second').format('YYYY-MM-DD HH:mm:ss')

      res.send({ message: "start repeat" });
    }


    clearInterval(intervalId);
    clearInterval(progressTimer);
    console.log("deadLine: ",  deadLine,  req.body.action)
    const afterNow = deadLine && dayjs(deadLine).isAfter(dayjs())
    if( req.body.action === "stop" || !afterNow) {
      await storage.remove('deadLine')
      res.send({ message: "stop countdown" });
      return
    }

    intervalId = setInterval(async () => {

      const { days, time, hours, minutes, seconds, ms } = countDown(deadLine)

      const badge = formatDuration(days, hours, minutes, seconds) // 30秒
   
      if (ms <= 0) {
        clearInterval(intervalId);
        chrome.runtime.sendMessage({ name: "countdownFinished" });
        chrome.action.setBadgeText({ text: 'Done' })

        goDonePage()
        
      } else {
        
        chrome.action.setBadgeText({ text: badge })
        const currentTheme = await storage.get('currentTheme') || {}
        // chrome.action.setBadgeBackgroundColor({ color: !isEmpty(currentTheme)? currentTheme.color: [0, 255, 0, 0] })
        chrome.runtime.sendMessage({ name: "countdownUpdate", body: { days, time, hours, minutes, seconds, ms } });
      }
    }, 1000);

    const totalTime = dayjs(deadLine).diff(dayjs(), "millisecond");
    
    progressTimer = setInterval(() => {
      const elapsedTime = dayjs(deadLine).diff(dayjs(), "millisecond");
      const progress = Math.max(0, Math.min(1, elapsedTime / totalTime));
      if(progress <= 0 || !progress) {
        clearInterval(progressTimer);
        return;
      }
      chrome.runtime.sendMessage({ name: "countdownProgress", body: { progress: progress * 100 } });
    }, 300);
  
}

 
export default handler