import { AppState } from '../AppState.js';

export class Block {
    constructor() {
        if (new.target === Block) {
            throw new Error("Абстрактный класс Block не может быть инстанциирован");
        }
        this.id = Math.random().toString(36).substr(2, 9);
    }

    generateHTML() {
        throw new Error("Метод 'generateHTML()' должен быть реализован");
    }

    getEditForm() {
        throw new Error("Метод 'getEditForm()' должен быть реализован");
    }

    getControls() {
        return AppState.instance.isEditMode ? `
            <div class="block-controls">
                <button class="control-btn edit-btn" title="Редактировать">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="control-btn delete-btn" title="Удалить">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </div>
        ` : '';
    }

    getDataForSave() {
        throw new Error("Метод 'getDataForSave()' должен быть реализован");
    }
}