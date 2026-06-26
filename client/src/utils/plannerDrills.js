export const getGoalDrillQuestions = (role) => {
  const cleanRole = (role || '').toLowerCase();

  if (cleanRole.includes('front') || cleanRole.includes('react') || cleanRole.includes('ui') || cleanRole.includes('design')) {
    return {
      q1: 'Explain the difference between React useMemo and useCallback hooks, and when to use each.',
      q1Placeholder: 'useMemo memoizes the returned value of a function, while useCallback memoizes the function definition itself.',
      q2: 'What is the benefit of CSS Container Queries over Media Queries?',
      q2Placeholder: 'Container queries allow styling elements based on the width of their parent container rather than the viewport.',
      modalTitle: `${role} Frontend Drill`,
    };
  }

  if (cleanRole.includes('back') || cleanRole.includes('node') || cleanRole.includes('db') || cleanRole.includes('data')) {
    return {
      q1: 'Explain the difference between optimistic concurrency control and pessimistic locking in databases.',
      q1Placeholder: 'Optimistic locking checks version fields before update. Pessimistic locking locks the records directly.',
      q2: 'What is the CAP theorem and how does it affect distributed database design?',
      q2Placeholder: 'States a distributed system can guarantee at most two out of three: Consistency, Availability, and Partition Tolerance.',
      modalTitle: `${role} Backend Drill`,
    };
  }

  return {
    q1: 'Explain the difference between AWS ALB (Application Load Balancer) and NLB (Network Load Balancer).',
    q1Placeholder: 'ALB operates at Layer 7 (HTTP/path routing). NLB operates at Layer 4 (high throughput TCP/UDP).',
    q2: 'What is the main benefit of using AWS Route 53 Geolocation routing policy?',
    q2Placeholder: 'Routes traffic based on user location to improve latency or show localized content.',
    modalTitle: `${role} Architect Drill`,
  };
};
