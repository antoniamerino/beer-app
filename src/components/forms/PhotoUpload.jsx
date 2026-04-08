import { useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import CameraModal from './CameraModal'

export default function PhotoUpload({ currentUrl, onUpload }) {
  const galleryRef = useRef()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl || null)
  const [uploadError, setUploadError] = useState('')
  const [showCamera, setShowCamera] = useState(false)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setUploadError('')
    setUploading(true)

    const ext = file.name.split('.').pop().toLowerCase() || 'jpg'
    const path = `beer-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('beer-photos')
      .upload(path, file, { upsert: true })

    setUploading(false)

    if (error) {
      setPreview(currentUrl || null)
      setUploadError(`No se pudo subir la foto: ${error.message}`)
      if (galleryRef.current) galleryRef.current.value = ''
      return
    }

    const { data } = supabase.storage.from('beer-photos').getPublicUrl(path)
    onUpload(data.publicUrl)
  }

  function handleCameraCapture(publicUrl, localPreview) {
    setPreview(localPreview)
    setUploadError('')
    setShowCamera(false)
    onUpload(publicUrl)
  }

  function handleRemove() {
    setPreview(null)
    setUploadError('')
    onUpload('')
    if (galleryRef.current) galleryRef.current.value = ''
  }

  return (
    <div className="photo-upload">
      {/* Hidden input for gallery */}
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="photo-upload__input"
        onChange={handleFileChange}
      />

      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {uploadError && (
        <div className="photo-upload__error">
          {uploadError}
          <button
            type="button"
            className="photo-upload__error-retry"
            onClick={() => { setUploadError(''); galleryRef.current.click() }}
          >
            Intentar con otra foto
          </button>
        </div>
      )}

      {preview ? (
        <div className="photo-upload__preview-wrapper">
          <div className="photo-upload__preview-crop">
            <img src={preview} alt="Preview" className="photo-upload__preview-img" />
            {uploading && (
              <div className="photo-upload__uploading-overlay">
                <span>Subiendo…</span>
              </div>
            )}
          </div>
          <p className="photo-upload__crop-hint">Así se verá en la tarjeta de la cerveza</p>
          <div className="photo-upload__actions">
            <button
              type="button"
              className="photo-upload__btn"
              onClick={() => galleryRef.current.click()}
              disabled={uploading}
            >
              🖼 Cambiar foto
            </button>
            <button
              type="button"
              className="photo-upload__btn photo-upload__btn--danger"
              onClick={handleRemove}
              disabled={uploading}
            >
              🗑 Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div className="photo-upload__triggers">
          <button
            type="button"
            className="photo-upload__trigger-btn"
            onClick={() => galleryRef.current.click()}
            disabled={uploading}
          >
            <span className="photo-upload__trigger-icon">🖼</span>
            <span>Elegir de la galería</span>
          </button>
          <button
            type="button"
            className="photo-upload__trigger-btn"
            onClick={() => setShowCamera(true)}
            disabled={uploading}
          >
            <span className="photo-upload__trigger-icon">📷</span>
            <span>Sacar foto</span>
          </button>
        </div>
      )}
    </div>
  )
}
