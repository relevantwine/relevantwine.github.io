// A tiny Satisfying Circles toy: rings with gaps spin around a bouncing ball.
// Hold the left half to push the inner ring forward, the right half to send it back,
// like the game. The ball escapes through the inner ring's gap, the ring pops and a new one
// is added outside. Purely decorative: no score, no saving.
(function () {
    const rings = document.getElementById('toy-rings');
    const ball = document.getElementById('toy-ball');
    if (!rings || !ball) return;
    const stage = rings.closest('.toy-stage');
    const NS = 'http://www.w3.org/2000/svg';
    const COLORS = ['#3be8ff', '#ff4fb0', '#5cf27f', '#ff9d3b', '#b77bff'];
    const GAP = 0.6;          // gap size in radians
    const STEP = 12;          // radius step between rings
    const INNER = 22;         // radius of the inner ring
    const COUNT = 6;
    const BALL_R = 4;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let list = [];
    let colorIndex = 0;
    let hold = 0;             // +1 forward, -1 backward, 0 none
    let bx = 0, by = 0, vx = 38, vy = -27;

    function makeRing(r, angle, speed) {
        const el = document.createElementNS(NS, 'circle');
        el.setAttribute('class', 'ring');
        el.setAttribute('r', r);
        const color = COLORS[colorIndex++ % COLORS.length];
        el.setAttribute('stroke', color);
        el.style.filter = 'drop-shadow(0 0 2.5px ' + color + ')';
        const c = 2 * Math.PI * r;
        el.setAttribute('stroke-dasharray', (c * (1 - GAP / (2 * Math.PI))).toFixed(2) + ' ' + c.toFixed(2));
        rings.appendChild(el);
        return { el, r, target: r, angle, speed, opacity: 1 };
    }

    for (let i = 0; i < COUNT; i++) {
        list.push(makeRing(INNER + i * STEP, Math.random() * 6.28, (i % 2 ? -1 : 1) * (0.5 + 0.12 * i)));
    }

    function draw() {
        for (const g of list) {
            g.el.setAttribute('r', g.r.toFixed(2));
            const c = 2 * Math.PI * g.r;
            g.el.setAttribute('stroke-dasharray', (c * (1 - GAP / (2 * Math.PI))).toFixed(2) + ' ' + c.toFixed(2));
            // the dash starts at angle 0, so the gap ends at `angle` and starts at `angle - GAP`
            g.el.setAttribute('transform', 'rotate(' + (g.angle * 180 / Math.PI).toFixed(2) + ')');
            g.el.style.opacity = g.opacity;
        }
        ball.setAttribute('cx', bx.toFixed(2));
        ball.setAttribute('cy', by.toFixed(2));
    }

    function angleDiff(a, b) {
        let d = (a - b) % (2 * Math.PI);
        if (d < 0) d += 2 * Math.PI;
        return d;
    }

    function step(dt) {
        const inner = list[0];
        for (let i = 0; i < list.length; i++) {
            const g = list[i];
            let s = g.speed;
            if (i === 0 && hold) s = hold * 4.2;
            g.angle += s * dt;
            g.r += (g.target - g.r) * Math.min(1, dt * 6);
        }

        bx += vx * dt; by += vy * dt;
        const d = Math.hypot(bx, by);
        const limit = inner.r - BALL_R - 2;
        if (d > limit) {
            const a = Math.atan2(by, bx);
            // inside the gap? (the gap is the arc from angle - GAP to angle, with a margin for the ball)
            const inGap = angleDiff(inner.angle - 0.08, a) < GAP - 0.16;
            if (inGap) {
                pop();
            } else {
                const nx = bx / d, ny = by / d;
                const dot = vx * nx + vy * ny;
                if (dot > 0) { vx -= 2 * dot * nx; vy -= 2 * dot * ny; }
                // a little spin from the ring keeps the path from repeating
                const t = 0.18 * (Math.random() - 0.5);
                const c = Math.cos(t), s = Math.sin(t);
                [vx, vy] = [vx * c - vy * s, vx * s + vy * c];
                bx = nx * limit; by = ny * limit;
            }
        }
    }

    function pop() {
        const gone = list.shift();
        gone.el.remove();
        for (let i = 0; i < list.length; i++) list[i].target = INNER + i * STEP;
        const last = list[list.length - 1];
        const fresh = makeRing(last.target + STEP + 10, Math.random() * 6.28, -Math.sign(last.speed) * (0.5 + 0.12 * (COUNT - 1)));
        fresh.target = INNER + list.length * STEP;
        fresh.opacity = 1;
        list.push(fresh);
        // bring the ball back to the middle area of the new inner ring
        const k = (list[0].target - BALL_R - 4) / Math.max(1, Math.hypot(bx, by));
        if (k < 1) { bx *= k; by *= k; }
        vx = -vx; vy = -vy;
    }

    draw();
    if (reduce) return;

    let last = 0, visible = true, raf = 0;
    function frame(t) {
        const dt = Math.min(0.033, (t - last) / 1000 || 0);
        last = t;
        step(dt);
        draw();
        raf = visible ? requestAnimationFrame(frame) : 0;
    }
    raf = requestAnimationFrame(frame);

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
        }).observe(stage);
    }

    // Controls: hold a half (pointer or keyboard)
    stage.querySelectorAll('.toy-half').forEach(function (btn) {
        const dir = Number(btn.dataset.dir);
        const down = function (e) {
            hold = dir; btn.classList.add('is-down');
            if (e.pointerId !== undefined && btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
        };
        const up = function () { if (hold === dir) hold = 0; btn.classList.remove('is-down'); };
        btn.addEventListener('pointerdown', down);
        btn.addEventListener('pointerup', up);
        btn.addEventListener('pointercancel', up);
        btn.addEventListener('lostpointercapture', up);
        btn.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); down(e); } });
        btn.addEventListener('keyup', up);
        btn.addEventListener('blur', up);
        btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    });
})();
