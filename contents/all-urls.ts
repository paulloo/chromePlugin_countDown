import { sendToBackground } from "@plasmohq/messaging";
import { sleep } from "radash";
import { quote } from "~core/quote"

window.addEventListener("DOMContentLoaded", () => {
  console.log(quote)
})

const hiddenElements = [];

function removeFixedAndStickyElements() {
  const fixedElements = [...document.querySelectorAll('*')].filter(
    el => getComputedStyle(el).position === 'fixed' || getComputedStyle(el).position === 'sticky'
  );

  fixedElements.forEach(el => {
    hiddenElements.push({ element: el, originalVisibility: el.style.visibility });
    el.style.visibility = 'hidden';
  });
}

function restoreFixedAndStickyElements() {
  const fixedElements = [...document.querySelectorAll('*')].filter(
    el => getComputedStyle(el).position === 'fixed' || getComputedStyle(el).position === 'sticky'
  );

  fixedElements.forEach(el => {
    hiddenElements.push({ element: el, originalVisibility: el.style.visibility });
    el.style.visibility = '';
  });
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
  const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
  return {
    width: document.documentElement.clientWidth,
    height: height
  };
}

async function captureFullPage() {
  const pageInfo = getPageInfo()

  const { width, height } = pageInfo
  const windowHeight = window.innerHeight
  let totalHeight = 0
  const screenShorts: { dataUrl: string, y: number}[] = []

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
 
    screenShorts.push({
      dataUrl: screenshotUrl,
      y: totalHeight
    })
    totalHeight += windowHeight
  }

  restoreScrollBars()
  restoreFixedAndStickyElements() // 恢复固定和粘性元素
  // 将最终合成的截图导出为 data URL
  // const finalDataURL = finalCanvas.toDataURL()

  try {

    const images = await Promise.all(screenShorts.map(async ({dataUrl, y}) => {
        const img = new Image()
  
        return new Promise<{img: HTMLImageElement, y: number, height: number}>(async (resolve, reject) => {
            img.onload = () => resolve({img, y, height: img.height})
            img.onerror = reject
            img.src = dataUrl
        })
    }))
  
  
    const totalHeightCanvas = images.reduce((acc, { img, y }, index) => {
      const imgHeight = (index === images.length - 1)
        ? Math.min(img.height - windowHeight, height - y)
        : img.height;
      return acc + imgHeight;
    }, 0)
    const canvas = document.createElement('canvas')
    canvas.width = images[0].img.width;
    canvas.height = totalHeightCanvas;
  
    const ctx = canvas.getContext('2d');
    let currentY = 0;
    images.forEach(({img, y}, index) => {
      console.log(img.height, windowHeight, height,y)
      const sourceY = (index === images.length - 1) ? img.height - windowHeight : 0;
      const destY = currentY;
      const imgHeight = (index === images.length - 1)
        ? Math.min(windowHeight, height - y)
        : img.height;

        ctx.drawImage(img, 0, sourceY, img.width, imgHeight, 0, destY, img.width, imgHeight);
        currentY += imgHeight;
    })
  
    const finalDataUrl = canvas.toDataURL("image/png")
  
    console.log("finalDataUrl: ", finalDataUrl)
  
    await sendToBackground({
      name: "showScreenshot",
      body: {
        screenshotUrl: finalDataUrl,
        width,
        height: totalHeightCanvas,
        images,
      }
    })
  } catch(err) {
    console.error(err)
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureFullPage') {
      captureFullPage()
    }else if (message.action === 'removeFixedAndSticky') {
    removeFixedAndStickyElements();
    sendResponse({ success: true });
  } else if (message.action === 'restoreFixedAndSticky') {
    restoreFixedAndStickyElements();
    sendResponse({ success: true });
  } else if (message.action === 'getPageInfo') {
    const pageInfo = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      scrollHeight: document.documentElement.scrollHeight
    };
    sendResponse(pageInfo);
  } else if (message.action === 'captureVisiblePart') {
    chrome.runtime.sendMessage({ action: 'capture' }, (response) => {
      sendResponse(response);
    });
  }
  return true; // 需要异步响应
});