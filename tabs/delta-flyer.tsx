import { usePort } from "@plasmohq/messaging/hook"
import { isEmpty } from "radash"

type RequestBody = {
  hello: string
}

type ResponseBody = {
  message: string
}


export default function DeltaFlyerPage() {
  
  const capturePort = usePort<RequestBody, ResponseBody>("capture")

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
          capturePort?.screenshotUrl
        }
        {
         !isEmpty(capturePort) &&  <img src={capturePort?.screenshotUrl} alt="finalData" />
        }
       
      </div>
    )
  }