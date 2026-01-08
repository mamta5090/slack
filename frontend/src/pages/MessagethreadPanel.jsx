import React, { useState, useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { serverURL } from "../main";
import Avatar from "../component/Avatar";
import { useSelector } from "react-redux";
import MessageInput from "./MessageInput";

const ThreadPanel = ({ parentMessage, onClose, receiverId }) => {
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);
    
    // File states
    const [backendFile, setBackendFile] = useState(null);
    const [frontendFile, setFrontendFile] = useState(null);
    const [fileType, setFileType] = useState("");

    const listEndRef = useRef(null);
    const { socket } = useSelector((state) => state.socket);

    useEffect(() => { fetchReplies(); }, [parentMessage.messageId]);

    useEffect(() => {
        listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [replies]);

    // Socket Listener for Thread
    useEffect(() => {
        if (!socket) return;
        const handleThreadReply = (payload) => {
            if (payload.parentId === parentMessage.messageId) {
                setReplies(prev => {
                    if (prev.find(r => r._id === payload.newMessage._id)) return prev;
                    return [...prev, payload.newMessage];
                });
            }
        };
        socket.on("newMessage", handleThreadReply);
        return () => socket.off("newMessage", handleThreadReply);
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

    const handleFileSelect = (file) => {
        if (file) {
            setBackendFile(file);
            setFrontendFile(URL.createObjectURL(file));
            setFileType(file.type);
        }
    };

    const cancelFile = () => {
        setBackendFile(null);
        setFrontendFile(null);
        setFileType("");
    };

    const handleSendReply = async () => {
        if (!replyText.trim() && !backendFile) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("message", replyText);
            formData.append("parentId", parentMessage.messageId);
            if (backendFile) {
                formData.append("image", backendFile); // Adjust field name to match backend 'upload.single'
            }

            await axios.post(
                `${serverURL}/api/message/reply/${receiverId}`, 
                formData, 
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
            );

            setReplyText("");
            cancelFile();
        } catch (err) {
            console.error("Reply failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full md:w-[450px] flex flex-col bg-white h-full border-l border-gray-200 shadow-xl z-50">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shadow-sm bg-white">
                <div>
                    <h3 className="font-black text-lg">Thread</h3>
                    <p className="text-xs text-gray-500 truncate max-w-[250px]">Conversation with {parentMessage.senderName}</p>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md"><RxCross2 size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Parent Message Bubble */}
                <div className="p-4 border-b bg-gray-50/30">
                    <div className="flex gap-3">
                        <Avatar user={{ name: parentMessage.senderName }} size="md" />
                        <div className="flex-1">
                            <p className="font-black text-sm">{parentMessage.senderName}</p>
                            <p className="text-[15px] text-gray-800">{parentMessage.text}</p>
                            {parentMessage.image && (
                                <img src={parentMessage.image} className="mt-2 rounded-lg max-h-48 border shadow-sm" alt="parent-img" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Replies List */}
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
                                {reply.image && (
                                    <img src={reply.image} className="mt-2 rounded-lg max-h-48 border" alt="reply-content" />
                                )}
                                {/* Support for Video in replies */}
                                {reply.files?.map((f, i) => f.mimetype.startsWith('video') && (
                                    <video key={i} src={f.url} controls className="mt-2 rounded-lg max-h-48 border" />
                                ))}
                            </div>
                        </div>
                    ))}
                    <div ref={listEndRef} />
                </div>
            </div>

            {/* Common Message Input with Uploads */}
            <div className="p-4 border-t">
                <MessageInput 
                    value={replyText}
                    onChange={setReplyText}
                    onSend={handleSendReply}
                    placeholder="Reply..."
                    loading={loading}
                    onFileSelect={handleFileSelect}
                    filePreview={frontendFile}
                    onCancelFile={cancelFile}
                    fileType={fileType}
                />
            </div>
        </div>
    );
};

export default ThreadPanel;