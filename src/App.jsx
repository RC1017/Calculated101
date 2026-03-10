import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Gamepad2, X, Maximize2, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './games.json';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const isFullscreenPending = useRef(false);

  const toggleFullscreen = async () => {
    if (!containerRef.current || isFullscreenPending.current) return;

    try {
      isFullscreenPending.current = true;
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      // Ignore "Pending operation cancelled" errors as they are benign
      if (err.message?.includes('Pending operation cancelled')) {
        return;
      }
      console.error(`Error attempting to toggle full-screen mode: ${err.message}`);
    } finally {
      isFullscreenPending.current = false;
    }
  };

  const filteredGames = useMemo(() => {
    return gamesData.filter(game =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closePlayer = () => {
    setSelectedGame(null);
    setIsFullscreen(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect py-4 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => { setSearchQuery(''); setSelectedGame(null); }}
          >
            <div className="bg-gaming-accent p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <Gamepad2 size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              UNBLOCKED<span className="text-gaming-accent">HUB</span>
            </h1>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gaming-accent/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 pb-12">
        <AnimatePresence mode="wait">
          {selectedGame ? (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{selectedGame.title}</h2>
                  <p className="text-white/60 flex items-center gap-2 mt-1">
                    <Info size={14} />
                    {selectedGame.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Toggle Fullscreen"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <a
                    href={selectedGame.iframeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Open in New Tab"
                  >
                    <ExternalLink size={20} />
                  </a>
                  <button
                    onClick={closePlayer}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                    title="Close Game"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div 
                ref={containerRef}
                className={`relative bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-500 ${isFullscreen ? 'w-full h-full' : 'aspect-video w-full'}`}
              >
                {isFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 z-50 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/20"
                  >
                    <X size={24} />
                  </button>
                )}
                <iframe
                  src={selectedGame.iframeUrl}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              
              {!isFullscreen && (
                <div className="pt-12 border-t border-white/5">
                  <h3 className="text-xl font-bold mb-6">More Games</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGames.filter(g => g.id !== selectedGame.id).slice(0, 4).map((game) => (
                      <GameCard key={game.id} game={game} onClick={() => handleGameSelect(game)} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-4xl font-black tracking-tight">POPULAR <span className="text-gaming-accent">GAMES</span></h2>
                  <p className="text-white/40 mt-2">Hand-picked unblocked games for your entertainment.</p>
                </div>
                <div className="hidden md:block text-right">
                  <span className="text-xs font-mono text-white/20 uppercase tracking-widest">Total Games: {filteredGames.length}</span>
                </div>
              </div>

              {filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredGames.map((game) => (
                    <GameCard key={game.id} game={game} onClick={() => handleGameSelect(game)} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="inline-block p-6 bg-white/5 rounded-3xl border border-white/10 mb-4">
                    <Search size={48} className="text-white/20 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold">No games found</h3>
                  <p className="text-white/40 mt-2">Try searching for something else.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50">
            <Gamepad2 size={20} />
            <span className="font-bold tracking-tighter">UNBLOCKED HUB</span>
          </div>
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs font-mono text-white/20">© 2026 UNBLOCKED HUB. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}

function GameCard({ game, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer bg-gaming-card rounded-2xl overflow-hidden border border-white/5 hover:border-gaming-accent/50 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        <div className="absolute bottom-3 right-3 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-gaming-accent p-2 rounded-lg shadow-lg">
            <Gamepad2 size={16} />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg group-hover:text-gaming-accent transition-colors">{game.title}</h3>
        <p className="text-sm text-white/40 line-clamp-2 mt-1">{game.description}</p>
      </div>
    </motion.div>
  );
}
