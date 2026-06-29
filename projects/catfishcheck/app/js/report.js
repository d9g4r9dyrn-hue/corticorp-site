const Report = {
    render(subject) {
        const container = document.getElementById('report-content');

        const photoHtml = (subject.photos || []).map(p =>
            `<img src="${p.data}" alt="${p.name}">`
        ).join('');

        const nameStr = (subject.names || []).map(n =>
            [n.first, n.last].filter(Boolean).join(' ')
        ).join(', ') || 'Unnamed Subject';

        const chipsHtml = [
            ...(subject.phones || []).map(p => `<span class="chip"><span class="chip-label">Phone</span> ${p.number}</span>`),
            ...(subject.emails || []).map(e => `<span class="chip"><span class="chip-label">Email</span> ${e.address}</span>`),
            ...(subject.socials || []).map(s => `<span class="chip"><span class="chip-label">${s.platform || 'Social'}</span> ${s.handle}</span>`)
        ].join('');

        const title = subject.caseName || nameStr;

        if (!subject.report) {
            container.innerHTML = `
                <div class="report-header">
                    <div>
                        <div class="report-subject-photos">${photoHtml || '<div class="subject-card-photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'}</div>
                    </div>
                    <div class="report-subject-info">
                        <h2>${title}</h2>
                        <div class="report-contact-chips">${chipsHtml}</div>
                        ${subject.notes ? `<p style="margin-top:12px;color:var(--text-dim);font-size:0.85rem">${subject.notes}</p>` : ''}
                    </div>
                </div>
                <div class="report-not-run">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="M12 8v4M12 16h.01"/>
                    </svg>
                    <h3>Investigation not yet run</h3>
                    <p>Click "Run Investigation" to analyze this subject's photos and contact information for red flags.</p>
                </div>
            `;
            return;
        }

        const report = subject.report;
        const scoreColor = report.score >= 70 ? 'var(--success)' :
                          report.score >= 40 ? 'var(--warning)' : 'var(--danger)';
        const scoreText = report.score >= 70 ? 'Low Risk' :
                         report.score >= 40 ? 'Moderate Risk' : 'High Risk';

        const circumference = 2 * Math.PI * 46;
        const offset = circumference - (report.score / 100) * circumference;

        container.innerHTML = `
            <div class="report-header">
                <div>
                    <div class="report-subject-photos">${photoHtml}</div>
                </div>
                <div class="report-subject-info">
                    <h2>${title}</h2>
                    <div class="report-contact-chips">${chipsHtml}</div>
                    ${subject.notes ? `<p style="margin-top:12px;color:var(--text-dim);font-size:0.85rem">${subject.notes}</p>` : ''}
                    <p style="margin-top:8px;font-size:0.75rem;color:var(--text-muted)">
                        Report generated: ${new Date(report.generatedAt).toLocaleString()}
                    </p>
                </div>
                <div class="score-ring-container">
                    <div class="score-ring">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle class="score-ring-bg" cx="60" cy="60" r="46"/>
                            <circle class="score-ring-fill" cx="60" cy="60" r="46"
                                stroke="${scoreColor}"
                                stroke-dasharray="${circumference}"
                                stroke-dashoffset="${offset}"/>
                        </svg>
                        <div class="score-ring-text">
                            <span class="score-value" style="color:${scoreColor}">${report.score}</span>
                            <span class="score-label">${scoreText}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="report-modules">
                ${this.renderModule('Image Analysis', 'images', report.images)}
                ${this.renderModule('Phone Analysis', 'phone', report.phones)}
                ${this.renderModule('Social Media', 'social', report.socials)}
                ${this.renderModule('Email Analysis', 'email', report.emails)}
                ${report.summary ? this.renderSummaryModule(report.summary) : ''}
            </div>
        `;
    },

    renderModule(title, iconClass, findings) {
        if (!findings || findings.length === 0) return '';

        const iconSvgs = {
            images: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
            phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
            social: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
            email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        };

        const dangerCount = findings.filter(f => f.level === 'danger').length;
        const warningCount = findings.filter(f => f.level === 'warning').length;
        const statusColor = dangerCount > 0 ? 'var(--danger)' :
                           warningCount > 0 ? 'var(--warning)' : 'var(--success)';
        const statusText = dangerCount > 0 ? `${dangerCount} red flag${dangerCount > 1 ? 's' : ''}` :
                          warningCount > 0 ? `${warningCount} warning${warningCount > 1 ? 's' : ''}` : 'Clear';

        const findingsHtml = findings.map(f => {
            const icons = { clear: '✓', warning: '⚠', danger: '✗', info: 'ℹ', pending: '…' };
            return `<div class="finding finding-${f.level}">
                <span class="finding-icon">${icons[f.level] || '•'}</span>
                <div>
                    <strong>${f.title}</strong>
                    <div style="font-size:0.8rem;opacity:0.85;margin-top:2px">${f.detail}</div>
                </div>
            </div>`;
        }).join('');

        return `
            <div class="report-module">
                <div class="module-header">
                    <div class="module-icon icon-${iconClass}">${iconSvgs[iconClass]}</div>
                    <span class="module-title">${title}</span>
                    <span class="module-status" style="color:${statusColor}">${statusText}</span>
                </div>
                ${findingsHtml}
            </div>
        `;
    },

    renderSummaryModule(summary) {
        return `
            <div class="report-module full-width">
                <div class="module-header">
                    <div class="module-icon icon-summary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                    </div>
                    <span class="module-title">Summary</span>
                </div>
                <div style="font-size:0.9rem;line-height:1.6;color:var(--text-dim)">
                    ${summary}
                </div>
            </div>
        `;
    },

    generateMockReport(subject) {
        const findings = { images: [], phones: [], socials: [], emails: [] };
        let redFlags = 0;
        let warnings = 0;

        if (subject.photos && subject.photos.length > 0) {
            findings.images.push({
                level: 'clear',
                title: `${subject.photos.length} photo(s) analyzed`,
                detail: 'Reverse image search completed across Google, TinEye, and Yandex databases.'
            });

            if (subject.photos.length === 1) {
                findings.images.push({
                    level: 'warning',
                    title: 'Only one photo provided',
                    detail: 'Subjects who are real typically have multiple varied photos. Consider requesting more photos.'
                });
                warnings++;
            }

            const hasMatch = Math.random() > 0.5;
            if (hasMatch) {
                findings.images.push({
                    level: 'danger',
                    title: 'Image match found on stock photo site',
                    detail: 'One or more photos appear on stock photography websites under a different identity. This is a strong indicator of a fake profile.'
                });
                redFlags++;
            } else {
                findings.images.push({
                    level: 'clear',
                    title: 'No duplicate images found',
                    detail: 'Photos do not appear elsewhere on the web under a different name.'
                });
            }
        }

        if (subject.phones && subject.phones.length > 0) {
            subject.phones.forEach(phone => {
                const isVoip = Math.random() > 0.6;
                if (isVoip) {
                    findings.phones.push({
                        level: 'warning',
                        title: `${phone.number} is a VoIP number`,
                        detail: 'This number is registered to a Voice over IP service (Google Voice, TextNow, etc.). VoIP numbers are commonly used by scammers to hide their real location.'
                    });
                    warnings++;
                } else {
                    findings.phones.push({
                        level: 'clear',
                        title: `${phone.number} is a legitimate carrier number`,
                        detail: 'Registered to a major mobile carrier. Geographic origin is consistent.'
                    });
                }
            });
        }

        if (subject.socials && subject.socials.length > 0) {
            subject.socials.forEach(social => {
                const isNew = Math.random() > 0.5;
                if (isNew) {
                    findings.socials.push({
                        level: 'warning',
                        title: `${social.platform || 'Social'}: @${social.handle} is a recently created account`,
                        detail: 'Account was created within the last 30 days with minimal activity and few connections. New accounts with little history are a common catfishing pattern.'
                    });
                    warnings++;
                } else {
                    findings.socials.push({
                        level: 'clear',
                        title: `${social.platform || 'Social'}: @${social.handle} appears established`,
                        detail: 'Account shows consistent activity over an extended period with a normal friend/follower pattern.'
                    });
                }
            });
        }

        if (subject.emails && subject.emails.length > 0) {
            subject.emails.forEach(email => {
                const domain = email.address.split('@')[1] || '';
                const isDisposable = ['tempmail', 'guerrilla', 'throwaway', 'yopmail'].some(d => domain.includes(d));
                if (isDisposable) {
                    findings.emails.push({
                        level: 'danger',
                        title: `${email.address} is a disposable email`,
                        detail: 'This email uses a known disposable/temporary email service. Legitimate people rarely use throwaway email addresses.'
                    });
                    redFlags++;
                } else {
                    findings.emails.push({
                        level: 'info',
                        title: `${email.address} checked`,
                        detail: `Email domain (${domain}) is a legitimate email provider. Address format appears valid.`
                    });
                }
            });
        }

        const totalChecks = findings.images.length + findings.phones.length + findings.socials.length + findings.emails.length;
        let score = 85;
        score -= redFlags * 25;
        score -= warnings * 10;
        if (totalChecks <= 2) score -= 10;
        score = Math.max(5, Math.min(100, score));

        let summary = '';
        if (redFlags > 0) {
            summary = `<strong>This profile shows significant red flags.</strong> ${redFlags} critical issue(s) and ${warnings} warning(s) were found during analysis. The combination of findings suggests this person may not be who they claim to be. Exercise extreme caution and consider ceasing communication.`;
        } else if (warnings > 0) {
            summary = `<strong>Some concerns were identified.</strong> While no definitive proof of deception was found, ${warnings} warning sign(s) were detected that warrant caution. Consider verifying their identity through a video call or requesting additional proof before sharing personal information or sending money.`;
        } else {
            summary = `<strong>No major red flags detected.</strong> Based on the information provided, this profile appears consistent. However, no automated check is 100% conclusive. Continue to exercise normal caution in online interactions.`;
        }

        return {
            score,
            generatedAt: new Date().toISOString(),
            images: findings.images,
            phones: findings.phones,
            socials: findings.socials,
            emails: findings.emails,
            summary
        };
    }
};
