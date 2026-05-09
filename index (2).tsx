import { useEffect, useMemo, useRef, useState } from "react";

export default function GoalTrackerApp() {
  const [theme, setTheme] = useState("rgb");
  const [goals, setGoals] = useState([]);
  const [view, setView] = useState("home");
  const [showAdd, setShowAdd] = useState(false);
  const [showMoneyAdd, setShowMoneyAdd] = useState(false);

  const [moneyEntries, setMoneyEntries] = useState([]);
  const [moneyGoal, setMoneyGoal] = useState(10000);
  const [moneyInput, setMoneyInput] = useState("");

  const [email, setEmail] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: "",
    deadline: "",
    duration: "1 day",
    tasks: ["", "", ""],
  });

  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  // PARTICLES
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particles = [];
    const count = 70;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          p.x -= dx * 0.002;
          p.y -= dy * 0.002;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const move = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // THEMES
  const themes = {
    rgb: "from-pink-500 via-cyan-400 to-purple-500",
    cyan: "from-cyan-400 to-blue-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-400 to-emerald-500",
    red: "from-red-500 to-orange-500",
    rainbow: "from-red-500 via-yellow-400 via-green-400 via-blue-500 to-purple-500",
  };

  const gradient = themes[theme] || themes.rgb;

  // TASKS
  const updateTask = (i, value) => {
    const copy = [...newGoal.tasks];
    copy[i] = value;
    setNewGoal({ ...newGoal, tasks: copy });
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.deadline) return;
    if (newGoal.tasks.some((t) => !t.trim())) return;

    setGoals([
      ...goals,
      {
        ...newGoal,
        tasks: newGoal.tasks.map((t) => ({ text: t, done: false })),
      },
    ]);

    setNewGoal({ title: "", deadline: "", duration: "1 day", tasks: ["", "", ""] });
    setShowAdd(false);
  };

  const toggleTask = (gi, ti) => {
    const copy = [...goals];
    copy[gi].tasks[ti].done = !copy[gi].tasks[ti].done;
    setGoals(copy);
  };

  // PROGRESS
  const weekProgress = useMemo(() => {
    let total = 0;
    let done = 0;

    goals.forEach((g) => {
      g.tasks.forEach((t) => {
        total++;
        if (t.done) done++;
      });
    });

    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [goals]);

  // STRESS SYSTEM
  const stress = useMemo(() => {
    const base = 100 - weekProgress;
    const curve = Math.abs(weekProgress - 70);
    return Math.max(5, Math.min(100, base * 0.6 + curve * 0.4));
  }, [weekProgress]);

  const glassBlur = useMemo(() => {
    return Math.max(6, 22 - stress * 0.15);
  }, [stress]);

  const glassStyle = {
    backdropFilter: `blur(${glassBlur}px)`,
    WebkitBackdropFilter: `blur(${glassBlur}px)`,
  };

  // RANK
  const rank = useMemo(() => {
    if (weekProgress < 20) return "BRONZE";
    if (weekProgress < 40) return "SILVER";
    if (weekProgress < 60) return "GOLD";
    if (weekProgress < 80) return "PLATINUM";
    return "DIAMOND";
  }, [weekProgress]);

  const rankColor = {
    BRONZE: "text-orange-400",
    SILVER: "text-zinc-300",
    GOLD: "text-yellow-400",
    PLATINUM: "text-cyan-300",
    DIAMOND: "text-purple-400",
  };

  const coachMessage = useMemo(() => {
    if (goals.length === 0) return "Add your first goal.";
    if (stress > 70) return "High pressure detected. Focus on 1 task.";
    if (weekProgress < 20) return "Start small.";
    if (weekProgress < 60) return "Build consistency.";
    return "Elite performance.";
  }, [weekProgress, goals.length, stress]);

  // CHART
  const chartData = useMemo(() => {
    if (goals.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    const target = weekProgress;
    const values = [];

    let current = Math.max(5, target * 0.35);

    for (let i = 0; i < 12; i++) {
      const volatility = (Math.random() - 0.5) * 35;
      const correction = (target - current) * 0.18;
      const spike = Math.random() > 0.82
        ? (Math.random() - 0.5) * 45
        : 0;

      current += volatility + correction + spike;
      current = Math.max(0, Math.min(100, current));
      values.push(current);
    }

    values[values.length - 1] = target;

    return values;
  }, [weekProgress, goals]);

  const animatedChart = useRef(chartData);
  const [, rerender] = useState(0);

  useEffect(() => {
    let frame;

    const animate = () => {
      animatedChart.current = animatedChart.current.map((v, i) => {
        const target = chartData[i] ?? v;
        return v + (target - v) * 0.08;
      });

      rerender(t => t + 1);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [chartData]);

  const points = animatedChart.current.map((v, i) => ({
    x: i * 22,
    y: 100 - v,
  }));

  const path = points.reduce((acc, point, i) => {
    return acc + `${i === 0 ? "M" : "L"} ${point.x} ${point.y} `;
  }, "");

  const navBtn = (label, v) => (
    <button onClick={() => setView(v)} className={`px-3 py-1 text-xs rounded-lg border ${view === v ? "border-white text-white" : "border-zinc-600 text-zinc-300"}`}>
      {label}
    </button>
  );

  const totalTasks = goals.reduce((a, g) => a + g.tasks.length, 0);
  const completedTasks = goals.reduce((a, g) => a + g.tasks.filter(t => t.done).length, 0);

  // MONEY SYSTEM
  const totalMoney = moneyEntries.reduce((a, b) => a + b.amount, 0);

  const moneyProgress = Math.min(
    100,
    Math.round((totalMoney / moneyGoal) * 100)
  );

  const addMoneyEntry = () => {
    const value = parseFloat(moneyInput);

    if (isNaN(value) || value <= 0) return;

    setMoneyEntries([
      ...moneyEntries,
      {
        amount: value,
        date: new Date().toLocaleDateString(),
      },
    ]);

    setMoneyInput("");
    setShowMoneyAdd(false);
  };

  // MONEY CHART
  const moneyChartData = useMemo(() => {
    if (moneyEntries.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    const values = [];
    let current = 10;

    for (let i = 0; i < 10; i++) {
      const volatility = (Math.random() - 0.45) * 22;
      const pull = ((moneyProgress) - current) * 0.15;

      current += volatility + pull;
      current = Math.max(0, Math.min(100, current));
      values.push(current);
    }

    values[values.length - 1] = moneyProgress;

    return values;
  }, [moneyEntries, moneyProgress]);

  const animatedMoneyChart = useRef(moneyChartData);

  useEffect(() => {
    let frame;

    const animate = () => {
      animatedMoneyChart.current = animatedMoneyChart.current.map((v, i) => {
        const target = moneyChartData[i] ?? v;
        return v + (target - v) * 0.08;
      });

      rerender(t => t + 1);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [moneyChartData]);

  const moneyPoints = animatedMoneyChart.current.map((v, i) => ({
    x: i * 24,
    y: 100 - v,
  }));

  const moneyPath = moneyPoints.reduce((acc, point, i) => {
    return acc + `${i === 0 ? "M" : "L"} ${point.x} ${point.y} `;
  }, "");

  const createAccount = () => {
    if (!email.includes("@")) return;
    setAccountCreated(true);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      <canvas ref={canvasRef} className="fixed inset-0 z-0" />

      <div className="relative z-10 p-3 max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h1 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>GOAL SYSTEM</h1>

          <div className="flex gap-2">
            {navBtn("Home", "home")}
            {navBtn("Profile", "profile")}
            {navBtn("Settings", "settings")}
          </div>
        </div>

        {/* HOME */}
        {view === "home" && (
          <>
            <div className="mb-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800" style={glassStyle}>
              AI Coach: {coachMessage}
            </div>

            <div className="mb-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800" style={glassStyle}>
              Rank: <span className={rankColor[rank]}>{rank}</span>
            </div>





            {/* MONEY WALLET */}
            <div className="mb-3 rounded-2xl border border-emerald-500/20 overflow-hidden" style={glassStyle}>

              {/* Two-column layout */}
              <div className="grid grid-cols-2">

                {/* LEFT — Wallet + Goal amounts in one box + green money chart */}
                <div className="p-3 bg-zinc-900/60 border-r border-emerald-500/20">
                  <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 p-2 mb-3">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <div className="text-[10px] text-zinc-400 mb-0.5">Wallet</div>
                        <div className="text-xl font-black text-emerald-400 leading-none">
                          ${totalMoney.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-400 mb-0.5">Goal</div>
                        <div className="text-xl font-black text-white leading-none">
                          ${moneyGoal.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 mb-1">Money Chart</div>
                  <svg width="100%" height="75" viewBox="0 0 240 100">
                    <path
                      d={moneyPath}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={`${moneyPath} L 240 100 L 0 100 Z`}
                      fill="rgba(52,211,153,0.08)"
                    />
                  </svg>
                </div>

                {/* RIGHT — Progress % + blue goal chart */}
                <div className="p-3 bg-zinc-900/60 flex flex-col gap-3">
                  <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 p-2">
                    <div className="text-[10px] text-zinc-400 mb-0.5">Progress</div>
                    <div className="text-xl font-black text-cyan-400 leading-none mb-2">
                      {weekProgress}%
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-cyan-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 mb-1">Goal Chart</div>
                    <svg width="100%" height="75" viewBox="0 0 240 100">
                      <path
                        d={path}
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d={`${path} L 240 100 L 0 100 Z`}
                        fill="rgba(34,211,238,0.08)"
                      />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Progress bar + add button spanning full width */}
              <div className="p-3 bg-zinc-900/60 border-t border-emerald-500/20">
                <div className="h-2 bg-zinc-800 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-2 bg-emerald-400 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${moneyProgress}%` }}
                  />
                </div>

                <button
                  onClick={() => setShowMoneyAdd(!showMoneyAdd)}
                  className="w-full bg-emerald-400 text-black font-bold py-2 rounded-xl"
                >
                  {showMoneyAdd ? "Close Wallet" : "+ Add Money"}
                </button>

                {showMoneyAdd && (
                  <div className="mt-3 space-y-2">
                    <input
                      className="w-full p-2 bg-black border border-zinc-700 rounded-xl"
                      placeholder="Money Made"
                      value={moneyInput}
                      onChange={(e) => setMoneyInput(e.target.value)}
                    />
                    <input
                      className="w-full p-2 bg-black border border-zinc-700 rounded-xl"
                      placeholder="Money Goal"
                      value={moneyGoal}
                      onChange={(e) => setMoneyGoal(Number(e.target.value))}
                    />
                    <button
                      onClick={addMoneyEntry}
                      className="w-full bg-white text-black font-bold py-2 rounded-xl"
                    >
                      Save Entry
                    </button>
                  </div>
                )}
              </div>

            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {goals.map((g, gi) => (
                <div key={gi} className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800" style={glassStyle}>
                  <div className="font-bold text-xs">{g.title}</div>
                  {g.tasks.map((t, ti) => (
                    <div key={ti} onClick={() => toggleTask(gi, ti)} className="text-[10px] mt-1 cursor-pointer">
                      {t.done ? "✓" : "○"} {t.text}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800" style={glassStyle}>
              <button onClick={() => setShowAdd(!showAdd)} className="w-full bg-white text-black font-bold py-2 rounded-xl">
                {showAdd ? "Close Add Goal" : "+ Add Goal"}
              </button>

              {showAdd && (
                <div className="mt-3">
                  <input className="w-full p-2 bg-black border mb-2" placeholder="Title" onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} />
                  <input className="w-full p-2 bg-black border mb-2" placeholder="Deadline" onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} />

                  {newGoal.tasks.map((t, i) => (
                    <input key={i} className="w-full p-2 bg-black border mb-2" value={t} onChange={e => updateTask(i, e.target.value)} placeholder={`Task ${i + 1}`} />
                  ))}

                  <button onClick={addGoal} className="w-full bg-cyan-400 text-black font-bold py-2 rounded-xl">
                    Create Goal
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* PROFILE */}
        {view === "profile" && (
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800" style={glassStyle}>
            <div>Tasks: {completedTasks}/{totalTasks}</div>
            <input className="w-full mt-3 p-2 bg-black border" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <button className="w-full mt-2 bg-white text-black font-bold py-2 rounded-xl" onClick={createAccount}>Create Account</button>
          </div>
        )}

        {/* SETTINGS */}
        {view === "settings" && (
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800" style={glassStyle}>
            <div className="font-bold mb-2">Themes</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(themes).map(t => (
                <button key={t} onClick={() => setTheme(t)} className="border p-2 rounded">
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
