import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef()
  const [snapshot, setSnapshot] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let active = true

    async function startStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (!active) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        if (active) setError('No se puede acceder a la cámara: ' + err.message)
      }
    }

    startStream()

    return () => {
      active = false
      stopStream()
    }
  }, [])

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setSnapshot(canvas.toDataURL('image/jpeg', 0.9))
  }

  function retake() {
    setSnapshot(null)
  }

  async function usePhoto() {
    if (!snapshot) return
    setUploading(true)

    // Convert data URL to blob
    const res = await fetch(snapshot)
    const blob = await res.blob()

    const path = `beer-${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('beer-photos')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })

    setUploading(false)

    if (uploadError) {
      setError('No se pudo subir la foto: ' + uploadError.message)
      return
    }

    const { data } = supabase.storage.from('beer-photos').getPublicUrl(path)
    stopStream()
    onCapture(data.publicUrl, snapshot)
  }

  function close() {
    stopStream()
    onClose()
  }

  return (
    <div className="camera-modal" onClick={e => { if (e.target === e.currentTarget) close() }}>
      <div className="camera-modal__box">
        <button type="button" className="camera-modal__close" onClick={close} aria-label="Cerrar">✕</button>

        {error ? (
          <div className="camera-modal__error">
            <p>{error}</p>
            <button type="button" className="photo-upload__btn" onClick={close}>Volver</button>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!snapshot ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-modal__video"
                />
                <div className="camera-modal__controls">
                  <button type="button" className="camera-modal__shutter" onClick={capture} aria-label="Capturar">
                    📸
                  </button>
                </div>
              </>
            ) : (
              <>
                <img src={snapshot} alt="Foto capturada" className="camera-modal__preview" />
                <div className="camera-modal__controls">
                  <button type="button" className="photo-upload__btn" onClick={retake} disabled={uploading}>
                    Volver a tomar
                  </button>
                  <button type="button" className="photo-upload__btn" onClick={usePhoto} disabled={uploading}>
                    {uploading ? 'Subiendo…' : 'Usar esta foto'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
