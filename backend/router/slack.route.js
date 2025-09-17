import express from 'express'
import { SendOtp, Signin, SlackLogin, VerifyOtp } from '../controller/slackUser.controller.js'


const slackRouter=express.Router()

slackRouter.post("/signin",Signin)
slackRouter.post("/slacklogin",SlackLogin)
slackRouter.post("/sendotp",SendOtp)
slackRouter.post('/verifyotp',VerifyOtp)

export default slackRouter