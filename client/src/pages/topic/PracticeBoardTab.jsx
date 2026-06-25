import React from 'react';

const PracticeBoardTab = ({
  topic,
  lbAlgo,
  setLbAlgo,
  servers,
  activeNodeIndex,
  handleSimulateRequest,
  handleSimulateSpike,
  handleResetSimulator,
  gwRoute,
  setGwRoute,
  rateLimitEnabled,
  setRateLimitEnabled,
  gwActiveNode,
  gwServiceTarget,
  handleGwRequest,
  gwLogs,
  indexEnabled,
  setIndexEnabled,
  dbRunning,
  dbScanIndex,
  dbResults,
  handleRunDbQuery,
  dbHealthy,
  setDbHealthy,
  cacheEnabled,
  setCacheEnabled,
  msActiveNode,
  msLogs,
  msStatus,
  handleTriggerMsRequest
}) => {
  const lowerName = (topic?.name || '').toLowerCase();
  let practiceType = 'generic'; // 'generic', 'load-balancer', 'api-gateway', 'database'
  if (lowerName.includes('load') || lowerName.includes('scale') || lowerName.includes('latency') || lowerName.includes('traffic')) {
    practiceType = 'load-balancer';
  } else if (lowerName.includes('gateway') || lowerName.includes('proxy') || lowerName.includes('rate') || lowerName.includes('routing')) {
    practiceType = 'api-gateway';
  } else if (lowerName.includes('database') || lowerName.includes('sql') || lowerName.includes('index') || lowerName.includes('query') || lowerName.includes('nosql') || lowerName.includes('acid') || lowerName.includes('transaction')) {
    practiceType = 'database';
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white border border-outline-variant/30 p-6 rounded-xl shadow-sm">
        
        {/* PLAYGROUND 1: LOAD BALANCER PLAYGROUND */}
        {practiceType === 'load-balancer' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Load Balancer Playground</h3>
                <p className="text-on-surface-variant text-body-sm leading-normal">
                  Dispatch requests or trigger traffic spikes to visualize how load balancing algorithms distribute traffic.
                </p>
              </div>
              
              {/* Select algorithm */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-on-surface-variant uppercase">Algorithm:</span>
                <select
                  value={lbAlgo}
                  onChange={(e) => setLbAlgo(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="round-robin">Round Robin</option>
                  <option value="least-connections">Least Connections</option>
                  <option value="random">Random Hashing</option>
                </select>
              </div>
            </div>

            {/* Simulator Visualizer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-inner relative">
              {/* Gateway/Client */}
              <div className="col-span-1 flex flex-col items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/25 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg animate-pulse relative">
                  <span className="material-symbols-outlined text-3xl">router</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">API Gateway</h4>
                  <p className="text-[10px] text-on-surface-variant leading-none uppercase font-bold mt-1">Load Balancer</p>
                </div>
                <button
                  onClick={handleSimulateRequest}
                  className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container shadow-md transition-all active:scale-95"
                >
                  Dispatch Request
                </button>
                <button
                  onClick={handleSimulateSpike}
                  className="w-full py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/90 shadow-md transition-all active:scale-95 text-center"
                >
                  Burst Spike (10x)
                </button>
              </div>

              {/* Visual Connection line animation column */}
              <div className="col-span-1 hidden md:flex flex-col justify-around h-48 border-l border-dashed border-outline-variant/40 relative ml-8">
                {[0, 1, 2].map((idx) => {
                  const isActive = activeNodeIndex === idx;
                  return (
                    <div key={idx} className="relative w-full">
                      <div className={`absolute left-0 -top-0.5 h-1 transition-all ${
                        isActive ? 'bg-primary w-full shadow-[0_0_8px_rgba(42,20,180,0.5)]' : 'bg-transparent w-0'
                      } duration-300`}></div>
                    </div>
                  );
                })}
              </div>

              {/* Backend Servers */}
              <div className="col-span-2 space-y-3">
                {servers.map((server, idx) => {
                  const isActive = activeNodeIndex === idx;
                  const loadPercent = Math.min(100, (server.connections / server.capacity) * 100);

                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        isActive 
                          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                          : 'border-outline-variant/25 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-sm">dns</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-on-surface">{server.name}</h5>
                          <p className="text-[10px] text-on-surface-variant font-medium">
                            Load: {server.connections} / {server.capacity} Active Conn
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-1 max-w-[150px]">
                        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              loadPercent > 80 ? 'bg-error' : loadPercent > 50 ? 'bg-[#f59e0b]' : 'bg-[#10b981]'
                            }`}
                            style={{ width: `${loadPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant w-8 text-right">
                          {Math.round(loadPercent)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reset Control */}
            <div className="flex justify-end gap-3 border-t border-outline-variant/20 pt-4">
              <button
                onClick={handleResetSimulator}
                className="px-4 py-2 border border-outline-variant/30 rounded-lg text-xs font-bold hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                Reset Connection Load
              </button>
            </div>
          </div>
        )}

        {/* PLAYGROUND 2: API GATEWAY & RATE LIMITER PLAYGROUND */}
        {practiceType === 'api-gateway' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">API Gateway Routing &amp; Rate Limiting Playground</h3>
                <p className="text-on-surface-variant text-body-sm leading-normal">
                  Test rate limiting configurations and gateway proxy path routing in this live request visualizer.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-inner relative">
              {/* Gateway/Client */}
              <div className="col-span-1 flex flex-col items-center gap-4 bg-primary/5 p-4 rounded-xl border border-primary/25 shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg relative">
                  <span className="material-symbols-outlined text-3xl">send_to_mobile</span>
                </div>
                <div className="w-full">
                  <span className="text-xs font-bold text-on-surface-variant uppercase">Target API Route:</span>
                  <select
                    value={gwRoute}
                    onChange={(e) => setGwRoute(e.target.value)}
                    className="w-full mt-1.5 bg-white border border-outline-variant/30 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-primary font-semibold cursor-pointer"
                  >
                    <option value="/users">GET /users</option>
                    <option value="/orders">POST /orders</option>
                    <option value="/auth">GET /auth</option>
                    <option value="/admin">DELETE /admin</option>
                  </select>
                </div>
                <button
                  onClick={handleGwRequest}
                  className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Send API Request
                </button>
              </div>

              {/* API Gateway & Rate Limiter Node */}
              <div className="col-span-1 flex flex-col gap-4">
                {/* API Gateway Card */}
                <div className={`p-4 rounded-xl border text-center transition-all ${
                  gwActiveNode === 'gateway' ? 'border-primary bg-primary/5 scale-105 shadow-md' : 'border-outline-variant/25 bg-white'
                }`}>
                  <span className="material-symbols-outlined text-primary text-2xl">router</span>
                  <h5 className="font-bold text-xs text-on-surface mt-1">API Gateway</h5>
                  <p className="text-[10px] text-on-surface-variant font-medium">Port: 80 / 443</p>
                </div>

                {/* Rate Limiter Card */}
                <div className={`p-4 rounded-xl border text-center transition-all ${
                  gwActiveNode === 'rate-limiter' ? 'border-[#e0b034] bg-amber-50/50 scale-105 shadow-md' : 'border-outline-variant/25 bg-white'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase">Rate Limiter</span>
                    <input 
                      type="checkbox" 
                      checked={rateLimitEnabled} 
                      onChange={(e) => setRateLimitEnabled(e.target.checked)} 
                      className="w-3.5 h-3.5 rounded text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </div>
                  <span className={`material-symbols-outlined text-sm ${rateLimitEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {rateLimitEnabled ? 'gpp_good' : 'gpp_bad'}
                  </span>
                  <p className="text-[9px] text-on-surface-variant font-semibold mt-0.5">
                    {rateLimitEnabled ? 'Active (Limit: 3/5s)' : 'Bypassed'}
                  </p>
                </div>
              </div>

              {/* Block / Success Terminal Column */}
              <div className="col-span-2 space-y-3">
                {/* Backend Services */}
                <div className="space-y-2">
                  {[
                    { id: 'user-service', name: 'User Microservice', url: '/users', color: 'bg-emerald-50 border-emerald-300 text-emerald-700' },
                    { id: 'order-service', name: 'Order Microservice', url: '/orders', color: 'bg-indigo-50 border-indigo-300 text-indigo-700' },
                    { id: 'auth-service', name: 'Auth Microservice', url: '/auth', color: 'bg-purple-50 border-purple-300 text-purple-700' }
                  ].map((srv) => {
                    const isTarget = gwServiceTarget === srv.id && gwActiveNode === 'service';
                    return (
                      <div 
                        key={srv.id}
                        className={`p-3 rounded-lg border text-xs font-semibold flex justify-between items-center transition-all ${
                          isTarget ? `${srv.color} scale-[1.03] shadow-md` : 'bg-white border-outline-variant/20 text-on-surface-variant/70'
                        }`}
                      >
                        <span>{srv.name}</span>
                        <span className="font-mono text-[10px]">{srv.url}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Error / Rate Limited Blocker Node */}
                <div className={`p-3 rounded-xl border text-center transition-all ${
                  gwActiveNode === 'block' ? 'bg-error-container/10 border-error text-error scale-[1.02] shadow-md' : 'bg-slate-50 border-outline-variant/10 text-on-surface-variant/40'
                }`}>
                  <span className="material-symbols-outlined text-xl">block</span>
                  <h5 className="font-bold text-xs mt-0.5">Gatekeeper Firewall</h5>
                  <p className="text-[9px] font-semibold">Blocks rate-limited or illegal paths.</p>
                </div>
              </div>
            </div>

            {/* API Gateway Console Output */}
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-300 min-h-[120px] overflow-y-auto shadow-inner">
              <div className="text-slate-500 font-bold uppercase text-[9px] border-b border-slate-800 pb-1 mb-2 tracking-wider">Gateway System Logs:</div>
              {gwLogs.length === 0 ? (
                <div className="text-slate-600 italic">No queries dispatched yet. Click "Send API Request" above to test routing.</div>
              ) : (
                gwLogs.map((log, idx) => (
                  <div key={idx} className={log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('BLOCKED') ? 'text-error' : 'text-amber-400'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PLAYGROUND 3: DATABASE INDEXING & TABLE SCAN PLAYGROUND */}
        {practiceType === 'database' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Query Indexing &amp; Table Scan Simulator</h3>
                <p className="text-on-surface-variant text-body-sm leading-normal">
                  Enable/disable B-Tree database indexes and query a mock user database to measure query execution latency.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-inner relative">
              {/* Control Panel */}
              <div className="col-span-1 bg-white border border-outline-variant/25 p-4 rounded-xl shadow-sm space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Database Search Simulator</h4>
                  <p className="text-on-surface-variant text-[10px] leading-normal mt-0.5">
                    Query: <code>SELECT * FROM users WHERE email = 'jane.doe@example.com';</code>
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                  <span className="text-xs font-bold text-on-surface">B-Tree Index on Email:</span>
                  <input
                    type="checkbox"
                    checked={indexEnabled}
                    onChange={(e) => setIndexEnabled(e.target.checked)}
                    disabled={dbRunning}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer disabled:opacity-40"
                  />
                </div>

                <button
                  onClick={handleRunDbQuery}
                  disabled={dbRunning}
                  className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container shadow-md transition-all active:scale-95 disabled:bg-slate-400 cursor-pointer"
                >
                  {dbRunning ? 'Scanning DB...' : 'Run SELECT Query'}
                </button>

                {dbResults && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1.5 animate-in fade-in duration-200">
                    <h5 className="font-bold text-emerald-800">Query Performance:</h5>
                    <div className="flex justify-between">
                      <span>Scan Type:</span>
                      <span className="font-bold">{indexEnabled ? 'Index Seek (B-Tree)' : 'Full Table Scan'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rows Evaluated:</span>
                      <span className="font-bold text-primary">{dbResults.rowsScanned} / 1000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Execution Time:</span>
                      <span className="font-bold text-emerald-700">{dbResults.executionTime}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Visual scan representation */}
              <div className="col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Disk Database Blocks (1000 records)</span>
                  {dbScanIndex !== -1 && (
                    <span className="text-[10px] text-primary font-bold">Scanning ID: {dbScanIndex}</span>
                  )}
                </div>

                {/* Visual Grid representing Database Rows */}
                <div className="grid grid-cols-10 gap-1 bg-white border border-outline-variant/20 p-4 rounded-xl max-h-36 overflow-y-auto no-scrollbar shadow-sm">
                  {Array.from({ length: 100 }).map((_, idx) => {
                    const blockStart = idx * 10;
                    const blockEnd = blockStart + 9;
                    const isScanning = dbScanIndex >= blockStart && dbScanIndex <= blockEnd;
                    const isMatchedBlock = blockStart <= 847 && blockEnd >= 847;
                    const isFullyScanned = !indexEnabled && dbScanIndex > blockEnd;
                    
                    let cellBg = 'bg-slate-100';
                    if (isScanning) cellBg = 'bg-primary text-white scale-105 animate-pulse';
                    else if (isMatchedBlock && dbScanIndex >= 847) cellBg = 'bg-emerald-500 text-white font-bold';
                    else if (isFullyScanned) cellBg = 'bg-primary/10 border-primary/20 text-primary/60';

                    return (
                      <div 
                        key={idx} 
                        className={`h-8 rounded text-[9px] flex items-center justify-center border border-outline-variant/10 transition-all font-mono ${cellBg}`}
                        title={`IDs ${blockStart}-${blockEnd}`}
                      >
                        {blockStart}
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-surface-container rounded-lg text-xs leading-normal">
                  <b>How it works:</b> Without an index, the database must evaluate every row sequentially until it reaches ID 847. With a B-Tree index, it performs binary partitioning, reducing the scan load from 847 rows to just 8 page index traverses!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLAYGROUND 4: GENERIC ARCHITECTURE & OUTAGE RESILIENCE PLAYGROUND */}
        {practiceType === 'generic' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Chaos &amp; Resilience Architecture Playground</h3>
                <p className="text-on-surface-variant text-body-sm leading-normal">
                  Toggle outages and cache states to see how system boundaries recover or fail under load.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-8 shadow-inner relative">
              {/* Control Panel */}
              <div className="col-span-1 bg-white border border-outline-variant/25 p-4 rounded-xl shadow-sm flex flex-col justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Fault Monkey Controls</h4>
                  <p className="text-on-surface-variant text-[10px] leading-normal mt-0.5">
                    Inject failures to test system fallback logic.
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Toggle cache */}
                  <div className="flex items-center justify-between p-2 bg-surface-container rounded-lg">
                    <span className="text-[10px] font-bold text-on-surface">Redis Cache:</span>
                    <button
                      onClick={() => setCacheEnabled(!cacheEnabled)}
                      className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer ${
                        cacheEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {cacheEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  {/* Toggle database */}
                  <div className="flex items-center justify-between p-2 bg-surface-container rounded-lg">
                    <span className="text-[10px] font-bold text-on-surface">Database:</span>
                    <button
                      onClick={() => setDbHealthy(!dbHealthy)}
                      className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer ${
                        dbHealthy ? 'bg-emerald-500 text-white' : 'bg-error text-white'
                      }`}
                    >
                      {dbHealthy ? 'HEALTHY' : 'DOWN ⚠️'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleTriggerMsRequest}
                  disabled={msStatus === 'running'}
                  className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container shadow-md transition-all active:scale-95 disabled:bg-slate-400 cursor-pointer"
                >
                  {msStatus === 'running' ? 'Routing request...' : 'Trigger API Request'}
                </button>
              </div>

              {/* Nodes Path Visual */}
              <div className="col-span-3 flex flex-col justify-between gap-4 bg-white border border-outline-variant/20 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Architecture Nodes</span>
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Live Simulation</span>
                  </div>
                </div>

                {/* Architecture Path Layout */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto py-4">
                  {[
                    { id: 'client', label: 'Client App', icon: 'devices' },
                    { id: 'gateway', label: 'API Gateway', icon: 'router' },
                    { id: 'cache', label: 'Redis Cache', icon: 'database' },
                    { id: 'app', label: 'App Service', icon: 'dns' },
                    { id: 'db', label: 'MongoDB', icon: 'storage', isDb: true }
                  ].map((node) => {
                    const isActive = msActiveNode === node.id;
                    const isNodeDb = node.isDb;
                    
                    let statusColor = 'border-outline-variant/20 bg-white';
                    if (isActive) statusColor = 'border-primary bg-primary/10 text-primary scale-110 shadow-md ring-2 ring-primary/20';
                    else if (isNodeDb && !dbHealthy) statusColor = 'border-error bg-error/5 text-error scale-[0.98] opacity-80';

                    return (
                      <React.Fragment key={node.id}>
                        <div className={`p-2.5 rounded-xl border text-center transition-all min-w-[70px] flex-1 flex flex-col items-center justify-center gap-1 ${statusColor}`}>
                          <span className="material-symbols-outlined text-sm">{node.icon}</span>
                          <span className="text-[8px] font-bold leading-tight block whitespace-nowrap">{node.label}</span>
                        </div>
                        {node.id !== 'db' && (
                          <span className={`material-symbols-outlined text-[14px] text-on-surface-variant/40 shrink-0 ${
                            isActive ? 'text-primary animate-pulse' : ''
                          }`}>
                            arrow_forward
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Request Results Console */}
                <div className="bg-slate-950 rounded-lg p-3 font-mono text-[9px] text-slate-300 min-h-[90px] overflow-y-auto">
                  <div className="text-slate-500 font-bold uppercase text-[8px] border-b border-slate-800 pb-1 mb-1 tracking-wider">Console Logs:</div>
                  {msLogs.length === 0 ? (
                    <div className="text-slate-600 italic">No request triggered yet. Click button to test resilience.</div>
                  ) : (
                    msLogs.map((log, idx) => (
                      <div key={idx} className={log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('CACHE HIT') ? 'text-cyan-400' : 'text-error'}>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PracticeBoardTab;
