'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DocumentVault() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Fetch real documents from Supabase via your C# Backend
  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/documents/mine`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setDocuments(data); 
      } else if (res.status === 401) {
        console.error("Unauthorized: Token might be expired or invalid.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // 2. File Selection Handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  // 3. Upload Logic
  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData, 
      });

      if (res.ok) {
        setFile(null);
        await fetchDocs(); // Refresh list from database
        alert("File vaulted successfully!");
      } else {
        const errData = await res.text();
        alert(`Upload failed: ${errData}`);
      }
    } catch (error) {
      alert("Connection error to backend.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
  // 1. Safety Check (Crucial for medical records)
  if (!window.confirm("Are you sure you want to permanently delete this document from the vault? This cannot be undone.")) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    
    // 2. Call your new C# Delete Endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/documents/delete/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      alert("Document permanently deleted from AWS S3 and Database!");
      
      // 3. Update the UI instantly without needing to refresh the page
      // (This assumes your state variable is called 'documents')
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
    } else {
      const errorText = await res.text();
      alert(`Failed to delete: ${errorText}`);
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Could not connect to the server.");
  }
};

  return (
    <div className="p-10 max-w-7xl mx-auto min-w-[800px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: UPLOAD BOX */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 font-mono">UPLOAD NEW RECORD</h3>
            
            {/* DASHED DROPZONE WITH DRAG EVENTS */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl text-center transition-colors
                ${isDragging ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors
                  ${isDragging ? 'bg-red-100' : 'bg-red-50'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                
                <div>
                  <span className="text-red-600 font-bold hover:underline">Click to browse</span>
                  <span className="text-gray-500"> or drag file here</span>
                </div>
                
                {/* 100% Hidden Input */}
                <input 
                  type="file" 
                  className="hidden" 
                  style={{ display: 'none' }}
                  onChange={handleFileChange} 
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                
                <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG up to 10MB</p>
              </label>
            </div>

            {/* Selected File Preview */}
            {file && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between animate-fade-in">
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full mt-6 py-3 rounded-xl font-bold transition-all shadow-sm
                ${(!file || isUploading) 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'}`}
            >
              {isUploading ? 'Encrypting & Uploading...' : 'Upload to Vault'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DOCUMENT LIST */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full mb-10">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">YOUR ENCRYPTED RECORDS</h3>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{documents.length} Files</span>
            </div>

            <div className="divide-y divide-gray-50">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 p-3 rounded-xl text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                      </div>
                      
                      <div>
                        <p className="font-bold text-gray-800">{doc.name}</p>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1 font-medium">
                          <span>{doc.date}</span>
                          <span>•</span>
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Download">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <p className="font-medium">Your vault is empty.</p>
                  <p className="text-sm mt-1">Upload records to securely store them in the cloud.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
  );
}