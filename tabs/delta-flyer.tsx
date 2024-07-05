import { usePort } from "@plasmohq/messaging/hook"

type RequestBody = {
  hello: string
}

type ResponseBody = {
  message: string
}

export default function DeltaFlyerPage() {
  
  const mailPort = usePort<RequestBody, ResponseBody>("mail")

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16
        }}>
        <h2>Delta Flyer Tab</h2>
  
        <p>This tab is only available on the Delta Flyer page.</p>
        
        {mailPort.data?.message}
        <button
          onClick={async () => {
            mailPort.send({
              hello: "world"
            })
          }}>
          Send Port
        </button>

        <button
          onClick={async () => {
            // 获取当前激活的标签页
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              // tabs[0] 是当前激活的标签页
              const currentTabId = tabs[0].id;
              if (currentTabId) {
                // 使用 chrome.tabs.remove 关闭当前标签页
                chrome.tabs.remove(currentTabId);
              }
            });
          }}>
          close tab
        </button>
      </div>
    )
  }