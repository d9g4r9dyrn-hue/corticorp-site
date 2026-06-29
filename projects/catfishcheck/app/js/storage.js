const Storage = {
    KEY: 'catfishcheck_subjects',

    getAll() {
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : [];
    },

    get(id) {
        return this.getAll().find(s => s.id === id);
    },

    save(subject) {
        const subjects = this.getAll();
        const idx = subjects.findIndex(s => s.id === subject.id);
        if (idx >= 0) {
            subjects[idx] = subject;
        } else {
            subjects.unshift(subject);
        }
        localStorage.setItem(this.KEY, JSON.stringify(subjects));
        return subject;
    },

    delete(id) {
        const subjects = this.getAll().filter(s => s.id !== id);
        localStorage.setItem(this.KEY, JSON.stringify(subjects));
    },

    generateId() {
        return 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }
};
