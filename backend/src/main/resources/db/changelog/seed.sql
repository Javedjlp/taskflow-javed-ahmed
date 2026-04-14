INSERT INTO users (id, name, email, password, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Test User',
    'test@example.com',
    '$2y$12$j3eaWZ1l.tlzznv3cwsjdOR8te7sUTwF.V/tPjqgSI3/.wQEQ2tZe',
    NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (id, name, description, owner_id, created_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Website Redesign',
    'Q2 delivery initiative',
    '11111111-1111-1111-1111-111111111111',
    NOW()
) ON CONFLICT DO NOTHING;

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, created_by, due_date, created_at, updated_at)
VALUES
    (
        '33333333-3333-3333-3333-333333333331',
        'Design landing page',
        'Create first draft',
        'TODO',
        'HIGH',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        CURRENT_DATE + INTERVAL '5 day',
        NOW(), NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333332',
        'Define typography scale',
        'Need alignment with branding',
        'IN_PROGRESS',
        'MEDIUM',
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        CURRENT_DATE + INTERVAL '7 day',
        NOW(), NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Ship responsive QA',
        'Verify mobile and desktop breakpoints',
        'DONE',
        'LOW',
        '22222222-2222-2222-2222-222222222222',
        null,
        '11111111-1111-1111-1111-111111111111',
        CURRENT_DATE + INTERVAL '10 day',
        NOW(), NOW()
    )
ON CONFLICT DO NOTHING;
