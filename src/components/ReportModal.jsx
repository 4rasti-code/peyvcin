import React, { useState, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';

const ReportModal = ({ isOpen, onClose, user }) => {
  const [type, setType] = useState('bug');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      setError('تو دشێی زێدەترینی ٥ وێنەیان هەلبژێری.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    for (let file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('قەبارەیێ وێنەی نابیت ژ 5 مێگابایت مەزنتر بیت.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('هیڤیە ئاریشە یان پێشنیارێ بنڤێسە.');
      return;
    }

    try {
      triggerHaptic(10);
      setIsSubmitting(true);
      setError(null);

      let imageUrl = null;

      // 1. Upload images if exist
      if (images.length > 0) {
        const uploadedUrls = [];
        for (let i = 0; i < images.length; i++) {
          const imageObj = images[i];
          const fileExt = imageObj.file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('report_images')
            .upload(fileName, imageObj.file, { upsert: false });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('report_images')
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrlData.publicUrl);
        }
        imageUrl = uploadedUrls.join(',');
      }

      // 2. Insert into user_reports
      const { error: insertError } = await supabase
        .from('user_reports')
        .insert([{
          user_id: user.id,
          type,
          description: description.trim(),
          image_url: imageUrl
        }]);

      if (insertError) throw insertError;

      triggerHaptic(30);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Report submission error:', err);
      setError('ئاریشەیەک چێبوو د هنارتنێ دا: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setType('bug');
    setDescription('');
    setImages([]);
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 sm:p-8" dir="rtl">
      {/* Backdrop */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isSubmitting ? undefined : handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <Motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-[400px] bg-white dark:bg-mono-900 border border-mono-200 dark:border-white/10 rounded-md p-5 sm:p-6 shadow-2xl flex flex-col gap-4 overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black font-rabar text-mono-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">report</span>
            ڕاپۆرت یان پێشنیار
          </h2>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-[6px] bg-mono-100 dark:bg-white/10 flex items-center justify-center text-mono-500 hover:text-mono-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-md bg-green-500/20 text-green-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <p className="font-bold text-mono-900 dark:text-white text-center">ب سەرکەفتیانە هاتە هنارتن!</p>
            <p className="text-xs text-mono-500 text-center">سوپاس بۆ هاریکاریا تە.</p>
          </div>
        ) : (
          <>
            {/* Type Selector */}
            <div className="flex bg-mono-100 dark:bg-white/5 rounded-md p-1">
              <button
                onClick={() => setType('bug')}
                className={`flex-1 py-2 text-sm font-bold rounded-[4px] transition-colors ${type === 'bug' ? 'bg-white dark:bg-mono-700 text-mono-900 dark:text-white shadow-sm' : 'text-mono-500 hover:text-mono-700 dark:hover:text-mono-300'}`}
              >
                ئاریشەیەک هەیە
              </button>
              <button
                onClick={() => setType('suggestion')}
                className={`flex-1 py-2 text-sm font-bold rounded-[4px] transition-colors ${type === 'suggestion' ? 'bg-white dark:bg-mono-700 text-mono-900 dark:text-white shadow-sm' : 'text-mono-500 hover:text-mono-700 dark:hover:text-mono-300'}`}
              >
                پێشنیار
              </button>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-mono-600 dark:text-mono-400">ڕوونکرن *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={type === 'bug' ? "ئاریشەیەکا چاڤەڕێ نەکری چێبوو..." : "هزرەکا نوی بۆ یاریێ..."}
                className="w-full bg-mono-50 dark:bg-black/20 border border-mono-200 dark:border-white/10 rounded-md p-3 text-sm min-h-[100px] text-mono-900 dark:text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-mono-600 dark:text-mono-400">وێنە (هەتا ٥ وێنە - هەلبژارتنە)</label>
              
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                  {images.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden border border-mono-200 dark:border-white/10 bg-black snap-start">
                      <img src={img.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-[4px] bg-black/60 text-white flex items-center justify-center transition-opacity hover:bg-red-500"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 shrink-0 border-2 border-dashed border-mono-200 dark:border-white/10 hover:border-primary dark:hover:border-primary rounded-md flex flex-col items-center justify-center gap-1 text-mono-500 transition-colors bg-mono-50 dark:bg-black/20"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                  )}
                </div>
              )}

              {images.length === 0 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-mono-200 dark:border-white/10 hover:border-primary dark:hover:border-primary rounded-md flex flex-col items-center justify-center gap-2 text-mono-500 transition-colors bg-mono-50 dark:bg-black/20"
                >
                  <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                  <span className="text-xs font-bold">وێنەی هەلبژێرە...</span>
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden" 
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-2.5 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 mt-2 bg-primary hover:bg-primary-dark text-white rounded-md font-black text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_0_rgba(29,78,216,1)] disabled:opacity-50 active:translate-y-1 active:shadow-none"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  هنارتن
                </>
              )}
            </button>
          </>
        )}
      </Motion.div>
    </div>
  );
};

export default React.memo(ReportModal);
