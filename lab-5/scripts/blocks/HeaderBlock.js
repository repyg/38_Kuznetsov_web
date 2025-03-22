import { Block } from './Block.js';

export class HeaderBlock extends Block {
    constructor(title, subtitle) {
        super();
        this.title = title;
        this.subtitle = subtitle;
    }

    generateHTML() {
        return `
            <header class="character-header">
                <h1 class="title-lg">${this.title}</h1>
                <h2 class="subtitle">${this.subtitle}</h2>
            </header>
        `;
    }

    getEditForm() {
        return `
            <div class="form-group">
                <label>Заголовок:</label>
                <input type="text" name="title" value="${this.title}" required>
            </div>
            <div class="form-group">
                <label>Подзаголовок:</label>
                <input type="text" name="subtitle" value="${this.subtitle}">
            </div>
        `;
    }

    getDataForSave() {
        return [this.title, this.subtitle];
    }
}