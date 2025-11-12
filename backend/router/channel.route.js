import express from 'express'
import {addMember, createChannel, leaveChannel,getAllChannels, getChannelById, getChannelMessages, sendMessageToChannel, deleteMessageFromChannel} from '../controller/channel.controller.js'
import auth from '../middleware/auth.js'
import User from '../models/User.js'
import { uploadChannelImage } from '../config/s3.js'
const channelRouter=express.Router()

channelRouter.post('/create',auth, createChannel)
channelRouter.post('/:channelId/members',auth,addMember)
channelRouter.delete('/:channelId/members/me',auth,leaveChannel)
channelRouter.get('/getAllChannel', auth, getAllChannels);
channelRouter.get('/:channelId', auth, getChannelById);
channelRouter.get('/:channelId/messages', auth, getChannelMessages);
channelRouter.post(
  '/:channelId/messages',auth,
  uploadChannelImage.single('image'), // 'image' = form field name
  sendMessageToChannel
);
channelRouter.delete(
  '/:channelId/messages/:messageId',
  auth,
  deleteMessageFromChannel
);


export default channelRouter




