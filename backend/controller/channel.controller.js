import Channel from '../models/channel.model.js';

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
        const { userIdToAdd } = req.body;
        // Use req.userId, which is set by your middleware
        const currentUserId = req.userId;

        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }
        if (!channel.managedBy.includes(currentUserId)) {
            return res.status(403).json({ message: 'You do not have permission to add members to this channel' });
        }
        if (channel.members.includes(userIdToAdd)) {
            return res.status(400).json({ message: 'User is already a member of this channel' });
        }

        channel.members.push(userIdToAdd);
        await channel.save();
        res.status(200).json(channel);

    } catch (error) {
        console.error('ADD MEMBER ERROR:', error);
        res.status(500).json({ message: 'Error adding member', error });
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