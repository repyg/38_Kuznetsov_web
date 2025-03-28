import { Block } from './Block.js';

export class BioBlock extends Block {
    constructor(content = '') { 
        super();
        this.content = content;
    }

    generateHTML() {
        return `
            <section class="bio-section">
                <h2 class="section-title">Биография</h2>
                <div class="bio-content">
                    ${(this.content || '').split('\n').map(p => `<p>${p.trim()}</p>`).join('')}
                </div>
            </section>
        `;
    }

    getEditForm() {
        return `<label>Контент: <textarea name="content">${this.content}</textarea></label>`;
    }

    getDataForSave() {
        return [this.content];
    }
}