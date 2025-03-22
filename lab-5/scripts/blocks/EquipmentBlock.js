import { Block } from './Block.js';

export class EquipmentBlock extends Block {
    constructor(equipment) {
        super();
        this.equipment = equipment;
    }

    generateHTML() {
        return `
            <section class="equipment-section">
                <h2 class="section-title">Снаряжение</h2>
                <div class="equipment-grid">
                    ${this.equipment.map(item => `
                        <div class="equipment-card">
                            <div class="item-icon">⚔</div>
                            <div class="item-info">
                                <h3 class="item-name">${item.name}</h3>
                                <p class="item-description">${item.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    getEditForm() {
        return `
            <h3>Редактирование снаряжения</h3>
            <div class="equipment-editor">
                ${this.equipment.map((item, index) => `
                    <div class="equipment-row">
                        <input type="text" 
                               name="name_${index}" 
                               value="${item.name}" 
                               placeholder="Название" 
                               required>
                        
                        <textarea name="desc_${index}" 
                                  placeholder="Описание"
                                  rows="2">${item.description || ''}</textarea>
                        
                        <input type="text" 
                               name="icon_${index}" 
                               value="${item.icon || '⚔'}" 
                               placeholder="Иконка"
                               class="icon-input">
                        
                        <button type="button" class="remove-btn">×</button>
                    </div>
                `).join('')}
                <button type="button" class="add-btn">+ Добавить предмет</button>
            </div>
        `;
    }

    getDataForSave() {
        return [this.equipment];
    }
}