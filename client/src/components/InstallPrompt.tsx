import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay to not be too intrusive
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-dismissed', 'true');
  };

  // Don't show if already installed, no prompt available, or was dismissed
  if (isInstalled || !deferredPrompt || !showPrompt || sessionStorage.getItem('pwa-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <Card className="retro-card border-2 border-neon-pink bg-black/95 backdrop-blur-lg shadow-2xl shadow-neon-pink/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-neon-pink to-vivid-purple flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white mb-1 text-sm">
                  Install The Traitors App
                </h3>
                <p className="text-xs text-gray-300 mb-3 leading-relaxed">
                  Get the full app experience! Install on your phone for faster access and app-like features.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleInstallClick}
                    className="bg-gradient-to-r from-neon-pink to-vivid-purple hover:from-neon-pink/80 hover:to-vivid-purple/80 text-white text-xs px-3 py-1.5 h-auto font-medium"
                    data-testid="button-install-app"
                  >
                    <Download className="w-3 h-3 mr-1.5" />
                    Install
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-white hover:bg-white/10 text-xs px-2 py-1.5 h-auto"
                    data-testid="button-dismiss-install"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* iOS Safari Instructions */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-neon-pink">iPhone users:</strong> Tap the share button 
                <span className="mx-1">📤</span> then "Add to Home Screen"
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}