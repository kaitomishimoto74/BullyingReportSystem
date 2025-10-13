import React, { useState } from 'react';

function FileCaseForm() {
  return (
    <form method="POST" action="/report" style={{ background: '#f9f9f9', borderRadius: '8px', padding: '30px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <input type="hidden" name="_token" value={window.Laravel.csrfToken} />

      <div className="form-section row" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Today's Date</label>
          <input type="date" name="date" id="date" defaultValue={new Date().toISOString().slice(0, 10)} readOnly style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Person Reporting Incident</h3>
        <div className="row" style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="reporter_name">Name</label>
            <input type="text" name="reporter_name" id="reporter_name" required />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="reporter_phone">Phone</label>
            <input type="text" name="reporter_phone" id="reporter_phone" />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="reporter_email">Email</label>
            <input type="email" name="reporter_email" id="reporter_email" />
          </div>
        </div>
        <div className="checkbox-group" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label><input type="checkbox" name="reporter_type[]" value="Student" /> Student</label>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label><input type="checkbox" name="reporter_type[]" value="Parent/guardian" /> Parent/guardian</label>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label><input type="checkbox" name="reporter_type[]" value="Close adult relative" /> Close adult relative</label>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label><input type="checkbox" name="reporter_type[]" value="School staff" /> School staff</label>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label><input type="checkbox" name="reporter_type[]" value="Witness/bystander" /> Witness/bystander</label>
          </div>
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Name of Victim(s)</h3>
        <input type="text" name="victim_names" required />
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Name(s) of Alleged Offender(s)</h3>
        <div className="row" style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="offender_names">Name(s)</label>
            <input type="text" name="offender_names" id="offender_names" />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="offender_age">Age</label>
            <select name="offender_age" id="offender_age">
              <option value="">Select age</option>
              <option value="Unknown">Unknown</option>
              {[...Array(21)].map((_, i) => (
                <option key={i+5} value={i+5}>{i+5}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Is he/she a student?</label>
            <select name="offender_is_student">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Type of Bullying (Check all that apply)</h3>
        <div className="checkbox-group" style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Name calling/offensive remarks" /> Name calling/offensive remarks</label>
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Exclusion" /> Exclusion</label>
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Hit, kicked, punched" /> Hit, kicked, punched</label>
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Told lies or false rumors" /> Told lies or false rumors</label>
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Threatened" /> Threatened</label>
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Electronic communications" /> Electronic communications</label>
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Racial comments" /> Racial comments</label>
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Sexual comments" /> Sexual comments</label>
          </div>
          <div style={{ flex: '1 1 220px' }}>
            <label><input type="checkbox" name="bullying_type[]" value="Took/damaged possessions" /> Took/damaged possessions</label>
          </div>
        </div>
        <label htmlFor="bullying_explanation">Other/Explanation</label>
        <textarea name="bullying_explanation" id="bullying_explanation"></textarea>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Where did the bullying happen? (Check all that apply)</h3>
        <div className="checkbox-group" style={{ marginBottom: '10px' }}>
          <label><input type="checkbox" name="bullying_location[]" value="Outside" /> Outside</label>
          <label><input type="checkbox" name="bullying_location[]" value="Hallway" /> Hallway</label>
          <label><input type="checkbox" name="bullying_location[]" value="In class with teacher" /> In class with teacher</label>
          <label><input type="checkbox" name="bullying_location[]" value="In class without teacher" /> In class without teacher</label>
          <label><input type="checkbox" name="bullying_location[]" value="Bathroom" /> Bathroom</label>
          <label><input type="checkbox" name="bullying_location[]" value="Office" /> Office</label>
          <label><input type="checkbox" name="bullying_location[]" value="Cafe" /> Cafe</label>
          <label><input type="checkbox" name="bullying_location[]" value="To/from school" /> To/from school</label>
          <label><input type="checkbox" name="bullying_location[]" value="Social Media" /> Social Media</label>
        </div>
        <label htmlFor="bullying_location_other">Other</label>
        <input type="text" name="bullying_location_other" id="bullying_location_other" />
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>People the victim has spoken to about the bullying incident (Check all that apply)</h3>
        <div className="checkbox-group">
          <label><input type="checkbox" name="victim_spoken_to[]" value="Parent/Guardian" /> Parent/Guardian</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Teacher" /> Teacher</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="School Counselor" /> School Counselor</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Principal" /> Principal</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Friend" /> Friend</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Police" /> Police</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Other" /> Other</label>
        </div>
      </div>

      <button type="submit" className="btn" style={{ padding: '10px 30px', fontSize: '16px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
        Submit Report
      </button>
    </form>
  );
}

function CheckReportForm() {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/report/search?ticket_id=${encodeURIComponent(ticketId)}`);
      if (!res.ok) throw new Error('Report not found');
      const data = await res.json();
      if (!data || Object.keys(data).length === 0) {
        setError('No report found for this Ticket ID.');
      } else {
        setResult(data);
      }
    } catch {
      setError('No report found for this Ticket ID.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Check Report</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="ticket_id"
            placeholder="Enter your Ticket ID"
            required
            value={ticketId}
            onChange={e => setTicketId(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Search</button>
      </form>
      {error && (
        <div style={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>{error}</div>
      )}
      {result && (
        <div style={{ marginTop: '30px', background: '#f9f9f9', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3>Report Status</h3>
          <p>Ticket ID: <strong>{result.ticket_id}</strong></p>
          <p>Status: <strong>{result.status ?? 'Pending'}</strong></p>
          <p>Date: <strong>{result.date}</strong></p>
          <p>
            Assigned to: <strong>
              {result.assigned_username
                ? result.assigned_username
                : (result.worked_by ? 'Unknown' : 'Not yet assigned')}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default function ReportForm() {
  const [activeTab, setActiveTab] = useState('file');
  const successMessage = window.reportSuccess?.message;
  const ticketId = window.reportSuccess?.ticketId;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '40px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#007bff' }}>Bullying Reporting Incident Form</h1>

      {successMessage && (
        <div style={{ color: 'green', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
          {successMessage}<br />
          Your Ticket ID: <span style={{ color: 'blue' }}>{ticketId}</span>
        </div>
      )}

      <div style={{ background: '#007bff', padding: '15px 0', marginBottom: '30px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          style={{
            color: activeTab === 'file' ? '#fff' : '#007bff',
            background: activeTab === 'file' ? '#0056b3' : '#fff',
            fontWeight: 'bold',
            margin: '0 30px',
            textDecoration: 'none',
            fontSize: '18px',
            border: 'none',
            padding: '10px 30px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          File Case
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('check')}
          style={{
            color: activeTab === 'check' ? '#fff' : '#007bff',
            background: activeTab === 'check' ? '#0056b3' : '#fff',
            fontWeight: 'bold',
            margin: '0 30px',
            textDecoration: 'none',
            fontSize: '18px',
            border: 'none',
            padding: '10px 30px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check Report
        </button>
      </div>

      {activeTab === 'file' ? <FileCaseForm /> : <CheckReportForm />}

      <p style={{ textAlign: 'center', marginTop: '40px' }}>
        <a href="/" style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}>Return to Main Screen</a>
      </p>
    </div>
  );
}