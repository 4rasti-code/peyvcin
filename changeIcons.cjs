const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace person_add and login with mail
if (content.includes('person_add') || content.includes('login')) {
    // Specifically target the icons inside the auth buttons
    content = content.replace(
        /<span className="material-symbols-outlined text-\[18px\]">person_add<\/span>/g,
        '<span className="material-symbols-outlined text-[18px]">mail</span>'
    );
    content = content.replace(
        /<span className="material-symbols-outlined text-\[18px\]">login<\/span>/g,
        '<span className="material-symbols-outlined text-[18px]">mail</span>'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Icons changed to mail successfully!");
} else {
    console.log("Icons not found.");
}
