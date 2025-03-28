import { Block } from './Block.js';

export class ImageBlock extends Block {
    constructor(imageUrl = '', altText = 'Изображение персонажа') {
        super();
        this.imageUrl = imageUrl; 
        this.altText = altText;
    }

    generateHTML() {
        return `
            <figure class="image-wrapper">
                <img src="${this.imageUrl}" 
                     alt="${this.altText}" 
                     class="responsive-image"
                     onerror="this.src='img/дворф.png'">
                <figcaption>${this.altText}</figcaption>
            </figure>
        `;
    }

    getEditForm() {
        return `
            <div class="form-group">
                <label>Загрузить новое изображение:</label>
                <input type="file" 
                       name="imageFile" 
                       accept="image/*"
                       class="image-upload">
            </div>
            <div class="form-group">
                <label>Описание изображения:</label>
                <input type="text" 
                       name="altText" 
                       value="${this.altText}" 
                       maxlength="100"
                       required>
            </div>
            ${this.imageUrl ? `<img src="${this.imageUrl}" class="image-preview">` : ''}
        `;
    }
    

    getDataForSave() {
        return [this.imageUrl, this.altText];
    }
}