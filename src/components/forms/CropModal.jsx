import { useRef, useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

export default function CropModal({ file, onCapture, onClose }) {
  const [imgSrc, setImgSrc] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const containerRef = useRef()
  const imgRef = useRef()
  const transformRef = useRef({ x: 0, y: 0, scale: 1 })
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const dragRef = useRef(null)
  const pinchRef = useRef(null)

  // Load file as object URL
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImgSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Center + fit image when it loads
  const initTransform = useCallback(() => {
    const img = imgRef.current
    const c = containerRef.current
    if (!img || !c) return
    const scale = Math.max(c.clientWidth / img.naturalWidth, c.clientHeight / img.naturalHeight)
    const t = {
      x: (c.clientWidth - img.naturalWidth * scale) / 2,
      y: (c.clientHeight - img.naturalHeight * scale) / 2,
      scale,
    }
    transformRef.current = t
    setTransform(t)
  }, [])

  function applyTransform(t) {
    transformRef.current = t
    setTransform({ ...t })
  }

  // Mouse events (desktop)
  function onMouseDown(e) {
    dragRef.current = { startX: e.clientX - transformRef.current.x, startY: e.clientY - transformRef.current.y }
  }
  function onMouseMove(e) {
    if (!dragRef.current) return
    applyTransform({
      ...transformRef.current,
      x: e.clientX - dragRef.current.startX,
      y: e.clientY - dragRef.current.startY,
    })
  }
  function onMouseUp() { dragRef.current = null }

  function onWheel(e) {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    applyTransform({ ...transformRef.current, scale: Math.max(0.1, transformRef.current.scale * factor) })
  }

  // Touch events (mobile) — non-passive to allow preventDefault
  useEffect(() => {
    const c = containerRef.current
    if (!c) return

    function onTouchStart(e) {
      if (e.touches.length === 1) {
        dragRef.current = {
          startX: e.touches[0].clientX - transformRef.current.x,
          startY: e.touches[0].clientY - transformRef.current.y,
        }
        pinchRef.current = null
      } else if (e.touches.length === 2) {
        dragRef.current = null
        pinchRef.current = {
          dist: Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          ),
          scale: transformRef.current.scale,
        }
      }
    }

    function onTouchMove(e) {
      e.preventDefault()
      if (e.touches.length === 1 && dragRef.current) {
        applyTransform({
          ...transformRef.current,
          x: e.touches[0].clientX - dragRef.current.startX,
          y: e.touches[0].clientY - dragRef.current.startY,
        })
      } else if (e.touches.length === 2 && pinchRef.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        applyTransform({
          ...transformRef.current,
          scale: Math.max(0.1, pinchRef.current.scale * (dist / pinchRef.current.dist)),
        })
      }
    }

    function onTouchEnd() {
      dragRef.current = null
      pinchRef.current = null
    }

    c.addEventListener('touchstart', onTouchStart, { passive: true })
    c.addEventListener('touchmove', onTouchMove, { passive: false })
    c.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      c.removeEventListener('touchstart', onTouchStart)
      c.removeEventListener('touchmove', onTouchMove)
      c.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  async function handleCrop() {
    const img = imgRef.current
    const c = containerRef.current
    if (!img || !c) return
    setUploading(true)
    setError('')

    const { x, y, scale } = transformRef.current
    const canvas = document.createElement('canvas')
    canvas.width = c.clientWidth
    canvas.height = c.clientHeight
    canvas.getContext('2d').drawImage(
      img, x, y,
      img.naturalWidth * scale,
      img.naturalHeight * scale
    )

    canvas.toBlob(async (blob) => {
      const path = `beer-${Date.now()}.jpg`
      const { error: uploadErr } = await supabase.storage
        .from('beer-photos')
        .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })

      if (uploadErr) {
        setError('No se pudo subir: ' + uploadErr.message)
        setUploading(false)
        return
      }

      const { data } = supabase.storage.from('beer-photos').getPublicUrl(path)
      onCapture(data.publicUrl, canvas.toDataURL('image/jpeg', 0.85))
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="camera-modal" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="camera-modal__box">
        <button type="button" className="camera-modal__close" onClick={onClose}>✕</button>
        <p className="crop-modal__hint">Arrastrá para mover · Pellizca o rueda para zoom</p>

        <div
          ref={containerRef}
          className="crop-modal__frame"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt=""
              className="crop-modal__img"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: '0 0',
              }}
              onLoad={initTransform}
              draggable={false}
            />
          )}
        </div>

        {error && <p className="camera-modal__error" style={{ padding: '8px 16px', color: '#f08080' }}>{error}</p>}

        <div className="camera-modal__controls">
          <button type="button" className="photo-upload__btn" onClick={onClose} disabled={uploading}>
            Cancelar
          </button>
          <button type="button" className="photo-upload__btn" onClick={handleCrop} disabled={uploading}>
            {uploading ? 'Subiendo…' : 'Usar este recorte'}
          </button>
        </div>
      </div>
    </div>
  )
}
