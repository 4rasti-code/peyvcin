const fs = require('fs');
let file = 'src/components/SettingsModal.jsx';
let content = fs.readFileSync(file, 'utf8');

// The file should just start like this:
const header = `import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';
import AccountSettings from './AccountSettings';
import HelpCenterModal from './HelpCenterModal';
import BlockedUsersModal from './BlockedUsersModal';
import { useUser } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

function SettingsModal({
   isOpen,
   onClose,
   appSfxVolume,
   onAppSfxVolumeChange,
   bgMusicVolume,
   onBgMusicVolumeChange,
   hapticEnabled,
   onHapticToggle,
   updateProfile,
   onLogout
}) {`;

// Find where `const [isHelpCenterOpen` begins, which is the start of the component body
let index = content.indexOf('const [isHelpCenterOpen');
if (index !== -1) {
    let body = content.substring(index);
    fs.writeFileSync(file, header + '\n\n   ' + body, 'utf8');
    console.log('Fixed imports and signature');
} else {
    console.log('Could not find body');
}
