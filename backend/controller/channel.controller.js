import Channel from '../models/channel.model.js';
import Message from '../models/message.model.js';
import mongoose from 'mongoose';
import {io,getSocketId} from '../socket.js'
import { deleteFromS3 } from '../config/s3.js';
//import {uploadOnCloudinary} from '../config/cloudinary.js';
//import { io } from '../socket.js';
export const createChannel = async (req, res) => {
    try {
        const createdBy = req.userId;
        if (!createdBy) {
            return res.status(401).json({ msg: 'Authentication error. User ID not found.' });
        }
        const { name, visibility, description } = req.body;
        if (!name) {
            return res.status(400).json({ msg: 'Please enter a channel name' });
        }
        const existingChannel = await Channel.findOne({ name });
        if (existingChannel) {
            return res.status(400).json({ msg: 'A channel with this name already exists' });
        }
        const newChannel = new Channel({
            name,
            visibility,
            description: description || '', 
            createdBy,
            managedBy: [createdBy],
            members: [createdBy]
        });
        const savedChannel = await newChannel.save();
        res.status(201).json(savedChannel);
    } catch (error) {
        console.error('CREATE CHANNEL ERROR:', error);
        res.status(500).json({ msg: 'Server error occurred while creating channel.' });
    }
};

export const addMember = async (req, res) => {
    try {
        const { channelId } = req.params;
        // 1. Expect an array of members from the request body
        const { members } = req.body;
        const currentUserId = req.userId; // User performing the action

        // 2. Add validation for the incoming data
        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: 'Member IDs must be provided as a non-empty array.' });
        }

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        // Check for permission (optional but good practice)
        if (!channel.managedBy.includes(currentUserId)) {
            return res.status(403).json({ message: 'You do not have permission to add members to this channel' });
        }

        // 3. Filter out users who are already in the channel
        const newMemberIds = members.filter(
            memberId => !channel.members.includes(memberId)
        );

        if (newMemberIds.length === 0) {
            return res.status(400).json({ message: 'All specified users are already members of this channel.' });
        }

        // 4. Add all the new, unique members to the channel at once
        channel.members.push(...newMemberIds);
        
        await channel.save();
        
        // Return the updated channel
        res.status(200).json(channel);

    } catch (error) {
        console.error('ADD MEMBER ERROR:', error);
        res.status(500).json({ message: 'Server error while adding members', error });
    }
};

export const leaveChannel = async (req, res) => {
    try {
        const { channelId } = req.params;

        const userId = req.userId;
console.log(`[Backend] Received request to leave channel with ID: ${channelId}`);
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        channel.members = channel.members.filter(memberId => memberId.toString() !== userId);
        channel.managedBy = channel.managedBy.filter(managerId => managerId.toString() !== userId);

        if (channel.members.length === 0) {
            await Channel.findByIdAndDelete(channelId);
            return res.status(200).json({ message: 'You left the channel, and it has been deleted.' });
        }

        await channel.save();
        res.status(200).json({ message: 'You have successfully left the channel.' });

    } catch (error) {
        console.error('LEAVE CHANNEL ERROR:', error);
        res.status(500).json({ message: 'Error leaving channel', error });
    }
};


export const getAllChannels = async (req, res) => {
  try {
    const userId=req.userId;
    if(!userId){
      return res.status(401).json({msg:'Authentication error. User ID not found.'})
    }
    const channels=await Channel.find({members:userId}).sort({name:1})
    res.status(200).json(channels)
  } catch (error) {
    console.error('GET ALL CHANNELS ERROR:', error);
    res.status(500).json({ msg: 'Server error occurred while fetching channels.' });
  }
}

export const getChannelById = async (req, res) => {
    try {
        const { channelId } = req.params;
console.log(channelId);
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ message: 'Invalid channel ID format' });
        }
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }
        if (!channel.members.includes(req.userId)) {
            return res.status(403).json({ message: 'You are not a member of this channel' });
        }
        res.status(200).json(channel);
    } catch (error) {
        console.error('GET CHANNEL BY ID ERROR:', error);
        res.status(500).json({ msg: 'Server error while fetching channel details.' });
    }
};

export const sendMessageToChannel = async (req, res) => {
  try {
    const senderId = req.userId;
    const { channelId } = req.params;
    const { message } = req.body;
    console.log("Received message to channel:", {
      senderId,
      channelId,
      message,
      file: req.file ? req.file.key : null,
    });
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }
    // 1. Find channel
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // 2. [FIX] Check membership — Filter out null/undefined members before mapping
    // This prevents the 'Cannot read properties of null' error.
    const memberIds = channel.members.filter(m => m).map(m => m.toString());
    
    if (!memberIds.includes(senderId)) {
      return res.status(403).json({ message: "You are not a member of this channel." });
    }

    // 3. S3 Image URL
    const imageUrl = req.file
      ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`
      : null;

    // 4. Save message
    const newMessage = new Message({
      sender: senderId,
      channel: channelId,
      message: message || '',
      image: imageUrl,
    });

    await newMessage.save();

    // 5. Populate
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name profileImage");

    // 6. Emit to the channel room
    io.to(channelId).emit("newChannelMessage", populatedMessage);

    return res.status(201).json(populatedMessage);

  } catch (error) {
    console.error("Error in sendMessageToChannel:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};


/**
 * [MODIFIED] Gets all messages for a specific channel.
 * ROUTE: GET /api/channels/:channelId/messages
 */
export const getChannelMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.userId;

        // 1. Authorization Check: Ensure the user is a member of the channel.
        const channel = await Channel.findById(channelId);
        if (!channel || !channel.members.includes(userId)) {
            return res.status(403).json({ message: "You are not authorized to view these messages." });
        }

        // 2. Find all messages where the 'channel' field matches the channelId.
        const messages = await Message.find({ channel: channelId })
            .populate('sender', 'name profileImage email') // Populate sender details
            .sort({ createdAt: 1 }); // Sort chronologically

        res.status(200).json(messages);

    } catch (error)
        {
        console.error('Error in getChannelMessages:', error);
        res.status(500).json({ message: 'Server error while fetching messages.' });
    }
};

export const deleteMessageFromChannel = async (req, res) => {
  try {
    const { messageId,channelId } = req.params;
    const userId = req.userId;
    if (!messageId) return console.error("messageId missing");
console.log("Delete request:", { messageId, channelId, userId: req.userId });
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== userId)
      return res.status(403).json({ message: 'Not your message' });

    // Delete image from S3 if it exists
    if (message.image) {
      const key = message.image.split('.com/')[1]; // extract key from URL
      await deleteFromS3(key); // <-- uses the helper
    }

    await Message.findByIdAndDelete(messageId);

    io.to(message.channel.toString()).emit('messageDeleted', { messageId });

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};