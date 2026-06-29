const Form = {
    editingId: null,

    init() {
        document.querySelectorAll('[data-add]').forEach(btn => {
            btn.addEventListener('click', () => this.addEntry(btn.dataset.add));
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove')) {
                const row = e.target.closest('.entry-row');
                const container = row.parentElement;
                if (container.children.length > 1) {
                    row.remove();
                } else {
                    row.querySelectorAll('input, select').forEach(el => el.value = '');
                }
            }
        });
    },

    templates: {
        name: `<div class="entry-row" data-type="name">
            <input type="text" class="input" placeholder="First name" data-field="first">
            <input type="text" class="input" placeholder="Last name" data-field="last">
            <button class="btn-remove" title="Remove">&times;</button>
        </div>`,
        phone: `<div class="entry-row" data-type="phone">
            <input type="tel" class="input" placeholder="Phone number" data-field="number">
            <select class="input input-sm" data-field="type">
                <option value="">Type</option>
                <option value="mobile">Mobile</option>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
            </select>
            <button class="btn-remove" title="Remove">&times;</button>
        </div>`,
        email: `<div class="entry-row" data-type="email">
            <input type="email" class="input" placeholder="Email address" data-field="address">
            <button class="btn-remove" title="Remove">&times;</button>
        </div>`,
        social: `<div class="entry-row" data-type="social">
            <select class="input input-sm" data-field="platform">
                <option value="">Platform</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter/X</option>
                <option value="tiktok">TikTok</option>
                <option value="snapchat">Snapchat</option>
                <option value="linkedin">LinkedIn</option>
                <option value="telegram">Telegram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="tinder">Tinder</option>
                <option value="bumble">Bumble</option>
                <option value="hinge">Hinge</option>
                <option value="other">Other</option>
            </select>
            <input type="text" class="input" placeholder="Username or profile URL" data-field="handle">
            <button class="btn-remove" title="Remove">&times;</button>
        </div>`
    },

    addEntry(type) {
        const listId = type === 'name' ? 'names-list' :
                       type === 'phone' ? 'phones-list' :
                       type === 'email' ? 'emails-list' : 'socials-list';
        const container = document.getElementById(listId);
        container.insertAdjacentHTML('beforeend', this.templates[type]);
        const newRow = container.lastElementChild;
        newRow.querySelector('input').focus();
    },

    collectData() {
        const caseName = document.getElementById('case-name').value.trim();
        const notes = document.getElementById('notes').value.trim();

        const names = this.collectEntries('names-list', row => {
            const first = row.querySelector('[data-field="first"]').value.trim();
            const last = row.querySelector('[data-field="last"]').value.trim();
            return (first || last) ? { first, last } : null;
        });

        const phones = this.collectEntries('phones-list', row => {
            const number = row.querySelector('[data-field="number"]').value.trim();
            const type = row.querySelector('[data-field="type"]').value;
            return number ? { number, type } : null;
        });

        const emails = this.collectEntries('emails-list', row => {
            const address = row.querySelector('[data-field="address"]').value.trim();
            return address ? { address } : null;
        });

        const socials = this.collectEntries('socials-list', row => {
            const platform = row.querySelector('[data-field="platform"]').value;
            const handle = row.querySelector('[data-field="handle"]').value.trim();
            return handle ? { platform, handle } : null;
        });

        return { caseName, names, phones, emails, socials, notes };
    },

    collectEntries(containerId, mapper) {
        const rows = document.getElementById(containerId).querySelectorAll('.entry-row');
        const results = [];
        rows.forEach(row => {
            const val = mapper(row);
            if (val) results.push(val);
        });
        return results;
    },

    populateForm(subject) {
        this.editingId = subject.id;
        document.getElementById('form-title').textContent = 'Edit Investigation';
        document.getElementById('case-name').value = subject.caseName || '';
        document.getElementById('notes').value = subject.notes || '';

        this.populateMulti('names-list', 'name', subject.names, (row, item) => {
            row.querySelector('[data-field="first"]').value = item.first || '';
            row.querySelector('[data-field="last"]').value = item.last || '';
        });

        this.populateMulti('phones-list', 'phone', subject.phones, (row, item) => {
            row.querySelector('[data-field="number"]').value = item.number || '';
            row.querySelector('[data-field="type"]').value = item.type || '';
        });

        this.populateMulti('emails-list', 'email', subject.emails, (row, item) => {
            row.querySelector('[data-field="address"]').value = item.address || '';
        });

        this.populateMulti('socials-list', 'social', subject.socials, (row, item) => {
            row.querySelector('[data-field="platform"]').value = item.platform || '';
            row.querySelector('[data-field="handle"]').value = item.handle || '';
        });

        Photos.setPhotos(subject.photos);
    },

    populateMulti(containerId, type, items, filler) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        if (!items || items.length === 0) {
            container.insertAdjacentHTML('beforeend', this.templates[type]);
            return;
        }
        items.forEach(item => {
            container.insertAdjacentHTML('beforeend', this.templates[type]);
            const row = container.lastElementChild;
            filler(row, item);
        });
    },

    resetForm() {
        this.editingId = null;
        document.getElementById('form-title').textContent = 'New Investigation';
        document.getElementById('case-name').value = '';
        document.getElementById('notes').value = '';

        ['names-list', 'phones-list', 'emails-list', 'socials-list'].forEach((id, i) => {
            const types = ['name', 'phone', 'email', 'social'];
            const container = document.getElementById(id);
            container.innerHTML = this.templates[types[i]];
        });

        Photos.clear();
    },

    saveSubject() {
        const data = this.collectData();

        if (!data.caseName && data.names.length === 0 && Photos.getPhotos().length === 0) {
            alert('Please enter at least a case name, a name, or upload a photo.');
            return null;
        }

        const subject = {
            id: this.editingId || Storage.generateId(),
            caseName: data.caseName,
            names: data.names,
            phones: data.phones,
            emails: data.emails,
            socials: data.socials,
            notes: data.notes,
            photos: Photos.getPhotos(),
            createdAt: this.editingId ? (Storage.get(this.editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            report: this.editingId ? (Storage.get(this.editingId)?.report || null) : null
        };

        Storage.save(subject);
        return subject;
    }
};
