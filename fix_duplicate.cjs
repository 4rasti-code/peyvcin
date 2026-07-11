const fs = require('fs');

let c = fs.readFileSync('src/components/ProfileView.jsx', 'utf8');

// The script added `import { supabase } from '../supabaseClient';` when it was already there under a different formatting or already included in the file. Let's fix the duplicate import.
c = c.replace(`import { supabase } from '../supabaseClient';\nimport { getCroppedImg } from '../utils/imageUtils';`, `import { getCroppedImg } from '../utils/imageUtils';`);

fs.writeFileSync('src/components/ProfileView.jsx', c);
console.log('Fixed duplicate import');
