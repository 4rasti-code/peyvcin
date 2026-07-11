const fs = require('fs');

let c = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `        {currentView !== 'game' &&
          currentView !== 'auth' &&
          currentView !== 'stats' &&
          currentView !== 'achievements' &&
          currentView !== 'dictionary' &&
          (multiplayerState === 'idle' || multiplayerState === 'game_over') &&
          !isKeyboardOpen && (
            <BottomNav
              currentView={currentView}
              setCurrentView={navigateTo}
              onSettingsToggle={() => { setIsSettingsOpen(true); }}
              onTabClickSound={playBubblePopSound}
              chatBadgeCount={(socialNotifications.unreadMessages || 0) + (socialNotifications.unreadGlobal || 0)}
              pendingFriendsCount={socialNotifications.pendingRequests || 0}
              hasSilentGlobal={hasUnreadGlobalMessage}
            />
          )}`;

const replacementStr = `        {currentView !== 'game' &&
          currentView !== 'auth' &&
          currentView !== 'stats' &&
          currentView !== 'achievements' &&
          currentView !== 'dictionary' &&
          (multiplayerState === 'idle' || multiplayerState === 'game_over') &&
          !isKeyboardOpen && (() => {
            const displayData = { ...(profileData || {}), ...(profileData?.statistics || {}), level };
            const hasUnclaimedRewards = MEDALS.some(m => m.condition(displayData) && !(profileData?.claimed_medals || []).includes(m.id));
            
            return (
              <BottomNav
                currentView={currentView}
                setCurrentView={navigateTo}
                onSettingsToggle={() => { setIsSettingsOpen(true); }}
                onTabClickSound={playBubblePopSound}
                chatBadgeCount={(socialNotifications.unreadMessages || 0) + (socialNotifications.unreadGlobal || 0)}
                pendingFriendsCount={socialNotifications.pendingRequests || 0}
                hasSilentGlobal={hasUnreadGlobalMessage}
                hasUnclaimedRewards={hasUnclaimedRewards}
              />
            );
          })()}`;

c = c.replace(targetStr, replacementStr);

fs.writeFileSync('src/App.jsx', c);
console.log('App.jsx updated with hasUnclaimedRewards');
