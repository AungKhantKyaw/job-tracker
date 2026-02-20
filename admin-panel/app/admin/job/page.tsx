"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

const Job = () => {
  const [loading, setLoading] = useState(true);

  return (
    <section>
      <h3>Job Applications</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Job application cards will go here */}
        {loading ? <p>Loading jobs...</p> : <p>No jobs found.</p>}
      </div>
    </section>
  );
}

export default Job;