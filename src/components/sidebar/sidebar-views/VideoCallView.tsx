import { useVoice } from "@/context/VoiceContext"
import { useEffect, useRef } from "react"
import {
    FaMicrophone, FaMicrophoneSlash,
    FaVideo, FaVideoSlash,
    FaPhone, FaPhoneSlash
} from "react-icons/fa"

// Dedicated component so useEffect runs reliably when a remote stream arrives
const RemoteVideo = ({ peerId, stream }: { peerId: string; stream: MediaStream }) => {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(() => {})
        }
    }, [stream])

    return (
        <div className="relative">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg bg-black"
            />
            <span className="absolute bottom-1 left-2
                text-white text-xs bg-black/50 px-1 rounded">
                User {peerId.slice(0, 4)}
            </span>
        </div>
    )
}

const VideoCallView = () => {
    const {
        isMicOn, isVideoOn,
        toggleMic, toggleVideo,
        isInCall, joinCall, leaveCall,
        localVideoRef, remoteVideos
    } = useVoice()

    return (
        <div className="flex flex-col h-full p-4 gap-3">
            <h1 className="view-title">Video Call</h1>

            {/* Video Grid */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1">

                {/* Local Video */}
                {isInCall && (
                    <div className="relative">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            className="w-full rounded-lg bg-black"
                        />
                        <span className="absolute bottom-1 left-2 
                            text-white text-xs bg-black/50 px-1 rounded">
                            You
                        </span>
                    </div>
                )}

                {/* Remote Videos */}
                {Object.entries(remoteVideos).map(([peerId, stream]) => (
                    <RemoteVideo key={peerId} peerId={peerId} stream={stream} />
                ))}

                {/* Placeholder when not in call */}
                {!isInCall && (
                    <div className="flex items-center justify-center 
                        h-40 bg-darkHover rounded-lg text-gray-400">
                        Click Join Call to start video
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 justify-center pt-2 
                border-t border-darkHover">
                {!isInCall ? (
                    <button
                        onClick={joinCall}
                        className="flex items-center gap-2 bg-green-600 
                            hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        <FaPhone /> Join Call
                    </button>
                ) : (
                    <>
                        <button
                            onClick={toggleMic}
                            className={`p-2 rounded-full text-white
                                ${isMicOn ? "bg-gray-600" : "bg-red-600"}`}
                            title={isMicOn ? "Mute" : "Unmute"}
                        >
                            {isMicOn
                                ? <FaMicrophone size={18} />
                                : <FaMicrophoneSlash size={18} />}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`p-2 rounded-full text-white
                                ${isVideoOn ? "bg-gray-600" : "bg-red-600"}`}
                            title={isVideoOn ? "Hide Video" : "Show Video"}
                        >
                            {isVideoOn
                                ? <FaVideo size={18} />
                                : <FaVideoSlash size={18} />}
                        </button>

                        <button
                            onClick={leaveCall}
                            className="p-2 rounded-full bg-red-600 
                                text-white"
                            title="Leave Call"
                        >
                            <FaPhoneSlash size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default VideoCallView
