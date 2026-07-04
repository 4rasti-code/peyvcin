const fs = require('fs');
let file = 'src/components/AuthView.jsx';
let content = fs.readFileSync(file, 'utf8');

let formEnd = content.indexOf('</form>');
let afterForm = content.substring(formEnd, formEnd + 2000);
console.log(afterForm);
