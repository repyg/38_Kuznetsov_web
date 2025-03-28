import { Block } from './Block.js';

export class AttributesBlock extends Block {
    constructor(attributes) {
        super();
        this.attributes = attributes;
    }

    generateHTML() {
        return `
            <section class="attributes-section">
                <h2 class="section-title">Характеристики</h2>
                <div class="stats-grid">
                    ${(this.attributes || []).map(attr => `
                        <div class="stat-card">
                            <div class="stat-name">${attr.name || ''}</div>
                            <div class="stat-value">${attr.value || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    getEditForm() {
        return `
            <h3>Редактирование характеристик</h3>
            <div class="attributes-editor">
                ${(this.attributes || []).map((attr, index) => `
                    <div class="attribute-row">
                        <input type="text" 
                               name="name_${index}" 
                               value="${attr.name}" 
                               placeholder="Название"
                               required>
                        <input type="text" 
                               name="value_${index}" 
                               value="${attr.value}" 
                               placeholder="Значение"
                               required>
                        <button type="button" class="remove-btn">×</button>
                    </div>
                `).join('')}
                <button type="button" class="add-btn">+ Добавить характеристику</button>
            </div>
        `;
    }

    getDataForSave() {
        return this.attributes;
    }
}