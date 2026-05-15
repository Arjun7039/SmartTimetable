import random

# Constants
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

# Exact slots as requested by user
COMMON_SLOTS = [
    "08:00-09:00", 
    "09:00-10:00", 
    "10:00-11:00", 
    "11:00-11:30", # Short Break
    "11:30-12:30", 
    "12:30-01:30", 
    "01:30-02:00", # Lunch Break
    "02:00-03:00", 
    "03:00-04:00",
    "04:00-05:00"
]

LUNCH_SLOT = "01:30-02:00"
SHORT_BREAK = "11:00-11:30"
LAB_SLOT_LENGTH = 2

# Balanced Lab distribution
LAB_SCHEDULE = {
    "Monday": 1,
    "Tuesday": 1,
    "Wednesday": 1,
    "Thursday": 1,
    "Friday": 0
}

def generate_timetable_logic(subjects):
    timetable = {day: {slot: "" for slot in COMMON_SLOTS} for day in DAYS}
    remaining_hours = {s["subject"]: int(s["hours"]) for s in subjects}
    daily_subject_count = {day: {s["subject"]: 0 for s in subjects} for day in DAYS}

    labs = [s for s in subjects if s.get('type') == 'lab' or "lab" in s["subject"].lower()]
    theory_subjects = [s for s in subjects if s not in labs]

    # 1. Allocate Labs
    for day in DAYS:
        required_labs = LAB_SCHEDULE.get(day, 0)
        if not labs: continue
        
        for _ in range(required_labs):
            random.shuffle(labs)
            for lab in labs:
                name = lab["subject"]
                teacher = lab["teacher"]

                if remaining_hours[name] < LAB_SLOT_LENGTH:
                    continue

                # Find 2 consecutive slots for lab (avoiding breaks)
                for i in range(len(COMMON_SLOTS) - 1):
                    s1, s2 = COMMON_SLOTS[i], COMMON_SLOTS[i+1]
                    if any(b in [s1, s2] for b in [LUNCH_SLOT, SHORT_BREAK]):
                        continue
                    if timetable[day][s1] == "" and timetable[day][s2] == "":
                        timetable[day][s1] = f"{name}\n({teacher})"
                        timetable[day][s2] = f"{name}\n({teacher})"
                        remaining_hours[name] -= LAB_SLOT_LENGTH
                        daily_subject_count[day][name] += 1
                        break
                else:
                    continue
                break

    # 2. Allocate Theory Subjects (Balanced across the week)
    max_classes_per_day = 6 
    
    # Iterate multiple times to fill slots evenly
    for _ in range(20):
        for day in DAYS:
            current_day_total = sum(1 for s in timetable[day].values() if s != "")
            if current_day_total >= max_classes_per_day:
                continue

            for i, slot in enumerate(COMMON_SLOTS):
                if slot in [LUNCH_SLOT, SHORT_BREAK] or timetable[day][slot] != "":
                    continue

                random.shuffle(theory_subjects)
                assigned = False
                for subject in theory_subjects:
                    name = subject["subject"]
                    teacher = subject["teacher"]

                    if remaining_hours[name] <= 0:
                        continue
                    if daily_subject_count[day][name] >= 1:
                        continue

                    # Avoid adjacent duplicates
                    prev_slot = COMMON_SLOTS[i - 1] if i > 0 else None
                    next_slot = COMMON_SLOTS[i + 1] if i < len(COMMON_SLOTS) - 1 else None
                    if any(timetable[day].get(adj) == f"{name}\n({teacher})" for adj in [prev_slot, next_slot]):
                        continue

                    # Assign
                    timetable[day][slot] = f"{name}\n({teacher})"
                    remaining_hours[name] -= 1
                    daily_subject_count[day][name] += 1
                    assigned = True
                    break
                if assigned:
                    break # Move to next day for balancing

    # 3. Format Output Table
    headers = ["Day"] + COMMON_SLOTS
    table = []

    for day in DAYS:
        row = [day]
        for slot in COMMON_SLOTS:
            if slot == LUNCH_SLOT:
                row.append("LUNCH")
            elif slot == SHORT_BREAK:
                row.append("BREAK")
            else:
                row.append(timetable[day].get(slot, "—"))
        table.append(row)

    return headers, table