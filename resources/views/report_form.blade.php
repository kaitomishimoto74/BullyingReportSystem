<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bullying Reporting Incident Form</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .form-section { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 8px; margin-bottom: 10px; }
        .checkbox-group label { display: inline-block; margin-right: 15px; font-weight: normal; }
        .row { display: flex; gap: 10px; }
        .row > div { flex: 1; }
        .btn { padding: 10px 30px; font-size: 16px; background: #28a745; color: #fff; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Bullying Reporting Incident Form</h1>
    @if(session('success'))
        <div style="color: green; font-weight: bold;">
            {{ session('success') }}<br>
            Your Ticket ID: <span style="color: blue;">{{ session('ticket_id') }}</span>
        </div>
    @endif
    <form method="POST" action="{{ route('report.submit') }}">
        @csrf

        <div class="form-section row">
            <div>
                <label for="date">Today's Date</label>
                <input type="date" name="date" id="date" value="{{ date('Y-m-d') }}" readonly>
            </div>
        </div>

        <div class="form-section">
            <h3>Person Reporting Incident</h3>
            <div class="row">
                <div>
                    <label for="reporter_name">Name</label>
                    <input type="text" name="reporter_name" id="reporter_name" required>
                </div>
                <div>
                    <label for="reporter_phone">Phone</label>
                    <input type="text" name="reporter_phone" id="reporter_phone">
                </div>
                <div>
                    <label for="reporter_email">Email</label>
                    <input type="email" name="reporter_email" id="reporter_email">
                </div>
            </div>
            <div class="checkbox-group">
                <label><input type="checkbox" name="reporter_type[]" value="Student"> Student</label>
                <label><input type="checkbox" name="reporter_type[]" value="Parent/guardian"> Parent/guardian</label>
                <label><input type="checkbox" name="reporter_type[]" value="Close adult relative"> Close adult relative</label>
                <label><input type="checkbox" name="reporter_type[]" value="School staff"> School staff</label>
                <label><input type="checkbox" name="reporter_type[]" value="Witness/bystander"> Witness/bystander</label>
            </div>
        </div>

        <div class="form-section">
            <h3>Name of Victim(s)</h3>
            <input type="text" name="victim_names" required>
        </div>

        <div class="form-section">
            <h3>Name(s) of Alleged Offender(s)</h3>
            <div class="row">
                <div>
                    <label for="offender_names">Name(s)</label>
                    <input type="text" name="offender_names" id="offender_names">
                </div>
                <div>
                    <label for="offender_age">Age</label>
                    <select name="offender_age" id="offender_age">
                        <option value="">Select age</option>
                        <option value="Unknown">Unknown</option>
                        @for ($i = 5; $i <= 25; $i++)
                            <option value="{{ $i }}">{{ $i }}</option>
                        @endfor
                    </select>
                </div>
                <div>
                    <label>Is he/she a student?</label>
                    <select name="offender_is_student">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="form-section">
            <h3>Type of Bullying (Check all that apply)</h3>
            <div class="checkbox-group">
                <label><input type="checkbox" name="bullying_type[]" value="Name calling/offensive remarks"> Name calling/offensive remarks</label>
                <label><input type="checkbox" name="bullying_type[]" value="Exclusion"> Exclusion</label>
                <label><input type="checkbox" name="bullying_type[]" value="Hit, kicked, punched"> Hit, kicked, punched</label>
                <label><input type="checkbox" name="bullying_type[]" value="Told lies or false rumors"> Told lies or false rumors</label>
                <label><input type="checkbox" name="bullying_type[]" value="Threatened"> Threatened</label>
                <label><input type="checkbox" name="bullying_type[]" value="Electronic communications"> Electronic communications</label>
                <label><input type="checkbox" name="bullying_type[]" value="Racial comments"> Racial comments</label>
                <label><input type="checkbox" name="bullying_type[]" value="Sexual comments"> Sexual comments</label>
                <label><input type="checkbox" name="bullying_type[]" value="Took/damaged possessions"> Took/damaged possessions</label>
            </div>
            <label for="bullying_explanation">Other/Explanation</label>
            <textarea name="bullying_explanation" id="bullying_explanation"></textarea>
        </div>

        <div class="form-section">
            <h3>Where did the bullying happen? (Check all that apply)</h3>
            <div class="checkbox-group">
                <label><input type="checkbox" name="bullying_location[]" value="Outside"> Outside</label>
                <label><input type="checkbox" name="bullying_location[]" value="Hallway"> Hallway</label>
                <label><input type="checkbox" name="bullying_location[]" value="In class with teacher"> In class with teacher</label>
                <label><input type="checkbox" name="bullying_location[]" value="In class without teacher"> In class without teacher</label>
                <label><input type="checkbox" name="bullying_location[]" value="Bathroom"> Bathroom</label>
                <label><input type="checkbox" name="bullying_location[]" value="Office"> Office</label>
                <label><input type="checkbox" name="bullying_location[]" value="Cafe"> Cafe</label>
                <label><input type="checkbox" name="bullying_location[]" value="To/from school"> To/from school</label>
                <label><input type="checkbox" name="bullying_location[]" value="Social Media"> Social Media</label>
            </div>
            <label for="bullying_location_other">Other</label>
            <input type="text" name="bullying_location_other" id="bullying_location_other">
        </div>

        <div class="form-section">
            <h3>People the victim has spoken to about the bullying incident (Check all that apply)</h3>
            <div class="checkbox-group">
                <label><input type="checkbox" name="victim_spoken_to[]" value="Parent/Guardian"> Parent/Guardian</label>
                <label><input type="checkbox" name="victim_spoken_to[]" value="Teacher"> Teacher</label>
                <label><input type="checkbox" name="victim_spoken_to[]" value="School Counselor"> School Counselor</label>
                <label><input type="checkbox" name="victim_spoken_to[]" value="Principal"> Principal</label>
                <label><input type="checkbox" name="victim_spoken_to[]" value="Friend"> Friend</label>
                <label><input type="checkbox" name="victim_spoken_to[]" value="Police"> Police</label>
                <label><input type="checkbox" name="victim_spoken_to[]" value="Other"> Other</label>
            </div>
        </div>

        <button type="submit" class="btn">Submit Report</button>
    </form>

    <h2>Check Report Status</h2>
    <form method="GET" action="{{ route('report.search') }}" style="margin-bottom: 30px;">
        <input type="text" name="ticket_id" placeholder="Enter your Ticket ID" required>
        <button type="submit" class="btn">Search</button>
    </form>
</body>
</html>