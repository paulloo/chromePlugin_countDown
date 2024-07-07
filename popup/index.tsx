import axios from "axios"
import dayjs from "dayjs"
import { useEffect, useRef, useState } from "react"

import {
  sendToBackground,
  sendToBackgroundViaRelay,
  sendToContentScript
} from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { countDown, padZero } from "~utils"

import "../styles/main.css"


import generalSnd from "data-base64:~assets/sound/general.wav"
import simpleDoneBg from "~assets/img/BG01.jpg"
import simpleBg from "~assets/img/bg_simple.jpg"
import simpleIcon from "~assets/img/icon_stopwatch.svg"


import falloutDoneBg from "~assets/img/fall.jpg"
import falloutBg from "~assets/img/bg_fallout_2.jpg"
import falloutIcon from "~assets/img/icon_cowboy_hat.svg"

import londonDoneBg from "~assets/img/BG03.jpg"
import londonBg from "~assets/img/bg_london.jpg"
import londonIcon from "~assets/img/icon_bus.svg"

import pokemonDoneBg from "~assets/img/BG04.jpg"
import pokemonBg from "~assets/img/bg_game.jpg"
import pokemonIcon from "~assets/img/icon_game.svg"

import vaderDoneBg from "~assets/img/BG05.jpg"
import vaderBg from "~assets/img/bg_vader.jpg"
import vaderIcon from "~assets/img/icon_helmet.svg"

import r2d2DoneBg from "~assets/img/BG06.jpg"
import r2d2Bg from "~assets/img/bg_r2d2.jpg"
import r2d2Icon from "~assets/img/icon_r2d2.svg"

import defaultIcon from '~assets/icon.png'
import StarRating from "./StarRating"
import clsx from "clsx"
import { isEmpty } from "radash"

const projects = [
  {
    id: 1,
    doneBg: simpleDoneBg,
    className: "simple",
    color: "#013d99",
    snd: 'simple',
    bg: simpleBg,
    icon: simpleIcon,
    title: "Simple",
    on: true,
    theme: 'theme-light',
  },
  {
    id: 2,
    doneBg: falloutDoneBg,
    className: "fallout",
    color: "#0e980c",
    snd: 'fallout',
    bg: falloutBg,
    icon: falloutIcon,
    title: "Fallout",
    on: false,
    theme: 'theme-evergreen',
  },
  {
    id: 3,
    doneBg: londonDoneBg,
    className: "london",
    color: "#ba0001",
    snd: 'london',
    bg: londonBg,
    icon: londonIcon,
    title: "London",
    on: false,
    theme: 'theme-light',
  },
  {
    id: 4,
    doneBg: pokemonDoneBg,
    className: "pokemon",
    color: "#990001",
    snd: 'pokemon',
    bg: pokemonBg,
    icon: pokemonIcon,
    title: "Pokemon",
    on: false,
    theme: 'theme-solar',
  },
  {
    id: 5,
    doneBg: vaderDoneBg,
    className: "vader",
    color: "#00869a",
    snd: 'vader',
    bg: vaderBg,
    icon: vaderIcon,
    title: "Vader",
    on: false,
    theme: 'theme-dark',
  },
  {
    id: 6,
    doneBg: r2d2DoneBg,
    className: "r2d2",
    color: "#1f0099",
    snd: 'r2d2',
    bg: r2d2Bg,
    icon: r2d2Icon,
    title: "R2D2",
    on: false,
    theme: 'theme-dark',
  }
]

const storage = new Storage()

function IndexPopup() {
  const timerRef = useRef(null)
  const progressTimerRef = useRef(null)

  const timeRangeList = [
    // {
    //   value: 10,
    //   label: "10s"
    // },
    {
      value: 30,
      label: "30s"
    },
    {
      value: 60,
      label: "1m"
    },
    {
      value: 300,
      label: "5m"
    },
    {
      value: 600,
      label: "10m"
    },
    {
      value: 900,
      label: "15m"
    },
    {
      value: 1800,
      label: "30m"
    },
    {
      value: 3600,
      label: "1h"
    }
  ]

  const defaultTheme = projects[0]

  const [currentTheme, setCurrentTheme] = useStorage('currentTheme', {})

  const [allAddedSeconds, setAllAddedSeconds] = useStorage("allAddedSeconds", 0)
  const [deadLine, setDeadLine] = useStorage("deadLine", "")

  const [countDownDays, setCountDownDays] = useState("")
  const [countDownTime, setCountDownTime] = useState("")

  // 倒计时状态
  const [couting, setCouting] = useState(false)

  const [progress, setProgress] = useState(100)

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

  const audioRef = useRef(null)

  async function playAudio() {
    // const audioUrl = await loadStaticFile(audioName)
   

    if(audioRef.current) {
      audioRef.current.pause()
    }

    audioRef.current = new Audio(generalSnd)
    audioRef.current.play()
  }

  async function resetCount() {
    clearInterval(timerRef.current)
    clearInterval(progressTimerRef.current)
    setCouting(false)
    chrome.action.setBadgeText({ text: "" })
    setDeadLine('')
    setAllAddedSeconds(0)
    const resp = await sendToBackground({
      name: "countdown",
      body: {
        action: "stop",
        deadLine: dayjs(deadLine).valueOf()
      }
    })

    console.log("stop: ", resp)
  }

  async function countDownByDeadLine(deadLine) {
    const afterNow = dayjs(deadLine).isAfter(dayjs())
    if (isEmpty(deadLine) || !afterNow) {
      return
    }

    setCouting(true)
   
    const { days, time, hours, minutes, seconds, ms } = countDown(deadLine)
    if (ms <= 0) {
      resetCount()
      return
    }
    setCountDownTime(time)

    if(days > 0) {
      setCountDownDays(`${days}d`)
    }

    const badge = formatDuration(days, hours, minutes, seconds) // 30秒

    chrome.action.setBadgeText({ text: badge })
    chrome.action.setBadgeBackgroundColor({ color: currentTheme.color? currentTheme.color: [0, 255, 0, 0] })
  }

  // 用react 状态来控制 这个评价 五星 的星级评价

  async function setting() {

    playAudio()
    // deadLine 必须要在当前之间之后
    const afterNow = deadLine && dayjs(deadLine).isAfter(dayjs())
    console.log("localDeadLine: ", deadLine, afterNow, couting)

    if(!couting) {
      if(allAddedSeconds <= 0) {
        return
      }
      const quickDeadLine = dayjs().add(allAddedSeconds, 'second').format('YYYY-MM-DD HH:mm:ss')
      const { days, time, hours, minutes, seconds, ms } = countDown(quickDeadLine)
      setCouting(true)
      setCountDownTime(time)
      const resp = await sendToBackground({
        name: "countdown",
        body: {
          action: "start",
          deadLine: dayjs(quickDeadLine).valueOf(),
          // seconds: allAddedSeconds
        }
      })
      console.log("start: ", resp)
      return
    }

    if (couting || !afterNow) {
      resetCount()
      return
    }
    setCouting(true)
    const resp = await sendToBackground({
      name: "countdown",
      body: {
        action: "start",
        deadLine: dayjs(deadLine).valueOf(),
        // seconds: allAddedSeconds
      }
    })
    console.log("start: ", resp)
  }

  async function handleRange(item) {
    playAudio()
    setDeadLine("")
    // resetCount()

    // deadLine 必须要在当前之间之后
    const afterNow = dayjs(deadLine).isAfter(dayjs())

    const _dayTime = deadLine && afterNow ? dayjs(deadLine) : dayjs()

    setAllAddedSeconds(allAddedSeconds + item.value)

    const _deadLine = _dayTime
      .add(item.value, "second")
      .format("YYYY-MM-DD HH:mm:ss")
    // countDownByDeadLine(_deadLine)
    setDeadLine(_deadLine)
    setCouting(true)

    const { days, time, hours, minutes, seconds, ms } = countDown(_deadLine)
    setCountDownTime(time)
    const resp = await sendToBackground({
      name: "countdown",
      body: {
        action: "start",
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
        action: "start",
        deadLine: dayjs(date).valueOf()
      }
    })

    console.log("date change: ", resp)
  }

  async function changeTheme(item) {

    playAudio()
    setCurrentTheme(item)


    chrome.action.setBadgeBackgroundColor({ color: item.color? item.color: [0, 255, 0, 0] })
  }

  useEffect(() => {
   
    countDownByDeadLine(deadLine)

    // 监听倒计时更新
    const messageListener = (message) => {
      if (message.name === "countdownUpdate") {
        setCountDownTime(message.body.time)
        setCouting(true)
        // chrome.action.setBadgeBackgroundColor({ color: currentTheme.color? currentTheme.color: [0, 255, 0, 0] })
      } else if (message.name === "countdownFinished") {
        console.log("Countdown finished")
      } else if (message.name === "countdownProgress") {
        setProgress(message.body.progress)
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    // 清理监听器
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [deadLine])

  return (
    <div
      className={clsx("w-96 bg-no-repeat bg-center", (currentTheme.theme || 'theme-light'))}
      style={{ backgroundImage: `url(${currentTheme.bg || simpleBg})` }}>
      <section id="main" className="flex h-full flex-col justify-between">
        {/* <div className="border-b-2 p-4 dark:border-gray-800">
          <h1 className="text-center text-xl font-semibold leading-6">
            倒计时
          </h1>
        </div> */}

        <div className="flex px-6 pt-4 items-center">
          <img
            className="inline-block h-10 w-10 rounded-full"
            src={currentTheme.icon || defaultIcon}
            alt=""
          />
          
          <div className="settings flex cursor-pointer p-2.5 pt-0 items-center">
            {timeRangeList.map((item) => {
              return (
                <div
                  className="timeBtn block text-muted text-xs bg-base rounded-sm px-1 py-1 mr-1 cursor-pointer hover:bg-primary hover:text-white"
                  onClick={() => handleRange(item)}
                  key={item.value}>
                  +{item.label}
                </div>
              )
            })}
          </div>
        </div>

        {couting ? (
          <div
            id="time"
            className="relative px-4 pb-4 text-center font-semibold dark:text-gray-400">
            {/* <div className="font-mono text-5xl font-extralight block">{countDownDays}</div> */}
            <div className="font-mono text-5xl font-extralight text-muted">
              {countDownTime}
            </div>
            <div className="absolute right-4 top-2 text-center text-muted">
              {countDownDays}
            </div>

            <div className="flex items-center mt-4">
              <div className="w-full bg-base rounded h-2.5 dark:bg-gray-700 me-2">
                <div
                  className="bg-primary h-2.5 rounded dark:bg-blue-500"
                  style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            {/* <div className="text-center text-base">{deadLine}</div> */}
          </div>
        ) : (
          <div
            id="time"
            className="relative px-4 text-center font-semibold dark:text-gray-400">
            {/* <div className="font-mono text-5xl font-extralight block">{countDownDays}</div> */}
            <div className="font-mono text-5xl font-extralight text-muted">
              --:--:--
            </div>
            {/* <div className="absolute right-4 top-2 text-center text-base">
              <input
                type="date"
                onChange={(e) => handleDateChange(e.target.value)}
                value={deadLine}
              />
            </div> */}
            {/* <div className="text-center text-base">{deadLine}</div> */}
          </div>
        )}

        {/* <div className="flex px-4 pb-4">
          {projects.map((item) => {
            return (
              <div
                key={item.id}
                className={clsx("w-auto text-muted cursor-pointer flex-1 shrink-0 text-sm text-center")}
                style={{ color: currentTheme.id === item.id? currentTheme.color: '' }}
                onClick={() => changeTheme(item)}>
                {item.title}
              </div>
            )
          })}
        </div> */}

        {/* <StarRating /> */}

        <div
          id="footer"
          className="grid grid-cols-2 justify-center gap-x-2 divide-x border-t-2 py-4 text-xs font-semibold dark:divide-gray-800 dark:border-gray-800">
          <div className="flex items-center justify-center text-gray-500">
            <a
              href="https://ddp.life/"
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-x-1 text-muted">
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
            <button className="flex items-center justify-center gap-x-1 font-semibold text-muted">
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

              {couting ? "取消" : `开始`}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default IndexPopup
