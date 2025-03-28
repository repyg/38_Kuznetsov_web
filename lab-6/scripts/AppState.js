import { HeaderBlock } from './blocks/HeaderBlock.js';
import { ImageBlock } from './blocks/ImageBlock.js';
import { AttributesBlock } from './blocks/AttributesBlock.js';
import { AbilitiesBlock } from './blocks/AbilitiesBlock.js';
import { BioBlock } from './blocks/BioBlock.js';
import { EquipmentBlock } from './blocks/EquipmentBlock.js';
import { DividerBlock } from './blocks/DividerBlock.js';
import { ApiBlock } from './blocks/ApiBlock.js';

export class AppState {
    static instance = null;
    
    constructor() {
        if (AppState.instance) return AppState.instance;
        AppState.instance = this;
        
        this.isEditMode = false;
        this.blocks = [];
        this.blockHandlers = new Map([
            ['HeaderBlock', (block, data) => this.handleHeaderBlock(block, data)],
            ['AttributesBlock', (block, data) => {
                block.attributes = Object.keys(data)
                    .filter(k => k.startsWith('name_'))
                    .map((k, i) => ({
                        name: data[`name_${i}`],
                        value: data[`value_${i}`]
                    }));
            }],
            ['BioBlock', (block, data) => this.handleBioBlock(block, data)],
            ['ImageBlock', (block, data) => {
                if (data.imageFile) {
                    const file = data.imageFile;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        block.imageUrl = e.target.result;
                        block.altText = data.altText;
                    };
                    reader.readAsDataURL(file);
                } else {
                    block.altText = data.altText;
                }
            }],
            ['AbilitiesBlock', (block, data) => this.handleAbilitiesBlock(block, data)],
            ['EquipmentBlock', (block, data) => this.handleEquipmentBlock(block, data)],
            ['ApiBlock', (block, data) => this.handleApiBlock(block, data)]
        ]);
        
        this.init();
    }

    init() {
        this.loadSession();
        this.setupEventDelegation();
    }

    saveSession() {
        try {
            const serialized = this.blocks.map(block => ({
                className: block.constructor.name,
                args: block.getDataForSave()
            }));
            localStorage.setItem('characterData', JSON.stringify(serialized));
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    }
    
    loadSession() {
        try {
            const data = localStorage.getItem('characterData');
            if (!data) return this.loadDefaultConfig();
    
            this.blocks = JSON.parse(data).map(({ className, args }) => {
                const BlockClass = this.getClass(className);
                if (!BlockClass) return null;
    
                // Специальная обработка для блоков с массивами
                if (className === 'AttributesBlock' || className === 'AbilitiesBlock' || className === 'EquipmentBlock') {
                    return new BlockClass(args);
                }
    
                return new BlockClass(...args);
            }).filter(Boolean);
    
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            this.loadDefaultConfig();
        }
    }

    loadDefaultConfig() {
        this.blocks = [
            new HeaderBlock("Люрин Железное Колесо", "Паладин Пылающей Кузни (5 уровень)"),
            new ImageBlock("img/дворф.png", "Люрин в полном боевом облачении"),
            new DividerBlock(),
            new AttributesBlock(this.defaultAttributes()),
            new DividerBlock(),
            new AbilitiesBlock(this.defaultAbilities()),
            new DividerBlock(),
            new BioBlock(this.defaultBio()),
            new DividerBlock(),
            new EquipmentBlock(this.defaultEquipment())
        ];
    }

    defaultAttributes() {
        return [
            {name: "Сила", value: "20 (+5)"}, 
            {name: "Ловкость", value: "14 (+2)"},
            {name: "Выносливость", value: "18 (+4)"},
            {name: "Интеллект", value: "12 (+1)"},
            {name: "Мудрость", value: "16 (+3)"},
            {name: "Харизма", value: "18 (+4)"}
        ];
    }

    defaultAbilities() {
        return [
            {name: "Удар Вулкана", description: "Наносит 3у8 огненного урона", type: "active"},
            {name: "Щит Стали", description: "+5 к КД", type: "passive"}
        ];
    }

    defaultBio() {
        return "Когда-то величайший кузнец Королевства Пепла...";
    }

    defaultEquipment() {
        return [
            {name: "Молот Вулкана", description: "4d6 урона", icon: "⚔"},
            {name: "Стальная Броня", description: "КД 20", icon: "🛡"}
        ];
    }

    renderInterface() {
        this.cleanupDOM();
        const appFrame = this.createAppFrame();
        const [contentCol, imageCol] = this.createColumns();
        appFrame.append(contentCol, imageCol);
        
        this.distributeBlocks(contentCol, imageCol);
        
        if (this.isEditMode) {
            appFrame.append(this.buildBlockCreator());
        }

        document.body.prepend(appFrame);
        this.animateUI();
    }

    createAppFrame() {
        const frame = document.createElement('main');
        frame.className = 'character-sheet';
        return frame;
    }

    distributeBlocks(contentCol, imageCol) {
        contentCol.innerHTML = '';
        imageCol.innerHTML = '';
        
        this.blocks.forEach(block => {
            const element = this.wrapBlock(block);
            block instanceof ImageBlock 
                ? imageCol.appendChild(element)
                : contentCol.appendChild(element);
            this.attachEventListeners(element); 
        });
    }

    wrapBlock(block) {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-wrapper';
        wrapper.dataset.blockId = block.id;
        
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'block-content';
        contentWrapper.innerHTML = block.generateHTML();
        
        wrapper.append(contentWrapper);
        wrapper.insertAdjacentHTML('beforeend', block.getControls());
        
        return wrapper;
    }

    setupEventDelegation() {
        document.body.addEventListener('click', e => {
            if (e.target.closest('.delete-btn')) this.deleteBlock(e);
            if (e.target.closest('.edit-btn')) this.editBlock(e);
            if (e.target.closest('.add-block-btn')) this.addBlock(e);
            if (e.target.closest('.add-btn')) this.handleAddField(e);
            if (e.target.closest('.remove-btn')) this.handleRemoveField(e);
        });
    }

    addBlock(type) {
        const newBlock = this.createBlockByType(type);
        if (newBlock) {
            this.blocks.push(newBlock);
            this.safeRender(); 
            this.saveSession();
        }
    }

    createBlockByType(type) {
        switch(type) {
            case 'HeaderBlock': 
                return new HeaderBlock('Новый заголовок', 'Подзаголовок');
            
            case 'AttributesBlock': 
                return new AttributesBlock([{name: "Название", value: "Значение"}]);
            
            case 'BioBlock':
                return new BioBlock('Введите текст биографии...')
            
                case 'ImageBlock':
                    return new ImageBlock(
                        'img/дворф.png', 
                        'Новое изображение'    
                    );
            
            case 'AbilitiesBlock':
                return new AbilitiesBlock([{
                    name: "Новая способность",
                    description: "Описание способности",
                    type: "active"
                }]);
            
            case 'EquipmentBlock':
                return new EquipmentBlock([{
                    name: "Новый предмет",
                    description: "Описание предмета",
                    icon: "⚔"
                }]);
            
            case 'DividerBlock':
                return new DividerBlock();

            case 'ApiBlock':
                return new ApiBlock();    
            
            default:
                console.warn('Неизвестный тип блока:', type);
                return null;
        }
    }

    safeRender() {
        try {
            const scrollPos = window.scrollY;
            this.renderInterface();
            window.scrollTo(0, scrollPos);
        } catch (error) {
            console.error('Критическая ошибка рендеринга:', error);
            this.blocks = this.blocks.filter(b => !(b instanceof ImageBlock));
            this.renderInterface();
        }
    }

    getColumns() {
        return [
            document.querySelector('.content-column'),
            document.querySelector('.image-column')
        ];
    }

    attachEventListeners(wrapper) {
        const deleteBtn = wrapper.querySelector('.delete-btn');
        const editBtn = wrapper.querySelector('.edit-btn');
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteBlock(wrapper.dataset.blockId);
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editBlock({ target: editBtn });
            });
        }
    }

    deleteBlock(blockId) {
        this.blocks = this.blocks.filter(b => b.id !== blockId);
        document.querySelector(`[data-block-id="${blockId}"]`)?.remove();
        this.saveSession();
    }

    editBlock(e) {
        const blockId = e.target.closest('.block-wrapper').dataset.blockId;
        const block = this.blocks.find(b => b.id === blockId);
        this.showEditDialog(block);
    }

    showEditDialog(block) {
        const modal = document.createElement('div');
        modal.className = 'edit-dialog';
        modal.innerHTML = `
            <form class="editor" enctype="multipart/form-data">
                ${block.getEditForm()}
                <div class="controls">
                    <button type="submit">Сохранить</button>
                    <button type="button" class="cancel">Отмена</button>
                </div>
            </form>
        `;
    
        const form = modal.querySelector('form');
        form.onsubmit = e => {
            e.preventDefault();
            this.processForm(block, new FormData(e.target));
            modal.remove();
        };
    
        modal.querySelector('.cancel').onclick = () => modal.remove();
        document.body.append(modal);
    }

    processForm(block, formData) {
        const handler = this.blockHandlers.get(block.constructor.name);
        if (!handler) return;
    
        const data = Object.fromEntries(formData.entries());
    
        // Для ImageBlock обрабатываем файл отдельно
        if (block instanceof ImageBlock) {
            const fileInput = document.querySelector('.image-upload');
            if (fileInput?.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    block.imageUrl = e.target.result;
                    block.altText = data.altText;
                    this.finalizeFormProcessing(block);
                };
                reader.readAsDataURL(fileInput.files[0]);
                return;
            }
        }
    
        // Обработка данных для остальных блоков
        handler(block, data);
        this.finalizeFormProcessing(block);
    }
    
    finalizeFormProcessing(block) {
        const wrapper = document.querySelector(`[data-block-id="${block.id}"]`);
        if (wrapper) {
            wrapper.querySelector('.block-content').innerHTML = block.generateHTML();
            wrapper.insertAdjacentHTML('beforeend', block.getControls());
            this.attachEventListeners(wrapper);
        }
        this.saveSession();
    }

    cleanupDOM() {
        document.querySelectorAll('.character-sheet').forEach(el => el.remove());
    }

    animateUI() {
        document.body.style.opacity = 0;
        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 300ms';
            document.body.style.opacity = 1;
        });
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        this.renderInterface();
    }

    buildBlockCreator() {
        const panel = document.createElement('div');
        panel.className = 'block-creator';
        
        const select = document.createElement('select');
        select.innerHTML = Object.entries({
          HeaderBlock: 'Заголовок',
          AttributesBlock: 'Характеристики',
          BioBlock: 'Биография',
          ImageBlock: 'Изображение',
          AbilitiesBlock: 'Способности',
          EquipmentBlock: 'Снаряжение',
          DividerBlock: 'Разделитель',
          ApiBlock: 'API Данные'
        }).map(([val, text]) => `<option value="${val}">${text}</option>`).join('');
      
        const addBtn = document.createElement('button');
        addBtn.className = 'add-block-btn';
        addBtn.innerHTML = `
          <span>Добавить блок</span>
        `;
      
        addBtn.onclick = (e) => {
          e.stopPropagation();
          this.addBlock(select.value);
        };
      
        panel.append(select, addBtn);
        return panel;
      }

    getClass(className) {
        return {
            HeaderBlock,
            AttributesBlock,
            BioBlock,
            ImageBlock,
            AbilitiesBlock,
            EquipmentBlock,
            DividerBlock,
            ApiBlock
        }[className];
    }

    setupEventDelegation() {
        document.body.addEventListener('click', e => {
            if (e.target.closest('.delete-btn')) this.deleteBlock(e);
            if (e.target.closest('.edit-btn')) this.editBlock(e);
            if (e.target.closest('.add-block-btn')) this.addBlock(e);
            if (e.target.closest('.add-btn')) this.handleAddField(e);
            if (e.target.closest('.remove-btn')) this.handleRemoveField(e);
        });
    }
    
    handleApiBlock(block, data) {
        block.apiType = data.apiType;
        block.apiConfig = {
            method: data.apiMethod || 'GET',
            body: data.apiBody ? JSON.parse(data.apiBody) : null,
            resourceId: data.resourceId || ''
        };
        
        if (block.apiType === 'jsonplaceholder') {
            let url = 'https://jsonplaceholder.typicode.com/posts';
            if (block.apiConfig.resourceId && block.apiConfig.method !== 'POST') {
                url += `/${block.apiConfig.resourceId}`;
            }
            
            block.fetchData(
                url,
                block.apiConfig.method,
                block.apiConfig.body
            );
        }
    }
    handleAddField(e) {
        const wrapper = e.target.closest('.block-wrapper');
        if (!wrapper) return;
    
        const block = this.blocks.find(b => b.id === wrapper.dataset.blockId);
        if (!block) return;
    
        if (block instanceof AttributesBlock) {
            block.attributes.push({ name: "", value: "" });
        } else if (block instanceof AbilitiesBlock) {
            block.abilities.push({ name: "", type: "passive", description: "" });
        } else if (block instanceof EquipmentBlock) {
            block.equipment.push({ name: "", description: "", icon: "⚔" });
        }
    
        this.safeRender();
        this.saveSession();
    }
    
    handleRemoveField(e) {
        const row = e.target.closest('[class$="-row"]');
        if (!row) return;
    
        const index = Array.from(row.parentNode.children).indexOf(row);
        const wrapper = e.target.closest('.block-wrapper');
        if (!wrapper) return;
    
        const block = this.blocks.find(b => b.id === wrapper.dataset.blockId);
        if (!block) return;
    
        if (block instanceof AttributesBlock) {
            block.attributes.splice(index, 1);
        } else if (block instanceof AbilitiesBlock) {
            block.abilities.splice(index, 1);
        } else if (block instanceof EquipmentBlock) {
            block.equipment.splice(index, 1);
        }
    
        this.safeRender();
        this.saveSession();
    }

    updateInterface() {
        this.saveSession();
        this.renderInterface();
    }

    createColumns() {
        const contentCol = document.createElement('div');
        contentCol.className = 'content-column';
        
        const imageCol = document.createElement('div');
        imageCol.className = 'image-column';
        
        return [contentCol, imageCol]; 
    }
}