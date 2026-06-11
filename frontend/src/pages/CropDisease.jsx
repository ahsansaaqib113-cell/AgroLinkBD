import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Upload, HelpCircle, Activity, Sparkles, Sprout, Check, ShieldAlert } from 'lucide-react';

const CropDisease = () => {
  const { user } = useAuth();
  
  const [selectedCrop, setSelectedCrop] = useState('potato');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const mockImages = {
    potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
    tomato: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400',
    rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
  };

  const handleDiagnose = async () => {
    setIsScanning(true);
    setScanResult(null);
    setImagePreview(mockImages[selectedCrop] || mockImages.potato);

    // Simulate Scanning Delay for 3s
    setTimeout(async () => {
      try {
        const res = await api.post('/smart/crop-scan', { cropType: selectedCrop });
        if (res.data.success) {
          setScanResult(res.data.diagnosis);
        }
      } catch (err) {
        console.error('AI Scan simulation failed');
      } finally {
        setIsScanning(false);
      }
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <Activity className="h-4 w-4" /> AI Diagnostics
        </span>
        <h1 className="text-2xl font-bold dark:text-white mt-2">Crop Disease AI Diagnostic</h1>
        <p className="text-xs text-slate-400 mt-2">
          Upload leaf pictures of potato, tomato, or rice to run our simulated neural scanner. Get instant identification and organic treatment recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Scanner Panel */}
        <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 space-y-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Scanning console</span>

          {/* Image Upload Area */}
          <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl aspect-square flex flex-col items-center justify-center overflow-hidden p-2 bg-slate-50/50 dark:bg-slate-950/25">
            {imagePreview ? (
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  className="w-full h-full object-cover"
                />
                {isScanning && <div className="scan-line"></div>}
              </div>
            ) : (
              <div className="text-center space-y-2 p-6 cursor-pointer">
                <Upload className="h-10 w-10 text-slate-400 mx-auto" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Drag & Drop Crop leaf picture</span>
                <p className="text-[10px] text-slate-400">Supports PNG, JPG (maximum 5MB)</p>
              </div>
            )}
          </div>

          {/* Crop Type Tester Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Crop Specimen</label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setImagePreview(null);
                setScanResult(null);
              }}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-transparent dark:text-white dark:border-slate-800"
            >
              <option value="potato" className="dark:bg-slate-900">Potato Specimen (Late Blight)</option>
              <option value="tomato" className="dark:bg-slate-900">Tomato Specimen (Leaf Curl Virus)</option>
              <option value="rice" className="dark:bg-slate-900">Rice Specimen (Rice Blast)</option>
              <option value="generic" className="dark:bg-slate-900">Healthy specimen</option>
            </select>
          </div>

          <button
            onClick={handleDiagnose}
            disabled={isScanning}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/10"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isScanning ? 'Running Diagnostic Neural Network...' : 'Analyze Specimen'}</span>
          </button>
        </div>

        {/* Right: Results Panel */}
        <div className="glass-card rounded-[24px] p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-center min-h-[300px]">
          {isScanning ? (
            <div className="text-center py-12 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto"></div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Segmenting leaf tissues...</p>
              <p className="text-[10px] text-slate-400">Classifying pathogens in database</p>
            </div>
          ) : scanResult ? (
            <div className="space-y-4">
              
              {/* Header result */}
              <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Diagnosis result</span>
                  <h3 className="font-extrabold text-slate-800 dark:text-white mt-0.5">{scanResult.disease}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block">{scanResult.confidence}%</span>
                  <span className="text-[9px] text-slate-400">confidence</span>
                </div>
              </div>

              {/* Pathogen */}
              <div className="text-xs">
                <span className="text-[10px] font-bold text-slate-400 block">Pathogen classification</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 italic">{scanResult.pathogen}</span>
              </div>

              {/* Symptoms */}
              <div className="text-xs">
                <span className="text-[10px] font-bold text-slate-400 block">Visual symptoms identified</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{scanResult.symptoms}</p>
              </div>

              {/* Organic Cures */}
              <div className="rounded-xl bg-emerald-50/50 dark:bg-slate-800/40 p-3 border border-emerald-500/10 text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Check className="h-4 w-4" /> Organic Management Advice
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{scanResult.organicTreatment}</p>
              </div>

              {/* Chemical Cures */}
              {scanResult.chemicalTreatment && (
                <div className="rounded-xl bg-red-500/5 dark:bg-red-500/10 p-3 border border-red-500/10 text-xs">
                  <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="h-4 w-4" /> Chemical Control (If severe)
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{scanResult.chemicalTreatment}</p>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Sprout className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-800" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">Specimen Awaiting Diagnosis</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Select a specimen and click Analyze to view simulated neural classifier breakdown sheet.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default CropDisease;
