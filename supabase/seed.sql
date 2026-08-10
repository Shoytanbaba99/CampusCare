-- Seed Initial Departments and Categories for CampusCare

INSERT INTO public.departments (id, name, code, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Electrical & HVAC Maintenance', 'ELEC', 'Air conditioning, fans, lighting fixtures, and power distribution'),
    ('22222222-2222-2222-2222-222222222222', 'Facilities & Civil Work', 'FAC', 'Furniture repairs, door locks, windows, wall plaster, and carpentry'),
    ('33333333-3333-3333-3333-333333333333', 'IT Support & Lab Infrastructure', 'IT', 'Computer lab hardware, Wi-Fi routers, projectors, and network switches'),
    ('44444444-4444-4444-4444-444444444444', 'Plumbing & Sanitation', 'PLUMB', 'Water supply taps, pipe leaks, washroom fittings, and drainage')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categories (name, department_id) VALUES
    ('AC Failure / Not Cooling', '11111111-1111-1111-1111-111111111111'),
    ('Fan / Light Fixture Broken', '11111111-1111-1111-1111-111111111111'),
    ('Power Socket Damaged', '11111111-1111-1111-1111-111111111111'),
    ('Broken Glass / Window Pane', '22222222-2222-2222-2222-222222222222'),
    ('Door Lock Stuck / Key Broken', '22222222-2222-2222-2222-222222222222'),
    ('Desk / Chair Damage', '22222222-2222-2222-2222-222222222222'),
    ('Lab PC Hardware Failure', '33333333-3333-3333-3333-333333333333'),
    ('Wi-Fi / Network Router Down', '33333333-3333-3333-3333-333333333333'),
    ('Projector / Display Screen Issue', '33333333-3333-3333-3333-333333333333'),
    ('Water Tap Leak / Pipe Burst', '44444444-4444-4444-4444-444444444444'),
    ('Washroom Fitting / Drainage Blockage', '44444444-4444-4444-4444-444444444444')
ON CONFLICT (name) DO NOTHING;
