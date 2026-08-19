const APPROACHES = ['brute', 'better', 'optimized'];
const APPROACH_LABELS = {
    brute: 'Brute force',
    better: 'Better',
    optimized: 'Optimized'
};

function emptyApproaches() {
    return {
        brute: { done: false, code: '', timeComplexity: '', spaceComplexity: '', complexityExplanation: '', complexityCorrect: false, userTime: '', userSpace: '' },
        better: { done: false, code: '', timeComplexity: '', spaceComplexity: '', complexityExplanation: '', complexityCorrect: false, userTime: '', userSpace: '' },
        optimized: { done: false, code: '', timeComplexity: '', spaceComplexity: '', complexityExplanation: '', complexityCorrect: false, userTime: '', userSpace: '' }
    };
}

function normalizeApproaches(raw) {
    const base = emptyApproaches();
    if (!raw) return base;
    for (const key of APPROACHES) {
        const item = raw[key] || {};
        base[key] = {
            done: Boolean(item.done),
            code: item.code || '',
            completedAt: item.completedAt || null,
            timeComplexity: item.timeComplexity || '',
            spaceComplexity: item.spaceComplexity || '',
            complexityExplanation: item.complexityExplanation || '',
            complexityCorrect: Boolean(item.complexityCorrect),
            userTime: item.userTime || '',
            userSpace: item.userSpace || ''
        };
    }
    return base;
}

function nextApproach(progress) {
    if (progress.better && !progress.optimized) return 'optimized';
    if (progress.brute && !progress.better) return 'better';
    if (!progress.brute && !progress.better && !progress.optimized) return 'brute';
    if (!progress.optimized) return 'optimized';
    if (!progress.better) return 'better';
    if (!progress.brute) return 'brute';
    return null;
}

function progressFromApproaches(raw) {
    const approaches = normalizeApproaches(raw);
    const progress = {
        brute: approaches.brute.done,
        better: approaches.better.done,
        optimized: approaches.optimized.done
    };
    progress.doneCount = APPROACHES.filter(key => progress[key]).length;
    progress.next = nextApproach(progress);
    progress.complete = progress.doneCount === APPROACHES.length;
    return progress;
}

function codesFromApproaches(raw) {
    const approaches = normalizeApproaches(raw);
    return {
        brute: approaches.brute.code || '',
        better: approaches.better.code || '',
        optimized: approaches.optimized.code || ''
    };
}

function extractJson(text) {
    const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    try {
        return JSON.parse(cleaned);
    } catch (err) {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(cleaned.slice(start, end + 1));
            } catch (inner) {
                return null;
            }
        }
        return null;
    }
}

function parseCoachResponse(raw) {
    const text = String(raw || '').trim();
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== 'object') {
        return { status: 'needs_fix', approach: null, message: text || 'Try writing some code first.' };
    }
    const aliases = {
        brute: 'brute',
        'brute force': 'brute',
        bruteforce: 'brute',
        naive: 'brute',
        better: 'better',
        improved: 'better',
        optimized: 'optimized',
        optimised: 'optimized',
        optimal: 'optimized'
    };
    const failWords = ['needs_fix', 'error', 'incorrect', 'wrong', 'invalid', 'incomplete', 'none', 'null', ''];
    const message = parsed.hint || parsed.message || parsed.feedback || '';
    const rawApproach = String(
        parsed.classification || parsed.approach || parsed.type || ''
    ).toLowerCase().trim();
    const approach = aliases[rawApproach] || null;
    const statusRaw = String(parsed.status || '').toLowerCase().trim();

    if (failWords.includes(rawApproach) || statusRaw === 'needs_fix' || parsed.correct === false) {
        return { status: 'needs_fix', approach: null, message: message || 'Keep going — there is still something to fix.' };
    }

    const isCorrect = statusRaw === 'correct' || parsed.correct === true || Boolean(approach);
    return {
        status: isCorrect ? 'correct' : 'needs_fix',
        approach: isCorrect ? approach : null,
        message: message || (approach ? `This looks like a correct ${approach} approach.` : text),
        timeComplexity: String(parsed.timeComplexity || parsed.time || '').trim(),
        spaceComplexity: String(parsed.spaceComplexity || parsed.space || '').trim(),
        complexityExplanation: String(parsed.complexityExplanation || parsed.explanation || '').trim()
    };
}

function applyApproachMark(approaches, approach, code, extra = {}) {
    const next = normalizeApproaches(approaches);
    if (APPROACHES.includes(approach)) {
        next[approach].done = true;
        next[approach].code = code;
        next[approach].completedAt = new Date();
        if (extra.timeComplexity) next[approach].timeComplexity = extra.timeComplexity;
        if (extra.spaceComplexity) next[approach].spaceComplexity = extra.spaceComplexity;
        if (extra.complexityExplanation) next[approach].complexityExplanation = extra.complexityExplanation;
    }
    return next;
}

function pendingQuiz(approaches, preferKind) {
    const norm = normalizeApproaches(approaches);
    const pick = (preferKind && norm[preferKind] && norm[preferKind].done && !norm[preferKind].complexityCorrect)
        ? preferKind
        : APPROACHES.find(key => norm[key].done && !norm[key].complexityCorrect);
    if (!pick) return null;
    return {
        approach: pick,
        label: APPROACH_LABELS[pick],
        question: `This ${APPROACH_LABELS[pick]} approach is accepted. What is its time and space complexity?`
    };
}

function normalizeComplexity(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/theta|θ/g, 'o')
        .replace(/big-?o/g, 'o')
        .replace(/²/g, '2')
        .replace(/\^2/g, '2')
        .replace(/\*\*2/g, '2')
        .replace(/n\*n/g, 'n2');
}

function complexityMatches(expected, given) {
    const a = normalizeComplexity(expected);
    const b = normalizeComplexity(given);
    if (!a || !b) return false;
    return a === b || a.includes(b) || b.includes(a);
}

function gradeComplexity(approaches, kind, time, space) {
    const next = normalizeApproaches(approaches);
    if (!APPROACHES.includes(kind) || !next[kind].done) {
        return { ok: false, error: 'This approach is not accepted yet.' };
    }
    const rec = next[kind];
    const givenTime = String(time || '').trim();
    const givenSpace = String(space || '').trim();
    const timeOk = rec.timeComplexity
        ? complexityMatches(rec.timeComplexity, givenTime)
        : Boolean(givenTime);
    const spaceOk = rec.spaceComplexity
        ? complexityMatches(rec.spaceComplexity, givenSpace)
        : Boolean(givenSpace);
    const correct = timeOk && spaceOk;
    rec.userTime = givenTime;
    rec.userSpace = givenSpace;
    rec.complexityCorrect = correct;

    let explanation;
    if (correct) {
        explanation = rec.complexityExplanation
            || `Correct. Time ${rec.timeComplexity || givenTime}, space ${rec.spaceComplexity || givenSpace}.`;
    } else {
        const why = rec.complexityExplanation
            || 'Count nested loops for time. Extra arrays, hash maps, and recursion depth count as space.';
        explanation = rec.timeComplexity && rec.spaceComplexity
            ? `Not quite. This ${APPROACH_LABELS[kind]} approach is ${rec.timeComplexity} time and ${rec.spaceComplexity} space. ${why}`
            : why;
    }

    return {
        ok: true,
        approaches: next,
        quizResult: {
            correct,
            approach: kind,
            label: APPROACH_LABELS[kind],
            time: givenTime,
            space: givenSpace,
            explanation
        }
    };
}

function summarizeUserProgress(user, questions, categories) {
    const solvedIds = new Set((user.catQ || []).map(id => String(id)));
    const subMap = new Map();
    for (const sub of user.submissions || []) {
        if (sub.questionId) subMap.set(String(sub.questionId), sub);
    }

    const catStats = {};
    for (const cat of categories) {
        catStats[cat.slug] = {
            slug: cat.slug,
            name: cat.name,
            icon: cat.icon,
            blurb: cat.blurb,
            count: 0,
            solved: 0
        };
    }

    let brute = 0;
    let better = 0;
    let optimized = 0;
    let inProgress = 0;
    const recent = [];

    for (const q of questions) {
        const qid = q._id.toString();
        if (catStats[q.category]) catStats[q.category].count += 1;
        if (solvedIds.has(qid) && catStats[q.category]) catStats[q.category].solved += 1;

        const sub = subMap.get(qid);
        if (!sub) continue;
        const progress = progressFromApproaches(sub.approaches);
        if (progress.brute) brute += 1;
        if (progress.better) better += 1;
        if (progress.optimized) optimized += 1;
        if (progress.doneCount > 0 && !progress.complete) inProgress += 1;
        if (progress.doneCount > 0 || (sub.storedCode && sub.storedCode.trim())) {
            recent.push({
                id: qid,
                title: q.title,
                category: q.category,
                progress,
                submittedAt: sub.submittedAt
            });
        }
    }

    recent.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

    const solvedCount = questions.filter(q => solvedIds.has(q._id.toString())).length;
    return {
        solvedCount,
        totalQuestions: questions.length,
        brute,
        better,
        optimized,
        inProgress,
        recent: recent.slice(0, 8),
        categories: Object.values(catStats)
    };
}

module.exports = {
    APPROACHES,
    APPROACH_LABELS,
    emptyApproaches,
    normalizeApproaches,
    nextApproach,
    progressFromApproaches,
    codesFromApproaches,
    parseCoachResponse,
    applyApproachMark,
    pendingQuiz,
    complexityMatches,
    gradeComplexity,
    summarizeUserProgress
};
