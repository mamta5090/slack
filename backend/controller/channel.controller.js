import Channel from '../models/channel.model.js';
import Message from '../models/message.model.js';
import mongoose from 'mongoose';
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
        // Best practice: Validate the ID format before querying
        if (!mongoose.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({ message: 'Invalid channel ID format' });
        }

        const channel = await Channel.findById(channelId);

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        // Also check if the user requesting is actually a member of the channel
        if (!channel.members.includes(req.userId)) {
            return res.status(403).json({ message: 'You are not a member of this channel' });
        }

        res.status(200).json(channel);
    } catch (error) {
        console.error('GET CHANNEL BY ID ERROR:', error);
        res.status(500).json({ msg: 'Server error while fetching channel details.' });
    }
};

export const getChannelMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.userId;

        // Check if the user is a member of the channel first
        const channel = await Channel.findById(channelId);
        if (!channel || !channel.members.includes(userId)) {
            return res.status(403).json({ message: "You are not authorized to view these messages." });
        }

        // Find all messages where the receiverId is the channelId
        const messages = await Message.find({ receiverId: channelId })
            .populate('senderId', 'name profilePic') // Optional: get sender info
            .sort({ createdAt: 1 }); // Sort by creation time

        res.status(200).json(messages);

    } catch (error) {
        console.error('GET CHANNEL MESSAGES ERROR:', error);
        res.status(500).json({ message: 'Server error while fetching messages.' });
    }
};