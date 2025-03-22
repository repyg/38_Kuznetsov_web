import { AppState } from './AppState.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new AppState();
    
    const modeToggle = document.createElement('button');
    modeToggle.className = 'mode-toggle';
    modeToggle.textContent = '🛠';
    modeToggle.onclick = () => app.toggleEditMode();
    
    document.body.prepend(modeToggle);
    app.renderInterface();
});

