/**
 * AccountingQuest - Excel Export Module
 * Eksporterer spillresultater til Excel-format
 * 
 * Bruker SheetJS (xlsx) biblioteket
 * CDN: https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js
 */

var ExcelExport = (function() {
    
    /**
     * Eksporter spillresultater til Excel
     * @param {object} gameData - Data fra Firebase game_results
     * @param {string} filename - Filnavn uten .xlsx
     */
    function exportGameResults(gameData, filename) {
        if (typeof XLSX === 'undefined') {
            alert('Excel-biblioteket er ikke lastet. Prøv igjen.');
            loadXLSX().then(function() {
                exportGameResults(gameData, filename);
            });
            return;
        }

        var wb = XLSX.utils.book_new();

        // === Ark 1: Oversikt ===
        var overviewData = [
            ['AccountingQuest - Spillresultater'],
            [],
            ['Quiz:', gameData.quiz.title],
            ['Dato:', new Date(gameData.completedAt).toLocaleDateString('nb-NO')],
            ['Tidspunkt:', new Date(gameData.completedAt).toLocaleTimeString('nb-NO')],
            ['Antall spørsmål:', gameData.quiz.questions.length],
            ['Antall spillere:', Object.keys(gameData.players).length],
            [],
            ['=== RESULTATLISTE ==='],
            ['Plassering', 'Navn', 'Poeng', 'Riktige svar', 'Nøyaktighet']
        ];

        // Sorter spillere etter poeng
        var sortedPlayers = Object.entries(gameData.players)
            .map(function(entry) { return { id: entry[0], ...entry[1] }; })
            .sort(function(a, b) { return (b.score || 0) - (a.score || 0); });

        sortedPlayers.forEach(function(player, index) {
            var correctCount = player.correctCount || 0;
            var totalQuestions = gameData.quiz.questions.length;
            var accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            
            overviewData.push([
                index + 1,
                player.name,
                player.score || 0,
                correctCount + ' / ' + totalQuestions,
                accuracy + '%'
            ]);
        });

        var wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
        
        // Sett kolonnebredder
        wsOverview['!cols'] = [
            { wch: 12 }, // Plassering
            { wch: 25 }, // Navn
            { wch: 10 }, // Poeng
            { wch: 15 }, // Riktige
            { wch: 12 }  // Nøyaktighet
        ];

        XLSX.utils.book_append_sheet(wb, wsOverview, 'Oversikt');

        // === Ark 2: Detaljerte svar ===
        var detailData = [
            ['Detaljerte svar per spørsmål'],
            [],
            ['Spørsmål #', 'Spørsmålstekst', 'Type', 'Riktig svar'].concat(
                sortedPlayers.map(function(p) { return p.name; })
            )
        ];

        gameData.quiz.questions.forEach(function(question, qIndex) {
            var row = [
                qIndex + 1,
                question.text,
                getTypeLabel(question.type),
                getCorrectAnswer(question)
            ];

            // Legg til hver spillers svar
            sortedPlayers.forEach(function(player) {
                var answer = findPlayerAnswer(gameData.answers, player.id, qIndex);
                row.push(formatAnswer(answer, question));
            });

            detailData.push(row);
        });

        var wsDetail = XLSX.utils.aoa_to_sheet(detailData);
        
        // Dynamisk kolonnebredde
        var cols = [
            { wch: 12 },  // Spørsmål #
            { wch: 50 },  // Tekst
            { wch: 15 },  // Type
            { wch: 20 }   // Riktig svar
        ];
        sortedPlayers.forEach(function() {
            cols.push({ wch: 15 });
        });
        wsDetail['!cols'] = cols;

        XLSX.utils.book_append_sheet(wb, wsDetail, 'Detaljer');

        // === Ark 3: Statistikk ===
        var statsData = [
            ['Statistikk'],
            [],
            ['Gjennomsnittlig poengsum:', calculateAverage(sortedPlayers, 'score')],
            ['Høyeste poengsum:', Math.max(...sortedPlayers.map(function(p) { return p.score || 0; }))],
            ['Laveste poengsum:', Math.min(...sortedPlayers.map(function(p) { return p.score || 0; }))],
            [],
            ['=== Per spørsmål ==='],
            ['Spørsmål #', 'Antall riktige', 'Prosent riktige']
        ];

        gameData.quiz.questions.forEach(function(question, qIndex) {
            var correctCount = countCorrectAnswers(gameData.answers, sortedPlayers, qIndex, question);
            var percent = sortedPlayers.length > 0 
                ? Math.round((correctCount / sortedPlayers.length) * 100) 
                : 0;
            
            statsData.push([qIndex + 1, correctCount, percent + '%']);
        });

        var wsStats = XLSX.utils.aoa_to_sheet(statsData);
        wsStats['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsStats, 'Statistikk');

        // === Last ned filen ===
        var finalFilename = (filename || 'spillresultater') + '_' + 
            new Date().toISOString().split('T')[0] + '.xlsx';
        
        XLSX.writeFile(wb, finalFilename);
        
        return finalFilename;
    }

    /**
     * Eksporter quiz til Excel (for redigering/backup)
     */
    function exportQuiz(quiz, filename) {
        if (typeof XLSX === 'undefined') {
            loadXLSX().then(function() {
                exportQuiz(quiz, filename);
            });
            return;
        }

        var wb = XLSX.utils.book_new();

        // Quiz info
        var infoData = [
            ['Quiz Eksport'],
            [],
            ['Tittel:', quiz.title],
            ['Beskrivelse:', quiz.description || ''],
            ['Kategori:', quiz.category || ''],
            ['Språk:', quiz.language || 'no'],
            ['Tid per spørsmål:', quiz.timePerQuestion || 30],
            ['Antall spørsmål:', quiz.questions.length]
        ];

        var wsInfo = XLSX.utils.aoa_to_sheet(infoData);
        XLSX.utils.book_append_sheet(wb, wsInfo, 'Info');

        // Spørsmål
        var questionsData = [
            ['#', 'Type', 'Tekst', 'Vanskelighetsgrad', 'Poeng', 'Lovhenvisning', 
             'Alternativ A', 'Alternativ B', 'Alternativ C', 'Alternativ D', 'Riktig svar']
        ];

        quiz.questions.forEach(function(q, i) {
            var options = q.options || q.answers || [];
            var row = [
                i + 1,
                q.type || 'multiple_choice',
                q.text,
                q.difficulty || 'medium',
                q.points || 200,
                q.lawReference || ''
            ];

            // Legg til alternativer
            for (var j = 0; j < 4; j++) {
                if (options[j]) {
                    row.push(typeof options[j] === 'object' ? options[j].text : options[j]);
                } else {
                    row.push('');
                }
            }

            // Riktig svar
            row.push(getCorrectAnswer(q));

            questionsData.push(row);
        });

        var wsQuestions = XLSX.utils.aoa_to_sheet(questionsData);
        wsQuestions['!cols'] = [
            { wch: 5 },   // #
            { wch: 15 },  // Type
            { wch: 50 },  // Tekst
            { wch: 15 },  // Vanskelighetsgrad
            { wch: 8 },   // Poeng
            { wch: 20 },  // Lovhenvisning
            { wch: 25 },  // A
            { wch: 25 },  // B
            { wch: 25 },  // C
            { wch: 25 },  // D
            { wch: 15 }   // Riktig
        ];
        XLSX.utils.book_append_sheet(wb, wsQuestions, 'Spørsmål');

        var finalFilename = (filename || quiz.title || 'quiz') + '.xlsx';
        XLSX.writeFile(wb, finalFilename);
        
        return finalFilename;
    }

    /**
     * Eksporter leaderboard
     */
    function exportLeaderboard(players, title, filename) {
        if (typeof XLSX === 'undefined') {
            loadXLSX().then(function() {
                exportLeaderboard(players, title, filename);
            });
            return;
        }

        var wb = XLSX.utils.book_new();

        var data = [
            [title || 'Leaderboard'],
            ['Eksportert:', new Date().toLocaleString('nb-NO')],
            [],
            ['Plassering', 'Navn', 'Poeng', 'Riktige svar']
        ];

        players.forEach(function(player, index) {
            data.push([
                index + 1,
                player.name,
                player.score || 0,
                player.correctCount || 0
            ]);
        });

        var ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Leaderboard');

        var finalFilename = (filename || 'leaderboard') + '.xlsx';
        XLSX.writeFile(wb, finalFilename);
        
        return finalFilename;
    }

    // === Hjelpefunksjoner ===

    function loadXLSX() {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function getTypeLabel(type) {
        var labels = {
            multiple_choice: 'Flervalg',
            multiple_select: 'Velg flere',
            true_false: 'Sant/Usant',
            paragraph: 'Paragraf',
            drag_drop: 'Dra & Slipp',
            bokforing: 'Bokføring',
            analyse: 'Analyse'
        };
        return labels[type] || type || 'Ukjent';
    }

    function getCorrectAnswer(question) {
        var type = question.type || 'multiple_choice';
        
        switch(type) {
            case 'multiple_choice':
                var options = question.options || question.answers || [];
                if (question.correct !== undefined) {
                    return options[question.correct] || '';
                }
                var correct = options.find(function(o) { 
                    return typeof o === 'object' && o.correct; 
                });
                return correct ? correct.text : '';
                
            case 'true_false':
                return question.correctAnswer ? 'Sant' : 'Usant';
                
            case 'paragraph':
                return question.keywords || '';
                
            case 'analyse':
                return question.expectedAnswer || '';
                
            default:
                return '';
        }
    }

    function findPlayerAnswer(answers, oderId, questionIndex) {
        if (!answers) return null;
        
        var playerAnswers = Object.values(answers).filter(function(a) {
            return a.oderId === oderId || 
                   (answers[oderId] && answers[oderId].questionIndex === questionIndex);
        });
        
        // Finn svar for dette spørsmålet
        for (var oderId in answers) {
            var answer = answers[oderId];
            if (answer.questionIndex === questionIndex) {
                return answer;
            }
        }
        return null;
    }

    function formatAnswer(answer, question) {
        if (!answer) return '-';
        
        var type = question.type || 'multiple_choice';
        var value = answer.answer;
        
        switch(type) {
            case 'multiple_choice':
                var options = question.options || question.answers || [];
                return options[value] || value;
                
            case 'true_false':
                return value ? 'Sant' : 'Usant';
                
            case 'multiple_select':
                if (Array.isArray(value)) {
                    return value.join(', ');
                }
                return value;
                
            default:
                return typeof value === 'object' ? JSON.stringify(value) : value;
        }
    }

    function calculateAverage(players, field) {
        if (players.length === 0) return 0;
        var sum = players.reduce(function(acc, p) { return acc + (p[field] || 0); }, 0);
        return Math.round(sum / players.length);
    }

    function countCorrectAnswers(answers, players, questionIndex, question) {
        var count = 0;
        var correctAnswer = getCorrectAnswerValue(question);
        
        players.forEach(function(player) {
            var answer = findPlayerAnswer(answers, player.id, questionIndex);
            if (answer && isAnswerCorrect(answer.answer, correctAnswer, question.type)) {
                count++;
            }
        });
        
        return count;
    }

    function getCorrectAnswerValue(question) {
        var type = question.type || 'multiple_choice';
        
        switch(type) {
            case 'multiple_choice':
                if (question.correct !== undefined) return question.correct;
                var options = question.options || [];
                return options.findIndex(function(o) { 
                    return typeof o === 'object' && o.correct; 
                });
                
            case 'true_false':
                return question.correctAnswer;
                
            default:
                return null;
        }
    }

    function isAnswerCorrect(answer, correctAnswer, type) {
        if (correctAnswer === null || correctAnswer === undefined) return false;
        
        switch(type) {
            case 'multiple_choice':
            case 'true_false':
                return answer === correctAnswer;
                
            case 'multiple_select':
                if (!Array.isArray(answer) || !Array.isArray(correctAnswer)) return false;
                return JSON.stringify(answer.sort()) === JSON.stringify(correctAnswer.sort());
                
            default:
                return false;
        }
    }

    // Public API
    return {
        exportGameResults: exportGameResults,
        exportQuiz: exportQuiz,
        exportLeaderboard: exportLeaderboard,
        loadXLSX: loadXLSX
    };
})();
