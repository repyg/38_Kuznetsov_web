import { Block } from './Block.js';

export class DividerBlock extends Block {
    generateHTML() {
        return `<div class="divider-block"><hr class="section-divider"></div>`;
    }
    getEditForm() {
        return `<p>Разделитель не требует редактирования</p>`;
    }

    getDataForSave() {
        return [];
    }
}