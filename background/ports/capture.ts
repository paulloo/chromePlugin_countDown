import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  
  console.log('capture port:', req.body)
 
  res.send({
    data: req.body
  })
}

export default handler
