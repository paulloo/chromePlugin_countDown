import axios from "axios"
import { useEffect, useRef, useState } from "react"

import {
  sendToBackground,
  sendToBackgroundViaRelay,
  sendToContentScript
} from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { padZero, countDown } from '~utils'
import dayjs from "dayjs"
import "../styles/main.css"
import StarRating from "./StarRating"

const storage = new Storage()

function IndexPopup() {
  const timerRef = useRef(null);
  const progressTimerRef = useRef(null)
  const [data, setData] = useState("")
  const [selector, setSelector] = useState("#itero")
  const [csResponse, setCsData] = useState("")
  const [pong, setPong] = useState("")

  const timeRangeList = [{
    value: 10,
    label: "10s"
  }, {
    value: 30,
    label: "30s"
  }, {
    value: 60,
    label: "1m"
  }, {
    value: 300,
    label: "5m"
  }, {
    value: 600,
    label: "10m"
  }, {
    value: 900,
    label: "15m"
  }, {
    value: 1800,
    label: "30m"
  }, {
    value: 3600,
    label: "1h"
  
  }]

  const [hailingFrequency, setHailingFrequency] = useStorage("hailing", "42")

  const [allAddedSeconds, setAllAddedSeconds] = useStorage("allAddedSeconds", 0)
  const [deadLine, setDeadLine] = useStorage("deadLine", "")

  const [countDownDays, setCountDownDays] = useState("")
  const [countDownTime, setCountDownTime] = useState("")

  // 倒计时状态
  const [couting, setCouting] = useState(false)

  const [progress, setProgress] = useState(100)

  async function handleBackgroundMessage(data) {
    const resp = await sendToBackground({
      name: "ping",
      body: {
        id: data || "none"
      }
    })

    console.log(resp)
    setPong(resp.message)
  }

  async function handleBackgroundMessagePop(data) {
    const resp = await sendToBackground({
      // name: "open-extension",
      name: "hash-tx",
      // name: "get-manifest",
      body: {
        input: 2
      }
    })
  }

  async function articleSpider() {
    try {
      const apiURL = "http://111.231.107.70:5508/parse_article"
      const response = await axios.post(apiURL, {
        url: "https://www.sohu.com/a/246999709_119570",
        title_node: "h1",
        content_primary_node: "article",
        content_class: "article"
      })
      console.log(response.data)
      const { title } = response.data
      setPong(title)
      // 在这里可以处理获取到的数据
    } catch (error) {
      console.error("Fetching data failed", error)
      // 处理错误情况
    }
  }
  function formatDuration(
    days: number,
    hours: number,
    minutes: number,
    seconds: number
  ): string {
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}m`
  }

  async function resetCount() {

    clearInterval(timerRef.current )
    clearInterval(progressTimerRef.current)
    setCouting(false)
    chrome.action.setBadgeText({ text: '' })
    // setDeadLine('')
    setAllAddedSeconds(0)
    const resp = await sendToBackground({
      name: "countdown",
      body: {
        action: 'stop',
        deadLine: dayjs(deadLine).valueOf()
      }
    })

    
    console.log('stop: ', resp)
  }

  function doCountDown() {
    if (!deadLine) return;
    clearInterval(timerRef.current);
    clearInterval(progressTimerRef.current);
    setCouting(true);
    const totalTime = dayjs(deadLine).diff(dayjs(), "millisecond");

    timerRef.current = setInterval(() => {
      countDownByDeadLine(deadLine);
    }, 1000);

    progressTimerRef.current = setInterval(() => {
      const elapsedTime = dayjs(deadLine).diff(dayjs(), "millisecond");
      const progress = Math.max(0, Math.min(1, elapsedTime / totalTime));
      setProgress(progress * 100);

      if (progress <= 0) {
        clearInterval(progressTimerRef.current);
        resetCount();
      }
    }, 300);
  }


  function countDownByDeadLine(deadLine) {
    if(!deadLine) {
      return
    }
    setCouting(true)
    const { days, time, hours, minutes, seconds, ms } = countDown(deadLine)
    if (ms <= 0) {
      resetCount()
      return
    }
    setCountDownTime(time)
    
    setCountDownDays(`${days}d`)

    const badge = formatDuration(days, hours, minutes, seconds) // 30秒

    chrome.action.setBadgeText({ text: badge })
    chrome.action.setBadgeBackgroundColor({ color: [0, 255, 0, 0] })
  }

  // 用react 状态来控制 这个评价 五星 的星级评价



  async function setting() {

    // deadLine 必须要在当前之间之后
    const afterNow = !deadLine || dayjs(deadLine).isAfter(dayjs())
    debugger
    console.log("dayjs(deadLine).isAfter(dayjs()): ", dayjs(deadLine).isAfter(dayjs()))
    if(couting || afterNow) {
      setDeadLine('')
      resetCount()
      return
    }
    
    setCouting(true)
    const resp = await sendToBackground({
      name: "countdown",
      body: {
        action: 'start',
        deadLine: dayjs(deadLine).valueOf()
      }
    })
    console.log('start: ', resp)

    // if(couting) {
    //   setDeadLine('')
    //   resetCount()
    //   return
    // }
    // doCountDown()
  }

  async function handleRange(item) {
    setDeadLine('')
    // resetCount()

    // deadLine 必须要在当前之间之后
    const afterNow = dayjs(deadLine).isAfter(dayjs())

    const _dayTime = deadLine && afterNow? dayjs(deadLine): dayjs()
    
    setAllAddedSeconds(allAddedSeconds + item.value)

    const _deadLine = _dayTime.add(item.value, 'second').format('YYYY-MM-DD HH:mm:ss')
    // countDownByDeadLine(_deadLine)
    setDeadLine(_deadLine)
    setCouting(true)

    const { days, time, hours, minutes, seconds, ms } = countDown(_deadLine)
    setCountDownTime(time)
    const resp = await sendToBackground({
      name: "countdown",
      body: {
        action: 'start',
        deadLine: dayjs(_deadLine).valueOf()
      }
    })

    console.log("add Seconds: ", resp)
  }

  async function handleDateChange(date) {
    setDeadLine(date)

    const resp = await sendToBackground({
      name: "countdown",
      body: {
        action: 'start',
        deadLine: dayjs(date).valueOf()
      }
    })

    console.log('date change: ', resp)
  }


  useEffect(() => {
    // 发送开始倒计时的消息
    // chrome.runtime.sendMessage({
    //   name: "countdown",
    //   body: {
    //     deadLine: deadLine
    //   }
    // });

    async function getLocalDate() {

      const localDeadLine = await storage.get("deadLine") || ''
      console.log('localDeadLine: ', localDeadLine)
      console.log(' come in deadLine: ', deadLine)
    }

    getLocalDate()
  
    countDownByDeadLine(deadLine)
    
    // 监听倒计时更新
    const messageListener = (message) => {
      if (message.name === "countdownUpdate") {
        setCountDownTime(message.body.time)
        setCouting(true)
      } else if (message.name === "countdownFinished") {
        console.log("Countdown finished");
      } else if (message.name === 'countdownProgress') {
        setProgress(message.body.progress)
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // 清理监听器
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [deadLine]);

  return (
    <div className="w-96">
      <section id="main" className="flex h-full flex-col justify-between">
        {/* <div className="border-b-2 p-4 dark:border-gray-800">
          <h1 className="text-center text-xl font-semibold leading-6">
            倒计时
          </h1>
        </div> */}
        <div className="settings settingsTime cursor-pointer p-2.5 pt-0">
          {
            timeRangeList.map(item => {
              return (<span className="timeBtn" onClick={() => handleRange(item)} key={item.value}><p className="small inline-flex m-0 p-[2px_3px] rounded-md">+</p>{item.label}</span>)
            })
          }
        </div>
        {couting ? (
          <div
            id="time"
            className="relative px-4 py-8 text-center font-semibold dark:text-gray-400">
            {/* <div className="font-mono text-5xl font-extralight block">{countDownDays}</div> */}
            <div className="font-mono text-5xl font-extralight">
              {countDownTime}
            </div>
            <div className="absolute right-4 top-2 text-center text-base">
              {countDownDays}
            </div>
            <div>
              <div className="flex items-center mb-3">
                  <div className="w-full bg-gray-200 rounded h-2.5 dark:bg-gray-700 me-2">
                      <div className="bg-blue-600 h-2.5 rounded dark:bg-blue-500" style={{width: `${progress}%`}}></div>
                  </div>
              </div>
            </div>


            <div className="text-center text-base">{deadLine}</div>
          </div>
        ) : (
          <div
            id="time"
            className="relative px-4 py-8 text-center font-semibold dark:text-gray-400">
            {/* <div className="font-mono text-5xl font-extralight block">{countDownDays}</div> */}
            <div className="font-mono text-5xl font-extralight">
              --:--:--
            </div>
            <div className="absolute right-4 top-2 text-center text-base">
              <input
                type="date"
                onChange={(e) => handleDateChange(e.target.value)}
                value={deadLine}
              />
            </div>
            <div className="text-center text-base">{deadLine}</div>
          </div>
        )}

        <StarRating />

        

        <div
          id="footer"
          className="grid grid-cols-2 justify-center gap-x-2 divide-x border-t-2 py-4 text-xs font-semibold dark:divide-gray-800 dark:border-gray-800">
          <div className="flex items-center justify-center text-gray-500">
            <a
              href="https://ddp.life/"
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-x-1">
              Help
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                className="h-4 w-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
              </svg>
            </a>
          </div>
          <div
            className="flex items-center justify-center text-gray-500"
            onClick={() => setting()}>
            <button className="flex items-center justify-center gap-x-1 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
                className="h-5 w-5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"></path>
              </svg>

              {couting ? "取消" : "开始"}
            </button>
          </div>
        </div>
      </section>
      {/* <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
      <button
        onClick={() => {
          articleSpider();
        }}
        className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-80"
      >
        文章采集
      </button>
      <div>
        <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">Price</label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input 
          value={hailingFrequency}
          onChange={(e) => setHailingFrequency(e.target.value)}
          type="text" name="price" id="price" className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="0.00" />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <label htmlFor="currency" className="sr-only">Currency</label>
            <select id="currency" name="currency" className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
              <option>USD</option>
              <option>CAD</option>
              <option>EUR</option>
            </select>
          </div>
        </div>
      </div>
      <h2>
        Welcome to your{" "}
        <a href="https://www.plasmo.com" target="_blank">
          Plasmo
        </a>{" "}
        Extension!
      </h2>
      <input onChange={(e) => setData(e.target.value)} value={data} />
      <a href="https://docs.plasmo.com" target="_blank">
        View Docs
      </a>

      <button
        onClick={() => {
          handleBackgroundMessage(data);
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        ping ping
      </button>

      <button
        onClick={() => {
          handleBackgroundMessagePop(data);
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        popup..
      </button>
      <button
        onClick={() => {
          chrome.tabs.create({
            url: "./tabs/delta-flyer.html",
          });
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        open tab page
      </button>
      <button
        onClick={() => {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              const { id } = tabs[0];
              chrome.scripting.executeScript({
                target: { tabId: id },
                func: () => {
                  const iframe = document.createElement("iframe");
                  iframe.src = chrome.runtime.getURL("/tabs/delta-flyer.html");
                  iframe.name = "delta-flyer";
                  document.body.appendChild(iframe);
                },
              });
            }
          );
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        iframe mounting
      </button>

      <input
        value={selector}
        onChange={(e) => setSelector(e.target.value)}
      />
      <button
        onClick={async () => {
          const csResponse = await sendToContentScript({
            name: "query-selector-text",
            body: selector,
          });
          console.log("csResponse: ", csResponse);
          setCsData(csResponse);
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Query Text on Web Page
      </button>
      <br />
      <p>Text Data:{csResponse}</p>
      <div>{pong}</div> */}
    </div>
  )
}

export default IndexPopup
