import { useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function PhotoUpload({ currentUrl, onUpload }) {
  const galleryRef = useRef()
  const [preview, setPreview] = useState(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadError('')
    setUploading(true)

    const ext = file.name.split('.').pop()
    const path = `beers/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('beer-photos').upload(path, file, { upsert: true })
    if (error) {
      setUploadError('Error al subir la foto.')
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('beer-photos').getPublicUrl(path)
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setUploading(false)
    onUpload(data.publicUrl)
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
            <span>{uploading ? 'Subiendo…' : 'Elegir foto'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
