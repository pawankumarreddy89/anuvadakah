'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextTranslator } from '@/components/translation/TextTranslator';
import { VoiceTranslator } from '@/components/translation/VoiceTranslator';
import { LiveConversation } from '@/components/translation/LiveConversation';
import { HistoryPanel } from '@/components/translation/HistoryPanel';
import { Languages, Mic, Users, History, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('text');
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  Anuvadakah
                </h1>
                <p className="text-xs text-muted-foreground">अनुवादक - Indian Language Translator</p>
              </div>
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">History</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Introduction Card */}
          <Card className="mb-6 border-orange-200 dark:border-orange-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-orange-500" />
                Welcome to Anuvadakah
              </CardTitle>
              <CardDescription>
                Professional translation platform for all 22 scheduled Indian languages and major dialects.
                Translate text, voice, and conduct live conversations across languages.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Translation Modes */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    <span>Text</span>
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    <span>Voice</span>
                  </TabsTrigger>
                  <TabsTrigger value="live" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Live</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text">
                  <TextTranslator />
                </TabsContent>

                <TabsContent value="voice">
                  <VoiceTranslator />
                </TabsContent>

                <TabsContent value="live">
                  <LiveConversation />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* History Panel */}
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />

      {/* Footer */}
      <footer className="mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Anuvadakah - Indian Language Translation Platform</p>
            <p className="mt-1">Supporting 22 Scheduled Indian Languages + Major Dialects</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
