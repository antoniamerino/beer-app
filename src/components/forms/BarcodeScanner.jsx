import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    async function start() {
      try {
        await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result) {
              onDetected(result.getText())
            }
            // Errors firing every frame (no barcode detected) are normal — ignore them
          }
        )
        setScanning(true)
      } catch (e) {
        setError(
          e?.message?.includes('Permission')
            ? 'No se pudo acceder a la cámara. Verificá los permisos.'
            : 'No hay cámara disponible en este dispositivo.'
        )
      }
    }

    start()

    return () => {
      try { reader.reset() } catch {}
    }
  }, [onDetected])

  return (
    <div className="camera-modal" onClick={onClose}>
      <div className="camera-modal__box barcode-scanner__box" onClick={e => e.stopPropagation()}>
        <button className="camera-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>

        {error ? (
          <div className="camera-modal__error">
            <span style={{ fontSize: '2rem' }}>📷</span>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>{error}</p>
            <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <>
            <div className="barcode-scanner__video-wrap">
              <video ref={videoRef} className="camera-modal__video" autoPlay playsInline muted />
              <div className="barcode-scanner__viewfinder">
                <div className="barcode-scanner__line" />
              </div>
            </div>
            <div className="camera-modal__controls" style={{ flexDirection: 'column', gap: 4 }}>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {scanning ? 'Apuntá la cámara al código de barras de la botella' : 'Iniciando cámara…'}
              </p>
              <button className="btn-secondary" onClick={onClose} style={{ marginTop: 4 }}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
