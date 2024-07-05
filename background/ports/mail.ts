import type { PlasmoMessaging } from "@plasmohq/messaging"

const SECRET = "LABARRE"

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { password, hello } = req.body
  console.log("hello: ", hello)
  if (password !== SECRET) {
    res.send("(HINT: HOMETOWN)")
  } else {
    res.send("CAPTAIN")
  }
  console.log(req.body)
 
  // res.send({
  //   message: "Hello from port handler"
  // })
}

export default handler
