const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

app = app.replace('const [initialSocialTab, setInitialSocialTab] = useState(null);', 'const [initialSocialTab, setInitialSocialTab] = useState(null);\n  const [openFriendsFromNotif, setOpenFriendsFromNotif] = useState(false);');

app = app.replace(/\} else if \(item\.type === 'friend'\) \{\s*setInitialSocialTab\('friends'\);\s*navigateTo\('social_hub'\);\s*\}/, '} else if (item.type === \'friend\') {\n        setOpenFriendsFromNotif(true);\n        navigateTo(\'profile\');\n      }');

app = app.replace('<ProfileView', '<ProfileView\n                      initialFriendsModalOpen={openFriendsFromNotif}\n                      onFriendsModalConsumed={() => setOpenFriendsFromNotif(false)}');

app = app.replace(/onClick=\{\(\) => \{\s*setPushNotification\(null\);\s*triggerHaptic\(10\);\s*setCurrentView\('social_hub'\);\s*\}\}/, 'onClick={() => {\n                  setPushNotification(null);\n                  triggerHaptic(10);\n                  if (pushNotification.type === \'friend_request\') {\n                    setOpenFriendsFromNotif(true);\n                    navigateTo(\'profile\');\n                  } else {\n                    setCurrentView(\'social_hub\');\n                  }\n                }}');

app = app.replace('notificationCount={(socialNotifications.unreadMessages || 0) + (socialNotifications.unreadGlobal || 0)}', 'chatBadgeCount={(socialNotifications.unreadMessages || 0) + (socialNotifications.unreadGlobal || 0)}');

app = app.replace('hasGlobalNewMessage={hasUnreadGlobalMessage}', 'hasSilentGlobal={hasUnreadGlobalMessage}');

app = app.replace('<img src={pushNotification.avatar || https://api.dicebear.com/7.x/bottts/svg?seed=} alt=\"avatar\" className=\"w-full h-full object-cover\" />', '<Avatar src={pushNotification.avatar || \'default\'} size=\"full\" border={false} className=\"object-cover w-full h-full\" />');

app = app.replace('<div className=\"w-12 h-12 rounded-full overflow-hidden bg-mono-800 dark:bg-mono-200 shrink-0\">', '<div className=\"w-12 h-12 rounded-full overflow-hidden bg-mono-800 dark:bg-mono-200 shrink-0 flex items-center justify-center\">');

fs.writeFileSync('src/App.jsx', app, 'utf8');
