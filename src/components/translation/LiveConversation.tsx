'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allLanguages, popularLanguages, findLanguageByCode } from '@/lib/indian-languages';
import {
  Users,
  Send,
  Mic,
  Volume2,
  Copy,
  Settings,
  Play,
  UserPlus,
  UserMinus,
  Loader2,
  Sparkles,
  Video,
  VideoOff,
  Globe,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Participant {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  color: string;
}

interface Message {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  translation: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}

const participantColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
];

export function LiveConversation() {
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'User 1',
      sourceLang: 'detect',
      targetLang: 'en',
      color: participantColors[0],
    },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  const selectedParticipantData = participants.find(p => p.id === selectedParticipant);

  const addParticipant = () => {
    const newId = String(participants.length + 1);
    setParticipants([
      ...participants,
      {
        id: newId,
        name: `User ${participants.length + 1}`,
        sourceLang: 'detect',
        targetLang: 'en',
        color: participantColors[participants.length % participantColors.length],
      },
    ]);
    setSelectedParticipant(newId);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 1) {
      toast({
        title: 'Cannot remove last participant',
        variant: 'destructive',
      });
      return;
    }

    setParticipants(participants.filter(p => p.id !== id));
    if (selectedParticipant === id) {
      setSelectedParticipant(participants[0].id);
    }

    setMessages(messages.filter(m => m.participantId !== id));
  };

  const updateParticipant = (id: string, field: keyof Participant, value: any) => {
    setParticipants(participants.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleDetectLanguage = async () => {
    if (!inputText.trim()) {
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
          text: inputText,
        }),
      });

      // Even if API returns error, try to parse fallback language
      const data = await response.json();
      const detectedLanguageCode = data.language || 'en';

      if (selectedParticipantData) {
        updateParticipant(selectedParticipantData.id, 'sourceLang', detectedLanguageCode);

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
      }
    } catch (error) {
      console.error('Language detection error:', error);
      // Default to English on error
      if (selectedParticipantData) {
        updateParticipant(selectedParticipantData.id, 'sourceLang', 'en');

        toast({
          title: 'Language detection failed',
          description: 'Defaulting to English',
          variant: 'default',
        });
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedParticipantData) return;

    const participant = selectedParticipantData;
    setIsProcessing(true);

    try {
      // Detect language if set to 'detect'
      let actualSourceLang = participant.sourceLang;
      if (participant.sourceLang === 'detect') {
        const detectResponse = await fetch('/api/detect/language', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: inputText,
          }),
        });

        // Even if API returns error, try to parse fallback language
        const detectData = await detectResponse.json();
        actualSourceLang = detectData.language || 'en';

        // Update participant's source language
        updateParticipant(participant.id, 'sourceLang', actualSourceLang);

        const detectedLang = findLanguageByCode(actualSourceLang);
        toast({
          title: 'Language detected',
          description: `Detected: ${detectedLang?.name || 'English'}`,
        });
      }

      // Translate the message
      const response = await fetch('/api/translate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceText: inputText,
          sourceLang: actualSourceLang,
          targetLang: participant.targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();

      const newMessage: Message = {
        id: Date.now().toString(),
        participantId: participant.id,
        participantName: participant.name,
        text: inputText,
        translation: data.translatedText || '',
        sourceLang: participant.sourceLang,
        targetLang: participant.targetLang,
        timestamp: new Date(),
      };

      setMessages([...messages, newMessage]);
      setInputText('');

      toast({
        title: 'Message translated',
        description: `${participant.name}: ${data.translatedText?.substring(0, 50)}...`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakTranslation = async (text: string) => {
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

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: 'Text-to-speech failed',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClear = () => {
    setInputText('');
    toast({
      title: 'Cleared',
      description: 'Input text has been cleared',
    });
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      {/* Participants Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-orange-500" />
              Participants ({participants.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addParticipant}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Participant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <Card
                key={participant.id}
                className={`${
                  selectedParticipant === participant.id
                    ? 'border-orange-500 border-2'
                    : 'border-2'
                } cursor-pointer transition-all hover:shadow-md`}
                onClick={() => setSelectedParticipant(participant.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full ${participant.color} flex items-center justify-center text-white text-sm font-medium`}
                      >
                        {participant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{participant.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {findLanguageByCode(participant.sourceLang)?.name} →{' '}
                          {findLanguageByCode(participant.targetLang)?.name}
                        </Badge>
                      </div>
                    </div>
                    {participants.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeParticipant(participant.id);
                        }}
                        className="h-8 w-8"
                      >
                        <UserMinus className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Select
                      value={participant.sourceLang}
                      onValueChange={(value) => updateParticipant(participant.id, 'sourceLang', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
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
                        {popularLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                        {allLanguages.filter(lang => !popularLanguages.some(pop => pop.code === lang.code)).map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={participant.targetLang}
                      onValueChange={(value) => updateParticipant(participant.id, 'targetLang', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {popularLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                        {allLanguages.filter(lang => !popularLanguages.some(pop => pop.code === lang.code)).map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transcript */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-rose-500" />
              Live Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Start a conversation by sending a message</p>
                  </div>
                )}

                <AnimatePresence>
                  {messages.map((message) => {
                    const participant = participants.find(p => p.id === message.participantId);
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex gap-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${participant?.color || 'bg-gray-500'} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}
                        >
                          {participant?.name.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{participant?.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {findLanguageByCode(message.sourceLang)?.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-200 dark:border-orange-900">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {findLanguageByCode(message.targetLang)?.name}
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => speakTranslation(message.translation)}
                                  title="Listen"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyText(message.translation)}
                                  title="Copy"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                              {message.translation}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="w-5 h-5 text-green-500" />
              Send Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Speaking as
              </label>
              <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  Your message ({findLanguageByCode(selectedParticipantData?.sourceLang || 'en')?.name})
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDetectLanguage}
                  disabled={!inputText.trim() || isDetecting}
                  className="text-xs gap-1 text-orange-600 hover:text-orange-700"
                  title="Detect language from message"
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
              <Textarea
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[150px] resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsListening(!isListening)}
                className={isListening ? 'bg-rose-500 text-white' : ''}
              >
                {isListening ? <Mic /> : <Mic />}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={!inputText.trim() || isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isListening && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-sm">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  Listening...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
