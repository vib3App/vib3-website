'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { verificationCategories } from './types';

interface VerificationStepsProps {
  onSubmit: (data: VerificationFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface VerificationFormData {
  fullName: string;
  category: string;
  reason: string;
  links: string[];
  idDocument: File;
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= s ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/50'
          }`}>
            {s}
          </div>
          {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-purple-500' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  );
}

export function VerificationSteps({ onSubmit, isSubmitting }: VerificationStepsProps) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [links, setLinks] = useState(['']);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocument(file);
      const reader = new FileReader();
      reader.onloadend = () => setIdPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => links.length < 5 && setLinks([...links, '']);
  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };
  const removeLink = (index: number) => links.length > 1 && setLinks(links.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (!fullName || !category || !reason || !idDocument) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit({ fullName, category, reason, links: links.filter(l => l.trim()), idDocument });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What is verification?
        </h3>
        <p className="text-white/70 text-sm">
          A verified badge confirms that an account is the authentic presence of the public figure, celebrity, or brand it represents.
        </p>
      </div>

      <StepIndicator step={step} />

      {step === 1 && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-white font-medium">Step 1: Basic Information</h3>
          <div>
            <label className="block text-white/70 text-sm mb-2">Full Legal Name *</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="As shown on your ID" />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 glass rounded-xl text-white bg-transparent focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="" className="bg-gray-900">Select a category</option>
              {verificationCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">{cat}</option>
              ))}
            </select>
          </div>
          <button onClick={() => setStep(2)} disabled={!fullName || !category}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-50">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-white font-medium">Step 2: Why should we verify you?</h3>
          <div>
            <label className="block text-white/70 text-sm mb-2">Reason for verification *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
              className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              placeholder="Tell us why you should be verified..." />
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-2">Links to verify your identity (optional)</label>
            {links.map((link, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input type="url" value={link} onChange={(e) => updateLink(index, e.target.value)}
                  className="flex-1 px-4 py-2 glass rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  placeholder="https://..." />
                {links.length > 1 && (
                  <button onClick={() => removeLink(index)} className="p-2 glass rounded-xl text-white/50 hover:text-white">
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            {links.length < 5 && (
              <button onClick={addLink} className="text-purple-400 text-sm hover:underline">+ Add another link</button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 glass text-white rounded-full font-medium hover:bg-white/10 transition">Back</button>
            <button onClick={() => setStep(3)} disabled={!reason}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-50">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="text-white font-medium">Step 3: Identity Verification</h3>
          <p className="text-white/50 text-sm">
            Upload a photo of a government-issued ID. This is used to verify your identity and will be kept confidential.
          </p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <div onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition">
            {idPreview ? (
              <div className="relative w-48 h-32 mx-auto">
                <Image src={idPreview} alt="ID Preview" fill className="object-contain rounded-lg" />
              </div>
            ) : (
              <>
                <svg className="w-12 h-12 text-white/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white/50 text-sm">Click to upload ID document</p>
              </>
            )}
          </div>
          {idDocument && <p className="text-white/50 text-sm text-center">{idDocument.name}</p>}
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 glass text-white rounded-full font-medium hover:bg-white/10 transition">Back</button>
            <button onClick={handleSubmit} disabled={!idDocument || isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      <RequirementsCard />
    </div>
  );
}

function RequirementsCard() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-white font-medium mb-3">Requirements</h3>
      <ul className="text-white/50 text-sm space-y-2">
        {['Account must be public', 'Complete bio and profile picture', 'Active account with at least 5 videos', 'Represent a known person or brand'].map((req) => (
          <li key={req} className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {req}
          </li>
        ))}
      </ul>
    </div>
  );
}
