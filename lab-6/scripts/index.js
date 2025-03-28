import { AppState } from './AppState.js';
import { ApiBlock } from './blocks/ApiBlock.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new AppState();
    
    const apiNav = document.createElement('nav');
    apiNav.className = 'api-nav';
    apiNav.innerHTML = `
        <ul>
            <li><button onclick="handleDndApi()">D&D Классы</button></li>
            <li><button onclick="handleCatApi()">Факты о котах</button></li>
            <li><button onclick="handleMockApi()">Тест API</button></li>
        </ul>
    `;
    
    document.body.prepend(apiNav);
    
    window.handleDndApi = async () => {
        const block = new ApiBlock();
        block.apiType = 'dnd';
        await block.fetchData('https://www.dnd5eapi.co/api/classes');
        app.blocks.push(block);
        app.safeRender();
    };
    
    window.handleCatApi = async () => {
        const block = new ApiBlock();
        block.apiType = 'cats';
        await block.fetchData('https://catfact.ninja/fact');
        app.blocks.push(block);
        app.safeRender();
    };
    
    window.handleMockApi = async () => {
        const block = new ApiBlock();
        block.apiType = 'jsonplaceholder';
        await block.fetchData('https://jsonplaceholder.typicode.com/posts', 'POST', {
            title: 'foo',
            body: 'bar',
            userId: 1
        });
        app.blocks.push(block);
        app.safeRender();
    };
    
    const modeToggle = document.createElement('button');
    modeToggle.className = 'mode-toggle';
    modeToggle.textContent = '🛠';
    modeToggle.onclick = () => app.toggleEditMode();
    
    document.body.prepend(modeToggle);
    app.renderInterface();

    window.handleMockApi = async () => {
        const block = new ApiBlock();
        block.apiType = 'jsonplaceholder';
        
        await block.fetchData(
            'https://jsonplaceholder.typicode.com/posts', 
            'POST', 
            { title: 'foo', body: 'bar', userId: 1 }
        );
        
        await block.fetchData(
            'https://jsonplaceholder.typicode.com/posts/1', 
            'PUT', 
            { id: 1, title: 'updated', body: 'updated content', userId: 1 }
        );
        
        await block.fetchData(
            'https://jsonplaceholder.typicode.com/posts/1', 
            'PATCH', 
            { title: 'patched title' }
        );
        
        await block.fetchData(
            'https://jsonplaceholder.typicode.com/posts/1', 
            'DELETE'
        );
        
        app.blocks.push(block);
        app.safeRender();
    };

    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('test-api-btn')) {
            const form = e.target.closest('form');
            const blockId = form.closest('.edit-dialog').previousElementSibling.dataset.blockId;
            const block = app.blocks.find(b => b.id === blockId);
            
            if (block instanceof ApiBlock) {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                let url = 'https://jsonplaceholder.typicode.com/posts';
                if (data.resourceId && data.apiMethod !== 'POST') {
                    url += `/${data.resourceId}`;
                }
                
                const body = data.apiBody ? JSON.parse(data.apiBody) : null;
                
                await block.fetchData(url, data.apiMethod, body);
                app.finalizeFormProcessing(block);
                
                // Показываем историю запросов
                const historyDiv = form.querySelector('.api-history');
                const historyList = form.querySelector('.history-list');
                historyList.innerHTML = block.requests.map(req => `
                    <li>
                        [${req.timestamp}] ${req.method} ${req.url} - ${req.status}
                    </li>
                `).join('');
                historyDiv.style.display = 'block';
            }
        }
    });
});