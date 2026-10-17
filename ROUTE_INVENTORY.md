# Complete Route Inventory

Generated from the checked-in Next.js App Router source on 2026-10-18. This inventory contains **134 page routes** (61 admin and 73 non-admin), **174 API routes**, and **5 metadata/system routes**. Dynamic brackets denote route parameters, not separate hard-coded pages.

## Interpretation

- **BUILD PASS** means Next.js 16.4.2 compiled and generated the route in the reproduced production build. It does not prove provider delivery or live deployment.
- Admin route runtime behavior requires a valid session, permission, and database state unless the row is explicitly an authentication page.
- Official provider credentials and production browser evidence were unavailable; those checks remain NOT VERIFIED or BLOCKED in `FINAL_PRODUCTION_AUDIT.md`.

## Admin pages (all 61)

| Route | Classification | Purpose | Implementation evidence | Source | Verification |
|---|---|---|---|---|---|
| /admin | Private admin / command center | Admin | Runtime API: /api/v1/admin/dashboard | src/app/admin/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/ai-assistant | Private admin / command center | Ai Assistant | Runtime API: /api/v1/admin/ai-tasks | src/app/admin/ai-assistant/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/analytics | Private admin / command center | Analytics | Runtime API: /api/v1/admin/analytics | src/app/admin/analytics/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/approvals | Private admin / command center | Approvals | Runtime API: /api/v1/admin/approvals | src/app/admin/approvals/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/architecture | Private admin / command center | Architecture | Interactive source-authored diagrams with SVG/JSON export | src/app/admin/architecture/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/articles | Private admin / command center | Articles | Runtime API: /api/v1/admin/articles, /api/v1/admin/articles/ | src/app/admin/articles/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/audit-logs | Private admin / command center | Audit Logs | Runtime API: /api/v1/admin/audit-logs | src/app/admin/audit-logs/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/bookings | Private admin / command center | Bookings | Runtime API: /api/v1/admin/meetings | src/app/admin/bookings/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/calendar | Private admin / command center | Calendar | Runtime API: /api/v1/admin/meetings | src/app/admin/calendar/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/case-studies | Private admin / command center | Case Studies | Runtime API: /api/v1/admin/case-studies, /api/v1/admin/case-studies/ | src/app/admin/case-studies/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/companies | Private admin / command center | Companies | Runtime API: /api/v1/admin/companies, /api/v1/admin/companies/ | src/app/admin/companies/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/contacts | Private admin / command center | Contacts | Runtime API: /api/v1/admin/contacts, /api/v1/admin/contacts/ | src/app/admin/contacts/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/documents | Private admin / command center | Documents | Runtime API: /api/v1/admin/documents, /api/v1/admin/documents/ | src/app/admin/documents/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/email | Private admin / command center | Email | Runtime API: /api/v1/admin/email-operations | src/app/admin/email/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/english-learning/courses | Private admin / command center | Courses | Runtime API: /api/v1/english-learning/admin/courses, /api/v1/english-learning/admin/courses/ | src/app/admin/english-learning/courses/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/english-learning/lessons | Private admin / command center | Lessons | Runtime API: /api/v1/english-learning/admin/lessons, /api/v1/english-learning/admin/lessons/ | src/app/admin/english-learning/lessons/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/english-learning/practice-tests | Private admin / command center | Practice Tests | Runtime API: /api/v1/english-learning/admin/practice-tests, /api/v1/english-learning/admin/practice-tests/ | src/app/admin/english-learning/practice-tests/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/english-learning/questions | Private admin / command center | Questions | Runtime API: /api/v1/english-learning/admin/questions, /api/v1/english-learning/admin/questions/ | src/app/admin/english-learning/questions/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/english-learning/resources | Private admin / command center | Resources | Runtime API: /api/v1/english-learning/admin/resources, /api/v1/english-learning/admin/resources/ | src/app/admin/english-learning/resources/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/english-learning/tutors | Private admin / command center | Tutors | Runtime API: /api/v1/english-learning/admin/tutors, /api/v1/english-learning/admin/tutors/ | src/app/admin/english-learning/tutors/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/facebook | Private admin / command center | Facebook | Truthful provider-status view; publishing controls intentionally absent until official API integration exists | src/app/admin/facebook/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/follow-ups | Private admin / command center | Follow Ups | Runtime API: /api/v1/admin/tasks | src/app/admin/follow-ups/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/forgot-password | Admin authentication | Forgot Password | Runtime API: /api/v1/auth/forgot-password | src/app/admin/forgot-password/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/cities | Private admin / command center | Cities | Runtime API: /api/v1/higher-study/admin/cities, /api/v1/higher-study/admin/cities/ | src/app/admin/higher-study/cities/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/countries | Private admin / command center | Countries | Runtime API: /api/v1/higher-study/admin/countries, /api/v1/higher-study/admin/countries/ | src/app/admin/higher-study/countries/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/courses | Private admin / command center | Courses | Runtime API: /api/v1/higher-study/admin/courses, /api/v1/higher-study/admin/courses/ | src/app/admin/higher-study/courses/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/events | Private admin / command center | Events | Runtime API: /api/v1/higher-study/admin/events, /api/v1/higher-study/admin/events/ | src/app/admin/higher-study/events/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/intakes | Private admin / command center | Intakes | Runtime API: /api/v1/higher-study/admin/intakes, /api/v1/higher-study/admin/intakes/ | src/app/admin/higher-study/intakes/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/research-areas | Private admin / command center | Research Areas | Runtime API: /api/v1/higher-study/admin/research-areas, /api/v1/higher-study/admin/research-areas/ | src/app/admin/higher-study/research-areas/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/research-projects | Private admin / command center | Research Projects | Runtime API: /api/v1/higher-study/admin/research, /api/v1/higher-study/admin/research/ | src/app/admin/higher-study/research-projects/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/resources | Private admin / command center | Resources | Runtime API: /api/v1/higher-study/admin/resources, /api/v1/higher-study/admin/resources/ | src/app/admin/higher-study/resources/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/scholarships | Private admin / command center | Scholarships | Runtime API: /api/v1/higher-study/admin/scholarships, /api/v1/higher-study/admin/scholarships/ | src/app/admin/higher-study/scholarships/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/student-stories | Private admin / command center | Student Stories | Runtime API: /api/v1/higher-study/admin/student-stories, /api/v1/higher-study/admin/student-stories/ | src/app/admin/higher-study/student-stories/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/subjects | Private admin / command center | Subjects | Runtime API: /api/v1/higher-study/admin/subjects, /api/v1/higher-study/admin/subjects/ | src/app/admin/higher-study/subjects/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/supervisors | Private admin / command center | Supervisors | Runtime API: /api/v1/higher-study/admin/supervisors, /api/v1/higher-study/admin/supervisors/ | src/app/admin/higher-study/supervisors/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/higher-study/universities | Private admin / command center | Universities | Runtime API: /api/v1/higher-study/admin/universities, /api/v1/higher-study/admin/universities/ | src/app/admin/higher-study/universities/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/inbox | Private admin / command center | Inbox | Runtime API: /api/v1/admin/integrations | src/app/admin/inbox/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/inquiries | Private admin / command center | Inquiries | Runtime API: /api/v1/admin/inquiries | src/app/admin/inquiries/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/instagram | Private admin / command center | Instagram | Truthful provider-status view; publishing controls intentionally absent until official API integration exists | src/app/admin/instagram/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/integrations | Private admin / command center | Integrations | Runtime API: /api/v1/admin/integrations | src/app/admin/integrations/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/leads | Private admin / command center | Leads | Runtime API: /api/v1/admin/inquiries | src/app/admin/leads/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/linkedin | Private admin / command center | Linkedin | Truthful provider-status view; publishing controls intentionally absent until official API integration exists | src/app/admin/linkedin/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/login | Admin authentication | Login | Runtime API: /api/v1/auth/login | src/app/admin/login/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/marketing-studio | Private admin / command center | Marketing Studio | Governed brief builder; queues drafts through /api/v1/admin/ai-tasks | src/app/admin/marketing-studio/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/media | Private admin / command center | Media | Runtime API: /api/v1/admin/media, /api/v1/admin/media/ | src/app/admin/media/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/meetings | Private admin / command center | Meetings | Runtime API: /api/v1/admin/meetings, /api/v1/admin/meetings/ | src/app/admin/meetings/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/newsletter | Private admin / command center | Newsletter | Runtime API: /api/v1/admin/newsletter, /api/v1/admin/newsletter/ | src/app/admin/newsletter/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/notes | Private admin / command center | Notes | Runtime API: /api/v1/admin/notes, /api/v1/admin/notes/ | src/app/admin/notes/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/notifications | Private admin / command center | Notifications | Runtime API: /api/v1/admin/notifications, /api/v1/admin/notifications/ | src/app/admin/notifications/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/opportunities | Private admin / command center | Opportunities | Runtime API: /api/v1/admin/opportunities | src/app/admin/opportunities/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/projects | Private admin / command center | Projects | Runtime API: /api/v1/admin/projects, /api/v1/admin/projects/ | src/app/admin/projects/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/reset-password | Admin authentication | Reset Password | Runtime API: /api/v1/auth/reset-password | src/app/admin/reset-password/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/roles | Private admin / command center | Roles | Source-backed UI via Card | src/app/admin/roles/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/security | Private admin / command center | Security | Runtime API: /api/v1/admin/security | src/app/admin/security/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/seo | Private admin / command center | Seo | Runtime API: /api/v1/admin/seo | src/app/admin/seo/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/settings | Private admin / command center | Settings | Runtime API: /api/v1/admin/settings, /api/v1/admin/settings/test-email | src/app/admin/settings/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/social-media | Private admin / command center | Social Media | Truthful provider-status view; publishing controls intentionally absent until official API integration exists | src/app/admin/social-media/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/students | Private admin / command center | Students | Runtime API: /api/v1/admin/students | src/app/admin/students/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/tasks | Private admin / command center | Tasks | Runtime API: /api/v1/admin/tasks, /api/v1/admin/tasks/ | src/app/admin/tasks/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/users | Private admin / command center | Users | Runtime API: /api/v1/admin/users, /api/v1/admin/users/ | src/app/admin/users/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |
| /admin/whatsapp-ai | Private admin / command center | Whatsapp Ai | Runtime API: /api/v1/whatsapp/admin/stats, /api/v1/whatsapp/send | src/app/admin/whatsapp-ai/page.tsx | BUILD PASS; authenticated runtime requires a valid session and database |

## Public pages (all 73)

| Route | Classification | Purpose | Implementation evidence | Source | Verification |
|---|---|---|---|---|---|
| / | Public brand/content | Personal-brand homepage and conversion entry points | Runtime API: /api/v1/admin/* | src/app/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /about | Public brand/content | About | Authored page/components | src/app/about/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /articles | Public redirect | Articles | Redirects to /insights | src/app/articles/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /articles/[slug] | Public brand/content | Slug | Server-rendered database content with explicit fallback handling | src/app/articles/[slug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /case-studies | Public brand/content | Case Studies | Server-rendered database content with explicit fallback handling | src/app/case-studies/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /case-studies/[slug] | Public brand/content | Slug | Server-rendered database content with explicit fallback handling | src/app/case-studies/[slug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /contact | Public redirect | Contact | Redirects to /work-with-me | src/app/contact/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /ecosystem | Public brand/content | Ecosystem | Server-rendered database content with explicit fallback handling | src/app/ecosystem/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /ecosystem/alo-education | Public brand/content | Alo Education | Server-rendered database content with explicit fallback handling | src/app/ecosystem/alo-education/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /ecosystem/alo-labs | Public brand/content | Alo Labs | Server-rendered database content with explicit fallback handling | src/app/ecosystem/alo-labs/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /ecosystem/tech360 | Public brand/content | Tech360 | Server-rendered database content with explicit fallback handling | src/app/ecosystem/tech360/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning | Public English Learning | English Learning | Server-rendered database content with explicit fallback handling | src/app/english-learning/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/apply | Public English Learning | Apply | Server-rendered database content with explicit fallback handling | src/app/english-learning/apply/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/book-consultation | Public English Learning | Book Consultation | Server-rendered database content with explicit fallback handling | src/app/english-learning/book-consultation/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/book-tutor | Public English Learning | Book Tutor | Server-rendered database content with explicit fallback handling | src/app/english-learning/book-tutor/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/courses | Public English Learning | Courses | Server-rendered database content with explicit fallback handling | src/app/english-learning/courses/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/courses/[slug] | Public English Learning | Slug | Server-rendered database content with explicit fallback handling | src/app/english-learning/courses/[slug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/eligibility-check | Public English Learning | Eligibility Check | Authored page/components | src/app/english-learning/eligibility-check/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/practice-tests | Public English Learning | Practice Tests | Server-rendered database content with explicit fallback handling | src/app/english-learning/practice-tests/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/practice-tests/[slug] | Public English Learning | Slug | Server-rendered database content with explicit fallback handling | src/app/english-learning/practice-tests/[slug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/progress | Public English Learning | Progress | Runtime API: /api/v1/english-learning/progress | src/app/english-learning/progress/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/resources | Public English Learning | Resources | Server-rendered database content with explicit fallback handling | src/app/english-learning/resources/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/resources/[slug] | Public English Learning | Slug | Server-rendered database content with explicit fallback handling | src/app/english-learning/resources/[slug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/tutors | Public English Learning | Tutors | Server-rendered database content with explicit fallback handling | src/app/english-learning/tutors/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /english-learning/tutors/[slug] | Public English Learning | Slug | Server-rendered database content with explicit fallback handling | src/app/english-learning/tutors/[slug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /expertise | Public redirect | Expertise | Redirects to /about | src/app/expertise/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study | Public Higher Study | Higher Study | Server-rendered database content with explicit fallback handling | src/app/higher-study/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/application-guide | Public Higher Study | Application Guide | Authored page/components | src/app/higher-study/application-guide/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/apply | Public Higher Study | Apply | Authored page/components | src/app/higher-study/apply/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/book-consultation | Public Higher Study | Book Consultation | Authored page/components | src/app/higher-study/book-consultation/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/compare | Public Higher Study | Compare | Authored page/components | src/app/higher-study/compare/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/compare/courses | Public Higher Study | Courses | Authored page/components | src/app/higher-study/compare/courses/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/compare/scholarships | Public Higher Study | Scholarships | Authored page/components | src/app/higher-study/compare/scholarships/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/compare/universities | Public Higher Study | Universities | Authored page/components | src/app/higher-study/compare/universities/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/course-finder | Public Higher Study | Course Finder | Server-rendered database content with explicit fallback handling | src/app/higher-study/course-finder/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/courses | Public redirect | Courses | Redirects to canonical route | src/app/higher-study/courses/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/courses/[courseSlug] | Public Higher Study | Courseslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/courses/[courseSlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/destinations | Public Higher Study | Destinations | Server-rendered database content with explicit fallback handling | src/app/higher-study/destinations/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/destinations/[countrySlug] | Public Higher Study | Countryslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/destinations/[countrySlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/destinations/[countrySlug]/[citySlug] | Public Higher Study | Cityslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/destinations/[countrySlug]/[citySlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/eligibility-check | Public Higher Study | Eligibility Check | Authored page/components | src/app/higher-study/eligibility-check/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/global-universities | Public Higher Study | Global Universities | Server-rendered database content with explicit fallback handling | src/app/higher-study/global-universities/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/intakes | Public Higher Study | Intakes | Server-rendered database content with explicit fallback handling | src/app/higher-study/intakes/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/intakes/[intakeSlug] | Public Higher Study | Intakeslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/intakes/[intakeSlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/phd-research | Public Higher Study | Phd Research | Server-rendered database content with explicit fallback handling | src/app/higher-study/phd-research/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/planner | Public Higher Study | Planner | Private browser-local planner; no server persistence | src/app/higher-study/planner/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/research | Public redirect | Research | Redirects to canonical route | src/app/higher-study/research/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/research/[researchSlug] | Public Higher Study | Researchslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/research/[researchSlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/resources | Public redirect | Resources | Redirects to canonical route | src/app/higher-study/resources/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/resources/[resourceSlug] | Public Higher Study | Resourceslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/resources/[resourceSlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/saved | Public Higher Study | Saved | Authored page/components | src/app/higher-study/saved/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/scholarships | Public Higher Study | Scholarships | Server-rendered database content with explicit fallback handling | src/app/higher-study/scholarships/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/scholarships/[scholarshipSlug] | Public Higher Study | Scholarshipslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/scholarships/[scholarshipSlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/study-resources | Public Higher Study | Study Resources | Server-rendered database content with explicit fallback handling | src/app/higher-study/study-resources/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/subjects | Public Higher Study | Subjects | Server-rendered database content with explicit fallback handling | src/app/higher-study/subjects/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/subjects/[subjectSlug] | Public Higher Study | Subjectslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/subjects/[subjectSlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/supervisors | Public Higher Study | Supervisors | Server-rendered database content with explicit fallback handling | src/app/higher-study/supervisors/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/supervisors/[supervisorSlug] | Public Higher Study | Supervisorslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/supervisors/[supervisorSlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/uk-universities | Public Higher Study | Uk Universities | Server-rendered database content with explicit fallback handling | src/app/higher-study/uk-universities/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/universities | Public redirect | Universities | Redirects to canonical route | src/app/higher-study/universities/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/universities/[universitySlug] | Public Higher Study | Universityslug | Server-rendered database content with explicit fallback handling | src/app/higher-study/universities/[universitySlug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/universities/[universitySlug]/courses | Public Higher Study | Courses | Server-rendered database content with explicit fallback handling | src/app/higher-study/universities/[universitySlug]/courses/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/universities/[universitySlug]/research | Public Higher Study | Research | Server-rendered database content with explicit fallback handling | src/app/higher-study/universities/[universitySlug]/research/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/universities/[universitySlug]/scholarships | Public Higher Study | Scholarships | Server-rendered database content with explicit fallback handling | src/app/higher-study/universities/[universitySlug]/scholarships/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /higher-study/universities/uk | Public redirect | Uk | Redirects to canonical route | src/app/higher-study/universities/uk/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /impact | Public brand/content | Impact | Server-rendered database content with explicit fallback handling | src/app/impact/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /insights | Public brand/content | Insights | Server-rendered database content with explicit fallback handling | src/app/insights/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /legal/privacy | Public legal | Privacy | Authored page/components | src/app/legal/privacy/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /legal/terms | Public legal | Terms | Authored page/components | src/app/legal/terms/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /media | Public brand/content | Media | Authored page/components | src/app/media/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /projects | Public brand/content | Projects | Server-rendered database content with explicit fallback handling | src/app/projects/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /projects/[slug] | Public brand/content | Slug | Server-rendered database content with explicit fallback handling | src/app/projects/[slug]/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |
| /work-with-me | Public brand/content | Work With Me | Authored page/components | src/app/work-with-me/page.tsx | BUILD PASS; external/live browser behavior NOT VERIFIED |

## Metadata and crawler routes

| Route | Purpose | Source | Verification |
|---|---|---|---|
| /robots.txt | Crawler policy | `src/app/robots.ts` | BUILD PASS |
| /sitemap.xml | Generated static + database-backed sitemap | `src/app/sitemap.ts` | BUILD PASS |
| /manifest.webmanifest | Web app manifest | `src/app/manifest.ts` | BUILD PASS |
| /icon | Generated application icon | `src/app/icon.tsx` | BUILD PASS |
| /apple-icon | Generated Apple touch icon | `src/app/apple-icon.tsx` | BUILD PASS |

## API routes (all 174)

| Route | Methods | Classification | Access boundary | Implementation evidence | Source |
|---|---|---|---|---|---|
| /api | GET | Public application API | Anonymous boundary with validation/origin/rate controls where mutating | Handler implementation and validation in source | src/app/api/route.ts |
| /api/cron/audit-log-prune | GET | Scheduler | CRON_SECRET / scheduler guard | Prisma persistence, audit trail | src/app/api/cron/audit-log-prune/route.ts |
| /api/cron/backup | GET | Scheduler | CRON_SECRET / scheduler guard | Prisma persistence | src/app/api/cron/backup/route.ts |
| /api/cron/data-verification | GET | Scheduler | CRON_SECRET / scheduler guard | Prisma persistence | src/app/api/cron/data-verification/route.ts |
| /api/cron/email-queue | GET | Scheduler | CRON_SECRET / scheduler guard | audit trail | src/app/api/cron/email-queue/route.ts |
| /api/cron/health-monitor | GET | Scheduler | CRON_SECRET / scheduler guard | audit trail | src/app/api/cron/health-monitor/route.ts |
| /api/cron/notification-queue | GET | Scheduler | CRON_SECRET / scheduler guard | Handler implementation and validation in source | src/app/api/cron/notification-queue/route.ts |
| /api/cron/phd-deadlines | GET | Scheduler | CRON_SECRET / scheduler guard | Prisma persistence | src/app/api/cron/phd-deadlines/route.ts |
| /api/cron/referral-retry | GET | Scheduler | CRON_SECRET / scheduler guard | Prisma persistence | src/app/api/cron/referral-retry/route.ts |
| /api/cron/scholarship-deadlines | GET | Scheduler | CRON_SECRET / scheduler guard | Prisma persistence | src/app/api/cron/scholarship-deadlines/route.ts |
| /api/cron/session-cleanup | GET | Scheduler | CRON_SECRET / scheduler guard | Handler implementation and validation in source | src/app/api/cron/session-cleanup/route.ts |
| /api/cron/sitemap-generate | GET | Scheduler | CRON_SECRET / scheduler guard | Handler implementation and validation in source | src/app/api/cron/sitemap-generate/route.ts |
| /api/cron/temp-cleanup | GET | Scheduler | CRON_SECRET / scheduler guard | Handler implementation and validation in source | src/app/api/cron/temp-cleanup/route.ts |
| /api/health | GET | Health/readiness | Public safe status; deep/readiness may report dependency state | Handler implementation and validation in source | src/app/api/health/route.ts |
| /api/health/deep | GET | Health/readiness | Public safe status; deep/readiness may report dependency state | Prisma persistence, audit trail | src/app/api/health/deep/route.ts |
| /api/readiness | GET | Health/readiness | Public safe status; deep/readiness may report dependency state | Handler implementation and validation in source | src/app/api/readiness/route.ts |
| /api/v1/admin/ai-tasks | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/ai-tasks/route.ts |
| /api/v1/admin/ai-tasks/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/ai-tasks/[id]/route.ts |
| /api/v1/admin/analytics | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/analytics/route.ts |
| /api/v1/admin/approvals | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, transactional write | src/app/api/v1/admin/approvals/route.ts |
| /api/v1/admin/approvals/[id] | GET,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/approvals/[id]/route.ts |
| /api/v1/admin/articles | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/articles/route.ts |
| /api/v1/admin/articles/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/articles/[id]/route.ts |
| /api/v1/admin/audit-logs | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/admin/audit-logs/route.ts |
| /api/v1/admin/audit-logs/export | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/admin/audit-logs/export/route.ts |
| /api/v1/admin/case-studies | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/case-studies/route.ts |
| /api/v1/admin/case-studies/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/case-studies/[id]/route.ts |
| /api/v1/admin/companies | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/companies/route.ts |
| /api/v1/admin/companies/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/companies/[id]/route.ts |
| /api/v1/admin/contacts | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/contacts/route.ts |
| /api/v1/admin/contacts/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/contacts/[id]/route.ts |
| /api/v1/admin/contacts/export | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/contacts/export/route.ts |
| /api/v1/admin/dashboard | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/admin/dashboard/route.ts |
| /api/v1/admin/documents | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/documents/route.ts |
| /api/v1/admin/documents/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/documents/[id]/route.ts |
| /api/v1/admin/email-operations | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/admin/email-operations/route.ts |
| /api/v1/admin/inquiries | GET,PUT,PATCH | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/inquiries/route.ts |
| /api/v1/admin/inquiries/export | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/inquiries/export/route.ts |
| /api/v1/admin/integrations | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/admin/integrations/route.ts |
| /api/v1/admin/media | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/media/route.ts |
| /api/v1/admin/media/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/media/[id]/route.ts |
| /api/v1/admin/meetings | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/admin/meetings/route.ts |
| /api/v1/admin/meetings/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/meetings/[id]/route.ts |
| /api/v1/admin/newsletter | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/newsletter/route.ts |
| /api/v1/admin/newsletter/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/newsletter/[id]/route.ts |
| /api/v1/admin/newsletter/export | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/newsletter/export/route.ts |
| /api/v1/admin/notes | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/notes/route.ts |
| /api/v1/admin/notes/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/notes/[id]/route.ts |
| /api/v1/admin/notifications | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/notifications/route.ts |
| /api/v1/admin/notifications/[id] | PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/notifications/[id]/route.ts |
| /api/v1/admin/opportunities | GET,POST,PUT | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/opportunities/route.ts |
| /api/v1/admin/opportunities/export | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/opportunities/export/route.ts |
| /api/v1/admin/projects | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/projects/route.ts |
| /api/v1/admin/projects/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/projects/[id]/route.ts |
| /api/v1/admin/security | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/admin/security/route.ts |
| /api/v1/admin/security/two-factor | POST | Admin API | Authenticated/RBAC guard, current TOTP required for disable | Encrypted TOTP secret, hashed recovery codes, audit trail | src/app/api/v1/admin/security/two-factor/route.ts |
| /api/v1/admin/seo | GET,PUT | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, transactional write | src/app/api/v1/admin/seo/route.ts |
| /api/v1/admin/settings | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, transactional write | src/app/api/v1/admin/settings/route.ts |
| /api/v1/admin/settings/test-email | POST | Admin API | Authenticated/RBAC guard in handler | audit trail | src/app/api/v1/admin/settings/test-email/route.ts |
| /api/v1/admin/students | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/students/route.ts |
| /api/v1/admin/tasks | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/tasks/route.ts |
| /api/v1/admin/tasks/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/tasks/[id]/route.ts |
| /api/v1/admin/uploads | POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/uploads/route.ts |
| /api/v1/admin/users | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/users/route.ts |
| /api/v1/admin/users/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/admin/users/[id]/route.ts |
| /api/v1/ai/approvals | GET,POST | Public application API | Anonymous boundary with validation/origin/rate controls where mutating | Prisma persistence, email adapter, audit trail | src/app/api/v1/ai/approvals/route.ts |
| /api/v1/ai/tasks | GET,POST | Public application API | Anonymous boundary with validation/origin/rate controls where mutating | Prisma persistence, audit trail | src/app/api/v1/ai/tasks/route.ts |
| /api/v1/analytics/track | GET,POST,PUT,PATCH,DELETE | Public application API | Anonymous boundary with validation/origin/rate controls where mutating | Prisma persistence | src/app/api/v1/analytics/track/route.ts |
| /api/v1/auth/forgot-password | POST | Authentication | Public auth boundary with validation/rate controls | Prisma persistence, email adapter, audit trail | src/app/api/v1/auth/forgot-password/route.ts |
| /api/v1/auth/login | POST | Authentication | Public auth boundary with validation/rate controls | Prisma persistence, email adapter, audit trail | src/app/api/v1/auth/login/route.ts |
| /api/v1/auth/logout | POST | Authentication | Public auth boundary with validation/rate controls | Prisma persistence, audit trail | src/app/api/v1/auth/logout/route.ts |
| /api/v1/auth/reset-password | POST | Authentication | Public auth boundary with validation/rate controls | Prisma persistence, audit trail | src/app/api/v1/auth/reset-password/route.ts |
| /api/v1/auth/session | GET | Authentication | Public auth boundary with validation/rate controls | Prisma persistence | src/app/api/v1/auth/session/route.ts |
| /api/v1/english-learning/admin/audit-logs | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/english-learning/admin/audit-logs/route.ts |
| /api/v1/english-learning/admin/courses | GET,POST | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/courses/route.ts |
| /api/v1/english-learning/admin/courses/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/courses/[id]/route.ts |
| /api/v1/english-learning/admin/dashboard | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/english-learning/admin/dashboard/route.ts |
| /api/v1/english-learning/admin/lessons | GET,POST | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/lessons/route.ts |
| /api/v1/english-learning/admin/lessons/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/lessons/[id]/route.ts |
| /api/v1/english-learning/admin/practice-tests | GET,POST | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/practice-tests/route.ts |
| /api/v1/english-learning/admin/practice-tests/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/practice-tests/[id]/route.ts |
| /api/v1/english-learning/admin/questions | GET,POST | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/questions/route.ts |
| /api/v1/english-learning/admin/questions/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/questions/[id]/route.ts |
| /api/v1/english-learning/admin/referrals | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/english-learning/admin/referrals/route.ts |
| /api/v1/english-learning/admin/resources | GET,POST | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/resources/route.ts |
| /api/v1/english-learning/admin/resources/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/resources/[id]/route.ts |
| /api/v1/english-learning/admin/tutors | GET,POST | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/tutors/route.ts |
| /api/v1/english-learning/admin/tutors/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Handler implementation and validation in source | src/app/api/v1/english-learning/admin/tutors/[id]/route.ts |
| /api/v1/english-learning/courses | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/courses/route.ts |
| /api/v1/english-learning/courses/[slug] | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/courses/[slug]/route.ts |
| /api/v1/english-learning/courses/[slug]/lessons | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/courses/[slug]/lessons/route.ts |
| /api/v1/english-learning/enroll | POST | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/enroll/route.ts |
| /api/v1/english-learning/health | GET | Health/readiness | Public safe status; deep/readiness may report dependency state | Prisma persistence, audit trail | src/app/api/v1/english-learning/health/route.ts |
| /api/v1/english-learning/lessons/[id] | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/lessons/[id]/route.ts |
| /api/v1/english-learning/practice-tests | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/practice-tests/route.ts |
| /api/v1/english-learning/practice-tests/[slug] | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/practice-tests/[slug]/route.ts |
| /api/v1/english-learning/practice-tests/[slug]/submit | POST | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/practice-tests/[slug]/submit/route.ts |
| /api/v1/english-learning/progress | GET,POST | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/progress/route.ts |
| /api/v1/english-learning/referral | POST | English Learning API | Anonymous domain API; consent/session checks on mutations | audit trail | src/app/api/v1/english-learning/referral/route.ts |
| /api/v1/english-learning/resources | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/resources/route.ts |
| /api/v1/english-learning/resources/[slug] | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/resources/[slug]/route.ts |
| /api/v1/english-learning/tutors | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/tutors/route.ts |
| /api/v1/english-learning/tutors/[slug] | GET | English Learning API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/english-learning/tutors/[slug]/route.ts |
| /api/v1/higher-study/admin/audit-logs | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/higher-study/admin/audit-logs/route.ts |
| /api/v1/higher-study/admin/cities | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/cities/route.ts |
| /api/v1/higher-study/admin/cities/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/cities/[id]/route.ts |
| /api/v1/higher-study/admin/countries | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/countries/route.ts |
| /api/v1/higher-study/admin/countries/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/countries/[id]/route.ts |
| /api/v1/higher-study/admin/courses | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/courses/route.ts |
| /api/v1/higher-study/admin/courses/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/courses/[id]/route.ts |
| /api/v1/higher-study/admin/dashboard | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/higher-study/admin/dashboard/route.ts |
| /api/v1/higher-study/admin/events | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/events/route.ts |
| /api/v1/higher-study/admin/events/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/events/[id]/route.ts |
| /api/v1/higher-study/admin/import | POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/higher-study/admin/import/route.ts |
| /api/v1/higher-study/admin/import/[id] | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/higher-study/admin/import/[id]/route.ts |
| /api/v1/higher-study/admin/intakes | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/intakes/route.ts |
| /api/v1/higher-study/admin/intakes/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/intakes/[id]/route.ts |
| /api/v1/higher-study/admin/referrals | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/higher-study/admin/referrals/route.ts |
| /api/v1/higher-study/admin/research | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/research/route.ts |
| /api/v1/higher-study/admin/research-areas | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/research-areas/route.ts |
| /api/v1/higher-study/admin/research-areas/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/research-areas/[id]/route.ts |
| /api/v1/higher-study/admin/research/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/research/[id]/route.ts |
| /api/v1/higher-study/admin/resources | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/resources/route.ts |
| /api/v1/higher-study/admin/resources/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/resources/[id]/route.ts |
| /api/v1/higher-study/admin/scholarships | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/scholarships/route.ts |
| /api/v1/higher-study/admin/scholarships/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/scholarships/[id]/route.ts |
| /api/v1/higher-study/admin/student-stories | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/student-stories/route.ts |
| /api/v1/higher-study/admin/student-stories/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/student-stories/[id]/route.ts |
| /api/v1/higher-study/admin/subjects | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/subjects/route.ts |
| /api/v1/higher-study/admin/subjects/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/subjects/[id]/route.ts |
| /api/v1/higher-study/admin/supervisors | GET,POST | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/supervisors/route.ts |
| /api/v1/higher-study/admin/supervisors/[id] | GET,PUT,DELETE | Admin API | RBAC through shared admin factory | Prisma persistence | src/app/api/v1/higher-study/admin/supervisors/[id]/route.ts |
| /api/v1/higher-study/admin/universities | GET,POST | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/higher-study/admin/universities/route.ts |
| /api/v1/higher-study/admin/universities/[id] | GET,PUT,DELETE | Admin API | Authenticated/RBAC guard in handler | Prisma persistence | src/app/api/v1/higher-study/admin/universities/[id]/route.ts |
| /api/v1/higher-study/alerts | POST | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/alerts/route.ts |
| /api/v1/higher-study/alerts/[id] | DELETE | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/alerts/[id]/route.ts |
| /api/v1/higher-study/compare | GET,POST | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/compare/route.ts |
| /api/v1/higher-study/consultation | GET,POST | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence, email adapter, audit trail | src/app/api/v1/higher-study/consultation/route.ts |
| /api/v1/higher-study/courses | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/courses/route.ts |
| /api/v1/higher-study/courses/[slug] | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/courses/[slug]/route.ts |
| /api/v1/higher-study/destinations | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/destinations/route.ts |
| /api/v1/higher-study/destinations/[slug] | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/destinations/[slug]/route.ts |
| /api/v1/higher-study/eligibility-check | GET,POST | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence, audit trail | src/app/api/v1/higher-study/eligibility-check/route.ts |
| /api/v1/higher-study/events | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/events/route.ts |
| /api/v1/higher-study/health | GET | Health/readiness | Public safe status; deep/readiness may report dependency state | Prisma persistence | src/app/api/v1/higher-study/health/route.ts |
| /api/v1/higher-study/intakes | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/intakes/route.ts |
| /api/v1/higher-study/referral | POST | Higher Study API | Anonymous domain API; consent/session checks on mutations | audit trail | src/app/api/v1/higher-study/referral/route.ts |
| /api/v1/higher-study/referral/[code]/confirm | POST | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence, audit trail | src/app/api/v1/higher-study/referral/[code]/confirm/route.ts |
| /api/v1/higher-study/research | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/research/route.ts |
| /api/v1/higher-study/research/[slug] | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/research/[slug]/route.ts |
| /api/v1/higher-study/resources | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/resources/route.ts |
| /api/v1/higher-study/resources/[slug] | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/resources/[slug]/route.ts |
| /api/v1/higher-study/saved | GET,POST | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/saved/route.ts |
| /api/v1/higher-study/saved/[id] | DELETE | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/saved/[id]/route.ts |
| /api/v1/higher-study/scholarships | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/scholarships/route.ts |
| /api/v1/higher-study/scholarships/[slug] | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/scholarships/[slug]/route.ts |
| /api/v1/higher-study/student-stories | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/student-stories/route.ts |
| /api/v1/higher-study/subjects | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/subjects/route.ts |
| /api/v1/higher-study/supervisors | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/supervisors/route.ts |
| /api/v1/higher-study/supervisors/[slug] | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/supervisors/[slug]/route.ts |
| /api/v1/higher-study/universities | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/universities/route.ts |
| /api/v1/higher-study/universities/[slug] | GET | Higher Study API | Anonymous domain API; consent/session checks on mutations | Prisma persistence | src/app/api/v1/higher-study/universities/[slug]/route.ts |
| /api/v1/inquiries | POST | Public application API | Anonymous boundary with validation/origin/rate controls where mutating | Prisma persistence, email adapter, audit trail | src/app/api/v1/inquiries/route.ts |
| /api/v1/meetings | POST | Public application API | Anonymous boundary with validation/origin/rate controls where mutating | Prisma persistence, transactional write, email adapter, audit trail | src/app/api/v1/meetings/route.ts |
| /api/v1/meetings/admin | GET,PATCH | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/meetings/admin/route.ts |
| /api/v1/newsletter | POST | Public application API | Anonymous boundary with validation/origin/rate controls where mutating | Prisma persistence, email adapter, audit trail | src/app/api/v1/newsletter/route.ts |
| /api/v1/newsletter/verify | GET | Public application API | Anonymous boundary with validation/origin/rate controls where mutating | Prisma persistence, email adapter, audit trail | src/app/api/v1/newsletter/verify/route.ts |
| /api/v1/public/articles | GET | Public read API | Anonymous read | Prisma persistence | src/app/api/v1/public/articles/route.ts |
| /api/v1/public/projects | GET | Public read API | Anonymous read | Prisma persistence | src/app/api/v1/public/projects/route.ts |
| /api/v1/whatsapp/admin/stats | GET | Admin API | Authenticated/RBAC guard in handler | Prisma persistence, audit trail | src/app/api/v1/whatsapp/admin/stats/route.ts |
| /api/v1/whatsapp/chat | GET,POST | WhatsApp | Public/provider or admin guard according to endpoint | Handler implementation and validation in source | src/app/api/v1/whatsapp/chat/route.ts |
| /api/v1/whatsapp/send | POST | WhatsApp | Public/provider or admin guard according to endpoint | Handler implementation and validation in source | src/app/api/v1/whatsapp/send/route.ts |
| /api/v1/whatsapp/status | GET | WhatsApp | Public/provider or admin guard according to endpoint | Handler implementation and validation in source | src/app/api/v1/whatsapp/status/route.ts |
| /api/v1/whatsapp/webhook | GET,POST | Provider webhook | Signature/verification boundary | Prisma persistence, audit trail | src/app/api/v1/whatsapp/webhook/route.ts |

## Route-level conclusions

- No checked-in admin `page.tsx` contains the rejected generic `Page Title` / `Description` scaffold text.
- `/admin/facebook`, `/admin/instagram`, `/admin/linkedin`, and `/admin/social-media` are intentionally provider-status views, not fake publishing applications.
- `/contact` and `/expertise` remain compatibility redirects but are intentionally omitted from the sitemap in favor of `/work-with-me` and `/about`.
- The build route manifest and this source inventory agree on the 61 admin page files and 174 API handler files.
- Runtime behavior of private routes was not marked PASS merely because they built; production session/provider/browser evidence is reported separately.
