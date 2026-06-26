import React, { useEffect, useMemo, useState } from 'react';

const ACTIVITY_TYPES = new Set([
  'flow',
  'algorithm',
  'timeline',
  'matching',
  'simulation',
  'packet',
  'decision',
  'pipeline',
  'relationship',
  'memory',
  'bugfix',
  'visualization',
]);

const TYPE_META = {
  flow: { icon: 'account_tree', label: 'Flow Lab', color: 'from-cyan-500 to-blue-600' },
  algorithm: { icon: 'route', label: 'Algorithm Lab', color: 'from-violet-500 to-fuchsia-600' },
  timeline: { icon: 'timeline', label: 'Timeline Lab', color: 'from-amber-500 to-orange-600' },
  matching: { icon: 'join_inner', label: 'Matching Lab', color: 'from-emerald-500 to-teal-600' },
  simulation: { icon: 'model_training', label: 'Simulation Lab', color: 'from-indigo-500 to-sky-600' },
  packet: { icon: 'send', label: 'Packet Lab', color: 'from-sky-500 to-cyan-600' },
  decision: { icon: 'fork_right', label: 'Decision Lab', color: 'from-rose-500 to-pink-600' },
  pipeline: { icon: 'conversion_path', label: 'Pipeline Lab', color: 'from-slate-600 to-slate-900' },
  relationship: { icon: 'hub', label: 'Relationship Lab', color: 'from-lime-500 to-emerald-600' },
  memory: { icon: 'psychology', label: 'Memory Lab', color: 'from-purple-500 to-indigo-600' },
  bugfix: { icon: 'bug_report', label: 'Bug Fix Lab', color: 'from-red-500 to-orange-600' },
  visualization: { icon: 'schema', label: 'Visualization Lab', color: 'from-teal-500 to-green-600' },
};

const compactText = (value, fallback = '') => String(value || fallback).trim();

const makeId = (value, index) => (
  compactText(value, `item-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `item-${index + 1}`
);

const limitWords = (value, maxWords = 12) => {
  const words = compactText(value).split(/\s+/).filter(Boolean);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}...` : words.join(' ');
};

const classifyTopic = (topicName = '') => {
  const name = topicName.toLowerCase();
  if (/(merge|quick|binary search|dfs|bfs|sort|search|algorithm)/.test(name)) return 'algorithm';
  if (/(dns|tcp|http|packet|network)/.test(name)) return 'packet';
  if (/(react lifecycle|git|history|timeline|version)/.test(name)) return 'timeline';
  if (/(join|normalization|match)/.test(name)) return 'matching';
  if (/(scheduling|deadlock|os|operating system|simulation)/.test(name)) return 'simulation';
  if (/(oop|inheritance|class|relationship)/.test(name)) return 'relationship';
  if (/(compiler|pipeline|ci\/cd|build)/.test(name)) return 'pipeline';
  if (/(heap|trie|tree|graph|visual)/.test(name)) return 'visualization';
  if (/(bug|debug|error|exception)/.test(name)) return 'bugfix';
  return 'flow';
};

const createLocalActivity = (topic) => {
  const topicName = topic?.name || 'this concept';
  const activityType = classifyTopic(topicName);
  const flow = [
    { id: 'problem', step: 1, label: 'Problem', icon: 'error', description: 'Spot the real need.' },
    { id: 'idea', step: 2, label: topicName, icon: 'psychology_alt', description: 'Apply the core idea.' },
    { id: 'tradeoff', step: 3, label: 'Trade-off', icon: 'balance', description: 'Choose the safer path.' },
    { id: 'result', step: 4, label: 'Result', icon: 'verified', description: 'Explain the outcome.' },
  ];

  return {
    activityType,
    title: `${topicName} Concept Lab`,
    subtitle: `Learn ${topicName} through a visual, interactive activity.`,
    difficulty: topic?.difficulty || 'Beginner',
    scenario: `A product team must use ${topicName} correctly under real constraints.`,
    objective: 'Arrange, test, and explain the concept in one minute.',
    estimatedTime: '3 min',
    flow,
    exercise: {
      prompt: 'Arrange the concept flow.',
      correctOrder: flow.map(item => item.id),
      choices: flow.map(item => item.label),
      pairs: [
        { left: 'Real product', right: 'Use the concept in context' },
        { left: 'Interview answer', right: 'Explain trade-offs clearly' },
      ],
      bugLines: [
        { line: 1, code: `const idea = "${topicName}";`, isBug: false },
        { line: 2, code: 'skipExample();', isBug: true, explanation: 'Always prove the idea with an example.' },
        { line: 3, code: 'explainTradeoff();', isBug: false },
      ],
      decisionOptions: [
        { id: 'guess', label: 'Guess', result: 'The concept stays abstract.', isCorrect: false },
        { id: 'example', label: 'Use example', result: 'The idea becomes testable.', isCorrect: true },
        { id: 'memorize', label: 'Memorize', result: 'Recall may fail under pressure.', isCorrect: false },
      ],
    },
    memoryHack: `Remember ${topicName}: problem, rule, example, trade-off.`,
    realWorldExample: `${topicName} appears in everyday product decisions.`,
    commonMistake: 'Memorizing the definition without testing an example.',
    interviewTip: 'Start with purpose, then explain one trade-off.',
    summary: `${topicName} is easier when shown as a sequence of choices.`,
    successMessage: 'Concept locked. You can explain the visual path.',
    retryHint: 'Focus on cause, action, then outcome.',
  };
};

const normalizeActivity = (activity, topic) => {
  const fallback = createLocalActivity(topic);
  const source = activity && typeof activity === 'object' ? activity : fallback;
  const activityType = ACTIVITY_TYPES.has(source.activityType) ? source.activityType : fallback.activityType;
  const rawFlow = Array.isArray(source.flow) && source.flow.length ? source.flow : fallback.flow;
  const flow = rawFlow.slice(0, 8).map((node, index) => ({
    id: node.id || makeId(node.label || node.step, index),
    step: Number(node.step) || index + 1,
    label: compactText(node.label, `Step ${index + 1}`),
    icon: compactText(node.icon, TYPE_META[activityType]?.icon || 'tips_and_updates'),
    description: limitWords(node.description || node.detail || node.summary || fallback.flow[index % fallback.flow.length]?.description),
  }));

  return {
    ...fallback,
    ...source,
    activityType,
    title: compactText(source.title, fallback.title),
    subtitle: compactText(source.subtitle, fallback.subtitle),
    difficulty: compactText(source.difficulty, fallback.difficulty),
    scenario: compactText(source.scenario, fallback.scenario),
    objective: compactText(source.objective || source.goal, fallback.objective),
    estimatedTime: compactText(source.estimatedTime, fallback.estimatedTime),
    flow,
    exercise: { ...fallback.exercise, ...(source.exercise || {}) },
    memoryHack: compactText(source.memoryHack || source.memoryHook, fallback.memoryHack),
    realWorldExample: compactText(source.realWorldExample, fallback.realWorldExample),
    commonMistake: compactText(source.commonMistake, fallback.commonMistake),
    interviewTip: compactText(source.interviewTip, fallback.interviewTip),
    summary: compactText(source.summary || source.lesson, fallback.summary),
    successMessage: compactText(source.successMessage, fallback.successMessage),
    retryHint: compactText(source.retryHint, fallback.retryHint),
  };
};

const shuffleByTopic = (items, seed = '') => {
  const copy = [...items];
  let hash = seed.length || 7;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    hash = (hash * 31 + seed.charCodeAt(i % Math.max(seed.length, 1))) % 997;
    const j = hash % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const ActivityHeader = ({ activity, completed, progress, score }) => {
  const meta = TYPE_META[activity.activityType] || TYPE_META.flow;

  return (
    <section className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-sm">
      <div className={`relative bg-gradient-to-br ${meta.color} p-5 text-white sm:p-7`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_34%)]" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div>
            <div className="mb-4 flex w-fit items-center gap-2 rounded-lg bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wide backdrop-blur">
              <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
              {meta.label}
            </div>
            <h3 className="text-2xl font-black leading-tight sm:text-3xl">{activity.title}</h3>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-white/90">{activity.subtitle}</p>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/15 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-white/80">
              <span>{activity.difficulty}</span>
              <span>{activity.estimatedTime}</span>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-black leading-none">{score}</span>
              <span className="pb-1 text-sm font-black text-white/80">XP</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold">
              <span className="material-symbols-outlined text-[17px]">{completed ? 'workspace_premium' : 'flag'}</span>
              {completed ? 'Completion badge earned' : activity.objective}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-3 bg-surface-container-lowest p-4 md:grid-cols-2">
        <InfoStrip icon="stadia_controller" label="Scenario" text={activity.scenario} />
        <InfoStrip icon="track_changes" label="Objective" text={activity.objective} />
      </div>
    </section>
  );
};

const InfoStrip = ({ icon, label, text }) => (
  <div className="rounded-xl border border-outline-variant/20 bg-white p-4">
    <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-on-surface-variant">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
    </div>
    <p className="text-sm font-bold leading-relaxed text-on-surface">{text}</p>
  </div>
);

const ConceptNode = ({ node, active, index, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group min-h-[116px] rounded-xl border p-4 text-left transition duration-200 ${
      active
        ? 'border-primary bg-primary/10 shadow-sm'
        : 'border-outline-variant/20 bg-white hover:border-primary/40 hover:bg-primary/5'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
        active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10'
      }`}>
        <span className="material-symbols-outlined text-[22px]">{node.icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-on-surface-variant">Step {node.step || index + 1}</p>
        <h5 className="mt-1 text-sm font-black leading-tight text-on-surface">{node.label}</h5>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-on-surface-variant">{node.description}</p>
      </div>
    </div>
  </button>
);

const PathActivity = ({ activity, mode, onComplete }) => {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setActive(0);
    setRunning(false);
  }, [activity.title]);

  const next = () => {
    setActive(prev => {
      const nextIndex = Math.min(prev + 1, activity.flow.length - 1);
      if (nextIndex === activity.flow.length - 1) onComplete();
      return nextIndex;
    });
  };

  const play = () => {
    setRunning(true);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setActive(Math.min(index, activity.flow.length - 1));
      if (index >= activity.flow.length - 1) {
        window.clearInterval(timer);
        setRunning(false);
        onComplete();
      }
    }, mode === 'packet' ? 650 : 500);
  };

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-on-surface-variant">{activity.exercise?.prompt || 'Follow the visual path'}</p>
          <h4 className="text-lg font-black text-on-surface">{mode === 'packet' ? 'Watch the packet move' : 'Step through the concept'}</h4>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={next} className="rounded-lg border border-outline-variant/30 bg-white px-3 py-2 text-xs font-black text-on-surface transition hover:bg-surface-container-low">
            Next
          </button>
          <button type="button" onClick={play} disabled={running} className="flex items-center gap-2 rounded-lg bg-on-surface px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-60">
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            Run
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {activity.flow.map((node, index) => (
          <div key={node.id} className="relative">
            {mode === 'packet' && active === index && (
              <div className="absolute right-4 top-4 z-10 flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-sky-500 text-white shadow-lg">
                <span className="material-symbols-outlined text-[17px]">send</span>
              </div>
            )}
            <ConceptNode node={node} index={index} active={active === index} onClick={() => setActive(index)} />
          </div>
        ))}
      </div>
    </section>
  );
};

const FlowActivity = (props) => <PathActivity {...props} mode="flow" />;
const AlgorithmActivity = (props) => <PathActivity {...props} mode="algorithm" />;
const PacketActivity = (props) => <PathActivity {...props} mode="packet" />;
const TimelineActivity = (props) => <PathActivity {...props} mode="timeline" />;
const SimulationActivity = (props) => <PathActivity {...props} mode="simulation" />;
const PipelineActivity = (props) => <PathActivity {...props} mode="pipeline" />;
const VisualizationActivity = (props) => <PathActivity {...props} mode="visualization" />;

const MatchingActivity = ({ activity, onComplete }) => {
  const pairs = Array.isArray(activity.exercise?.pairs) && activity.exercise.pairs.length
    ? activity.exercise.pairs.slice(0, 5)
    : activity.flow.slice(0, 4).map(node => ({ left: node.label, right: node.description }));
  const rightOptions = useMemo(() => shuffleByTopic(pairs.map(pair => pair.right), activity.title), [activity.title, pairs]);
  const [answers, setAnswers] = useState({});

  const correct = pairs.filter(pair => answers[pair.left] === pair.right).length;
  useEffect(() => {
    if (correct === pairs.length && pairs.length > 0) onComplete();
  }, [correct, pairs.length, onComplete]);

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-on-surface-variant">Match the pairs</p>
          <h4 className="text-lg font-black text-on-surface">{correct}/{pairs.length} correct</h4>
        </div>
        <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">+{correct * 15} XP</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {pairs.map(pair => (
          <div key={pair.left} className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
            <h5 className="text-sm font-black text-on-surface">{pair.left}</h5>
            <select
              value={answers[pair.left] || ''}
              onChange={(event) => setAnswers(prev => ({ ...prev, [pair.left]: event.target.value }))}
              className="mt-3 w-full rounded-lg border border-outline-variant/30 bg-white px-3 py-2 text-sm font-bold text-on-surface outline-none focus:border-primary"
            >
              <option value="">Choose match</option>
              {rightOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
};

const RelationshipActivity = ({ activity, onComplete }) => {
  const [selected, setSelected] = useState(activity.flow[0]?.id);
  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-white p-4 shadow-sm">
      <div className="mb-5">
        <p className="text-[10px] font-black uppercase tracking-wide text-on-surface-variant">Build the relationship</p>
        <h4 className="text-lg font-black text-on-surface">Click each level from parent to child</h4>
      </div>
      <div className="flex flex-col items-center gap-3">
        {activity.flow.map((node, index) => (
          <React.Fragment key={node.id}>
            <button
              type="button"
              onClick={() => {
                setSelected(node.id);
                if (index === activity.flow.length - 1) onComplete();
              }}
              className={`w-full max-w-md rounded-xl border p-4 text-left transition ${
                selected === node.id ? 'border-emerald-400 bg-emerald-50' : 'border-outline-variant/20 bg-surface-container-lowest hover:bg-emerald-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600">{node.icon || 'class'}</span>
                <div>
                  <h5 className="text-sm font-black text-on-surface">{node.label}</h5>
                  <p className="text-xs font-bold text-on-surface-variant">{node.description}</p>
                </div>
              </div>
            </button>
            {index < activity.flow.length - 1 && <span className="material-symbols-outlined text-on-surface-variant">keyboard_arrow_down</span>}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

const DecisionActivity = ({ activity, onComplete }) => {
  const options = Array.isArray(activity.exercise?.decisionOptions) ? activity.exercise.decisionOptions : [];
  const [choice, setChoice] = useState(null);
  const selected = options.find(option => option.id === choice);

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-wide text-on-surface-variant">Choose the best move</p>
        <h4 className="text-lg font-black text-on-surface">{activity.exercise?.prompt || activity.objective}</h4>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {options.map(option => (
          <button
            key={option.id || option.label}
            type="button"
            onClick={() => {
              setChoice(option.id);
              if (option.isCorrect) onComplete();
            }}
            className={`rounded-xl border p-4 text-left transition ${
              choice === option.id ? 'border-rose-400 bg-rose-50' : 'border-outline-variant/20 bg-surface-container-lowest hover:bg-rose-50/40'
            }`}
          >
            <h5 className="text-sm font-black text-on-surface">{option.label}</h5>
            <p className="mt-2 text-xs font-bold leading-relaxed text-on-surface-variant">{option.result}</p>
          </button>
        ))}
      </div>
      {selected && (
        <div className={`mt-4 rounded-xl p-4 text-sm font-bold ${selected.isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
          {selected.isCorrect ? activity.successMessage : activity.retryHint}
        </div>
      )}
    </section>
  );
};

const BugFixActivity = ({ activity, onComplete }) => {
  const lines = Array.isArray(activity.exercise?.bugLines) ? activity.exercise.bugLines : [];
  const [picked, setPicked] = useState(null);
  const selected = lines.find(line => line.line === picked);

  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-slate-950 p-4 text-white shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-red-200">Bug fix activity</p>
          <h4 className="text-lg font-black">Click the incorrect line</h4>
        </div>
        <span className="material-symbols-outlined text-red-300">bug_report</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 font-mono text-sm">
        {lines.map(line => (
          <button
            key={line.line}
            type="button"
            onClick={() => {
              setPicked(line.line);
              if (line.isBug) onComplete();
            }}
            className={`grid w-full grid-cols-[44px_1fr] text-left transition ${
              picked === line.line ? (line.isBug ? 'bg-emerald-500/20' : 'bg-red-500/20') : 'hover:bg-white/5'
            }`}
          >
            <span className="border-r border-white/10 px-3 py-2 text-right text-white/40">{line.line}</span>
            <code className="px-3 py-2 text-white/90">{line.code}</code>
          </button>
        ))}
      </div>
      {selected && (
        <p className="mt-4 rounded-xl bg-white/10 p-4 text-sm font-bold text-white">
          {selected.isBug ? selected.explanation || activity.successMessage : activity.retryHint}
        </p>
      )}
    </section>
  );
};

const MemoryActivity = ({ activity, onComplete }) => (
  <section className="rounded-2xl border border-outline-variant/30 bg-white p-4 shadow-sm">
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-xl bg-purple-50 p-5">
        <p className="text-[10px] font-black uppercase tracking-wide text-purple-700">Memory builder</p>
        <h4 className="mt-2 text-2xl font-black text-on-surface">{activity.memoryHack}</h4>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {activity.flow.map((node, index) => (
            <ConceptNode key={node.id} node={node} index={index} active={index === 0} onClick={onComplete} />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onComplete}
        className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 text-left transition hover:border-purple-300 hover:bg-purple-50"
      >
        <span className="material-symbols-outlined text-purple-600">psychology</span>
        <h5 className="mt-3 text-lg font-black text-on-surface">Say it once</h5>
        <p className="mt-2 text-sm font-bold leading-relaxed text-on-surface-variant">{activity.exercise?.prompt || 'Repeat the memory trick and connect it to each step.'}</p>
      </button>
    </div>
  </section>
);

const ACTIVITY_COMPONENTS = {
  flow: FlowActivity,
  algorithm: AlgorithmActivity,
  packet: PacketActivity,
  timeline: TimelineActivity,
  matching: MatchingActivity,
  simulation: SimulationActivity,
  relationship: RelationshipActivity,
  decision: DecisionActivity,
  bugfix: BugFixActivity,
  memory: MemoryActivity,
  visualization: VisualizationActivity,
  pipeline: PipelineActivity,
};

const MemoryPanel = ({ activity }) => (
  <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <MiniPanel icon="lightbulb" label="Memory Hack" text={activity.memoryHack} color="amber" />
    <MiniPanel icon="deployed_code" label="Real Product" text={activity.realWorldExample} color="sky" />
    <MiniPanel icon="warning" label="Common Mistake" text={activity.commonMistake} color="rose" />
    <MiniPanel icon="record_voice_over" label="Interview Tip" text={activity.interviewTip} color="emerald" />
  </section>
);

const MiniPanel = ({ color, icon, label, text }) => {
  const classes = {
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    sky: 'bg-sky-50 text-sky-800 border-sky-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return (
    <div className={`rounded-xl border p-4 ${classes[color]}`}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-xs font-bold leading-relaxed text-on-surface">{text}</p>
    </div>
  );
};

const ActivityRenderer = ({ activity, onComplete }) => {
  const Component = ACTIVITY_COMPONENTS[activity.activityType] || FlowActivity;
  return <Component activity={activity} onComplete={onComplete} />;
};

const ConceptLab = ({ activity }) => {
  const [completed, setCompleted] = useState(false);
  const [replays, setReplays] = useState(0);

  useEffect(() => {
    setCompleted(false);
    setReplays(0);
  }, [activity.title, activity.activityType]);

  const progress = completed ? 100 : Math.max(25, Math.round((activity.flow.length / 8) * 50));
  const score = completed ? 100 + replays * 10 : 40;

  const replay = () => {
    setCompleted(false);
    setReplays(prev => prev + 1);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <ActivityHeader activity={activity} completed={completed} progress={progress} score={score} />
      <ActivityRenderer activity={activity} onComplete={() => setCompleted(true)} />

      {completed && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Perfect score</p>
              <h4 className="text-lg font-black text-on-surface">{activity.successMessage}</h4>
              <p className="mt-1 text-sm font-bold text-on-surface-variant">{activity.summary}</p>
            </div>
            <button type="button" onClick={replay} className="flex w-fit items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700">
              <span className="material-symbols-outlined text-[17px]">replay</span>
              Replay
            </button>
          </div>
        </section>
      )}

      <MemoryPanel activity={activity} />
    </div>
  );
};

const PracticeBoardTab = ({ topic, practiceBoard, practiceBoardLoading }) => {
  if (practiceBoardLoading) {
    return (
      <div className="rounded-xl border border-outline-variant/30 bg-white p-8 text-center shadow-sm animate-in fade-in duration-200">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
        </div>
        <h3 className="text-sm font-bold text-on-surface">Generating Concept Lab</h3>
        <p className="mt-1 text-xs font-semibold text-on-surface-variant">
          Classifying this topic and building the best activity.
        </p>
      </div>
    );
  }

  return <ConceptLab activity={normalizeActivity(practiceBoard, topic)} />;
};

export default PracticeBoardTab;
