import express from 'express'
import {addMember, createChannel, leaveChannel,getAllChannels} from '../controller/channel.controller.js'
import auth from '../middleware/auth.js'
import User from '../models/User.js'
const channelRouter=express.Router()

channelRouter.post('/create',auth, createChannel)
channelRouter.post('/:channelId/members',auth,addMember)
channelRouter.delete('/:channelId/members/me',auth,leaveChannel)
channelRouter.get('/getAllChannel',auth,getAllChannels)

export default channelRouter




