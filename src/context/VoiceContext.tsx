import Peer, { MediaConnection } from "peerjs"
import {
    ReactNode, createContext, useContext,
    useEffect, useRef, useState
} from "react"
import { useSocket } from "./SocketContext"

interface VoiceContextType {
    isMicOn: boolean
    isVideoOn: boolean
    toggleMic: () => void
    toggleVideo: () => void
    withVideo: boolean
    isInCall: boolean
    joinCall: (withVideo?: boolean) => void
    leaveCall: () => void
    localVideoRef: React.RefObject<HTMLVideoElement>
    remoteVideos: { [peerId: string]: MediaStream }
}

const VoiceContext = createContext<VoiceContextType | null>(null)

export const useVoice = () => {
    const ctx = useContext(VoiceContext)
    if (!ctx) throw new Error("useVoice must be inside VoiceProvider")
    return ctx
}

export const VoiceContextProvider = ({ children }: { children: ReactNode }) => {
    const { socket } = useSocket()
    const peerRef = useRef<Peer | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const callsRef = useRef<MediaConnection[]>([])
    const localVideoRef = useRef<HTMLVideoElement>(null)

    const [isMicOn, setIsMicOn] = useState(true)
    const [isVideoOn, setIsVideoOn] = useState(false)
    const [isInCall, setIsInCall] = useState(false)
    const [withVideo, setWithVideo] = useState(false)
    const [remoteVideos, setRemoteVideos] = useState<{
        [peerId: string]: MediaStream
    }>({})

    const addRemoteStream = (peerId: string, stream: MediaStream) => {
        setRemoteVideos(prev => ({ ...prev, [peerId]: stream }))
    }

    const removeRemoteStream = (peerId: string) => {
        setRemoteVideos(prev => {
            const updated = { ...prev }
            delete updated[peerId]
            return updated
        })
    }

    // Assign the local stream to the video element once it mounts
    useEffect(() => {
        if (isInCall && localVideoRef.current && streamRef.current) {
            localVideoRef.current.srcObject = streamRef.current
            localVideoRef.current.play().catch(() => {})
        }
    }, [isInCall])

    const joinCall = async (video = false) => {
        setWithVideo(video)
        // Request camera only if joining with video
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: video
        })
        streamRef.current = stream
        setIsVideoOn(video)

        const peer = new Peer()
        peerRef.current = peer

        peer.on("open", (peerId) => {
            socket.emit("peer-id", { peerId })
            socket.emit("get-peers")
        })

        // Answer incoming calls
        peer.on("call", (call) => {
            call.answer(stream)
            call.on("stream", (remoteStream) => {
                addRemoteStream(call.peer, remoteStream)
            })
            call.on("close", () => removeRemoteStream(call.peer))
            callsRef.current.push(call)
        })

        // Call existing peers
        socket.on("existing-peers", ({ peers }: { peers: string[] }) => {
            peers.forEach((peerId) => {
                const call = peer.call(peerId, stream)
                call.on("stream", (remoteStream) => {
                    addRemoteStream(peerId, remoteStream)
                })
                call.on("close", () => removeRemoteStream(peerId))
                callsRef.current.push(call)
            })
        })

        // Call new peer who joins
        socket.on("peer-joined", ({ peerId }: { peerId: string }) => {
            const call = peer.call(peerId, stream)
            call.on("stream", (remoteStream) => {
                addRemoteStream(peerId, remoteStream)
            })
            call.on("close", () => removeRemoteStream(peerId))
            callsRef.current.push(call)
        })

        setIsInCall(true)
    }

    const leaveCall = () => {
        callsRef.current.forEach(call => call.close())
        callsRef.current = []
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
        peerRef.current?.destroy()
        peerRef.current = null
        if (localVideoRef.current) localVideoRef.current.srcObject = null
        setRemoteVideos({})
        socket.off("existing-peers")
        socket.off("peer-joined")
        setIsInCall(false)
    }

    const toggleMic = () => {
        streamRef.current?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled
        })
        setIsMicOn(prev => !prev)
    }

    const toggleVideo = () => {
        streamRef.current?.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled
        })
        setIsVideoOn(prev => !prev)
    }

    return (
        <VoiceContext.Provider value={{
            isMicOn, isVideoOn,
            toggleMic, toggleVideo,
            isInCall, joinCall, leaveCall,
            localVideoRef, remoteVideos,
            withVideo
        }}>
            {children}
        </VoiceContext.Provider>
    )
}
