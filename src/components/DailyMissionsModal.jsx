import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import { useGame } from '../context/GameContext';
import { playSuccessSfx } from '../utils/audio';
import { FilsIcon, DerhemIcon, ZerIcon } from './CurrencyIcon';

const ASSETS = {
  fils: "/assets/missions/fils.png",
  magnet: "/assets/missions/magnet.png",
  hint: "/assets/missions/hint.png",
  skip: "/assets/missions/skip.png",
  derhem: "/assets/missions/derhem.png",
  book_stone: "/assets/missions/book_stone.png",
  book_alchemist: "/assets/missions/book_alchemist.png",
  book_lava: "/assets/missions/book_lava.png",
  book_mystic: "/assets/missions/book_mystic.png"
};

// --- VFX: Reward Flying Item ---
const FlyingVFX = ({ type, isStar, onComplete, onHitTarget }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 0, x: 0 }}
      animate={{ 
        scale: [0, 1.5, 1],
        opacity: [0, 1, 1],
        x: [(Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50],
        y: [-50, -30],
        transitionEnd: { display: "none" }
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.div
        animate={{
          x: 0,
          y: isStar ? -400 : 500, // Fly to top rail vs bottom bag
          scale: 0.5,
          opacity: 0,
        }}
        transition={{ 
          type: "spring", 
          duration: 0.8, 
          delay: 0.2, 
          bounce: 0.45, 
          mass: 0.8
        }}
        onAnimationComplete={() => {
          onHitTarget?.();
          onComplete?.();
        }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none"
      >
        {type === 'fils' ? (
          <FilsIcon className="w-16 h-16 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
        ) : type === 'derhem' ? (
          <DerhemIcon className="w-16 h-16 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
        ) : type === 'zer' ? (
          <ZerIcon className="w-16 h-16 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
        ) : isStar ? (
          <span className="material-symbols-outlined text-amber-400 text-6xl drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]">star</span>
        ) : (
          <img src={ASSETS[type]} className="w-16 h-16 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
        )}
      </motion.div>
    </motion.div>
  );
};

const RewardFountain = ({ reward, isVisible, onFinished, onHitRail, onHitBag }) => {
  const [isDone, setIsDone] = useState(false);
  if (!isVisible || isDone) return null;
  
  const items = [];
  items.push({ type: 'star', isStar: true });
  if (reward.fils) items.push({ type: 'fils', isStar: false });
  if (reward.magnetCount) items.push({ type: 'magnet', isStar: false });
  if (reward.hintCount) items.push({ type: 'hint', isStar: false });

  return (
    <>
      {items.map((item, i) => (
        <FlyingVFX 
          key={i} 
          type={item.type} 
          isStar={item.isStar}
          onHitTarget={item.isStar ? onHitRail : onHitBag}
          onComplete={i === items.length - 1 ? () => { setIsDone(true); onFinished(); } : undefined} 
        />
      ))}
    </>
  );
};

const NativeChest = ({ type = "wooden", isReady, isClaimed, size = "w-14 h-14", onClick }) => {
  const assets = {
    wooden: isClaimed ? "/assets/missions/chest_wood_open.png" : "/assets/missions/chest_wood_closed.png",
    golden: isClaimed ? "/assets/missions/chest_silver_open.png" : "/assets/missions/chest_golden.png",
    purple: isClaimed ? "/assets/missions/chest_wood_open.png" : "/assets/missions/chest_wooden.png"
  };
  const src = assets[type] || assets.wooden;

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={isReady && !isClaimed ? { 
        y: [0, -5, 0],
        rotate: [0, -2, 2, 0]
      } : {}}
      transition={isReady ? { repeat: Infinity, duration: 1.2 } : {}}
      onClick={onClick}
      className={`relative ${size} cursor-pointer flex items-center justify-center ${isClaimed ? 'opacity-60 grayscale-[0.2]' : 'opacity-100'}`}
    >
      <img src={src} className="w-full h-full object-contain drop-shadow-lg" />
      {isReady && !isClaimed && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm z-20" />
      )}
    </motion.div>
  );
};

const DailyMissionsModal = ({ isOpen, onClose }) => {
  const { 
    dailyMissions, MISSION_DEFS, CHEST_DEFS, 
    claimMissionReward, claimChestReward,
    inventory 
  } = useGame();

  const [timeLeft, setTimeLeft] = useState("");
  const [openingMissionId, setOpeningMissionId] = useState(null);
  const [openingMilestoneId, setOpeningMilestoneId] = useState(null);
  const [railRipple, setRailRipple] = useState(0);
  const [bagPulse, setBagPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const completedCount = dailyMissions.filter(m => m.progress >= m.target_goal).length;

  const handleClaimMission = async (missionId) => {
    setOpeningMissionId(missionId);
    triggerHaptic(50);
    setTimeout(() => playSuccessSfx(), 200);
    setTimeout(async () => {
      await claimMissionReward(missionId);
    }, 1000); 
  };

  const handleClaimMilestone = async (chestId) => {
    setOpeningMilestoneId(chestId);
    triggerHaptic(70);
    setTimeout(() => playSuccessSfx(), 200);
    setTimeout(async () => {
      await claimChestReward(chestId);
    }, 1000);
  };

  const MissionCard = ({ mission, gridClass }) => {
    const def = MISSION_DEFS[mission.mission_type];
    const isDone = mission.progress >= mission.target_goal;
    const isClaimed = mission.is_claimed;
    const isOpening = openingMissionId === mission.id;
    const progressPercent = Math.min(100, (mission.progress / mission.target_goal) * 100);

    return (
      <motion.div 
        layout
        className={`relative ${gridClass} bg-slate-900/60 border-2 border-white/5 rounded-[32px] p-5 flex flex-col justify-between overflow-hidden group`}
      >
        <div className="flex justify-between items-start">
           <div className="flex flex-col">
              <span className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">Missions</span>
              <h3 className="text-white font-black text-lg leading-tight group-hover:text-amber-400 transition-colors uppercase">
                {def.title}
              </h3>
           </div>
           {/* Reward Preview */}
           <div className="bg-white/5 p-2 rounded-2xl flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
              <span className="text-white font-black text-xs">50</span>
           </div>
        </div>

        <div className="mt-4">
           <div className="flex justify-between text-[11px] font-black text-white/60 mb-1.5 uppercase tracking-tighter">
              <span>Progress</span>
              <span>{mission.progress} / {mission.target_goal}</span>
           </div>
           <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-blue-500'}`}
              />
           </div>
        </div>

        <button 
          disabled={isClaimed}
          onClick={() => isDone ? (!isClaimed && handleClaimMission(mission.id)) : onClose()}
          className={`mt-4 w-full py-3 rounded-2xl border-b-4 border-black/30 font-black text-sm uppercase transition-all active:translate-y-1 active:border-b-0 ${
            isClaimed ? 'bg-slate-800 text-white/10' : 
            isDone ? 'bg-emerald-500 text-white shadow-lg' : 
            'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          {isClaimed ? 'Claimed' : isDone ? 'Claim Reward' : 'Continue'}
        </button>

        <AnimatePresence>
          {isOpening && (
            <RewardFountain 
              reward={def.reward} 
              isVisible={true} 
              onHitRail={() => setRailRipple(prev => prev + 1)}
              onHitBag={() => setBagPulse(prev => prev + 1)}
              onFinished={() => setOpeningMissionId(null)} 
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="relative w-full max-w-lg bg-slate-950 rounded-[48px] shadow-2xl overflow-hidden flex flex-col border-2 border-white/10"
        >
          {/* Header Tile (Span 4) */}
          <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-b border-white/5 relative">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Daily Missions</h1>
                   <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Milestones & Rewards</p>
                </div>
                <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
                   <span className="material-symbols-outlined text-amber-400 text-xl">stars</span>
                   <span className="text-2xl font-black text-white tabular-nums">{completedCount * 50}</span>
                </div>
             </div>

             <div className="relative h-4 bg-black/40 rounded-full mx-2 mb-10 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / 3) * 100}%` }}
                  className="absolute top-0 left-0 h-full bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                />
                
                {/* Milestones */}
                {[
                  { pos: "13%", pts: 20, type: "wooden" },
                  { pos: "40%", pts: 60, type: "wooden" },
                  { pos: "66%", pts: 100, type: "golden" },
                  { pos: "100%", pts: 150, type: "purple" }
                ].map((m, i) => {
                  const pts = completedCount * 50;
                  const isReached = pts >= m.pts;
                  const chestId = `milestone_${m.pts}`;
                  const isClaimed = inventory.badges?.includes(chestId);
                  
                  return (
                    <div key={i} className="absolute top-0 bottom-0 flex items-center" style={{ left: m.pos }}>
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                           <NativeChest 
                             type={m.type} 
                             isReady={isReached} 
                             isClaimed={isClaimed} 
                             size="w-12 h-12"
                             onClick={() => isReached && !isClaimed && handleClaimMilestone(chestId)}
                           />
                        </div>
                       <div className={`w-3 h-3 rounded-full border-2 border-slate-950 z-10 transition-colors ${isReached ? 'bg-amber-400' : 'bg-slate-700'}`} />
                       <span className={`absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-black ${isReached ? 'text-amber-400' : 'text-slate-600'}`}>
                          {m.pts}
                       </span>
                    </div>
                  );
                })}
             </div>
          </div>

          {/* Bento Grid Content */}
          <div className="flex-1 p-6 grid grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
             {/* Missions (Tiles) */}
             {dailyMissions.map((m, idx) => (
                <MissionCard 
                  key={m.id} 
                  mission={m} 
                  gridClass={idx === 0 ? "col-span-2 aspect-[2/1]" : "col-span-1 aspect-square"} 
                />
             ))}

             {/* Utility Tiles */}
             <div className="bg-slate-900/40 rounded-[32px] p-5 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
                <span className="material-symbols-outlined text-rose-500 text-3xl mb-2 group-hover:scale-110 transition-transform">schedule</span>
                <span className="text-white font-black text-xl tabular-nums">{timeLeft}</span>
                <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-1">Reset</span>
             </div>

             <div className="bg-slate-900/40 rounded-[32px] p-5 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group">
                <motion.div
                  animate={bagPulse > 0 ? { scale: [1, 1.25, 1] } : {}}
                  className="relative"
                >
                   <span className="material-symbols-outlined text-blue-400 text-3xl group-hover:rotate-12 transition-transform">inventory_2</span>
                   {bagPulse > 0 && <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full" />}
                </motion.div>
                <span className="text-white font-black text-xl mt-1 uppercase tracking-tighter">Vault</span>
                <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-1">Ready</span>
             </div>
          </div>

          {/* Footer Action */}
          <div className="px-8 py-6 bg-white/5 flex items-center justify-center">
             <button 
               onClick={onClose}
               className="text-white/40 font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-colors"
             >
                Close Portal
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DailyMissionsModal;
