/**
 * AccountingQuest API - Cloudflare Worker
 * Komplett backend med Turso database
 * 
 * @version 2.0.0
 */

// ==================== CORS ====================

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key, Authorization',
    'Access-Control-Max-Age': '86400'
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
}

function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
}

// ==================== ADMIN AUTH ====================

function isAdmin(request, env) {
    const key = request.headers.get('X-Admin-Key');
    return key === env.ADMIN_KEY;
}

// ==================== MAIN HANDLER ====================

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        const url = new URL(request.url);
        const path = url.pathname;
        
        try {
            // Route requests
            if (path.startsWith('/api/questions')) {
                return await handleQuestions(request, env, path, url);
            }
            if (path.startsWith('/api/classrooms')) {
                return await handleClassrooms(request, env, path, url);
            }
            if (path.startsWith('/api/assignments')) {
                return await handleAssignments(request, env, path, url);
            }
            if (path.startsWith('/api/progress')) {
                return await handleProgress(request, env, path, url);
            }
            if (path.startsWith('/api/quizzes')) {
                return await handleQuizzes(request, env, path, url);
            }
            if (path.startsWith('/api/admin')) {
                return await handleAdmin(request, env, path, url);
            }
            
            // Health check
            if (path === '/api/health' || path === '/') {
                return jsonResponse({ 
                    status: 'ok', 
                    version: '2.0.0',
                    timestamp: new Date().toISOString()
                });
            }
            
            return errorResponse('Not found', 404);
            
        } catch (err) {
            console.error('API Error:', err);
            return errorResponse('Internal server error: ' + err.message, 500);
        }
    }
};

// ==================== QUESTIONS ====================

async function handleQuestions(request, env, path, url) {
    const method = request.method;
    
    // GET /api/questions - List questions
    if (method === 'GET' && path === '/api/questions') {
        const module = url.searchParams.get('module');
        const topic = url.searchParams.get('topic');
        const difficulty = url.searchParams.get('difficulty');
        const type = url.searchParams.get('type');
        const limit = parseInt(url.searchParams.get('limit')) || 100;
        const random = url.searchParams.get('random') === 'true';
        
        let sql = 'SELECT * FROM questions WHERE 1=1';
        const params = [];
        
        if (module) {
            sql += ' AND module = ?';
            params.push(module);
        }
        if (topic) {
            sql += ' AND topic = ?';
            params.push(topic);
        }
        if (difficulty) {
            sql += ' AND difficulty = ?';
            params.push(difficulty);
        }
        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }
        
        if (random) {
            sql += ' ORDER BY RANDOM()';
        } else {
            sql += ' ORDER BY created_at DESC';
        }
        
        sql += ' LIMIT ?';
        params.push(limit);
        
        const result = await env.DB.prepare(sql).bind(...params).all();
        
        return jsonResponse({
            questions: result.results.map(parseQuestion),
            total: result.results.length
        });
    }
    
    // GET /api/questions/counts - Get counts
    if (method === 'GET' && path === '/api/questions/counts') {
        const module = url.searchParams.get('module');
        
        const total = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM questions WHERE module = ?'
        ).bind(module).first();
        
        const byTopic = await env.DB.prepare(
            'SELECT topic, COUNT(*) as count FROM questions WHERE module = ? GROUP BY topic'
        ).bind(module).all();
        
        const byDifficulty = await env.DB.prepare(
            'SELECT difficulty, COUNT(*) as count FROM questions WHERE module = ? GROUP BY difficulty'
        ).bind(module).all();
        
        return jsonResponse({
            total: total?.count || 0,
            byTopic: Object.fromEntries(byTopic.results.map(r => [r.topic, r.count])),
            byDifficulty: Object.fromEntries(byDifficulty.results.map(r => [r.difficulty, r.count]))
        });
    }
    
    // GET /api/questions/:id - Get single question
    const idMatch = path.match(/^\/api\/questions\/([^\/]+)$/);
    if (method === 'GET' && idMatch) {
        const id = idMatch[1];
        const result = await env.DB.prepare(
            'SELECT * FROM questions WHERE id = ?'
        ).bind(id).first();
        
        if (!result) {
            return errorResponse('Question not found', 404);
        }
        
        return jsonResponse({ question: parseQuestion(result) });
    }
    
    return errorResponse('Not found', 404);
}

function parseQuestion(row) {
    return {
        ...row,
        data: row.data ? JSON.parse(row.data) : {},
        options: row.data ? JSON.parse(row.data).options : [],
        correct: row.data ? JSON.parse(row.data).correct : null
    };
}

// ==================== CLASSROOMS ====================

async function handleClassrooms(request, env, path, url) {
    const method = request.method;
    
    // POST /api/classrooms - Create classroom
    if (method === 'POST' && path === '/api/classrooms') {
        const body = await request.json();
        const id = crypto.randomUUID();
        const code = generateClassroomCode();
        
        await env.DB.prepare(`
            INSERT INTO classrooms (id, code, name, description, teacher_id, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(id, code, body.name, body.description || '', body.teacherId).run();
        
        return jsonResponse({
            classroom: { id, code, name: body.name, description: body.description }
        }, 201);
    }
    
    // GET /api/classrooms - List classrooms
    if (method === 'GET' && path === '/api/classrooms') {
        const teacherId = url.searchParams.get('teacherId');
        
        const result = await env.DB.prepare(
            'SELECT * FROM classrooms WHERE teacher_id = ? ORDER BY created_at DESC'
        ).bind(teacherId).all();
        
        // Get student counts
        const classrooms = await Promise.all(result.results.map(async (c) => {
            const count = await env.DB.prepare(
                'SELECT COUNT(*) as count FROM classroom_students WHERE classroom_id = ?'
            ).bind(c.id).first();
            return { ...c, studentCount: count?.count || 0 };
        }));
        
        return jsonResponse({ classrooms });
    }
    
    // GET /api/classrooms/code/:code - Get by code
    const codeMatch = path.match(/^\/api\/classrooms\/code\/([A-Z0-9]+)$/i);
    if (method === 'GET' && codeMatch) {
        const code = codeMatch[1].toUpperCase();
        const result = await env.DB.prepare(
            'SELECT * FROM classrooms WHERE code = ?'
        ).bind(code).first();
        
        if (!result) {
            return errorResponse('Classroom not found', 404);
        }
        
        return jsonResponse({ classroom: result });
    }
    
    // POST /api/classrooms/join - Join classroom
    if (method === 'POST' && path === '/api/classrooms/join') {
        const body = await request.json();
        const code = body.code.toUpperCase();
        
        const classroom = await env.DB.prepare(
            'SELECT * FROM classrooms WHERE code = ?'
        ).bind(code).first();
        
        if (!classroom) {
            return errorResponse('Classroom not found', 404);
        }
        
        const studentId = crypto.randomUUID();
        
        await env.DB.prepare(`
            INSERT INTO classroom_students (id, classroom_id, student_name, student_email, joined_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `).bind(studentId, classroom.id, body.studentName, body.studentEmail || '').run();
        
        return jsonResponse({
            success: true,
            classroomId: classroom.id,
            studentId: studentId,
            classroomName: classroom.name
        }, 201);
    }
    
    // GET /api/classrooms/:id/students - Get students
    const studentsMatch = path.match(/^\/api\/classrooms\/([^\/]+)\/students$/);
    if (method === 'GET' && studentsMatch) {
        const classroomId = studentsMatch[1];
        
        const result = await env.DB.prepare(
            'SELECT * FROM classroom_students WHERE classroom_id = ? ORDER BY joined_at DESC'
        ).bind(classroomId).all();
        
        return jsonResponse({ students: result.results });
    }
    
    // DELETE /api/classrooms/:id/students/:studentId - Remove student
    const removeMatch = path.match(/^\/api\/classrooms\/([^\/]+)\/students\/([^\/]+)$/);
    if (method === 'DELETE' && removeMatch) {
        const [, classroomId, studentId] = removeMatch;
        
        await env.DB.prepare(
            'DELETE FROM classroom_students WHERE classroom_id = ? AND id = ?'
        ).bind(classroomId, studentId).run();
        
        return jsonResponse({ success: true });
    }
    
    return errorResponse('Not found', 404);
}

function generateClassroomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ==================== ASSIGNMENTS ====================

async function handleAssignments(request, env, path, url) {
    const method = request.method;
    
    // POST /api/assignments - Create assignment
    if (method === 'POST' && path === '/api/assignments') {
        const body = await request.json();
        const id = crypto.randomUUID();
        
        await env.DB.prepare(`
            INSERT INTO assignments (id, classroom_id, title, questions, due_date, settings, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
            id, 
            body.classroomId, 
            body.title, 
            JSON.stringify(body.questions),
            body.dueDate || null,
            JSON.stringify(body.settings || {})
        ).run();
        
        return jsonResponse({ assignment: { id, ...body } }, 201);
    }
    
    // GET /api/assignments - List assignments
    if (method === 'GET' && path === '/api/assignments') {
        const classroomId = url.searchParams.get('classroomId');
        
        const result = await env.DB.prepare(
            'SELECT * FROM assignments WHERE classroom_id = ? ORDER BY created_at DESC'
        ).bind(classroomId).all();
        
        return jsonResponse({
            assignments: result.results.map(a => ({
                ...a,
                questions: JSON.parse(a.questions || '[]'),
                settings: JSON.parse(a.settings || '{}')
            }))
        });
    }
    
    // GET /api/assignments/student/:studentId - Get student's assignments
    const studentMatch = path.match(/^\/api\/assignments\/student\/([^\/]+)$/);
    if (method === 'GET' && studentMatch) {
        const studentId = studentMatch[1];
        
        // Get student's classroom
        const student = await env.DB.prepare(
            'SELECT classroom_id FROM classroom_students WHERE id = ?'
        ).bind(studentId).first();
        
        if (!student) {
            return errorResponse('Student not found', 404);
        }
        
        // Get assignments for that classroom
        const assignments = await env.DB.prepare(
            'SELECT * FROM assignments WHERE classroom_id = ? ORDER BY due_date ASC'
        ).bind(student.classroom_id).all();
        
        // Get submissions
        const submissions = await env.DB.prepare(
            'SELECT assignment_id, score, submitted_at FROM submissions WHERE student_id = ?'
        ).bind(studentId).all();
        
        const submissionMap = Object.fromEntries(
            submissions.results.map(s => [s.assignment_id, s])
        );
        
        return jsonResponse({
            assignments: assignments.results.map(a => ({
                ...a,
                questions: JSON.parse(a.questions || '[]'),
                submission: submissionMap[a.id] || null
            }))
        });
    }
    
    // POST /api/assignments/:id/submit - Submit assignment
    const submitMatch = path.match(/^\/api\/assignments\/([^\/]+)\/submit$/);
    if (method === 'POST' && submitMatch) {
        const assignmentId = submitMatch[1];
        const body = await request.json();
        const submissionId = crypto.randomUUID();
        
        // Calculate score
        const assignment = await env.DB.prepare(
            'SELECT questions FROM assignments WHERE id = ?'
        ).bind(assignmentId).first();
        
        const questions = JSON.parse(assignment.questions || '[]');
        let score = 0;
        
        // Simple scoring - can be enhanced
        questions.forEach((q, i) => {
            if (body.answers[i] === q.correct) {
                score++;
            }
        });
        
        const percentage = Math.round((score / questions.length) * 100);
        
        await env.DB.prepare(`
            INSERT INTO submissions (id, assignment_id, student_id, answers, score, submitted_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(
            submissionId,
            assignmentId,
            body.studentId,
            JSON.stringify(body.answers),
            percentage
        ).run();
        
        return jsonResponse({
            success: true,
            submissionId,
            score: percentage,
            correct: score,
            total: questions.length
        }, 201);
    }
    
    // GET /api/assignments/:id/results - Get results
    const resultsMatch = path.match(/^\/api\/assignments\/([^\/]+)\/results$/);
    if (method === 'GET' && resultsMatch) {
        const assignmentId = resultsMatch[1];
        
        const submissions = await env.DB.prepare(`
            SELECT s.*, cs.student_name 
            FROM submissions s
            JOIN classroom_students cs ON s.student_id = cs.id
            WHERE s.assignment_id = ?
            ORDER BY s.submitted_at DESC
        `).bind(assignmentId).all();
        
        return jsonResponse({
            results: submissions.results.map(s => ({
                ...s,
                answers: JSON.parse(s.answers || '[]')
            }))
        });
    }
    
    return errorResponse('Not found', 404);
}

// ==================== PROGRESS ====================

async function handleProgress(request, env, path, url) {
    const method = request.method;
    
    // POST /api/progress - Save progress
    if (method === 'POST' && path === '/api/progress') {
        const body = await request.json();
        
        await env.DB.prepare(`
            INSERT INTO progress (id, user_id, module, data, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id, module) DO UPDATE SET
                data = excluded.data,
                updated_at = datetime('now')
        `).bind(
            crypto.randomUUID(),
            body.userId,
            body.module,
            JSON.stringify(body.data)
        ).run();
        
        return jsonResponse({ success: true }, 201);
    }
    
    // GET /api/progress/:userId/:module - Get specific progress
    const specificMatch = path.match(/^\/api\/progress\/([^\/]+)\/([^\/]+)$/);
    if (method === 'GET' && specificMatch) {
        const [, userId, module] = specificMatch;
        
        const result = await env.DB.prepare(
            'SELECT * FROM progress WHERE user_id = ? AND module = ?'
        ).bind(userId, module).first();
        
        if (!result) {
            return jsonResponse({ progress: null });
        }
        
        return jsonResponse({
            progress: {
                ...result,
                data: JSON.parse(result.data || '{}')
            }
        });
    }
    
    // GET /api/progress/:userId - Get all progress
    const allMatch = path.match(/^\/api\/progress\/([^\/]+)$/);
    if (method === 'GET' && allMatch) {
        const userId = allMatch[1];
        
        const result = await env.DB.prepare(
            'SELECT * FROM progress WHERE user_id = ?'
        ).bind(userId).all();
        
        return jsonResponse({
            progress: result.results.map(p => ({
                ...p,
                data: JSON.parse(p.data || '{}')
            }))
        });
    }
    
    // GET /api/progress/classroom/:classroomId - Get classroom progress
    const classroomMatch = path.match(/^\/api\/progress\/classroom\/([^\/]+)$/);
    if (method === 'GET' && classroomMatch) {
        const classroomId = classroomMatch[1];
        
        const students = await env.DB.prepare(
            'SELECT id, student_name FROM classroom_students WHERE classroom_id = ?'
        ).bind(classroomId).all();
        
        const progressData = await Promise.all(students.results.map(async (s) => {
            const progress = await env.DB.prepare(
                'SELECT module, data FROM progress WHERE user_id = ?'
            ).bind(s.id).all();
            
            return {
                studentId: s.id,
                studentName: s.student_name,
                modules: Object.fromEntries(
                    progress.results.map(p => [p.module, JSON.parse(p.data || '{}')])
                )
            };
        }));
        
        return jsonResponse({ students: progressData });
    }
    
    return errorResponse('Not found', 404);
}

// ==================== QUIZZES ====================

async function handleQuizzes(request, env, path, url) {
    const method = request.method;
    
    // POST /api/quizzes - Save quiz
    if (method === 'POST' && path === '/api/quizzes') {
        const body = await request.json();
        const id = crypto.randomUUID();
        
        await env.DB.prepare(`
            INSERT INTO quizzes (id, teacher_id, name, questions, visibility, settings, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
            id,
            body.teacherId,
            body.name,
            JSON.stringify(body.questions),
            body.visibility || 'private',
            JSON.stringify(body.settings || {})
        ).run();
        
        return jsonResponse({ quiz: { id, ...body } }, 201);
    }
    
    // GET /api/quizzes - List quizzes
    if (method === 'GET' && path === '/api/quizzes') {
        const teacherId = url.searchParams.get('teacherId');
        
        const result = await env.DB.prepare(
            'SELECT * FROM quizzes WHERE teacher_id = ? ORDER BY created_at DESC'
        ).bind(teacherId).all();
        
        return jsonResponse({
            quizzes: result.results.map(q => ({
                ...q,
                questions: JSON.parse(q.questions || '[]'),
                settings: JSON.parse(q.settings || '{}')
            }))
        });
    }
    
    // GET /api/quizzes/public - Get public quizzes
    if (method === 'GET' && path === '/api/quizzes/public') {
        const result = await env.DB.prepare(
            "SELECT * FROM quizzes WHERE visibility = 'public' ORDER BY created_at DESC LIMIT 50"
        ).all();
        
        return jsonResponse({
            quizzes: result.results.map(q => ({
                ...q,
                questions: JSON.parse(q.questions || '[]'),
                settings: JSON.parse(q.settings || '{}')
            }))
        });
    }
    
    // GET /api/quizzes/:id - Get quiz
    const idMatch = path.match(/^\/api\/quizzes\/([^\/]+)$/);
    if (method === 'GET' && idMatch) {
        const id = idMatch[1];
        const result = await env.DB.prepare(
            'SELECT * FROM quizzes WHERE id = ?'
        ).bind(id).first();
        
        if (!result) {
            return errorResponse('Quiz not found', 404);
        }
        
        return jsonResponse({
            quiz: {
                ...result,
                questions: JSON.parse(result.questions || '[]'),
                settings: JSON.parse(result.settings || '{}')
            }
        });
    }
    
    // DELETE /api/quizzes/:id - Delete quiz
    if (method === 'DELETE' && idMatch) {
        const id = idMatch[1];
        await env.DB.prepare('DELETE FROM quizzes WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    }
    
    return errorResponse('Not found', 404);
}

// ==================== ADMIN ====================

async function handleAdmin(request, env, path, url) {
    // Check admin auth
    if (!isAdmin(request, env)) {
        return errorResponse('Unauthorized', 401);
    }
    
    const method = request.method;
    
    // POST /api/admin/questions - Create question
    if (method === 'POST' && path === '/api/admin/questions') {
        const body = await request.json();
        const id = crypto.randomUUID();
        
        await env.DB.prepare(`
            INSERT INTO questions (id, module, topic, difficulty, type, question, data, explanation, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
            id,
            body.module,
            body.topic || '',
            body.difficulty || 'medium',
            body.type,
            body.question,
            JSON.stringify({
                options: body.options,
                correct: body.correct,
                ...body.data
            }),
            body.explanation || ''
        ).run();
        
        return jsonResponse({ question: { id, ...body } }, 201);
    }
    
    // PUT /api/admin/questions/:id - Update question
    const updateMatch = path.match(/^\/api\/admin\/questions\/([^\/]+)$/);
    if (method === 'PUT' && updateMatch) {
        const id = updateMatch[1];
        const body = await request.json();
        
        await env.DB.prepare(`
            UPDATE questions SET
                module = ?,
                topic = ?,
                difficulty = ?,
                type = ?,
                question = ?,
                data = ?,
                explanation = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            body.module,
            body.topic || '',
            body.difficulty || 'medium',
            body.type,
            body.question,
            JSON.stringify({
                options: body.options,
                correct: body.correct,
                ...body.data
            }),
            body.explanation || '',
            id
        ).run();
        
        return jsonResponse({ success: true });
    }
    
    // DELETE /api/admin/questions/:id - Delete question
    if (method === 'DELETE' && updateMatch) {
        const id = updateMatch[1];
        await env.DB.prepare('DELETE FROM questions WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    }
    
    // POST /api/admin/questions/bulk - Bulk import
    if (method === 'POST' && path === '/api/admin/questions/bulk') {
        const body = await request.json();
        const module = body.module;
        const questions = body.questions;
        
        let imported = 0;
        let errors = [];
        
        for (const q of questions) {
            try {
                const id = crypto.randomUUID();
                await env.DB.prepare(`
                    INSERT INTO questions (id, module, topic, difficulty, type, question, data, explanation, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                `).bind(
                    id,
                    module,
                    q.topic || '',
                    q.difficulty || 'medium',
                    q.type,
                    q.question,
                    JSON.stringify({
                        options: q.options,
                        correct: q.correct,
                        ...q.data
                    }),
                    q.explanation || ''
                ).run();
                imported++;
            } catch (err) {
                errors.push({ question: q.question?.substring(0, 50), error: err.message });
            }
        }
        
        return jsonResponse({
            success: true,
            imported,
            total: questions.length,
            errors: errors.length > 0 ? errors : undefined
        });
    }
    
    return errorResponse('Not found', 404);
}
