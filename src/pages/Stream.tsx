import { useEffect, useRef, useState } from 'react'

export function Stream() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    let stream: MediaStream | null = null

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setAvailable(false)
      }
    }

    start()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <div className="p-4 md:p-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-black">
        <span className="absolute left-3 top-3 z-10 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">Live</span>
        {available ? (
          <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full bg-black object-cover" />
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-neutral-400">
            Keine Webcam verfügbar — Placeholder aktiv.
          </div>
        )}
        <div className="absolute right-3 top-12 w-48 rounded-xl border border-neutral-700 bg-neutral-950/80 p-3 text-xs text-neutral-300">
          Chat Overlay
        </div>
      </div>
    </div>
  )
}
