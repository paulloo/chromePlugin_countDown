import { usePort } from "@plasmohq/messaging/hook"
import { Storage } from "@plasmohq/storage"
import "../styles/main.css"
import { sendToBackground } from "@plasmohq/messaging"
import dayjs from "dayjs"

const storage = new Storage()

type RequestBody = {
  hello: string
}

type ResponseBody = {
  message: string
}

export default function DeltaFlyerPage() {
  const mailPort = usePort<RequestBody, ResponseBody>("mail")

  function handleClose() {
    // 获取当前激活的标签页
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // tabs[0] 是当前激活的标签页
      const currentTabId = tabs[0].id
      if (currentTabId) {
        // 使用 chrome.tabs.remove 关闭当前标签页
        chrome.tabs.remove(currentTabId)
      }
    })
  }

  async function handleRepeat() {
    const deadLine = await storage.get("deadLine") || ''
    const allAddedSeconds = await storage.get("allAddedSeconds") || ''
    if(!deadLine) {
        return
    }
    const resp = await sendToBackground({
        name: "countdown",
        body: {
          action: 'start',
          type: 'seconds',
          deadLine: dayjs(deadLine).valueOf(),
          seconds: allAddedSeconds
        }
      })

      
      chrome.action.setBadgeText({ text: `${allAddedSeconds}s` })

      debugger
      handleClose()

  }

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <div className="">
        <div className="flex justify-center items-center">
          <div className="mt-10">
            <div className="relative w-36 h-30 rounded-full transition duration-500 z-10">
              <svg>
                <circle cx="70" cy="70" r="70"></circle>
                <circle
                  cx="70"
                  cy="70"
                  r="70"
                  style={{ strokeDashoffset: "calc(444.4)" }}></circle>
              </svg>
              <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center rounded-full">
                <div
                  className="w-full h-full bg-gray-200 bg-opacity-30 bg-no-repeat bg-center bg-[length:60%] text-white rounded-full"
                  style={{
                    backgroundImage:
                      "url(&quot;./img/icon_cowboy_hat.svg&quot;)"
                  }}></div>
                <h2>
                  <span>&nbsp;</span>
                </h2>
              </div>
            </div>
          </div>
        </div>
        <div className="block text-center mt-5">
          <button
            className="btn inline-block cursor-pointer rounded-lg text-white text-lg leading-[3em] min-w-[130px] border border-transparent"
            style={{ backgroundColor: "rgb(14, 152, 12)" }}
            onClick={handleClose}>
            Close
          </button>
          <button className="btn inline-block cursor-pointer rounded-lg text-white bg-gray-600 text-lg leading-[3em] min-w-[130px] border border-transparent" onClick={handleRepeat}>
            Repeat
          </button>
        </div>
      </div>
    </div>
  )
}
