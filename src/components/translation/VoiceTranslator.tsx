'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { allLanguages, popularLanguages, findLanguageByCode } from '@/lib/indian-languages';
import {
  Mic,
  MicOff,
  Volume2,
  Copy,
  Star,
  ArrowRightLeft,
  Languages,
  Loader2,
  Sparkles,
  Play,
  Pause,
  Globe,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export function VoiceTranslator() {
  const [sourceLang, setSourceLang] = useState('detect');
  const [targetLang, setTargetLang] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [actualDetectedLang, setActualDetectedLang] = useState<string | null>(null);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sourceLanguage = findLanguageByCode(sourceLang);
  const targetLanguage = findLanguageByCode(targetLang);

  const getSourceDisplay = () => {
    if (sourceLang === 'detect') {
      return 'Auto Detect';
    }
    return sourceLanguage?.name || 'Unknown';
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDetectLanguage = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'No transcript to detect',
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
          text: transcript,
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscript('');
      setTranslation('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to use voice translation',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convert audio blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Step 1: Transcribe audio to text using ASR
      const transcriptionResponse = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
        }),
      });

      if (!transcriptionResponse.ok) {
        throw new Error('Speech recognition failed');
      }

      const transcriptionData = await transcriptionResponse.json();
      const transcribedText = transcriptionData.text || '';
      setTranscript(transcribedText);

      // Step 2: Translate the transcribed text
      if (transcribedText) {
        const translationResponse = await fetch('/api/translate/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceText: transcribedText,
            sourceLang,
            targetLang,
          }),
        });

        if (!translationResponse.ok) {
          throw new Error('Translation failed');
        }

        const translationData = await translationResponse.json();
        setTranslation(translationData.translatedText || '');

        // Save to history
        await saveTranslation({
          sourceText: transcribedText,
          sourceLang,
          targetText: translationData.translatedText,
          targetLang,
          modality: 'voice',
        });

        toast({
          title: 'Voice translation completed',
          description: `Translated ${sourceLanguage?.name} to ${targetLanguage?.name}`,
        });
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      toast({
        title: 'Voice translation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handlePlayTranslation = async () => {
    if (!translation) return;

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    try {
      setIsProcessing(true);

      const response = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: translation,
          voice: 'tongtong',
          speed: 1.0,
        }),
      });

      if (!response.ok) {
        throw new Error('Text-to-speech failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: 'Audio playback failed',
          variant: 'destructive',
        });
      };

      audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: 'Text-to-speech failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
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

    // Swap languages
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);

    // Swap text content
    const tempText = transcript;
    setTranscript(translation);
    setTranslation(tempText);
  };

  const handleCopy = (text: string, type: 'transcript' | 'translation') => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${type === 'transcript' ? 'Transcript' : 'Translation'} copied`,
    });
  };

  const handleClear = () => {
    setTranscript('');
    setTranslation('');
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    toast({
      title: 'Cleared',
      description: 'Both transcript and translation have been cleared',
    });
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
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                From (Voice Input)
              </label>
              <Select value={sourceLang} onValueChange={setSourceLang} disabled={isRecording}>
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
              disabled={isRecording}
              title="Swap languages"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                To (Translation Output)
              </label>
              <Select value={targetLang} onValueChange={setTargetLang} disabled={isRecording}>
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
            {sourceLanguage && (
              <Badge variant="secondary" className="gap-1">
                {sourceLanguage.name}
              </Badge>
            )}
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            {targetLanguage && (
              <Badge variant="secondary" className="gap-1">
                {targetLanguage.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Recording Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="w-5 h-5 text-rose-500" />
            Voice Input
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            {/* Recording Button */}
            <div className="relative">
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  isRecording ? 'bg-orange-500/20' : 'bg-transparent'
                }`}
                animate={isRecording ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
              />
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`relative w-32 h-32 rounded-full ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600'
                    : 'bg-gradient-to-br from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'
                } text-white`}
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-rose-500 font-medium"
                >
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  Recording...
                </motion.div>
                <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
              </div>
            )}

            {isProcessing && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transcript and Translation */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Transcript */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                {sourceLang === 'detect' ? 'Transcript' : (sourceLanguage?.name || 'Transcript')}
              </CardTitle>
              {transcript && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(transcript, 'transcript')}
                  title="Copy transcript"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 min-h-[150px]">
              <p className="text-sm">
                {transcript || 'Speak to see transcript here...'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Translation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                {targetLanguage?.name || 'Translation'}
              </CardTitle>
              <div className="flex items-center gap-1">
                {translation && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePlayTranslation}
                      disabled={isProcessing}
                      title="Listen to translation"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(translation, 'translation')}
                      title="Copy translation"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50 min-h-[150px]">
              <p className="text-sm">
                {translation || 'Translation will appear here...'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear Button */}
      {(transcript || translation) && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleClear}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
