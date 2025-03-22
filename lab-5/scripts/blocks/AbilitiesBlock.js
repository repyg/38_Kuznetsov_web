import { Block } from './Block.js';

export class AbilitiesBlock extends Block {
    constructor(abilities = []) {
        super();
        this.abilities = abilities;
    }

    generateHTML() {
        return `
            <section class="abilities-section">
                <h2 class="section-title">Способности</h2>
                <div class="abilities-grid">
                    ${this.abilities.map(ability => `
                        <div class="ability-card">
                            <div class="ability-header">
                                <h3 class="ability-name">${ability.name || 'Без названия'}</h3>
                                <span class="ability-type">${ability.type || 'Пассивная'}</span>
                            </div>
                            ${ability.description ? `
                            <div class="ability-description">
                                ${ability.description}
                            </div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    getEditForm() {
        return `
            <h3>Управление способностями</h3>
            <div class="abilities-editor">
                ${this.abilities.map((ability, index) => `
                    <div class="ability-row">
                        <input type="text" 
                               name="name_${index}" 
                               value="${ability.name}" 
                               placeholder="Название способности"
                               required>
                        
                        <select name="type_${index}" class="ability-type-select">
                            <option value="active" ${ability.type === 'active' ? 'selected' : ''}>Активная</option>
                            <option value="passive" ${!ability.type || ability.type === 'passive' ? 'selected' : ''}>Пассивная</option>
                        </select>
                        
                        <textarea name="desc_${index}" 
                                  placeholder="Описание способности..."
                                  rows="3">${ability.description || ''}</textarea>
                        
                        <button type="button" class="remove-btn">×</button>
                    </div>
                `).join('')}
                <button type="button" class="add-btn">+ Добавить способность</button>
            </div>
        `;
    }

    getDataForSave() {
        return [this.abilities];
    }
}