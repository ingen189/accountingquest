**
 * AccountingQuest API - Cloudflare Worker
 * 
 * Kobler til Turso database og håndterer alle API-forespørsler
 * Deploy: wrangler deploy
 */

import { createClient } from '@libsql/client/web';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};

// Helper: JSON response
function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: corsHeaders
    });
}

// Helper: Error response
function error(message, status = 400) {
    return json({ error: message }, status);
}

// Helper: Generate ID
function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

// Helper: Generate PIN/join code
function generateCode(length = 6) {
    return Math.random().toString().substring(2, 2 + length);
}

// ============================================
// MAIN WORKER
// ============================================

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Initialize Turso client
        const db = createClient({
            url: env.TURSO_URL,
            authToken: env.TURSO_AUTH_TOKEN,
        });

        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // ============================================
            // ROUTING
            // ============================================

            // Health check
            if (path === '/api/health') {
                return json({ status: 'ok', timestamp: new Date().toISOString() });
            }

            // Modules
            if (path === '/api/modules') {
                return handleModules(db, method);
            }

            // Questions
            if (path === '/api/questions') {
                return handleQuestions(db, method, request, url);
            }
            if (path.match(/^\/api\/questions\/[^/]+$/)) {
                const id = path.split('/')[3];
                return handleQuestion(db, method, request, id);
            }

            // Grid questions (Excel/T-konto)
            if (path.match(/^\/api\/questions\/[^/]+\/grid$/)) {
                const id = path.split('/')[3];
                return handleQuestionGrid(db, method, request, id);
            }

            // Users
            if (path === '/api/users') {
                return handleUsers(db, method, request);
            }
            if (path.match(/^\/api\/users\/[^/]+$/)) {
                const id = path.split('/')[3];
                return handleUser(db, method, request, id);
            }

            // Progress
            if (path === '/api/progress') {
                return handleProgress(db, method, request, url);
            }
            if (path.match(/^\/api\/progress\/[^/]+$/)) {
                const userId = path.split('/')[3];
                return handleUserProgress(db, method, request, userId, url);
            }

            // Classrooms
            if (path === '/api/classrooms') {
                return handleClassrooms(db, method, request, url);
            }
            if (path.match(/^\/api\/classrooms\/[^/]+$/)) {
                const id = path.split('/')[3];
                return handleClassroom(db, method, request, id);
            }
            if (path.match(/^\/api\/classrooms\/[^/]+\/members$/)) {
                const id = path.split('/')[3];
                return handleClassroomMembers(db, method, request, id);
            }
            if (path.match(/^\/api\/classrooms\/[^/]+\/join$/)) {
                const id = path.split('/')[3];
                return handleClassroomJoin(db, method, request, id);
            }
            if (path === '/api/classrooms/join') {
                return handleJoinByCode(db, method, request);
            }

            // Assignments
            if (path === '/api/assignments') {
                return handleAssignments(db, method, request, url);
            }
            if (path.match(/^\/api\/assignments\/[^/]+$/)) {
                const id = path.split('/')[3];
                return handleAssignment(db, method, request, id);
            }

            // Duels
            if (path === '/api/duels') {
                return handleDuels(db, method, request, url);
            }
            if (path.match(/^\/api\/duels\/[^/]+$/)) {
                const id = path.split('/')[3];
                return handleDuel(db, method, request, id);
            }
            if (path.match(/^\/api\/duels\/[^/]+\/answer$/)) {
                const id = path.split('/')[3];
                return handleDuelAnswer(db, method, request, id);
            }

            // Live Games (Kahoot-style)
            if (path === '/api/live-games') {
                return handleLiveGames(db, method, request);
            }
            if (path.match(/^\/api\/live-games\/[^/]+$/)) {
                const id = path.split('/')[3];
                return handleLiveGame(db, method, request, id);
            }
            if (path === '/api/live-games/join') {
                return handleLiveGameJoin(db, method, request);
            }

            // Leaderboards
            if (path === '/api/leaderboard/global') {
                return handleGlobalLeaderboard(db, url);
            }
            if (path.match(/^\/api\/leaderboard\/[^/]+$/)) {
                const moduleId = path.split('/')[3];
                return handleModuleLeaderboard(db, moduleId, url);
            }

            // Wiki
            if (path === '/api/wiki') {
                return handleWiki(db, method, request, url);
            }
            if (path.match(/^\/api\/wiki\/[^/]+$/)) {
                const id = path.split('/')[3];
                return handleWikiArticle(db, method, request, id);
            }

            // 404
            return error('Not found', 404);

        } catch (err) {
            console.error('API Error:', err);
            return error(err.message || 'Internal server error', 500);
        }
    }
};

// ============================================
// MODULES
// ============================================

async function handleModules(db, method) {
    if (method !== 'GET') return error('Method not allowed', 405);

    const result = await db.execute(`
        SELECT m.*, 
            (SELECT COUNT(*) FROM questions WHERE module_id = m.id AND is_active = TRUE) as question_count
        FROM modules m
        WHERE m.is_active = TRUE
        ORDER BY m.sort_order
    `);

    return json(result.rows);
}

// ============================================
// QUESTIONS
// ============================================

async function handleQuestions(db, method, request, url) {
    if (method === 'GET') {
        const moduleId = url.searchParams.get('module');
        const type = url.searchParams.get('type');
        const difficulty = url.searchParams.get('difficulty');
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const offset = parseInt(url.searchParams.get('offset')) || 0;

        let query = `
            SELECT q.*, qd.hints, qd.explanation, qd.wiki_refs
            FROM questions q
            LEFT JOIN question_data qd ON q.id = qd.question_id
            WHERE q.is_active = TRUE
        `;
        const params = [];

        if (moduleId) {
            query += ` AND q.module_id = ?`;
            params.push(moduleId);
        }
        if (type) {
            query += ` AND q.type = ?`;
            params.push(type);
        }
        if (difficulty) {
            query += ` AND q.difficulty = ?`;
            params.push(difficulty);
        }

        query += ` ORDER BY q.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const result = await db.execute({ sql: query, args: params });

        // For grid questions, fetch the grid structure
        const questions = [];
        for (const q of result.rows) {
            const question = { ...q };
            
            // Parse JSON fields
            if (question.hints) question.hints = JSON.parse(question.hints);
            if (question.wiki_refs) question.wiki_refs = JSON.parse(question.wiki_refs);

            if (q.type === 'excel_grid') {
                question.grid = await getQuestionGrid(db, q.id);
            } else if (q.type === 'mc') {
                question.options = await getMcOptions(db, q.id);
            } else if (q.type === 'dnd') {
                question.dnd = await getDndData(db, q.id);
            }

            questions.push(question);
        }

        return json(questions);
    }

    if (method === 'POST') {
        const body = await request.json();
        const id = generateId('q');

        await db.execute({
            sql: `INSERT INTO questions (id, module_id, type, topic, title, question, difficulty, points, time_limit, created_by)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [id, body.module_id, body.type, body.topic, body.title, body.question, 
                   body.difficulty || 'medium', body.points || 10, body.time_limit, body.created_by]
        });

        // Insert question_data
        if (body.hints || body.explanation || body.wiki_refs) {
            await db.execute({
                sql: `INSERT INTO question_data (question_id, hints, explanation, wiki_refs)
                      VALUES (?, ?, ?, ?)`,
                args: [id, JSON.stringify(body.hints || []), body.explanation, JSON.stringify(body.wiki_refs || [])]
            });
        }

        // Handle type-specific data
        if (body.type === 'excel_grid' && body.grid) {
            await saveQuestionGrid(db, id, body.grid);
        } else if (body.type === 'mc' && body.options) {
            await saveMcOptions(db, id, body.options);
        } else if (body.type === 'dnd' && body.dnd) {
            await saveDndData(db, id, body.dnd);
        }

        // Save solution for non-grid questions
        if (body.correct_answer) {
            await db.execute({
                sql: `INSERT INTO solutions (question_id, correct_answer, tolerance, answer_format)
                      VALUES (?, ?, ?, ?)`,
                args: [id, body.correct_answer, body.tolerance || 0, body.answer_format]
            });
        }

        return json({ id, message: 'Question created' }, 201);
    }

    return error('Method not allowed', 405);
}

async function handleQuestion(db, method, request, id) {
    if (method === 'GET') {
        const result = await db.execute({
            sql: `SELECT q.*, qd.hints, qd.explanation, qd.wiki_refs, s.correct_answer, s.tolerance
                  FROM questions q
                  LEFT JOIN question_data qd ON q.id = qd.question_id
                  LEFT JOIN solutions s ON q.id = s.question_id
                  WHERE q.id = ?`,
            args: [id]
        });

        if (result.rows.length === 0) {
            return error('Question not found', 404);
        }

        const question = { ...result.rows[0] };
        
        // Parse JSON fields
        if (question.hints) question.hints = JSON.parse(question.hints);
        if (question.wiki_refs) question.wiki_refs = JSON.parse(question.wiki_refs);

        // Get type-specific data
        if (question.type === 'excel_grid') {
            question.grid = await getQuestionGrid(db, id);
        } else if (question.type === 'mc') {
            question.options = await getMcOptions(db, id);
        } else if (question.type === 'dnd') {
            question.dnd = await getDndData(db, id);
        }

        // Update usage count
        await db.execute({
            sql: `UPDATE questions SET usage_count = usage_count + 1 WHERE id = ?`,
            args: [id]
        });

        return json(question);
    }

    if (method === 'PUT') {
        const body = await request.json();
        
        await db.execute({
            sql: `UPDATE questions SET 
                    module_id = COALESCE(?, module_id),
                    topic = COALESCE(?, topic),
                    title = COALESCE(?, title),
                    question = COALESCE(?, question),
                    difficulty = COALESCE(?, difficulty),
                    points = COALESCE(?, points),
                    time_limit = COALESCE(?, time_limit),
                    is_active = COALESCE(?, is_active),
                    updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`,
            args: [body.module_id, body.topic, body.title, body.question, 
                   body.difficulty, body.points, body.time_limit, body.is_active, id]
        });

        return json({ message: 'Question updated' });
    }

    if (method === 'DELETE') {
        await db.execute({
            sql: `UPDATE questions SET is_active = FALSE WHERE id = ?`,
            args: [id]
        });
        return json({ message: 'Question deleted' });
    }

    return error('Method not allowed', 405);
}

// ============================================
// EXCEL GRID HELPERS
// ============================================

async function getQuestionGrid(db, questionId) {
    // Get grid definition
    const defResult = await db.execute({
        sql: `SELECT * FROM grid_definitions WHERE question_id = ?`,
        args: [questionId]
    });

    const columns = defResult.rows.length > 0 
        ? JSON.parse(defResult.rows[0].columns) 
        : ['Debet', 'Kredit'];

    // Get rows with cells
    const rowsResult = await db.execute({
        sql: `SELECT * FROM grid_rows WHERE question_id = ? ORDER BY row_order`,
        args: [questionId]
    });

    const rows = [];
    for (const row of rowsResult.rows) {
        const cellsResult = await db.execute({
            sql: `SELECT * FROM grid_cells WHERE row_id = ? ORDER BY column_index`,
            args: [row.id]
        });

        rows.push({
            id: row.id,
            label: row.label,
            accountNumber: row.account_number,
            type: row.row_type,
            cells: cellsResult.rows.map(cell => ({
                id: cell.id,
                columnIndex: cell.column_index,
                isReadonly: Boolean(cell.is_readonly),
                isInput: Boolean(cell.is_input),
                expectedValue: cell.expected_value,
                displayValue: cell.display_value,
                tolerance: cell.tolerance,
                format: cell.format
            }))
        });
    }

    return { columns, rows };
}

async function saveQuestionGrid(db, questionId, grid) {
    // Save grid definition
    await db.execute({
        sql: `INSERT OR REPLACE INTO grid_definitions (question_id, columns, settings)
              VALUES (?, ?, ?)`,
        args: [questionId, JSON.stringify(grid.columns || ['Debet', 'Kredit']), JSON.stringify(grid.settings || {})]
    });

    // Save rows and cells
    for (let i = 0; i < grid.rows.length; i++) {
        const row = grid.rows[i];
        const rowId = await db.execute({
            sql: `INSERT INTO grid_rows (question_id, account_number, label, row_order, row_type)
                  VALUES (?, ?, ?, ?, ?)
                  RETURNING id`,
            args: [questionId, row.accountNumber || row.account_number, row.label, i, row.type || 'account']
        });

        const newRowId = rowId.rows[0].id;

        // Save cells
        for (const cell of row.cells) {
            const cellId = cell.id || `${questionId}_${row.accountNumber || i}_${cell.columnIndex}`;
            await db.execute({
                sql: `INSERT INTO grid_cells (id, row_id, column_index, is_readonly, is_input, expected_value, display_value, tolerance, format)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [cellId, newRowId, cell.columnIndex, cell.isReadonly || false, cell.isInput !== false, 
                       cell.expectedValue, cell.displayValue, cell.tolerance || 0, cell.format || 'number']
            });
        }
    }
}

async function handleQuestionGrid(db, method, request, questionId) {
    if (method === 'GET') {
        const grid = await getQuestionGrid(db, questionId);
        return json(grid);
    }

    if (method === 'PUT') {
        const body = await request.json();
        
        // Delete existing grid data
        const rows = await db.execute({
            sql: `SELECT id FROM grid_rows WHERE question_id = ?`,
            args: [questionId]
        });
        
        for (const row of rows.rows) {
            await db.execute({
                sql: `DELETE FROM grid_cells WHERE row_id = ?`,
                args: [row.id]
            });
        }
        
        await db.execute({
            sql: `DELETE FROM grid_rows WHERE question_id = ?`,
            args: [questionId]
        });
        
        await db.execute({
            sql: `DELETE FROM grid_definitions WHERE question_id = ?`,
            args: [questionId]
        });

        // Save new grid
        await saveQuestionGrid(db, questionId, body);

        return json({ message: 'Grid updated' });
    }

    return error('Method not allowed', 405);
}

// ============================================
// MULTIPLE CHOICE HELPERS
// ============================================

async function getMcOptions(db, questionId) {
    const result = await db.execute({
        sql: `SELECT * FROM mc_options WHERE question_id = ? ORDER BY option_order`,
        args: [questionId]
    });
    return result.rows;
}

async function saveMcOptions(db, questionId, options) {
    for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        await db.execute({
            sql: `INSERT INTO mc_options (question_id, option_text, is_correct, option_order)
                  VALUES (?, ?, ?, ?)`,
            args: [questionId, opt.text || opt.option_text, opt.is_correct || opt.isCorrect || false, i]
        });
    }
}

// ============================================
// DRAG & DROP HELPERS
// ============================================

async function getDndData(db, questionId) {
    const items = await db.execute({
        sql: `SELECT * FROM dnd_items WHERE question_id = ? ORDER BY item_order`,
        args: [questionId]
    });

    const targets = await db.execute({
        sql: `SELECT * FROM dnd_targets WHERE question_id = ? ORDER BY target_order`,
        args: [questionId]
    });

    const solutions = await db.execute({
        sql: `SELECT * FROM dnd_solutions WHERE item_id IN 
              (SELECT id FROM dnd_items WHERE question_id = ?)`,
        args: [questionId]
    });

    return {
        items: items.rows,
        targets: targets.rows,
        solutions: solutions.rows
    };
}

async function saveDndData(db, questionId, dnd) {
    for (let i = 0; i < dnd.items.length; i++) {
        const item = dnd.items[i];
        const itemId = item.id || generateId('item');
        await db.execute({
            sql: `INSERT INTO dnd_items (id, question_id, item_text, item_order)
                  VALUES (?, ?, ?, ?)`,
            args: [itemId, questionId, item.text || item.item_text, i]
        });
    }

    for (let i = 0; i < dnd.targets.length; i++) {
        const target = dnd.targets[i];
        const targetId = target.id || generateId('target');
        await db.execute({
            sql: `INSERT INTO dnd_targets (id, question_id, label, target_order)
                  VALUES (?, ?, ?, ?)`,
            args: [targetId, questionId, target.label, i]
        });
    }

    if (dnd.solutions) {
        for (const sol of dnd.solutions) {
            await db.execute({
                sql: `INSERT INTO dnd_solutions (item_id, target_id) VALUES (?, ?)`,
                args: [sol.item_id, sol.target_id]
            });
        }
    }
}

// ============================================
// USERS
// ============================================

async function handleUsers(db, method, request) {
    if (method === 'POST') {
        const body = await request.json();
        const id = body.id || generateId('u');

        await db.execute({
            sql: `INSERT OR REPLACE INTO users (id, firebase_uid, email, name, role, school_id)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [id, body.firebase_uid, body.email, body.name, body.role || 'student', body.school_id]
        });

        return json({ id, message: 'User created/updated' }, 201);
    }

    return error('Method not allowed', 405);
}

async function handleUser(db, method, request, id) {
    if (method === 'GET') {
        // Check if id is firebase_uid or internal id
        const result = await db.execute({
            sql: `SELECT * FROM users WHERE id = ? OR firebase_uid = ?`,
            args: [id, id]
        });

        if (result.rows.length === 0) {
            return error('User not found', 404);
        }

        return json(result.rows[0]);
    }

    if (method === 'PUT') {
        const body = await request.json();
        
        await db.execute({
            sql: `UPDATE users SET 
                    name = COALESCE(?, name),
                    role = COALESCE(?, role),
                    school_id = COALESCE(?, school_id),
                    avatar_url = COALESCE(?, avatar_url),
                    preferences = COALESCE(?, preferences),
                    updated_at = CURRENT_TIMESTAMP
                  WHERE id = ? OR firebase_uid = ?`,
            args: [body.name, body.role, body.school_id, body.avatar_url, 
                   body.preferences ? JSON.stringify(body.preferences) : null, id, id]
        });

        return json({ message: 'User updated' });
    }

    return error('Method not allowed', 405);
}

// ============================================
// PROGRESS
// ============================================

async function handleProgress(db, method, request, url) {
    if (method === 'POST') {
        const body = await request.json();

        // Upsert progress
        await db.execute({
            sql: `INSERT INTO user_progress (user_id, question_id, is_correct, user_answer, points_earned, time_spent, hints_used)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(user_id, question_id) DO UPDATE SET
                    is_correct = excluded.is_correct,
                    user_answer = excluded.user_answer,
                    attempts = user_progress.attempts + 1,
                    points_earned = CASE WHEN excluded.is_correct THEN excluded.points_earned ELSE user_progress.points_earned END,
                    time_spent = excluded.time_spent,
                    hints_used = excluded.hints_used,
                    answered_at = CURRENT_TIMESTAMP`,
            args: [body.user_id, body.question_id, body.is_correct, body.user_answer, 
                   body.points_earned || 0, body.time_spent, body.hints_used || 0]
        });

        // Update leaderboard
        await updateLeaderboard(db, body.user_id, body.module_id, body.is_correct, body.points_earned || 0);

        // Check for achievements
        const achievements = await checkAchievements(db, body.user_id, body);

        return json({ message: 'Progress saved', achievements });
    }

    return error('Method not allowed', 405);
}

async function handleUserProgress(db, method, request, userId, url) {
    if (method === 'GET') {
        const moduleId = url.searchParams.get('module');

        let query = `
            SELECT up.*, q.title, q.module_id, q.type
            FROM user_progress up
            JOIN questions q ON up.question_id = q.id
            WHERE up.user_id = ?
        `;
        const params = [userId];

        if (moduleId) {
            query += ` AND q.module_id = ?`;
            params.push(moduleId);
        }

        query += ` ORDER BY up.answered_at DESC`;

        const result = await db.execute({ sql: query, args: params });

        // Also get stats
        const stats = await db.execute({
            sql: `SELECT 
                    COUNT(*) as total_questions,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
                    SUM(points_earned) as total_points,
                    AVG(time_spent) as avg_time
                  FROM user_progress WHERE user_id = ?`,
            args: [userId]
        });

        return json({
            progress: result.rows,
            stats: stats.rows[0]
        });
    }

    return error('Method not allowed', 405);
}

// ============================================
// CLASSROOMS
// ============================================

async function handleClassrooms(db, method, request, url) {
    if (method === 'GET') {
        const teacherId = url.searchParams.get('teacher');
        const userId = url.searchParams.get('user');

        if (teacherId) {
            const result = await db.execute({
                sql: `SELECT c.*, 
                        (SELECT COUNT(*) FROM classroom_members WHERE classroom_id = c.id) as member_count
                      FROM classrooms c WHERE c.teacher_id = ? AND c.is_active = TRUE`,
                args: [teacherId]
            });
            return json(result.rows);
        }

        if (userId) {
            const result = await db.execute({
                sql: `SELECT c.*, u.name as teacher_name
                      FROM classrooms c
                      JOIN classroom_members cm ON c.id = cm.classroom_id
                      JOIN users u ON c.teacher_id = u.id
                      WHERE cm.user_id = ? AND c.is_active = TRUE`,
                args: [userId]
            });
            return json(result.rows);
        }

        return error('Missing teacher or user parameter');
    }

    if (method === 'POST') {
        const body = await request.json();
        const id = generateId('class');
        const joinCode = generateCode(6);

        await db.execute({
            sql: `INSERT INTO classrooms (id, name, description, teacher_id, school_id, join_code)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [id, body.name, body.description, body.teacher_id, body.school_id, joinCode]
        });

        return json({ id, join_code: joinCode, message: 'Classroom created' }, 201);
    }

    return error('Method not allowed', 405);
}

async function handleClassroom(db, method, request, id) {
    if (method === 'GET') {
        const result = await db.execute({
            sql: `SELECT c.*, u.name as teacher_name, u.email as teacher_email
                  FROM classrooms c
                  JOIN users u ON c.teacher_id = u.id
                  WHERE c.id = ?`,
            args: [id]
        });

        if (result.rows.length === 0) {
            return error('Classroom not found', 404);
        }

        return json(result.rows[0]);
    }

    if (method === 'PUT') {
        const body = await request.json();
        
        await db.execute({
            sql: `UPDATE classrooms SET 
                    name = COALESCE(?, name),
                    description = COALESCE(?, description),
                    is_active = COALESCE(?, is_active),
                    settings = COALESCE(?, settings)
                  WHERE id = ?`,
            args: [body.name, body.description, body.is_active, 
                   body.settings ? JSON.stringify(body.settings) : null, id]
        });

        return json({ message: 'Classroom updated' });
    }

    if (method === 'DELETE') {
        await db.execute({
            sql: `UPDATE classrooms SET is_active = FALSE WHERE id = ?`,
            args: [id]
        });
        return json({ message: 'Classroom deleted' });
    }

    return error('Method not allowed', 405);
}

async function handleClassroomMembers(db, method, request, classroomId) {
    if (method === 'GET') {
        const result = await db.execute({
            sql: `SELECT u.id, u.name, u.email, u.avatar_url, cm.nickname, cm.joined_at,
                    (SELECT SUM(points_earned) FROM user_progress WHERE user_id = u.id) as total_points,
                    (SELECT COUNT(*) FROM user_progress WHERE user_id = u.id AND is_correct = TRUE) as correct_answers
                  FROM classroom_members cm
                  JOIN users u ON cm.user_id = u.id
                  WHERE cm.classroom_id = ?
                  ORDER BY cm.joined_at`,
            args: [classroomId]
        });

        return json(result.rows);
    }

    if (method === 'DELETE') {
        const body = await request.json();
        
        await db.execute({
            sql: `DELETE FROM classroom_members WHERE classroom_id = ? AND user_id = ?`,
            args: [classroomId, body.user_id]
        });

        return json({ message: 'Member removed' });
    }

    return error('Method not allowed', 405);
}

async function handleClassroomJoin(db, method, request, classroomId) {
    if (method !== 'POST') return error('Method not allowed', 405);

    const body = await request.json();

    // Check if classroom exists and is active
    const classroom = await db.execute({
        sql: `SELECT * FROM classrooms WHERE id = ? AND is_active = TRUE`,
        args: [classroomId]
    });

    if (classroom.rows.length === 0) {
        return error('Classroom not found', 404);
    }

    // Add member
    await db.execute({
        sql: `INSERT OR IGNORE INTO classroom_members (classroom_id, user_id, nickname)
              VALUES (?, ?, ?)`,
        args: [classroomId, body.user_id, body.nickname]
    });

    return json({ message: 'Joined classroom' });
}

async function handleJoinByCode(db, method, request) {
    if (method !== 'POST') return error('Method not allowed', 405);

    const body = await request.json();

    // Find classroom by code
    const classroom = await db.execute({
        sql: `SELECT * FROM classrooms WHERE join_code = ? AND is_active = TRUE`,
        args: [body.code]
    });

    if (classroom.rows.length === 0) {
        return error('Invalid join code', 404);
    }

    const classroomId = classroom.rows[0].id;

    // Add member
    await db.execute({
        sql: `INSERT OR IGNORE INTO classroom_members (classroom_id, user_id, nickname)
              VALUES (?, ?, ?)`,
        args: [classroomId, body.user_id, body.nickname]
    });

    return json({ 
        classroom_id: classroomId, 
        classroom_name: classroom.rows[0].name,
        message: 'Joined classroom' 
    });
}

// ============================================
// ASSIGNMENTS
// ============================================

async function handleAssignments(db, method, request, url) {
    if (method === 'GET') {
        const classroomId = url.searchParams.get('classroom');

        if (!classroomId) {
            return error('Missing classroom parameter');
        }

        const result = await db.execute({
            sql: `SELECT a.*, 
                    (SELECT COUNT(*) FROM assignment_questions WHERE assignment_id = a.id) as question_count
                  FROM assignments a
                  WHERE a.classroom_id = ? AND a.is_active = TRUE
                  ORDER BY a.due_date`,
            args: [classroomId]
        });

        return json(result.rows);
    }

    if (method === 'POST') {
        const body = await request.json();
        const id = generateId('assign');

        await db.execute({
            sql: `INSERT INTO assignments (id, classroom_id, title, description, module_id, due_date, time_limit, max_attempts)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [id, body.classroom_id, body.title, body.description, body.module_id, 
                   body.due_date, body.time_limit, body.max_attempts || 1]
        });

        // Add questions to assignment
        if (body.question_ids && body.question_ids.length > 0) {
            for (let i = 0; i < body.question_ids.length; i++) {
                await db.execute({
                    sql: `INSERT INTO assignment_questions (assignment_id, question_id, question_order)
                          VALUES (?, ?, ?)`,
                    args: [id, body.question_ids[i], i]
                });
            }
        }

        return json({ id, message: 'Assignment created' }, 201);
    }

    return error('Method not allowed', 405);
}

async function handleAssignment(db, method, request, id) {
    if (method === 'GET') {
        const result = await db.execute({
            sql: `SELECT * FROM assignments WHERE id = ?`,
            args: [id]
        });

        if (result.rows.length === 0) {
            return error('Assignment not found', 404);
        }

        const assignment = result.rows[0];

        // Get questions
        const questions = await db.execute({
            sql: `SELECT q.*, aq.question_order, aq.points_override,
                    qd.hints, qd.explanation
                  FROM assignment_questions aq
                  JOIN questions q ON aq.question_id = q.id
                  LEFT JOIN question_data qd ON q.id = qd.question_id
                  WHERE aq.assignment_id = ?
                  ORDER BY aq.question_order`,
            args: [id]
        });

        // Get grid data for grid questions
        const fullQuestions = [];
        for (const q of questions.rows) {
            const question = { ...q };
            if (q.hints) question.hints = JSON.parse(q.hints);
            
            if (q.type === 'excel_grid') {
                question.grid = await getQuestionGrid(db, q.id);
            } else if (q.type === 'mc') {
                question.options = await getMcOptions(db, q.id);
            }
            
            fullQuestions.push(question);
        }

        assignment.questions = fullQuestions;

        return json(assignment);
    }

    return error('Method not allowed', 405);
}

// ============================================
// DUELS
// ============================================

async function handleDuels(db, method, request, url) {
    if (method === 'GET') {
        const status = url.searchParams.get('status') || 'waiting';
        const userId = url.searchParams.get('user');

        let query = `SELECT d.*, 
                        u1.name as player1_name, u2.name as player2_name,
                        m.name as module_name
                     FROM duels d
                     JOIN users u1 ON d.player1_id = u1.id
                     LEFT JOIN users u2 ON d.player2_id = u2.id
                     LEFT JOIN modules m ON d.module_id = m.id
                     WHERE d.status = ?`;
        const params = [status];

        if (userId) {
            query += ` AND (d.player1_id = ? OR d.player2_id = ?)`;
            params.push(userId, userId);
        }

        query += ` ORDER BY d.created_at DESC LIMIT 50`;

        const result = await db.execute({ sql: query, args: params });
        return json(result.rows);
    }

    if (method === 'POST') {
        const body = await request.json();
        const id = generateId('duel');
        const joinCode = generateCode(6);

        await db.execute({
            sql: `INSERT INTO duels (id, player1_id, module_id, rounds_total, join_code)
                  VALUES (?, ?, ?, ?, ?)`,
            args: [id, body.player1_id, body.module_id, body.rounds || 5, joinCode]
        });

        return json({ id, join_code: joinCode, message: 'Duel created' }, 201);
    }

    return error('Method not allowed', 405);
}

async function handleDuel(db, method, request, id) {
    if (method === 'GET') {
        const result = await db.execute({
            sql: `SELECT d.*, 
                    u1.name as player1_name, u2.name as player2_name,
                    m.name as module_name
                  FROM duels d
                  JOIN users u1 ON d.player1_id = u1.id
                  LEFT JOIN users u2 ON d.player2_id = u2.id
                  LEFT JOIN modules m ON d.module_id = m.id
                  WHERE d.id = ?`,
            args: [id]
        });

        if (result.rows.length === 0) {
            return error('Duel not found', 404);
        }

        const duel = result.rows[0];

        // Get rounds
        const rounds = await db.execute({
            sql: `SELECT dr.*, q.title, q.question
                  FROM duel_rounds dr
                  JOIN questions q ON dr.question_id = q.id
                  WHERE dr.duel_id = ?
                  ORDER BY dr.round_number`,
            args: [id]
        });

        duel.rounds = rounds.rows;

        return json(duel);
    }

    if (method === 'PUT') {
        const body = await request.json();

        // Join duel
        if (body.action === 'join' && body.player2_id) {
            await db.execute({
                sql: `UPDATE duels SET player2_id = ?, status = 'active', started_at = CURRENT_TIMESTAMP
                      WHERE id = ? AND status = 'waiting'`,
                args: [body.player2_id, id]
            });

            // Generate rounds with random questions
            const duel = await db.execute({
                sql: `SELECT * FROM duels WHERE id = ?`,
                args: [id]
            });

            if (duel.rows.length > 0) {
                const moduleId = duel.rows[0].module_id;
                const roundsTotal = duel.rows[0].rounds_total;

                const questions = await db.execute({
                    sql: `SELECT id FROM questions 
                          WHERE module_id = ? AND is_active = TRUE
                          ORDER BY RANDOM() LIMIT ?`,
                    args: [moduleId, roundsTotal]
                });

                for (let i = 0; i < questions.rows.length; i++) {
                    await db.execute({
                        sql: `INSERT INTO duel_rounds (duel_id, round_number, question_id)
                              VALUES (?, ?, ?)`,
                        args: [id, i + 1, questions.rows[i].id]
                    });
                }
            }

            return json({ message: 'Joined duel' });
        }

        return error('Invalid action');
    }

    return error('Method not allowed', 405);
}

async function handleDuelAnswer(db, method, request, duelId) {
    if (method !== 'POST') return error('Method not allowed', 405);

    const body = await request.json();
    const { player_id, round_number, answer, time_ms } = body;

    // Get duel info
    const duel = await db.execute({
        sql: `SELECT * FROM duels WHERE id = ?`,
        args: [duelId]
    });

    if (duel.rows.length === 0) {
        return error('Duel not found', 404);
    }

    const isPlayer1 = duel.rows[0].player1_id === player_id;
    const playerColumn = isPlayer1 ? 'player1' : 'player2';

    // Get question and check answer
    const round = await db.execute({
        sql: `SELECT dr.*, s.correct_answer, s.tolerance
              FROM duel_rounds dr
              JOIN solutions s ON dr.question_id = s.question_id
              WHERE dr.duel_id = ? AND dr.round_number = ?`,
        args: [duelId, round_number]
    });

    if (round.rows.length === 0) {
        return error('Round not found', 404);
    }

    const correctAnswer = round.rows[0].correct_answer;
    const tolerance = round.rows[0].tolerance || 0;
    
    // Check if answer is correct
    let isCorrect = false;
    if (tolerance > 0) {
        const numAnswer = parseFloat(answer);
        const numCorrect = parseFloat(correctAnswer);
        isCorrect = Math.abs(numAnswer - numCorrect) <= tolerance;
    } else {
        isCorrect = answer.toString().toLowerCase() === correctAnswer.toString().toLowerCase();
    }

    // Update round
    await db.execute({
        sql: `UPDATE duel_rounds SET 
                ${playerColumn}_answer = ?,
                ${playerColumn}_correct = ?,
                ${playerColumn}_time = ?
              WHERE duel_id = ? AND round_number = ?`,
        args: [answer, isCorrect, time_ms, duelId, round_number]
    });

    // Update score
    if (isCorrect) {
        await db.execute({
            sql: `UPDATE duels SET ${playerColumn}_score = ${playerColumn}_score + 1 WHERE id = ?`,
            args: [duelId]
        });
    }

    // Check if both players answered - move to next round
    const updatedRound = await db.execute({
        sql: `SELECT * FROM duel_rounds WHERE duel_id = ? AND round_number = ?`,
        args: [duelId, round_number]
    });

    const roundData = updatedRound.rows[0];
    if (roundData.player1_answer !== null && roundData.player2_answer !== null) {
        // Both answered, update current round
        await db.execute({
            sql: `UPDATE duels SET current_round = ? WHERE id = ?`,
            args: [round_number, duelId]
        });

        // Check if duel is complete
        if (round_number >= duel.rows[0].rounds_total) {
            // Determine winner
            const finalDuel = await db.execute({
                sql: `SELECT * FROM duels WHERE id = ?`,
                args: [duelId]
            });
            
            const p1Score = finalDuel.rows[0].player1_score;
            const p2Score = finalDuel.rows[0].player2_score;
            const winnerId = p1Score > p2Score 
                ? finalDuel.rows[0].player1_id 
                : (p2Score > p1Score ? finalDuel.rows[0].player2_id : null);

            await db.execute({
                sql: `UPDATE duels SET status = 'completed', winner_id = ?, completed_at = CURRENT_TIMESTAMP
                      WHERE id = ?`,
                args: [winnerId, duelId]
            });
        }
    }

    return json({ is_correct: isCorrect, message: 'Answer recorded' });
}

// ============================================
// LIVE GAMES
// ============================================

async function handleLiveGames(db, method, request) {
    if (method === 'POST') {
        const body = await request.json();
        const id = generateId('game');
        const pinCode = generateCode(6);

        await db.execute({
            sql: `INSERT INTO live_games (id, host_id, classroom_id, title, pin_code)
                  VALUES (?, ?, ?, ?, ?)`,
            args: [id, body.host_id, body.classroom_id, body.title, pinCode]
        });

        // Add questions
        if (body.question_ids) {
            for (let i = 0; i < body.question_ids.length; i++) {
                await db.execute({
                    sql: `INSERT INTO live_game_questions (game_id, question_id, question_order, time_limit)
                          VALUES (?, ?, ?, ?)`,
                    args: [id, body.question_ids[i], i, body.time_limit || 30]
                });
            }
        }

        return json({ id, pin_code: pinCode, message: 'Game created' }, 201);
    }

    return error('Method not allowed', 405);
}

async function handleLiveGame(db, method, request, id) {
    if (method === 'GET') {
        const result = await db.execute({
            sql: `SELECT * FROM live_games WHERE id = ?`,
            args: [id]
        });

        if (result.rows.length === 0) {
            return error('Game not found', 404);
        }

        const game = result.rows[0];

        // Get players
        const players = await db.execute({
            sql: `SELECT * FROM live_game_players WHERE game_id = ? ORDER BY score DESC`,
            args: [id]
        });
        game.players = players.rows;

        // Get questions
        const questions = await db.execute({
            sql: `SELECT lgq.*, q.title, q.question, q.type
                  FROM live_game_questions lgq
                  JOIN questions q ON lgq.question_id = q.id
                  WHERE lgq.game_id = ?
                  ORDER BY lgq.question_order`,
            args: [id]
        });
        game.questions = questions.rows;

        return json(game);
    }

    if (method === 'PUT') {
        const body = await request.json();

        if (body.action === 'start') {
            await db.execute({
                sql: `UPDATE live_games SET status = 'active', started_at = CURRENT_TIMESTAMP WHERE id = ?`,
                args: [id]
            });
        } else if (body.action === 'next') {
            await db.execute({
                sql: `UPDATE live_games SET current_question = current_question + 1 WHERE id = ?`,
                args: [id]
            });
        } else if (body.action === 'pause') {
            await db.execute({
                sql: `UPDATE live_games SET status = 'paused' WHERE id = ?`,
                args: [id]
            });
        } else if (body.action === 'resume') {
            await db.execute({
                sql: `UPDATE live_games SET status = 'active' WHERE id = ?`,
                args: [id]
            });
        } else if (body.action === 'end') {
            await db.execute({
                sql: `UPDATE live_games SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`,
                args: [id]
            });
        }

        return json({ message: 'Game updated' });
    }

    return error('Method not allowed', 405);
}

async function handleLiveGameJoin(db, method, request) {
    if (method !== 'POST') return error('Method not allowed', 405);

    const body = await request.json();

    // Find game by PIN
    const game = await db.execute({
        sql: `SELECT * FROM live_games WHERE pin_code = ? AND status IN ('lobby', 'active')`,
        args: [body.pin]
    });

    if (game.rows.length === 0) {
        return error('Invalid game PIN', 404);
    }

    const gameId = game.rows[0].id;

    // Add player
    await db.execute({
        sql: `INSERT OR REPLACE INTO live_game_players (game_id, user_id, nickname)
              VALUES (?, ?, ?)`,
        args: [gameId, body.user_id, body.nickname]
    });

    return json({
        game_id: gameId,
        game_title: game.rows[0].title,
        message: 'Joined game'
    });
}

// ============================================
// LEADERBOARDS
// ============================================

async function handleGlobalLeaderboard(db, url) {
    const limit = parseInt(url.searchParams.get('limit')) || 100;

    const result = await db.execute({
        sql: `SELECT gl.*, u.name, u.avatar_url
              FROM global_leaderboard gl
              JOIN users u ON gl.user_id = u.id
              ORDER BY gl.total_points DESC
              LIMIT ?`,
        args: [limit]
    });

    return json(result.rows);
}

async function handleModuleLeaderboard(db, moduleId, url) {
    const limit = parseInt(url.searchParams.get('limit')) || 100;

    const result = await db.execute({
        sql: `SELECT l.*, u.name, u.avatar_url
              FROM leaderboards l
              JOIN users u ON l.user_id = u.id
              WHERE l.module_id = ?
              ORDER BY l.total_points DESC
              LIMIT ?`,
        args: [moduleId, limit]
    });

    return json(result.rows);
}

async function updateLeaderboard(db, userId, moduleId, isCorrect, points) {
    if (!moduleId) return;

    // Update module leaderboard
    await db.execute({
        sql: `INSERT INTO leaderboards (user_id, module_id, total_points, questions_answered, correct_answers, current_streak)
              VALUES (?, ?, ?, 1, ?, ?)
              ON CONFLICT(user_id, module_id) DO UPDATE SET
                total_points = leaderboards.total_points + ?,
                questions_answered = leaderboards.questions_answered + 1,
                correct_answers = leaderboards.correct_answers + ?,
                current_streak = CASE WHEN ? THEN leaderboards.current_streak + 1 ELSE 0 END,
                best_streak = MAX(leaderboards.best_streak, 
                    CASE WHEN ? THEN leaderboards.current_streak + 1 ELSE leaderboards.best_streak END),
                updated_at = CURRENT_TIMESTAMP`,
        args: [userId, moduleId, points, isCorrect ? 1 : 0, isCorrect ? 1 : 0,
               points, isCorrect ? 1 : 0, isCorrect, isCorrect]
    });

    // Update global leaderboard
    await db.execute({
        sql: `INSERT INTO global_leaderboard (user_id, total_points, total_questions, total_correct)
              VALUES (?, ?, 1, ?)
              ON CONFLICT(user_id) DO UPDATE SET
                total_points = global_leaderboard.total_points + ?,
                total_questions = global_leaderboard.total_questions + 1,
                total_correct = global_leaderboard.total_correct + ?,
                updated_at = CURRENT_TIMESTAMP`,
        args: [userId, points, isCorrect ? 1 : 0, points, isCorrect ? 1 : 0]
    });
}

// ============================================
// ACHIEVEMENTS
// ============================================

async function checkAchievements(db, userId, progressData) {
    const earned = [];

    // Get user's current stats
    const stats = await db.execute({
        sql: `SELECT 
                (SELECT COUNT(*) FROM user_progress WHERE user_id = ?) as total_answers,
                (SELECT SUM(points_earned) FROM user_progress WHERE user_id = ?) as total_points,
                (SELECT current_streak FROM leaderboards WHERE user_id = ? LIMIT 1) as current_streak
              `,
        args: [userId, userId, userId]
    });

    const userStats = stats.rows[0];

    // Get unearned achievements
    const achievements = await db.execute({
        sql: `SELECT * FROM achievements WHERE id NOT IN 
              (SELECT achievement_id FROM user_achievements WHERE user_id = ?)`,
        args: [userId]
    });

    for (const achievement of achievements.rows) {
        let earned_now = false;

        switch (achievement.requirement_type) {
            case 'count':
                if (achievement.category === 'special' && achievement.id === 'first_answer') {
                    earned_now = userStats.total_answers >= 1;
                } else if (achievement.category === 'points') {
                    earned_now = userStats.total_points >= achievement.requirement_value;
                }
                break;
            case 'streak':
                earned_now = userStats.current_streak >= achievement.requirement_value;
                break;
            case 'time':
                if (progressData.time_spent && progressData.is_correct) {
                    earned_now = progressData.time_spent <= achievement.requirement_value;
                }
                break;
        }

        if (earned_now) {
            await db.execute({
                sql: `INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`,
                args: [userId, achievement.id]
            });
            earned.push({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                points: achievement.points_reward
            });

            // Add achievement points
            if (achievement.points_reward > 0) {
                await db.execute({
                    sql: `UPDATE global_leaderboard SET 
                            total_points = total_points + ?,
                            achievements_count = achievements_count + 1
                          WHERE user_id = ?`,
                    args: [achievement.points_reward, userId]
                });
            }
        }
    }

    return earned;
}

// ============================================
// WIKI
// ============================================

async function handleWiki(db, method, request, url) {
    if (method === 'GET') {
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('q');

        let query = `SELECT id, title, category, tags FROM wiki_articles WHERE is_active = TRUE`;
        const params = [];

        if (category) {
            query += ` AND category = ?`;
            params.push(category);
        }

        if (search) {
            query += ` AND (title LIKE ? OR content LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ` ORDER BY title`;

        const result = await db.execute({ sql: query, args: params });

        // Parse tags
        const articles = result.rows.map(a => ({
            ...a,
            tags: a.tags ? JSON.parse(a.tags) : []
        }));

        return json(articles);
    }

    if (method === 'POST') {
        const body = await request.json();
        const id = body.id || generateId('wiki');

        await db.execute({
            sql: `INSERT INTO wiki_articles (id, title, content, category, tags, related_questions)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [id, body.title, body.content, body.category, 
                   JSON.stringify(body.tags || []), JSON.stringify(body.related_questions || [])]
        });

        return json({ id, message: 'Article created' }, 201);
    }

    return error('Method not allowed', 405);
}

async function handleWikiArticle(db, method, request, id) {
    if (method === 'GET') {
        const result = await db.execute({
            sql: `SELECT * FROM wiki_articles WHERE id = ?`,
            args: [id]
        });

        if (result.rows.length === 0) {
            return error('Article not found', 404);
        }

        // Increment view count
        await db.execute({
            sql: `UPDATE wiki_articles SET view_count = view_count + 1 WHERE id = ?`,
            args: [id]
        });

        const article = result.rows[0];
        if (article.tags) article.tags = JSON.parse(article.tags);
        if (article.related_questions) article.related_questions = JSON.parse(article.related_questions);

        return json(article);
    }

    return error('Method not allowed', 405);
}








