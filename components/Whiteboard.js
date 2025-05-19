import React, { useEffect, useState, useRef } from 'react';
import { RoomProvider, useStorage, useSelf, useOthers } from '@liveblocks/react';
import { createClient } from '@liveblocks/client';
import { nanoid } from 'nanoid';

const client = createClient({
  publicApiKey: 'pk_dev_tQUoV8LdcFGqa2td6O7JzL1y45k5qgYD8Mc3CGq1LoSVCav6z-2AwPmDzjtsG4FJ'
});

function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 800;
      const scaleSize = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scaleSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        callback(blob);
      }, 'image/jpeg', 0.7);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function WhiteboardCanvas() {
  const storage = useStorage();
  const self = useSelf();
  const others = useOthers();
  const fileInput = useRef(null);

  const [items, setItems] = useState([]);

  useEffect(() => {
    const images = storage.get('images');
    if (images) {
      setItems(images);
    }
  }, [storage]);

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile();
          compressImage(file, (blob) => {
            const url = URL.createObjectURL(blob);
            const newImage = { id: nanoid(), url };
            storage.set('images', [...storage.get('images'), newImage]);
          });
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [storage]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">协作白板</h1>
      <div className="flex flex-wrap gap-4">
        {items.map((img) => (
          <img key={img.id} src={img.url} alt="upload" className="w-40 h-auto rounded shadow" />
        ))}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            compressImage(file, (blob) => {
              const url = URL.createObjectURL(blob);
              const newImage = { id: nanoid(), url };
              storage.set('images', [...storage.get('images'), newImage]);
            });
          }
        }}
      />
      <button
        onClick={() => fileInput.current.click()}
        className="mt-4 bg-yellow-400 px-4 py-2 rounded text-white shadow"
      >
        上传图片
      </button>
      <div className="mt-6 text-sm text-gray-500">
        当前在线人数：{others.length + 1} 人
      </div>
    </div>
  );
}

export default function PageWrapper() {
  const roomId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : 'default';
  return (
    <RoomProvider
      id={roomId}
      initialStorage={{ images: [] }}
      client={client}
    >
      <WhiteboardCanvas />
    </RoomProvider>
  );
}
