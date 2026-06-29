const App = {
    currentSubjectId: null,

    init() {
        Photos.init();
        Form.init();
        this.bindNav();
        this.bindActions();
        this.showView('subjects');
    },

    bindNav() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                if (view === 'new') {
                    Form.resetForm();
                }
                this.showView(view);
            });
        });
    },

    bindActions() {
        document.getElementById('btn-new-investigation').addEventListener('click', () => {
            Form.resetForm();
            this.showView('new');
        });

        document.getElementById('btn-empty-new').addEventListener('click', () => {
            Form.resetForm();
            this.showView('new');
        });

        document.getElementById('btn-cancel').addEventListener('click', () => {
            this.showView('subjects');
        });

        document.getElementById('btn-save-subject').addEventListener('click', () => {
            const subject = Form.saveSubject();
            if (subject) {
                this.currentSubjectId = subject.id;
                this.showView('report');
            }
        });

        document.getElementById('btn-back-list').addEventListener('click', () => {
            this.showView('subjects');
        });

        document.getElementById('btn-edit-subject').addEventListener('click', () => {
            const subject = Storage.get(this.currentSubjectId);
            if (subject) {
                Form.populateForm(subject);
                this.showView('new');
            }
        });

        document.getElementById('btn-run-check').addEventListener('click', () => {
            this.runInvestigation();
        });
    },

    showView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        const viewEl = document.getElementById(`view-${viewName}`);
        if (viewEl) viewEl.classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(b => {
            if (b.dataset.view === viewName) b.classList.add('active');
        });

        if (viewName === 'subjects') {
            this.renderSubjectsList();
        } else if (viewName === 'report' && this.currentSubjectId) {
            const subject = Storage.get(this.currentSubjectId);
            if (subject) Report.render(subject);
        }
    },

    renderSubjectsList() {
        const subjects = Storage.getAll();
        const list = document.getElementById('subjects-list');
        const empty = document.getElementById('empty-state');

        if (subjects.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        list.style.display = 'grid';
        empty.style.display = 'none';

        list.innerHTML = subjects.map(subject => {
            const photo = subject.photos && subject.photos.length > 0
                ? `<img src="${subject.photos[0].data}" alt="Subject">`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                   </svg>`;

            const name = subject.caseName ||
                (subject.names && subject.names.length > 0
                    ? [subject.names[0].first, subject.names[0].last].filter(Boolean).join(' ')
                    : 'Unnamed Subject');

            const meta = [];
            if (subject.photos) meta.push(`${subject.photos.length} photo(s)`);
            if (subject.phones && subject.phones.length) meta.push(`${subject.phones.length} phone(s)`);
            if (subject.socials && subject.socials.length) meta.push(`${subject.socials.length} social(s)`);

            let badge = '<span class="subject-card-badge badge-pending">Not checked</span>';
            if (subject.report) {
                const score = subject.report.score;
                if (score >= 70) badge = `<span class="subject-card-badge badge-clear">Score: ${score}</span>`;
                else if (score >= 40) badge = `<span class="subject-card-badge badge-pending">Score: ${score}</span>`;
                else badge = `<span class="subject-card-badge badge-flagged">Score: ${score}</span>`;
            }

            const date = new Date(subject.updatedAt || subject.createdAt).toLocaleDateString();

            return `
                <div class="subject-card" data-id="${subject.id}">
                    <div class="subject-card-photo">${photo}</div>
                    <div class="subject-card-info">
                        <h3>${name}</h3>
                        <div class="subject-card-meta">
                            <span>${meta.join(' · ')}</span>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="subject-card-actions">
                        ${badge}
                        <button class="subject-card-delete" data-delete="${subject.id}" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.subject-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.subject-card-delete')) return;
                this.currentSubjectId = card.dataset.id;
                this.showView('report');
            });
        });

        list.querySelectorAll('.subject-card-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.delete;
                const subject = Storage.get(id);
                const name = subject?.caseName || 'this subject';
                if (confirm(`Delete "${name}"? This cannot be undone.`)) {
                    Storage.delete(id);
                    this.renderSubjectsList();
                }
            });
        });
    },

    runInvestigation() {
        const subject = Storage.get(this.currentSubjectId);
        if (!subject) return;

        const btn = document.getElementById('btn-run-check');
        const origHtml = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> Analyzing...';
        btn.disabled = true;

        setTimeout(() => {
            subject.report = Report.generateMockReport(subject);
            subject.updatedAt = new Date().toISOString();
            Storage.save(subject);
            Report.render(subject);
            btn.innerHTML = origHtml;
            btn.disabled = false;
        }, 2000);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
