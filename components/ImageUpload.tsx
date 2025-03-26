import React, { useState, useRef, useEffect } from 'react';

interface ImageUploadProps {
  listingImage?: string;
  preset: string; // Add the preset prop
  onImageChange: (imageUrl: string | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ listingImage, preset, onImageChange }) => {
  const defaultImage =
    listingImage ||
    'https://res.cloudinary.com/dagb1kdy2/image/upload/v1742230696/listings/iv6anzgdy1cpymxhddew.jpg';

  const [preview, setPreview] = useState<string>(defaultImage);
  const [oversizeImage, setOversizeImage] = useState<boolean>(false);
  const [showRevertBtn, setShowRevertBtn] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPreview(listingImage || defaultImage); // Update preview when listingImage changes
  }, [listingImage]);

  useEffect(() => {
    // Example effect logic
  }, [listingImage, defaultImage, preview, oversizeImage, showRevertBtn]);

  const imageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3000000) {
      setOversizeImage(true);
      return;
    }

    setOversizeImage(false);
    setShowRevertBtn(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset); // Use the preset prop dynamically
    formData.append('folder', 'next'); // 💡 This ensures the image is stored inside 'listings/'

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dagb1kdy2/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();

    setPreview(data.secure_url);
    onImageChange(data.secure_url);
  };

  const revertImageChange = () => {
    setShowRevertBtn(false);
    setPreview(defaultImage);
    setOversizeImage(false);
    onImageChange(null);
  };

  return (
    <div>
      <span
        className={`font-medium block text-sm ${
          oversizeImage ? 'text-red-500' : 'text-slate-700'
        }`}
      >
        {oversizeImage
          ? 'The selected image exceeds 3mb'
          : 'Image (max size 3mb)'}
      </span>
      <label
        htmlFor="image"
        className={`relative mt-1 block h-[160px] cursor-pointer overflow-hidden rounded-md border ${
          oversizeImage ? 'border-red-500' : 'border-slate-300 bg-slate-300'
        }`}
      >
        <img
          src={preview}
          className="h-full w-full object-cover object-center"
          alt="Preview"
        />
        {showRevertBtn && (
          <button
            onClick={(e) => {
              e.preventDefault();
              revertImageChange();
            }}
            type="button"
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/75 text-slate-700"
          >
            <i className="fa-solid fa-undo"></i>
          </button>
        )}
      </label>
      <input
        ref={fileInputRef}
        onChange={imageSelected}
        type="file"
        name="image"
        id="image"
        hidden
      />
    </div>
  );
};

export default ImageUpload;