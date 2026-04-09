import { useRef, useState } from 'react'
import CropModal from './CropModal'

export default function PhotoUpload({ currentUrl, onUpload }) {
  const galleryRef = useRef()
  const [preview, setPreview] = useState(currentUrl || null)
  const [uploadError, setUploadError] = useState('')
  const [cropFile, setCropFile] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // reset so same file can be re-selected
    setUploadError('')
    setCropFile(file)
  }

  function handleCaptured(publicUrl, localPreview) {
    setPreview(localPreview)
    setCropFile(null)
    onUpload(publicUrl)
  }

  function handleRemove() {
    setPreview(null)
    setUploadError('')
    onUpload('')
  }

  return (
    <div className="photo-upload">
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="photo-upload__input"
        onChange={handleFileChange}
      />

      {cropFile && (
        <CropModal
          file={cropFile}
          onCapture={handleCaptured}
          onClose={() => setCropFile(null)}
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
          </div>
          <p className="photo-upload__crop-hint">Así se verá en la tarjeta de la cerveza</p>
          <div className="photo-upload__actions">
            <button
              type="button"
              className="photo-upload__btn"
              onClick={() => galleryRef.current.click()}
            >
              🖼 Cambiar foto
            </button>
            <button
              type="button"
              className="photo-upload__btn photo-upload__btn--danger"
              onClick={handleRemove}
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
          >
            <span className="photo-upload__trigger-icon">🖼</span>
            <span>Elegir foto</span>
          </button>
        </div>
      )}
    </div>
  )
}
