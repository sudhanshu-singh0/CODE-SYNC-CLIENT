import ChatInput from "@/components/chats/ChatInput"
import ChatList from "@/components/chats/ChatList"
import useResponsive from "@/hooks/useResponsive"
import { useVoice } from "@/context/VoiceContext"
import { FaMicrophone, FaMicrophoneSlash, FaPhone, FaPhoneSlash } from "react-icons/fa"

const ChatsView = () => {
    const { viewHeight } = useResponsive()
    const { isMicOn, toggleMic, isInCall, joinCall, leaveCall } = useVoice()

    return (
        <div
            className="flex max-h-full min-h-[400px] w-full flex-col gap-2 p-4"
            style={{ height: viewHeight }}
        >
            <h1 className="view-title">Group Chat</h1>

            {/* Voice Call Buttons */}
            <div className="flex gap-2 border-b border-darkHover pb-2">
                {!isInCall ? (
                    <button
                        onClick={joinCall}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                        <FaPhone /> Join Voice
                    </button>
                ) : (
                    <>
                        <button
                            onClick={toggleMic}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                            {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                            {isMicOn ? "Mute" : "Unmute"}
                        </button>
                        <button
                            onClick={leaveCall}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                            <FaPhoneSlash /> Leave
                        </button>
                    </>
                )}
            </div>

            {/* Chat list */}
            <ChatList />

            {/* Chat input */}
            <ChatInput />
        </div>
    )
}

export default ChatsView