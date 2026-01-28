'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { allLanguages, findLanguageByCode } from '@/lib/indian-languages';
import {
  Search,
  Star,
  Copy,
  Volume2,
  Trash2,
  Filter,
  X,
  Clock,
  Languages,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface Translation {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  modality: string;
  favorited: boolean;
  createdAt: string;
}

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModality, setFilterModality] = useState('all');
  const [filterFavorite, setFilterFavorite] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadTranslations();
    }
  }, [open]);

  useEffect(() => {
    filterTranslations();
  }, [translations, searchQuery, filterModality, filterFavorite]);

  const loadTranslations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/translations');
      if (response.ok) {
        const data = await response.json();
        setTranslations(data.translations || []);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      toast({
        title: 'Failed to load history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTranslations = () => {
    let filtered = [...translations];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.sourceText.toLowerCase().includes(query) ||
          t.targetText.toLowerCase().includes(query)
      );
    }

    // Modality filter
    if (filterModality !== 'all') {
      filtered = filtered.filter((t) => t.modality === filterModality);
    }

    // Favorite filter
    if (filterFavorite === 'favorited') {
      filtered = filtered.filter((t) => t.favorited);
    } else if (filterFavorite === 'not-favorited') {
      filtered = filtered.filter((t) => !t.favorited);
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredTranslations(filtered);
  };

  const toggleFavorite = async (id: string) => {
    try {
      const translation = translations.find((t) => t.id === id);
      if (!translation) return;

      await fetch('/api/translations/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceText: translation.sourceText,
          targetText: translation.targetText,
          sourceLang: translation.sourceLang,
          targetLang: translation.targetLang,
        }),
      });

      setTranslations(
        translations.map((t) =>
          t.id === id ? { ...t, favorited: !t.favorited } : t
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteTranslation = async (id: string) => {
    try {
      await fetch(`/api/translations/${id}`, {
        method: 'DELETE',
      });

      setTranslations(translations.filter((t) => t.id !== id));
      toast({
        title: 'Translation deleted',
      });
    } catch (error) {
      console.error('Error deleting translation:', error);
      toast({
        title: 'Failed to delete',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
    });
  };

  const handleSpeak = async (text: string) => {
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

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'voice':
        return '🎤';
      case 'text':
        return '📝';
      case 'live':
        return '💬';
      default:
        return '📄';
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterModality('all');
    setFilterFavorite('all');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Translation History
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-4 pb-4 border-b">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search translations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              title="Clear filters"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={filterModality} onValueChange={setFilterModality}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="voice">Voice</SelectItem>
                <SelectItem value="live">Live Conversation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterFavorite} onValueChange={setFilterFavorite}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by favorite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="favorited">Favorited</SelectItem>
                <SelectItem value="not-favorited">Not Favorited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Translations List */}
        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">Loading...</div>
            </div>
          ) : filteredTranslations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Languages className="w-12 h-12 mb-4 text-muted-foreground/20" />
              <p className="text-muted-foreground">
                {translations.length === 0
                  ? 'No translations yet. Start translating to build your history!'
                  : 'No translations match your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTranslations.map((translation) => (
                <motion.div
                  key={translation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getModalityIcon(translation.modality)}</span>
                          <Badge variant="outline" className="gap-1">
                            {findLanguageByCode(translation.sourceLang)?.name}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="outline" className="gap-1">
                            {findLanguageByCode(translation.targetLang)?.name}
                          </Badge>
                          {translation.favorited && (
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleFavorite(translation.id)}
                            title={translation.favorited ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                translation.favorited
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteTranslation(translation.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm line-clamp-2">{translation.sourceText}</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-200 dark:border-orange-900">
                          <p className="text-sm font-medium text-orange-700 dark:text-orange-300 line-clamp-2">
                            {translation.targetText}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          {new Date(translation.createdAt).toLocaleString()}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSpeak(translation.targetText)}
                            title="Listen"
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(translation.targetText)}
                            title="Copy translation"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredTranslations.length} of {translations.length} translations
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
