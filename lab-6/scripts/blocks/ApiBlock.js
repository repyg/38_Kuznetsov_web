import { Block } from './Block.js';


export class ApiBlock extends Block {
    constructor() {
        super();
        this.apiData = null;
        this.error = null;
        this.apiType = '';
        this.apiConfig = {};
        this.requests = []; 
    }

    generateHTML() {
        if (this.error) return `
            <section class="api-section">
                <div class="error">Ошибка: ${this.error}</div>
            </section>
        `;
        
        if (!this.apiData) return `
            <section class="api-section">
                <div class="loading">Загрузка данных</div>
            </section>
        `;
        
        let items = [];
        if (Array.isArray(this.apiData)) {
            items = this.apiData;
        } else if (this.apiData.results) {
            items = this.apiData.results;
        } else if (this.apiData.fact) {
            return `
                <section class="api-section">
                    <h2>Факт о котах</h2>
                    <div class="api-data">
                        <div class="api-card">
                            <h3>🐱 Интересный факт</h3>
                            <p>${this.apiData.fact}</p>
                            <div class="api-meta">Источник: Cat Facts API</div>
                        </div>
                    </div>
                </section>
            `;
        } else {
            items = [this.apiData];
        }
        
        return `
            <section class="api-section">
                <h2>${this.apiType === 'dnd' ? 'D&D Классы' : 
                     this.apiType === 'cats' ? 'Факты о котах' : 
                     'Данные API'}</h2>
                <div class="api-data">
                    ${items.map((item, index) => `
                        <div class="api-card" style="--order: ${index}">
                            <h3>${item.name || item.title || 'Элемент ' + (index + 1)}</h3>
                            ${item.description ? `<p>${item.description}</p>` : ''}
                            ${item.hit_die ? `<p><strong>Хиты:</strong> ${item.hit_die}</p>` : ''}
                            ${item.body ? `<p>${item.body}</p>` : ''}
                            <div class="api-meta">
                                ${this.apiType === 'dnd' ? 'D&D 5e API' : 
                                  this.apiType === 'cats' ? 'Cat Facts API' : 
                                  'JSONPlaceholder'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    async fetchData(url, method = 'GET', body = null) {
        try {
            this.error = null;
            const options = { method };
            
            if (body && method !== 'GET' && method !== 'DELETE') {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(url, options);
            
            if (!response.ok && method !== 'DELETE') {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const requestInfo = {
                method,
                url,
                body,
                status: response.status,
                timestamp: new Date().toLocaleTimeString()
            };
            
            this.requests.push(requestInfo);
            
            try {
                this.apiData = method === 'DELETE' 
                    ? { message: 'Resource deleted successfully' } 
                    : await response.json();
            } catch {
                this.apiData = { message: `Request successful (${method})` };
            }
        } catch (err) {
            this.error = err.message;
            this.apiData = null;
        }
    }

    getEditForm() {
        return `
            <div class="form-group">
                <label>Тип API:</label>
                <select name="apiType">
                    <option value="dnd" ${this.apiType === 'dnd' ? 'selected' : ''}>D&D Classes</option>
                    <option value="cats" ${this.apiType === 'cats' ? 'selected' : ''}>Cat Facts</option>
                    <option value="jsonplaceholder" ${this.apiType === 'jsonplaceholder' ? 'selected' : ''}>JSONPlaceholder</option>
                </select>
            </div>
            <div class="form-group">
                <label>Метод запроса:</label>
                <select name="apiMethod" class="api-method-select">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                </select>
            </div>
            <div class="form-group api-body-group">
                <label>Тело запроса (JSON):</label>
                <textarea name="apiBody" rows="4" placeholder='{"key": "value"}'></textarea>
            </div>
            <div class="form-group">
                <label>ID ресурса (для PUT/PATCH/DELETE):</label>
                <input type="text" name="resourceId" placeholder="1">
            </div>
            <button type="button" class="test-api-btn">Выполнить запрос</button>
            <div class="api-history" style="margin-top: 20px; display: none;">
                <h4>История запросов:</h4>
                <ul class="history-list"></ul>
            </div>
        `;
    }

    getDataForSave() {
        return [{
            apiType: this.apiType,
            apiConfig: this.apiConfig,
            apiData: this.apiData
        }];
    }
}