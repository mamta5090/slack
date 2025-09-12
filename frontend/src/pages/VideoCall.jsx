import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { IoCallOutline } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";

const VideoCall = ({ stream, callAccepted, connectionRef, onLeaveCall, isAudioOnly = false }) => {
    const { id: otherUserId } = useParams();
    const me = useSelector((s) => s.user.user);

    const myVideo = useRef();
    const userVideo = useRef();
    const [remoteUserName, setRemoteUserName] = useState("Connecting...");

    // Effect to attach local stream
    useEffect(() => {
        if (stream && myVideo.current) {
            myVideo.current.srcObject = stream;
        }
    }, [stream]);

    // Effect to handle remote stream
    useEffect(() => {
        if (callAccepted && connectionRef.current) {
            connectionRef.current.on("stream", (remoteStream) => {
                if (userVideo.current) {
                    userVideo.current.srcObject = remoteStream;
                }
            });
        }
    }, [callAccepted, connectionRef]);

    // Effect to fetch remote user's name
    useEffect(() => {
        const fetchRemoteUserName = async () => {
            if (otherUserId) {
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get(`/api/user/${otherUserId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.data?.name) {
                        setRemoteUserName(res.data.name);
                    }
                } catch (err) {
                    setRemoteUserName("Unknown User");
                }
            }
        };
        fetchRemoteUserName();
    }, [otherUserId]);

    if (!me || !stream) {
        return <div className="flex items-center justify-center h-full bg-gray-900 text-white">Loading media...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-4">
            <h1 className="text-2xl font-bold mb-4">{isAudioOnly ? "Audio Call" : "Video Call"} with {remoteUserName}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                {/* My Video / Audio Placeholder */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    {isAudioOnly ? (
                        <div className="flex items-center justify-center w-full h-full text-4xl text-gray-400">
                           <IoCallOutline />
                        </div>
                    ) : (
                        <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                    )}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">{me.name} (You)</div>
                </div>

                {/* Remote Video / Audio Placeholder */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    {callAccepted ? (
                        isAudioOnly ? (
                            <div className="flex items-center justify-center w-full h-full text-4xl text-gray-400"><IoCallOutline /></div>
                        ) : (
                            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                        )
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-lg">Connecting...</div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">{remoteUserName}</div>
                </div>
            </div>

            <div className="mt-8">
                <button onClick={onLeaveCall} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg">
                    <MdCallEnd className="text-2xl" />
                </button>
            </div>
        </div>
    );
};

export default VideoCall;