/**
 * AccountingQuest - Turso API
 * All backend-kommunikasjon via Cloudflare Workers + Turso
 * 
 * Firebase brukes KUN for sanntids multiplayer (game.html)
 * 
 * @version 2.0.0
 */

const AQ = (function() {
    'use strict';
    
    // ==================== CONFIG ====================
    
    const API_URL = 'https://accountingquest-api.acoustep.workers.dev';
    const TIMEOUT = 10000;
    
    // ==================== HELPERS ====================
    
    async function request(endpoint, options = {}) {
        const url = API_URL + endpoint;
        const config = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (err) {
            console.error(`[AQ API] ${endpoint}:`, err.message);
            throw err;
        }
    }
    
    function get(endpoint) {
        return request(endpoint, { method: 'GET' });
    }
    
    function post(endpoint, body) {
        return request(endpoint, { method: 'POST', body: JSON.stringify(body) });
    }
    
    function put(endpoint, body) {
        return request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
    }
    
    function del(endpoint) {
        return request(endpoint, { method: 'DELETE' });
    }
    
    function adminRequest(endpoint, options = {}) {
        const adminKey = localStorage.getItem('aq_admin_key');
        if (!adminKey) throw new Error('Admin key required');
        return request(endpoint, {
            ...options,
            headers: { ...options.headers, 'X-Admin-Key': adminKey }
        });
    }
    
    // ==================== SPØRSMÅL ====================
    
    const Questions = {
        async list(module, filters = {}) {
            const params = new URLSearchParams({ module, ...filters });
            return get(`/api/questions?${params}`);
        },
        
        async get(id) {
            return get(`/api/questions/${id}`);
        },
        
        async random(module, count = 10, filters = {}) {
            const params = new URLSearchParams({ module, limit: count, random: 'true', ...filters });
            return get(`/api/questions?${params}`);
        },
        
        async counts(module) {
            return get(`/api/questions/counts?module=${module}`);
        },
        
        // Admin
        async create(question) {
            return adminRequest('/api/admin/questions', { method: 'POST', body: JSON.stringify(question) });
        },
        
        async update(id, question) {
            return adminRequest(`/api/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(question) });
        },
        
        async delete(id) {
            return adminRequest(`/api/admin/questions/${id}`, { method: 'DELETE' });
        },
        
        async bulkImport(questions, module) {
            return adminRequest('/api/admin/questions/bulk', { 
                method: 'POST', 
                body: JSON.stringify({ questions, module }) 
            });
        }
    };
    
    // ==================== KLASSEROM ====================
    
    const Classrooms = {
        async create(name, description, teacherId) {
            return post('/api/classrooms', { name, description, teacherId });
        },
        
        async list(teacherId) {
            return get(`/api/classrooms?teacherId=${teacherId}`);
        },
        
        async getByCode(code) {
            return get(`/api/classrooms/code/${code}`);
        },
        
        async join(code, studentName, studentEmail) {
            return post('/api/classrooms/join', { code, studentName, studentEmail });
        },
        
        async getStudents(classroomId) {
            return get(`/api/classrooms/${classroomId}/students`);
        },
        
        async removeStudent(classroomId, studentId) {
            return del(`/api/classrooms/${classroomId}/students/${studentId}`);
        }
    };
    
    // ==================== OPPGAVER ====================
    
    const Assignments = {
        async create(data) {
            return post('/api/assignments', data);
        },
        
        async list(classroomId) {
            return get(`/api/assignments?classroomId=${classroomId}`);
        },
        
        async forStudent(studentId) {
            return get(`/api/assignments/student/${studentId}`);
        },
        
        async submit(assignmentId, studentId, answers) {
            return post(`/api/assignments/${assignmentId}/submit`, { studentId, answers });
        },
        
        async results(assignmentId) {
            return get(`/api/assignments/${assignmentId}/results`);
        }
    };
    
    // ==================== FREMGANG ====================
    
    const Progress = {
        async save(userId, module, data) {
            return post('/api/progress', { userId, module, data });
        },
        
        async get(userId, module) {
            return get(`/api/progress/${userId}/${module}`);
        },
        
        async getAll(userId) {
            return get(`/api/progress/${userId}`);
        },
        
        async forClassroom(classroomId) {
            return get(`/api/progress/classroom/${classroomId}`);
        },
        
        // Lokal backup
        saveLocal(module, data) {
            localStorage.setItem(`aq_progress_${module}`, JSON.stringify(data));
        },
        
        getLocal(module) {
            const data = localStorage.getItem(`aq_progress_${module}`);
            return data ? JSON.parse(data) : null;
        }
    };
    
    // ==================== QUIZER ====================
    
    const Quizzes = {
        async save(quiz, teacherId) {
            return post('/api/quizzes', { ...quiz, teacherId });
        },
        
        async list(teacherId) {
            return get(`/api/quizzes?teacherId=${teacherId}`);
        },
        
        async getPublic() {
            return get('/api/quizzes/public');
        },
        
        async get(id) {
            return get(`/api/quizzes/${id}`);
        },
        
        async delete(id) {
            return del(`/api/quizzes/${id}`);
        }
    };
    
    // ==================== BRUKER ====================
    
    const User = {
        _current: null,
        
        get() {
            if (this._current) return this._current;
            const stored = localStorage.getItem('aq_user');
            if (stored) {
                this._current = JSON.parse(stored);
                return this._current;
            }
            return null;
        },
        
        set(user) {
            this._current = user;
            localStorage.setItem('aq_user', JSON.stringify(user));
        },
        
        clear() {
            this._current = null;
            localStorage.removeItem('aq_user');
        },
        
        getId() {
            const user = this.get();
            if (user?.id) return user.id;
            // Generer anonym ID
            let id = localStorage.getItem('aq_anon_id');
            if (!id) {
                id = 'anon_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('aq_anon_id', id);
            }
            return id;
        },
        
        isTeacher() {
            return this.get()?.role === 'teacher';
        },
        
        isAdmin() {
            return !!localStorage.getItem('aq_admin_key');
        }
    };
    
    // ==================== TEMA ====================
    
    const Theme = {
        get() {
            return localStorage.getItem('aq_theme') || 'dark';
        },
        
        set(theme) {
            localStorage.setItem('aq_theme', theme);
            document.documentElement.setAttribute('data-theme', theme);
        },
        
        getAccent() {
            return localStorage.getItem('aq_accent') || '#4ade80';
        },
        
        setAccent(color) {
            localStorage.setItem('aq_accent', color);
            document.documentElement.style.setProperty('--accent', color);
        },
        
        init() {
            this.set(this.get());
            const accent = this.getAccent();
            if (accent !== '#4ade80') {
                document.documentElement.style.setProperty('--accent', accent);
            }
        }
    };
    
    // ==================== UTILS ====================
    
    const Utils = {
        formatNumber(num) {
            return new Intl.NumberFormat('nb-NO').format(num);
        },
        
        formatCurrency(num) {
            return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(num);
        },
        
        formatDate(date) {
            return new Intl.DateTimeFormat('nb-NO').format(new Date(date));
        },
        
        shuffle(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },
        
        debounce(fn, delay) {
            let timer;
            return function(...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        },
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };
    
    // ==================== INIT ====================
    
    function init() {
        Theme.init();
        console.log('✅ AQ API initialized (Turso-only mode)');
    }
    
    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ==================== PUBLIC API ====================
    
    return {
        Questions,
        Classrooms,
        Assignments,
        Progress,
        Quizzes,
        User,
        Theme,
        Utils,
        
        // Config
        API_URL,
        
        // Health check
        async health() {
            return get('/api/health');
        }
    };
})();

// Global
window.AQ = AQ;
