import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Chrome, Apple, CheckCircle, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPage() {
  const [, setLocation] = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      // Redirect to app if already installed
      setTimeout(() => setLocation('/'), 2000);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setTimeout(() => setLocation('/'), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setLocation]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    } else {
      setIsInstalling(false);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent);

  if (isInstalled) {
    return (
      <div className="min-h-screen atmospheric-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold neon-gradient-title mb-4">
            App Installed Successfully!
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Launching The Traitors...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-pink mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen atmospheric-bg">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-neon-pink to-vivid-purple p-4 shadow-2xl shadow-neon-pink/30">
            <img 
              src="/icon-512.png" 
              alt="The Traitors App" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 neon-gradient-title">
            Install The Traitors
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get the full mobile app experience! Install The Traitors on your phone for 
            faster access, offline play, and native app features.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Offline Play
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Home Screen Icon
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Fast Loading
            </div>
          </div>
        </motion.div>

        {/* Installation Methods */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Automatic Installation */}
          {deferredPrompt && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="retro-card border-2 border-neon-pink bg-black/50 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl neon-gradient-title flex items-center gap-3">
                    <Download className="w-8 h-8" />
                    Quick Install
                  </CardTitle>
                  <p className="text-gray-300">Recommended for most users</p>
                </CardHeader>
                <CardContent>
                  <Button
                    size="lg"
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full bg-gradient-to-r from-neon-pink to-vivid-purple hover:from-neon-pink/80 hover:to-vivid-purple/80 text-white font-bold py-4 text-lg"
                    data-testid="button-install-app-quick"
                  >
                    {isInstalling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-3" />
                        Install App Now
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    One-click installation for supported browsers
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Manual Installation - iOS */}
          {isIOS && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="retro-card border-2 border-pumpkin-orange bg-black/50 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-pumpkin-orange flex items-center gap-3">
                    <Apple className="w-8 h-8" />
                    iPhone Installation
                  </CardTitle>
                  <p className="text-gray-300">For Safari on iPhone/iPad</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pumpkin-orange text-black text-sm font-bold flex items-center justify-center">1</div>
                      <p className="text-gray-300">Tap the Share button (📤) at the bottom of Safari</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pumpkin-orange text-black text-sm font-bold flex items-center justify-center">2</div>
                      <p className="text-gray-300">Scroll down and tap "Add to Home Screen"</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pumpkin-orange text-black text-sm font-bold flex items-center justify-center">3</div>
                      <p className="text-gray-300">Tap "Add" to confirm installation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Manual Installation - Android */}
          {isAndroid && !deferredPrompt && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="retro-card border-2 border-vivid-purple bg-black/50 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-vivid-purple flex items-center gap-3">
                    <Smartphone className="w-8 h-8" />
                    Android Installation
                  </CardTitle>
                  <p className="text-gray-300">For Chrome on Android</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-vivid-purple text-white text-sm font-bold flex items-center justify-center">1</div>
                      <p className="text-gray-300">Tap the menu (⋮) in Chrome</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-vivid-purple text-white text-sm font-bold flex items-center justify-center">2</div>
                      <p className="text-gray-300">Select "Install app" or "Add to Home screen"</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-vivid-purple text-white text-sm font-bold flex items-center justify-center">3</div>
                      <p className="text-gray-300">Confirm installation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Desktop Installation */}
          {!isIOS && !isAndroid && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="retro-card border-2 border-vivid-purple bg-black/50 h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-vivid-purple flex items-center gap-3">
                    <Chrome className="w-8 h-8" />
                    Desktop Installation
                  </CardTitle>
                  <p className="text-gray-300">For Chrome, Edge, or Firefox</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-vivid-purple text-white text-sm font-bold flex items-center justify-center">1</div>
                      <p className="text-gray-300">Look for install icon (📥) in the address bar</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-vivid-purple text-white text-sm font-bold flex items-center justify-center">2</div>
                      <p className="text-gray-300">Or use browser menu → "Install The Traitors"</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-vivid-purple text-white text-sm font-bold flex items-center justify-center">3</div>
                      <p className="text-gray-300">Launch from desktop or start menu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold neon-gradient-title mb-8">
            Why Install The App?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-pink to-vivid-purple flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Native App Feel</h3>
              <p className="text-gray-300 text-sm">Full-screen experience without browser controls</p>
            </div>
            
            <div className="p-6 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pumpkin-orange to-blood-red flex items-center justify-center">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Works Offline</h3>
              <p className="text-gray-300 text-sm">Play even without internet connection</p>
            </div>
            
            <div className="p-6 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-vivid-purple to-neon-pink flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quick Access</h3>
              <p className="text-gray-300 text-sm">Launch directly from your home screen</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            className="border-gray-600 hover:bg-gray-800 text-gray-300"
            data-testid="button-use-browser"
          >
            Continue in Browser Instead
          </Button>
        </motion.div>
      </div>
    </div>
  );
}