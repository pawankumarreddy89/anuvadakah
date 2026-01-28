'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { allLanguages, popularLanguages, findLanguageByCode } from '@/lib/indian-languages';
import {
  ArrowRightLeft,
  Copy,
  Volume2,
  Star,
  Bookmark,
  MoreVertical,
  Languages,
  Sparkles,
  Loader2,
  Globe,
  X,
  FileText,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function TextTranslator() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('detect');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [actualDetectedLang, setActualDetectedLang] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sourceLanguage = findLanguageByCode(sourceLang);
  const targetLanguage = findLanguageByCode(targetLang);

  const getSourceDisplay = () => {
    if (sourceLang === 'detect') {
      return 'Auto Detect';
    }
    return sourceLanguage?.name || 'Unknown';
  };

  const handleDetectLanguage = async () => {
    if (!sourceText.trim()) {
      toast({
        title: 'Please enter text first',
        variant: 'destructive',
      });
      return;
    }

    setIsDetecting(true);

    try {
      const response = await fetch('/api/detect/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
        }),
      });

      // Even if API returns error, try to parse fallback language
      const data = await response.json();
      const detectedLanguageCode = data.language || 'en';

      setSourceLang(detectedLanguageCode);
      setActualDetectedLang(detectedLanguageCode);

      const detectedLang = findLanguageByCode(detectedLanguageCode);

      if (!response.ok) {
        toast({
          title: 'Language detection service unavailable',
          description: `Defaulting to ${detectedLang?.name || 'English'}`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Language detected',
          description: `Detected: ${detectedLang?.name || 'English'}`,
        });
      }
    } catch (error) {
      console.error('Language detection error:', error);
      // Default to English on error
      setSourceLang('en');
      setActualDetectedLang('en');

      toast({
        title: 'Language detection failed',
        description: 'Defaulting to English',
        variant: 'default',
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSwapLanguages = () => {
    // Prevent swapping if source is 'detect' (can't swap auto detect to target)
    if (sourceLang === 'detect') {
      toast({
        title: 'Cannot swap with Auto Detect',
        description: 'Please select a specific language first',
        variant: 'destructive',
      });
      return;
    }

    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: 'Please enter text to translate',
        variant: 'destructive',
      });
      return;
    }

    setIsTranslating(true);

    try {
      // Detect language if set to 'detect'
      let actualSourceLang = sourceLang;
      if (sourceLang === 'detect') {
        const detectResponse = await fetch('/api/detect/language', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: sourceText,
          }),
        });

        // Even if API returns error, try to parse fallback language
        const detectData = await detectResponse.json();
        actualSourceLang = detectData.language || 'en';

        // Update state with detected language
        setSourceLang(actualSourceLang);
        setActualDetectedLang(actualSourceLang);

        const detectedLang = findLanguageByCode(actualSourceLang);
        toast({
          title: 'Language detected',
          description: `Detected: ${detectedLang?.name || 'English'}`,
        });
      }

      const response = await fetch('/api/translate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceText,
          sourceLang: actualSourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTargetText(data.translatedText || '');

      // Save to history
      await saveTranslation({
        sourceText,
        sourceLang: actualSourceLang,
        targetText: data.translatedText,
        targetLang,
        modality: 'text',
      });

      toast({
        title: 'Translation completed',
        description: `Translated ${getSourceDisplay()} to ${targetLanguage?.name}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = (text: string, type: 'source' | 'target') => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${type === 'source' ? 'Source' : 'Translation'} text copied`,
    });
  };

  const handleClear = () => {
    setSourceText('');
    setTargetText('');
    toast({
      title: 'Text cleared',
      description: 'Both source and translation text have been cleared',
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      let apiUrl = '';
      if (file.type === 'application/pdf') {
        apiUrl = '/api/extract/pdf';
        // Simulate progress for PDF
        setExtractProgress(50);
      } else if (file.type.startsWith('image/')) {
        apiUrl = '/api/extract/image';
      } else {
        toast({
          title: 'Unsupported file type',
          description: 'Please upload a PDF or image file',
          variant: 'destructive',
        });
        setIsExtracting(false);
        return;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Extraction failed');
      }

      const data = await response.json();

      // Set progress to 100% when done
      setExtractProgress(100);

      setSourceText(data.text);

      toast({
        title: 'Text extracted successfully',
        description: file.type === 'application/pdf'
          ? `Extracted ${data.pageCount} pages of text`
          : `Extracted ${data.words || 'text'} from image`,
      });
    } catch (error) {
      console.error('File extraction error:', error);
      toast({
        title: 'File extraction failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
      setExtractProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSpeak = async (text: string, lang: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      const response = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: 'tongtong',
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error('Text-to-speech failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: 'Audio playback failed',
          variant: 'destructive',
        });
      };

      audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast({
        title: 'Text-to-speech failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const saveTranslation = async (translationData: any) => {
    try {
      await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(translationData),
      });
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!targetText) return;

    // Use actual detected language if source is 'detect'
    const langToSave = sourceLang === 'detect' ? (actualDetectedLang || 'en') : sourceLang;

    try {
      await fetch('/api/translations/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceText,
          targetText,
          sourceLang: langToSave,
          targetLang,
        }),
      });

      toast({
        title: 'Added to favorites',
        description: 'Translation has been favorited',
      });
    } catch (error) {
      console.error('Error favoriting:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Languages className="w-5 h-5 text-orange-500" />
            Select Languages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  From
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDetectLanguage}
                  disabled={!sourceText.trim() || isDetecting}
                  className="text-xs gap-1 text-orange-600 hover:text-orange-700"
                  title="Detect language automatically"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3" />
                      Detect
                    </>
                  )}
                </Button>
              </div>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Auto Detect
                  </div>
                  <SelectItem value="detect">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-orange-500" />
                      <span>Auto Detect</span>
                      <span className="text-muted-foreground text-xs">(Recommended)</span>
                    </div>
                  </SelectItem>
                  <Separator />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Popular Languages
                  </div>
                  {popularLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
                      </div>
                    </SelectItem>
                  ))}
                  <Separator />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    All Languages
                  </div>
                  {allLanguages.filter(lang => !popularLanguages.some(pop => pop.code === lang.code)).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              className="mt-6"
              title="Swap languages"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                To
              </label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Popular Languages
                  </div>
                  {popularLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
                      </div>
                    </SelectItem>
                  ))}
                  <Separator />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    All Languages
                  </div>
                  {allLanguages.filter(lang => !popularLanguages.some(pop => pop.code === lang.code)).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {sourceLanguage && sourceLang !== 'detect' && (
              <Badge variant="secondary" className="gap-1">
                {sourceLanguage.name} ({sourceLanguage.speakers})
              </Badge>
            )}
            {sourceLang === 'detect' && (
              <Badge variant="secondary" className="gap-1 text-orange-600 bg-orange-100 dark:bg-orange-900/30">
                Auto Detect
              </Badge>
            )}
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            {targetLanguage && (
              <Badge variant="secondary" className="gap-1">
                {targetLanguage.name} ({targetLanguage.speakers})
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Translation Area */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Source Text */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                {sourceLang === 'detect' ? 'Source Text' : (sourceLanguage?.name || 'Source Text')}
              </CardTitle>
              <div className="flex items-center gap-1">
                {sourceText && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(sourceText, sourceLang)}
                      disabled={isSpeaking}
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(sourceText, 'source')}
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" title="More options">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSourceText('')}>
                          Clear
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* File Upload Button */}
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isExtracting || isTranslating}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting || isTranslating}
                variant="outline"
                size="sm"
                className="gap-2 w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload PDF or Image
                  </>
                )}
              </Button>
              {isExtracting && (
                <div className="mt-2">
                  <Progress value={extractProgress} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Extracting text from {extractProgress}%
                  </p>
                </div>
              )}
            </div>

            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-[200px] resize-none border-2 focus:border-orange-500"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{sourceText.length} / 5000 characters</span>
              <AnimatePresence>
                {sourceText.length > 0 && sourceText.length < 3 && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-orange-500"
                  >
                    Type more to translate
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Target Text */}
        <Card className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                {targetLanguage?.name || 'Translation'}
              </CardTitle>
              <div className="flex items-center gap-1">
                {targetText && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(targetText, targetLang)}
                      disabled={isSpeaking}
                      title="Listen"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(targetText, 'target')}
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFavorite}
                      title="Add to favorites"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea
                placeholder="Translation will appear here..."
                value={targetText}
                readOnly
                className="min-h-[200px] resize-none bg-muted/50"
              />
              {isTranslating && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <span className="text-sm text-muted-foreground">Translating...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span>{targetText.length} characters</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Translate Button */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isTranslating}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-12"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Translate
            </>
          )}
        </Button>
        <Button
          onClick={handleClear}
          disabled={isTranslating || (!sourceText.trim() && !targetText.trim())}
          size="lg"
          variant="outline"
          className="px-6"
        >
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
