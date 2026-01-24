import { useState, useRef, useCallback } from 'react';
import axios from 'axios'; // Or your configured axios instance
import submissionService from '../services/submissionService/submissionService';
export const usePollSubmission = () => {
  const [status, setStatus] = useState('idle'); // idle | pending | running | completed | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startPolling = useCallback(async (submissionId) => {
    setStatus('pending');
    setResult(null);
    setError(null);

    // Initial check immediately
    // Then poll every 2 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const response = await submissionService.getSubmissionById(submissionId);
        const data = response.data.data; // Assuming your API wraps in { data: ... }

        if (['accepted', 'wrong-answer', 'time-limit-exceeded', 'runtime-error', 'compilation-error'].includes(data.status)) {
          // Verdict Reached!
          setResult(data);
          setStatus('completed');
          stopPolling();
        } else {
          // Still processing... update UI to show "Running Tests..."
          setStatus('running');
        }
      } catch (err) {
        setError(err.message || "Failed to fetch submission");
        setStatus('error');
        stopPolling();
      }
    }, 2000);

  }, []);

  return { 
    startPolling, 
    stopPolling, 
    status, 
    result, 
    error 
  };
};