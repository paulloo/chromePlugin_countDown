
import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import axios from "axios";
const storage = new Storage()
 
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const message = `pong ${req.body.id}`

  const  hailingData = await storage.get('hailing')
  console.log('ping messge.....', hailingData)
  
  try {
    const apiURL = 'http://111.231.107.70:5508/parse_article'
    const response = await axios.post(apiURL, {
      "url": "https://juejin.cn/post/7384646888697954304",
      "title_node": "h1", 
      "title_class": "article-title",
      "content_primary_node": "div", 
      "content_class": "main"
  });
    const { title } = response.data
    // 在这里可以处理获取到的数据
    console.log(title);
    res.send({
      message: title
    })
  } catch (error) {
    console.error("Fetching data failed", error);
    // 处理错误情况
  }

  // res.send({
  //   message
  // })
}

 
export default handler