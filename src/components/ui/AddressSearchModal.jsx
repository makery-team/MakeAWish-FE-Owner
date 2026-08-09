import React from 'react'
import DaumPostcode from 'react-daum-postcode'
import { X } from '@phosphor-icons/react'

export default function AddressSearchModal({ onComplete, onClose }) {
  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    onComplete(fullAddress);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="font-bold text-gray-800">주소 찾기</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        
        <div className="h-[400px] w-full">
          <DaumPostcode
            onComplete={handleComplete}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}
