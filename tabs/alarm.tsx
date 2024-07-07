import dayjs from "dayjs"
import { isEmpty } from "radash"

import { sendToBackground } from "@plasmohq/messaging"
import { usePort } from "@plasmohq/messaging/hook"
import { Storage } from "@plasmohq/storage"


import simpleDoneBg from "~assets/img/BG01.jpg"
import simpleSnd from "data-base64:~assets/sound/alarm1.mp3"

import falloutSnd from "data-base64:~assets/sound/mr_stranger.mp3"

import londonSnd from "data-base64:~assets/sound/bigban.mp3"

import pokemonSnd from "data-base64:~assets/sound/pika_pika.mp3"

import vaderSnd from "data-base64:~assets/sound/vader.mp3"

import r2d2Snd from "data-base64:~assets/sound/r2d2.mp3"

import defaultIcon from '~assets/icon.png'

import { useEffect, useRef, useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import "../styles/main.css"

const storage = new Storage()

type RequestBody = {
  hello: string
}

type ResponseBody = {
  message: string
}

export default function DeltaFlyerPage() {
  const mailPort = usePort<RequestBody, ResponseBody>("mail")

  const [currentTheme, setCurrentTheme] = useStorage<any>('currentTheme', {})

  const audioJson = {
    'simple': simpleSnd,
    'fallout': falloutSnd,
    'london': londonSnd,
    'pokemon': pokemonSnd,
    'vader': vaderSnd,
    'r2d2': r2d2Snd,
  }


  const audioRef = useRef(null)

  async function playAudio(audioName: string) {
    // const audioUrl = await loadStaticFile(audioName)

    if(audioRef.current) {
      audioRef.current.pause()
    }

    let audioSource = audioJson[audioName]
    if (isEmpty(audioJson[audioName])) {
      audioSource = simpleSnd
    }
    audioRef.current = new Audio(audioSource)
    audioRef.current.play()
  }

  useEffect(() => {
    console.log("currentTheme: ", currentTheme)
    async function getCurrentTheme() {
      playAudio(currentTheme.snd)
      setCurrentTheme(currentTheme)
    }
    // if(!isEmpty(currentTheme)) {
      getCurrentTheme()
    // }
  }, [currentTheme])

  function handleClose() {
    // 获取当前激活的标签页
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // tabs[0] 是当前激活的标签页
      const currentTabId = tabs[0].id
      if (currentTabId) {
        // 使用 chrome.tabs.remove 关闭当前标签页
        chrome.tabs.remove(currentTabId)

        storage.remove("deadLine")
      }
    })
  }

  async function handleRepeat() {
    let deadLine = (await storage.get("deadLine")) || ""
    const allAddedSeconds = await storage.get("allAddedSeconds") || '0'

    if(Number(allAddedSeconds) > 0) {
      deadLine = dayjs().add(Number(allAddedSeconds), 'second').format('YYYY-MM-DD HH:mm:ss')
    }

    if (!deadLine) {
      return
    }

    const resp = await sendToBackground({
      name: "countdown",
      body: {
        action: "start",
        type: "seconds",
        deadLine: dayjs(deadLine).valueOf(),
        seconds: allAddedSeconds
      }
    })

    chrome.action.setBadgeText({ text: `${allAddedSeconds}s` })

    handleClose()
  }

  return (
    <div
      className="min-h-screen min-w-screen flex items-center justify-center bg-no-repeat bg-center"
      style={{
        backgroundImage: `url(${!isEmpty(currentTheme) ? currentTheme.doneBg : simpleDoneBg})`
      }}>
      <div className="">
      <div className="flex justify-center items-center">
            <div className="mt-10">
              <div className="relative w-36 h-30 rounded-full transition duration-500 z-10">
                <svg>
                  <circle
                    cx="70"
                    cy="70"
                    r="70"
                    fill="none"
                    stroke="#191919"
                    strokeWidth="10"
                    strokeLinecap="round"
                    style={{ width: "100%", height: "100%", transform: 'translate(5px, 5px)' }}></circle>
                  <circle
                    cx="70"
                    cy="70"
                    r="70"
                    id="CircleOffset"
                    stroke="#67686b"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="440"
                    strokeDashoffset="440"
                    style={{
                      strokeDashoffset: "calc(444.4)",
                      transition: "stroke-dashoffset 0.2s",
                      width: "100%",
                      height: "100%",
                      transform: 'translate(5px, 5px)'
                    }}></circle>
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center rounded-full">
                  <div
                    className="w-full h-full bg-gray-200 bg-opacity-30 bg-no-repeat bg-center bg-[length:60%] text-white rounded-full"
                    style={{
                      backgroundImage: `url(${currentTheme.icon || defaultIcon})`
                    }}></div>
                  <h2 className="text-gray-600 font-bold" style={{fontSize: '250%'}}>
                    <span className="" style={{fontSize: '50%'}}>&nbsp;</span>
                  </h2>
                </div>
              </div>
            </div>
          </div>

        <div className="block text-center mt-5">
          <button
            className="btn inline-block cursor-pointer rounded-lg text-white text-lg leading-[3em] min-w-[130px] border border-transparent"
            style={{ backgroundColor: "rgb(14, 152, 12)" }}
            onClick={() => handleClose()}>
            Close
          </button>
          <button
            className="btn inline-block cursor-pointer rounded-lg text-white bg-gray-600 text-lg leading-[3em] min-w-[130px] border border-transparent"
            onClick={() => handleRepeat()}>
            Repeat
          </button>
        </div>
      </div>
    </div>
  )
}
