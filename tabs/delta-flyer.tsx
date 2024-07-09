import { usePort } from "@plasmohq/messaging/hook"
import { isEmpty } from "radash"
import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"

type RequestBody = {
  hello: string
}

type ResponseBody = {
  message: string
}
const storage = new Storage({
  area: 'local'
})

export default function DeltaFlyerPage() {
  
  const capturePort = usePort<RequestBody, ResponseBody>("capture")

  const [receivedData, setReceivedData] = useState(null)

  useEffect(() => {

    async function getLocalCapture() {
     const captureData = await storage.get('captureData')
     console.log("capture data: ", captureData)
     setReceivedData(captureData)
    }

    getLocalCapture()
    
    // const handleMessage = (message, sender, sendResponse) => {
      
    //   if(message.type === 'CAPTURE_DATA') {
    //       const captureData = message.data
    //       console.log('received data: ', captureData)
    //       setReceivedData(captureData)
          
    //   }
    // }
    // chrome.runtime.onMessage.addListener(handleMessage)
    // return () => {
    //   chrome.runtime.onMessage.removeListener(handleMessage)
    // }
  }, [])

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16
        }}>
        <h2>Delta Flyer Tab</h2>
  
        <p>This tab is only available on the Delta Flyer page.</p>
        {
          receivedData?.screenshotUrl
        }
        {
         !isEmpty(receivedData) &&  <img src={receivedData?.screenshotUrl} alt="finalData" />
        }
       
      </div>
    )
  }