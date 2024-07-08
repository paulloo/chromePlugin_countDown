import { sleep } from "radash"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { quote } from "~core/quote"

const storage = new Storage()
window.addEventListener("DOMContentLoaded", () => {
  console.log(quote)
})

const hiddenElements = []

function removeFixedAndStickyElements() {
  const fixedElements = [...document.querySelectorAll("*")].filter(
    (el) =>
      getComputedStyle(el).position === "fixed" ||
      getComputedStyle(el).position === "sticky"
  )

  fixedElements.forEach((el) => {
    hiddenElements.push({
      element: el,
      originalVisibility: el.style.visibility
    })
    el.style.visibility = "hidden"
  })
}

function restoreFixedAndStickyElements() {
  const fixedElements = [...document.querySelectorAll("*")].filter(
    (el) =>
      getComputedStyle(el).position === "fixed" ||
      getComputedStyle(el).position === "sticky"
  )

  fixedElements.forEach((el) => {
    hiddenElements.push({
      element: el,
      originalVisibility: el.style.visibility
    })
    el.style.visibility = ""
  })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
const hideScrollbars = () => {
  document.body.style.overflow = "hidden"
}

const restoreScrollBars = () => {
  document.body.style.overflow = ""
}

function getPageInfo() {
  const body = document.body
  const html = document.documentElement
  const height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  )
  return {
    width: document.documentElement.clientWidth,
    height: height
  }
}
function compressImage(dataUrl, scale, quality): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = dataUrl
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      // 设置canvas的宽高，缩放比例可以根据需要调整
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      // 绘制缩放后的图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 将canvas转换为压缩后的data URL
      const compressData = canvas.toDataURL("image/png", quality)
      resolve(compressData)
    }
    img.onerror = (error) => {
      console.error("Error loading image:", error)
      reject(error)
    }
  })
}
async function captureFullPage() {
  const pageInfo = getPageInfo()

  const { width, height } = pageInfo
  const windowHeight = window.innerHeight
  let totalHeight = 0
  const screenShorts: { dataUrl: string; y: number }[] = []

  hideScrollbars()

  while (totalHeight < height) {
    window.scrollTo(0, totalHeight)
    if (totalHeight > 0) {
      removeFixedAndStickyElements() // 移除固定和粘性元素
    }

    await sleep(600)

    const { screenshotUrl } = await sendToBackground({
      name: "capture",
      body: {}
    })

    const compressedDataUrl = await compressImage(screenshotUrl, 0.6, 0.8)

    screenShorts.push({
      dataUrl: compressedDataUrl,
      y: totalHeight
    })
    totalHeight += windowHeight
  }

  restoreScrollBars()
  restoreFixedAndStickyElements() // 恢复固定和粘性元素
  // 将最终合成的截图导出为 data URL
  // const finalDataURL = finalCanvas.toDataURL()

  try {
    const images = await Promise.all(
      screenShorts.map(async ({ dataUrl, y }) => {
        const img = new Image()

        return new Promise<{
          img: HTMLImageElement
          y: number
          height: number
        }>(async (resolve, reject) => {
          img.onload = () => resolve({ img, y, height: img.height })
          img.onerror = reject
          img.src = dataUrl
        })
      })
    )

    const totalHeightCanvas = images.reduce((acc, { img, y }, index) => {
      const imgHeight =
        index === images.length - 1
          ? img.height + (windowHeight - (height - y))
          : img.height
      return acc + imgHeight
    }, 0)
    const canvas = document.createElement("canvas")
    canvas.width = images[0].img.width
    canvas.height = totalHeightCanvas

    const ctx = canvas.getContext("2d")
    let currentY = 0
    images.forEach(({ img, y }, index) => {
      console.log(img.height, windowHeight, height, y)
      const sourceY = index === images.length - 1 ? height - y : 0
      const imgHeight =
        index === images.length - 1
          ? img.height + (windowHeight - (height - y))
          : img.height
      const destY = currentY
      currentY += imgHeight

      ctx.drawImage(
        img,
        0,
        sourceY,
        img.width,
        imgHeight,
        0,
        destY,
        img.width,
        imgHeight
      )
    })

    const finalDataUrl = canvas.toDataURL("image/png")


    return {
      screenshotUrl: finalDataUrl,
      width,
      height: totalHeightCanvas,
      images
    }
  } catch (err) {
    console.error(err)
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "captureFullPage") {
    const finalDataUrl = await captureFullPage()

    await sendToBackground({
      name: "showScreenshot",
      body: finalDataUrl
    })

    // sendResponse({
    //   finalDataUrl
    // })
  } else if (message.action === "captureVisiblePart") {
    chrome.runtime.sendMessage({ action: "capture" }, (response) => {
      sendResponse(response)
    })
  }
  return true // 需要异步响应
})
