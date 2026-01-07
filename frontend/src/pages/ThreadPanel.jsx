import React, { useState, useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { IoSend } from "react-icons/io5";
import axios from "axios";
import { serverURL } from "../main";
import Avatar from "../component/Avatar";
import { useSelector } from "react-redux";

const ThreadPanel = ({ parentMessage, onClose, currentUser, receiverId }) => {
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState("");
    const listEndRef = useRef(null);
    const { socket } = useSelector((state) => state.socket);

    useEffect(() => {
        fetchReplies();
    }, [parentMessage.messageId]);

    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [replies]);

    // Listen for real-time thread replies
    useEffect(() => {
        if (!socket) return;
        socket.on("newMessage", (msg) => {
            if (msg.parentId === parentMessage.messageId) {
                setReplies(prev => [...prev, msg]);
            }
        });
        return () => socket.off("newMessage");
    }, [socket, parentMessage.messageId]);

    const fetchReplies = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${serverURL}/api/message/thread/${parentMessage.messageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReplies(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const payload = {
                message: replyText,
                parentId: parentMessage.messageId // KEY: Identifies this as a reply
            };
            const res = await axios.post(`${serverURL}/api/message/send/${receiverId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReplyText("");
            // Logic: Socket will push the reply to the list via the listener above
        } catch (err) { console.error(err); }
    };

    return (
        <div className="w-[450px] flex flex-col bg-white h-full border-l border-gray-200 animate-in slide-in-from-right duration-300 shadow-xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shadow-sm">
                <div>
                    <h3 className="font-black text-lg">Thread</h3>
                    <p className="text-xs text-gray-500">Conversation with {parentMessage.senderName}</p>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md"><RxCross2 size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Parent Message */}
                <div className="p-4 border-b bg-gray-50/30">
                    <div className="flex gap-3">
                        <Avatar user={{name: parentMessage.senderName}} size="md" />
                        <div className="flex-1">
                            <p className="font-black text-sm">{parentMessage.senderName}</p>
                            <p className="text-[15px] text-gray-800">{parentMessage.text}</p>
                            {parentMessage.image && <img src={parentMessage.image} className="mt-2 rounded-lg max-h-48" />}
                        </div>
                    </div>
                </div>

                {/* Replies */}
                <div className="p-4 space-y-6">
                    {replies.map((reply) => (
                        <div key={reply._id} className="flex gap-3">
                            <Avatar user={reply.sender} size="sm" />
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-black text-sm">{reply.sender.name}</p>
                                    <span className="text-[11px] text-gray-400">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-[15px] text-gray-700">{reply.message}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={listEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
                <form onSubmit={handleSendReply} className="border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-gray-400">
                    <textarea 
                        className="w-full p-3 min-h-[100px] outline-none resize-none text-[15px]"
                        placeholder="Reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end p-2 bg-gray-50">
                        <button type="submit" className={`p-1.5 rounded ${replyText.trim() ? 'bg-[#007a5a] text-white' : 'text-gray-300'}`}>
                            <IoSend size={20}/>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ThreadPanel;