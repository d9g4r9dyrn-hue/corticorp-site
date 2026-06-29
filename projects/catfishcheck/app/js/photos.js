const Photos = {
    photos: [],

    init() {
        const dropzone = document.getElementById('photo-dropzone');
        const input = document.getElementById('photo-input');
        const browseBtn = document.getElementById('btn-browse-photos');

        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            input.click();
        });

        dropzone.addEventListener('click', () => input.click());

        input.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            input.value = '';
        });

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
            this.handleFiles(files);
        });
    },

    handleFiles(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                this.photos.push({
                    id: 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                    name: file.name,
                    data: e.target.result
                });
                this.render();
            };
            reader.readAsDataURL(file);
        }
    },

    remove(id) {
        this.photos = this.photos.filter(p => p.id !== id);
        this.render();
    },

    render() {
        const grid = document.getElementById('photo-grid');
        grid.innerHTML = this.photos.map(photo => `
            <div class="photo-thumb">
                <img src="${photo.data}" alt="${photo.name}">
                <button class="photo-remove" onclick="Photos.remove('${photo.id}')">&times;</button>
            </div>
        `).join('');
    },

    setPhotos(photoList) {
        this.photos = photoList || [];
        this.render();
    },

    getPhotos() {
        return this.photos;
    },

    clear() {
        this.photos = [];
        this.render();
    }
};
