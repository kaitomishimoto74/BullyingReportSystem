import React, { useState } from 'react';

// make sure CSRF token and current user are available in the component
const csrfToken = (typeof document !== 'undefined' && document.querySelector('meta[name="csrf-token"]'))
  ? document.querySelector('meta[name="csrf-token"]').getAttribute('content')
  : (typeof window !== 'undefined' && window.Laravel ? window.Laravel.csrfToken : '');

const currentUser = (typeof window !== 'undefined' && window.CurrentUser) ? window.CurrentUser : {};

function FileCaseForm() {
  const [victims, setVictims] = useState(['']);
  const [offenders, setOffenders] = useState(['']);
  const [reporterType, setReporterType] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [guide, setGuide] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const reporterOptions = [
    'Student',
    'Parent/guardian',
    'Close adult relative',
    'School staff',
    'Witness/bystander'
  ];

  // simple name validator: allows letters, spaces, hyphen, apostrophe, dot; requires length and a vowel
  const isValidName = (raw) => {
    const s = (raw || '').trim();
    if (s.length < 2 || s.length > 255) return false;
    // allow many unicode letters, spaces, hyphens, periods, apostrophes
    const namePattern = /^[\p{L}\p{M}'\-\.\s]+$/u;
    if (!namePattern.test(s)) return false;
    // heuristic: require at least one vowel-like character
    if (!/[aeiouyAEIOUY]/.test(s)) return false;
    // blacklist obvious nonsense
    const bad = ['asd','asdf','qwer','test','secret','fake','random','hello','hahaha','lol','admin','user','123','xyz'];
    const lower = s.toLowerCase();
    for (const b of bad) if (lower.includes(b)) return false;
    // disallow long repeated characters
    if (/(.)\1\1\1/.test(s)) return false;
    return true;
  };

  const addVictim = () => setVictims(prev => [...prev, '']);
  const removeVictim = (i) => setVictims(prev => prev.filter((_, idx) => idx !== i));
  const updateVictim = (i, val) => setVictims(prev => prev.map((v, idx) => idx === i ? val : v));

  const addOffender = () => setOffenders(prev => [...prev, '']);
  const removeOffender = (i) => setOffenders(prev => prev.filter((_, idx) => idx !== i));
  const updateOffender = (i, val) => setOffenders(prev => prev.map((o, idx) => idx === i ? val : o));

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault(); // ensure no normal form submit
      e.stopPropagation();
    }
    setLoading(true);
    setSuccessMessage('');
    setTicketId('');

    try {
      const form = e.target;

      // ensure school id available (from injected user or form)
      const schoolIdVal = (form.reporter_school_id?.value || currentUser.school_id || '').trim();
      if (!schoolIdVal) {
        setSuccessMessage('School ID is required.');
        setLoading(false);
        return;
      }

      // validate reporter phone if provided: must be exactly 11 digits
      const phoneRaw = (form.reporter_phone?.value || '').trim();
      if (phoneRaw && !/^\d{11}$/.test(phoneRaw)) {
        setSuccessMessage('Phone must be exactly 11 digits.');
        setLoading(false);
        return;
      }

      // validate victims: primary victim required and must be valid
      const primaryVictim = (victims[0] || '').trim();
      if (!isValidName(primaryVictim)) {
        setSuccessMessage('Primary victim name is invalid. Use a real name.');
        setLoading(false);
        return;
      }
      for (let i = 1; i < victims.length; i++) {
        const v = (victims[i] || '').trim();
        if (v && !isValidName(v)) {
          setSuccessMessage(`Victim ${i + 1} name is invalid.`);
          setLoading(false);
          return;
        }
      }

      // validate offender names if provided
      for (let i = 0; i < offenders.length; i++) {
        const o = (offenders[i] || '').trim();
        if (o && !isValidName(o)) {
          setSuccessMessage(`Offender ${i + 1} name is invalid.`);
          setLoading(false);
          return;
        }
      }

      // ensure reporter email is present (prefill from current user)
      if (!form.reporter_email?.value && currentUser.email) {
        const hiddenEmail = document.createElement('input');
        hiddenEmail.type = 'hidden';
        hiddenEmail.name = 'reporter_email';
        hiddenEmail.value = currentUser.email;
        form.appendChild(hiddenEmail);
      }

      const fd = new FormData(form);

      // convert victim_names[] inputs to a single string field "victim_names"
      const victimList = victims.map(v => v.trim()).filter(Boolean).join(', ');
      if (fd.has('victim_names[]')) fd.delete('victim_names[]');
      if (victimList) fd.append('victim_names', victimList);

      // convert offender_names[] inputs to a single string field "offender_names"
      const offenderList = offenders.map(o => o.trim()).filter(Boolean).join(', ');
      if (fd.has('offender_names[]')) fd.delete('offender_names[]');
      if (offenderList) fd.append('offender_names', offenderList);

      const res = await fetch('/report', {
        method: 'POST',
        body: fd,
        headers: {
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        },
        credentials: 'same-origin',
        redirect: 'manual' // prevent automatic navigation to server response
      });

      // read response text then try parse JSON (robust for HTML error pages)
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (err) { /* not JSON */ }

      if (res.ok) {
        const id = data?.ticket_id ?? data?.ticketId ?? data?.ticket ?? data?.id;
        setSuccessMessage(data?.message ?? 'Report submitted successfully.');
        if (id) setTicketId(id);
        setGuide(data?.guide ?? (data?.note ? { headline: data?.message, note: data?.note } : null));
        setRedirectUrl(data?.redirect ?? null);
        window.reportSuccess = { message: data?.message ?? 'Report submitted successfully.', ticketId: id };

        // do NOT auto-redirect — show guide and provide link only
        // server redirect URL is available in redirectUrl state (rendered as plain text/link below)
      } else {
        console.error('Report submit failed', { status: res.status, body: text, json: data });
        const serverMsg = data?.message || text || `Submission failed (status ${res.status})`;
        setSuccessMessage(serverMsg);
      }
    } catch (err) {
      setSuccessMessage('Submission failed. Check console/network for details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ background: '#f9f9f9', borderRadius: '8px', padding: '30px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <input type="hidden" name="_token" value={csrfToken} />

      {successMessage && (
        <div style={{ marginTop: 12 }}>
          <div style={{ color: successMessage.startsWith('Submission failed') || successMessage.includes('invalid') ? 'red' : 'green', fontWeight: 'bold', marginBottom: 12 }}>
            {successMessage}
            {ticketId && (<div>Your Ticket ID: <strong style={{ color: 'blue' }}>{ticketId}</strong></div>)}
          </div>

          {/* guide / note from server */}
          {guide && (
            <div style={{ marginTop: 12, background: '#fff', border: '1px solid #e6e6e6', padding: 12, borderRadius: 6, color: '#222' }}>
              {guide.headline && <div style={{ fontWeight: 700, marginBottom: 6 }}>{guide.headline}</div>}
              {guide.steps && guide.steps.map((s, i) => (
                <div key={i} style={{ marginBottom: 4 }}>{(i + 1) + '. ' + s}</div>
              ))}
              {guide.note && <div style={{ color: '#333', marginTop: 8 }}>{guide.note}</div>}
            </div>
          )}
        </div>
      )}

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
            <label htmlFor="reporter_school_id">School ID</label>
            <input type="text" name="reporter_school_id" id="reporter_school_id" defaultValue={currentUser.school_id || ''} readOnly required />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="reporter_phone">Phone</label>
            <input type="text" name="reporter_phone" id="reporter_phone" />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="reporter_email">Email</label>
            <input type="email" name="reporter_email" id="reporter_email" defaultValue={currentUser.email || ''} readOnly />
          </div>
        </div>

        <div className="radio-group" style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 20px' }}>
          {reporterOptions.map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6 }}>
              <input
                type="radio"
                name="reporter_type[]"
                value={opt}
                checked={reporterType === opt}
                onChange={(e) => setReporterType(e.target.value)}
                required
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Name of Victim(s)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {victims.map((v, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                name="victim_names[]"
                placeholder={i === 0 ? 'Primary victim name' : 'Additional victim name'}
                value={v}
                onChange={e => updateVictim(i, e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                required={i === 0}
              />
              {victims.length > 1 && (
                <button type="button" onClick={() => removeVictim(i)} style={{ padding: '6px 10px' }}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <div>
            <button type="button" onClick={addVictim} style={{ padding: '8px 12px' }}>Add Victim</button>
          </div>
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Name(s) of Alleged Offender(s)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {offenders.map((o, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                name="offender_names[]"
                placeholder={i === 0 ? 'Alleged offender name' : 'Additional offender name'}
                value={o}
                onChange={e => updateOffender(i, e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
              />
              {offenders.length > 1 && (
                <button type="button" onClick={() => removeOffender(i)} style={{ padding: '6px 10px' }}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <div>
            <button type="button" onClick={addOffender} style={{ padding: '8px 12px' }}>Add Offender</button>
          </div>
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Type of Bullying (Check all that apply)</h3>
        <div className="checkbox-group" style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px' }}>
          <label><input type="checkbox" name="bullying_type[]" value="Name calling/offensive remarks" /> Name calling/offensive remarks</label>
          <label><input type="checkbox" name="bullying_type[]" value="Exclusion" /> Exclusion</label>
          <label><input type="checkbox" name="bullying_type[]" value="Hit, kicked, punched" /> Hit, kicked, punched</label>
          <label><input type="checkbox" name="bullying_type[]" value="Told lies or false rumors" /> Told lies or false rumors</label>
          <label><input type="checkbox" name="bullying_type[]" value="Threatened" /> Threatened</label>
          <label><input type="checkbox" name="bullying_type[]" value="Electronic communications" /> Electronic communications</label>
          <label><input type="checkbox" name="bullying_type[]" value="Racial comments" /> Racial comments</label>
          <label><input type="checkbox" name="bullying_type[]" value="Sexual comments" /> Sexual comments</label>
          <label><input type="checkbox" name="bullying_type[]" value="Took/damaged possessions" /> Took/damaged possessions</label>
        </div>
        <label htmlFor="bullying_explanation">Other/Explanation</label>
        <textarea name="bullying_explanation" id="bullying_explanation"></textarea>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <h3>Where did the bullying happen? (Check all that apply)</h3>
        <div className="checkbox-group" style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px' }}>
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
        <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 16px' }}>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Parent/Guardian" /> Parent/Guardian</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Teacher" /> Teacher</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="School Counselor" /> School/School Counselor</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Principal" /> Principal</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Friend" /> Friend</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Police" /> Police</label>
          <label><input type="checkbox" name="victim_spoken_to[]" value="Other" /> Other</label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn"
        style={{ padding: '10px 30px', fontSize: '16px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        {loading ? 'Submitting...' : 'Submit Report'}
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
    <div style={{ maxWidth: 700, margin: '20px auto' }}>
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
            <strong>Assigned to:</strong>{' '}
            <strong>
              {result.assigned_fullname
                ? result.assigned_fullname
                : result.assigned_name
                  ? result.assigned_name
                  : (result.assigned_first_name && result.assigned_last_name)
                    ? `${result.assigned_first_name} ${result.assigned_last_name}`
                    : (result.assigned_username || (result.worked_by ? 'Unknown' : 'Not yet assigned'))
              }
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}

export { CheckReportForm };
export default FileCaseForm;