# Complete QA & Testing Checklist — Mind Garden Second Brain App

**Last Updated:** February 9, 2026  
**Scope:** Frontend, Backend, AI Integration, Error Handling, Accessibility, Security

---

## Table of Contents
1. [Frontend Testing](#frontend-testing)
2. [Backend Testing](#backend-testing)
3. [AI Functionality](#ai-functionality)
4. [Edge Cases & Error Handling](#edge-cases--error-handling)
5. [UX & UI Consistency](#ux--ui-consistency)
6. [Accessibility Testing](#accessibility-testing)
7. [Architecture & Best Practices](#architecture--best-practices)
8. [Manual Test Checklist](#manual-test-checklist)
9. [Automated Test Suggestions](#automated-test-suggestions)

---

## Frontend Testing

### 1.1 Tag Suggestion Flow (AI Available)
**Priority:** HIGH  
**Test Type:** Manual + Automated  

- [ ] Click "Suggest Tags" button with valid title and content
  - Expected: Spinner appears briefly
  - Expected: Suggested tags populate below the form field
  - Expected: No error toast visible
  - Expected: Inline message "Using local tag suggestions (offline)" is **NOT** shown
  - Expected: Tags can be clicked to add to the Tags input
  
- [ ] Verify disabled state of button
  - [ ] Button disabled when title is empty
  - [ ] Button disabled when content is empty
  - [ ] Button disabled while loading (`isAILoading === true`)
  - [ ] Button enabled when both title and content present

- [ ] Test consecutive clicks
  - [ ] Click Suggest Tags, wait for results
  - [ ] Click Suggest Tags again with different content
  - [ ] Verify previous suggested tags are cleared and replaced

**Code Snippet (Manual Test Setup):**
```bash
npm run dev
# Open browser DevTools → Network tab
# Add title: "React Performance" 
# Add content: "useCallback prevents unnecessary re-renders..."
# Click Suggest Tags
# Verify no 404 or network errors; tags appear
```

---

### 1.2 Tag Suggestion Flow (AI Unavailable — Fallback)
**Priority:** HIGH  
**Test Type:** Manual + Simulated Failure  

- [ ] Simulate network unavailability
  - [ ] Open browser DevTools → Network tab → Throttling: Offline
  - [ ] Click "Suggest Tags"
  - Expected: Spinner appears briefly
  - Expected: Suggested tags populate from local fallback extractor
  - Expected: Inline message "Using local tag suggestions (offline)" **IS** shown
  - Expected: **NO** "Failed to fetch" toast visible
  - Expected: No console errors about network failure

- [ ] Simulate 404 response (AI function not deployed)
  - [ ] Point `env.SUPABASE_URL` to non-existent endpoint (or mock 404)
  - [ ] Click "Suggest Tags"
  - Expected: Inline message shown
  - Expected: Fallback tags still populated
  - Expected: Success toast "AI unavailable — using local tag suggestions" shows (if toasts not removed)

- [ ] Simulate 500 error (server error)
  - [ ] Mock Supabase function to return 500
  - [ ] Click "Suggest Tags"
  - Expected: Fallback tags populated
  - Expected: Inline message shown
  - Expected: No raw error message exposed to user

**Code Snippet (Simulate Offline in DevTools):**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Throttling dropdown → Select "Offline"
4. Add title and content in the modal
5. Click "Suggest Tags"
6. Verify tags appear and inline message is shown
7. Switch back to Online in Throttling dropdown
```

---

### 1.3 Knowledge Item Creation
**Priority:** HIGH  
**Test Type:** Manual + Automated  

- [ ] Create new knowledge item with all fields
  - [ ] Enter title: "Learning React Hooks"
  - [ ] Enter content: Long paragraph (>100 words)
  - [ ] Select type: "Note"
  - [ ] Enter tags: "react, learning, hooks"
  - [ ] Enter source URL: "https://example.com/article"
  - [ ] Click "Create"
  - Expected: Spinner shows in button
  - Expected: Summary is generated (or fails gracefully)
  - Expected: Item saved to database
  - Expected: Modal closes
  - Expected: New item appears in dashboard

- [ ] Create item without optional fields
  - [ ] Title required ✓ (form validation)
  - [ ] Content required ✓
  - [ ] Type required ✓
  - [ ] Tags optional ✓ (can be empty)
  - [ ] Source URL optional ✓ (can be empty or invalid URL shows error)

- [ ] Update existing knowledge item
  - [ ] Click on existing item in dashboard
  - [ ] Modal opens with "Edit Knowledge Item" title
  - [ ] Form pre-populated with current data
  - [ ] Change title, content, tags
  - [ ] Click "Update"
  - Expected: Item updated in database
  - Expected: Dashboard reflects changes immediately
  - Expected: No duplicate items created

**Code Snippet (Verify Create + DB):**
```typescript
// In browser console after creating item:
// 1. Check Network tab for POST request to Supabase
// 2. Verify response includes item ID and timestamp
// 3. Refresh page and verify item persists
```

---

### 1.4 Dashboard Filters, Search, and Sorting
**Priority:** HIGH  
**Test Type:** Manual  

- [ ] Filter by type
  - [ ] Create items with types: "note", "link", "insight"
  - [ ] Filter by "Note" → Only notes shown
  - [ ] Filter by "Link" → Only links shown
  - [ ] Filter by "Insight" → Only insights shown
  - [ ] Clear filter → All items shown

- [ ] Search by title and content
  - [ ] Enter search term "React"
  - [ ] Dashboard updates to show only items matching "React"
  - [ ] Case-insensitive search works
  - [ ] Partial match works (search "Reac" matches "React")
  - [ ] Clear search → All items shown

- [ ] Sort by date
  - [ ] Sort "Newest First" → Recently created items first
  - [ ] Sort "Oldest First" → Old items first
  - [ ] Sort "A-Z" by title → Alphabetical order
  - [ ] Sort "Z-A" by title → Reverse alphabetical order

- [ ] Combined filtering and search
  - [ ] Filter by type + search term simultaneously
  - [ ] Both filters apply correctly
  - [ ] Clear one filter, other filters still active

**Code Snippet (Test Search):**
```bash
# Create 3+ items with different titles
# In search field type "React"
# Verify only items with "React" in title or content appear
# Delete search term, verify all items return
```

---

### 1.5 Knowledge Card and Detail View
**Priority:** MEDIUM  
**Test Type:** Manual  

- [ ] Knowledge Card displays correctly
  - [ ] Title visible
  - [ ] Summary visible (if available)
  - [ ] Type badge visible (Note/Link/Insight)
  - [ ] Tag badges visible
  - [ ] Truncation for long titles/summaries (ellipsis)

- [ ] Click card to open detail panel
  - [ ] Detail panel slides in from right (or overlay shows)
  - [ ] Full content visible
  - [ ] All metadata (title, type, tags, source URL, created date)
  - [ ] Edit and Delete buttons present

- [ ] Close detail panel
  - [ ] Click X or outside panel (if overlay)
  - [ ] Panel closes smoothly
  - [ ] Dashboard remains intact

---

### 1.6 Responsive Design
**Priority:** HIGH  
**Test Type:** Manual  

**Desktop (1920px):**
- [ ] Modal and form layout intact
- [ ] Dashboard grid displays 3+ cards per row
- [ ] Detail panel width appropriate (sidebar-style)
- [ ] No horizontal scrolling

**Tablet (768px — iPad):**
- [ ] Modal responsive and centered
- [ ] Dashboard grid displays 2 cards per row
- [ ] Detail panel overlays or takes full width
- [ ] Touch-friendly button sizes (48px min)

**Mobile (375px — iPhone SE):**
- [ ] Modal stacked and full-width
- [ ] Dashboard single card per row
- [ ] Hamburger menu (if applicable) visible
- [ ] Detail panel full-screen overlay
- [ ] All buttons easily tappable
- [ ] No overflow or horizontal scroll

**Code Snippet (DevTools Responsive Testing):**
```bash
# DevTools → Click Responsive Design Mode (Ctrl+Shift+M)
# Test breakpoints:
# - iPhone SE (375x667)
# - iPad (768x1024)
# - Desktop (1920x1080)
# Verify layout, touch targets, overflow
```

---

### 1.7 Micro-interactions and Motion
**Priority:** MEDIUM  
**Test Type:** Manual  

- [ ] Loading spinners
  - [ ] Smooth rotation animation (using `animate-spin`)
  - [ ] Positioned correctly in buttons and modals
  - [ ] Duration consistent (~1s per rotation)

- [ ] Modal transitions
  - [ ] Modal opens with fade-in + scale animation
  - [ ] Modal closes smoothly
  - [ ] Background overlay fades in/out

- [ ] Suggested tags animation
  - [ ] Tags slide in with fade (AnimatePresence + motion.div)
  - [ ] Tags slide out when cleared
  - [ ] Smooth easing curves (no jerky motion)

- [ ] Button hover states
  - [ ] Buttons change color/shadow on hover
  - [ ] Transitions smooth (100-200ms)
  - [ ] Active/disabled states visually distinct

**Code Snippet (Verify Framer Motion):**
```bash
# npm run dev
# Open DevTools → Rendering → Paint flashing
# Click buttons and interact with modal
# Verify no excessive repaints or jank
```

---

## Backend Testing

### 2.1 AI Endpoints (Supabase Function)
**Priority:** HIGH  
**Test Type:** Manual + Integration  

**Endpoint:** `POST /functions/v1/ai-process`

**Test 2.1.1: Summarization Request**
- [ ] Request structure
  ```json
  {
    "action": "summarize",
    "title": "React Hooks",
    "content": "Long paragraph about React Hooks..."
  }
  ```
- [ ] Response on success (200)
  ```json
  {
    "result": "A concise summary of the content..."
  }
  ```
- [ ] Summary is non-empty and relevant
- [ ] Response time < 5 seconds (if using OpenAI)

**Test 2.1.2: Auto-tag Request**
- [ ] Request structure
  ```json
  {
    "action": "auto-tag",
    "title": "React Hooks",
    "content": "Content..."
  }
  ```
- [ ] Response on success (200)
  ```json
  {
    "tags": ["react", "hooks", "javascript"]
  }
  ```
- [ ] Tags array non-empty (1-6 tags)
- [ ] Response time < 5 seconds

**Test 2.1.3: Missing Authorization**
- [ ] Request without `Authorization` header
- [ ] Expected: 401 Unauthorized
- [ ] Response includes user-friendly error message

**Test 2.1.4: Invalid Action**
- [ ] Request with `action: "invalid"`
- [ ] Expected: 400 Bad Request
- [ ] Error message: "Unknown action"

**Code Snippet (cURL Testing):**
```bash
# Test summarization endpoint
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "summarize",
    "title": "React Hooks",
    "content": "useCallback prevents re-renders..."
  }' \
  https://<supabase-project>.supabase.co/functions/v1/ai-process

# Test auto-tag endpoint
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "auto-tag",
    "title": "React Hooks",
    "content": "useCallback prevents re-renders..."
  }' \
  https://<supabase-project>.supabase.co/functions/v1/ai-process
```

---

### 2.2 Error Handling
**Priority:** HIGH  
**Test Type:** Manual + Integration  

- [ ] Missing OpenAI API Key
  - [ ] Supabase function env var not set
  - [ ] Request to `/ai-process` returns 500 or meaningful 400
  - [ ] Error message does **NOT** expose the key
  - [ ] Frontend receives error and uses local fallback

- [ ] Network Timeout
  - [ ] OpenAI API unreachable
  - [ ] Function returns 504 Gateway Timeout or connection timeout
  - [ ] Frontend handles gracefully (fallback tags)

- [ ] Rate Limiting
  - [ ] OpenAI rate limit exceeded
  - [ ] Function returns 429 Too Many Requests
  - [ ] Frontend shows user-friendly message (optional: "Please try again later")

- [ ] Malformed Request Body
  - [ ] Missing required fields (`title`, `content`)
  - [ ] Function returns 400 Bad Request
  - [ ] Error message describes what's missing

**Code Snippet (Backend Error Handling Pattern):**
```typescript
// In Supabase Edge Function (ai-process/index.ts)
export async function handler(req: Request) {
  const { action, title, content } = await req.json();

  if (!action || !title || !content) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!Deno.env.get('OPENAI_API_KEY')) {
    return new Response(
      JSON.stringify({ error: 'AI service unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Process request
}
```

---

### 2.3 Knowledge Item Storage (Supabase)
**Priority:** HIGH  
**Test Type:** Manual + SQL verification  

- [ ] Create knowledge item
  - [ ] POST to `/api/knowledge-items` (or Supabase insert)
  - [ ] Item saved with all fields: title, content, type, tags, source_url, summary
  - [ ] Auto-filled fields: id (UUID), created_at, updated_at, user_id
  - [ ] Tags normalized (lowercase, deduplicated)

- [ ] Retrieve knowledge item
  - [ ] GET `/api/knowledge-items/:id`
  - [ ] Returns correct item with all fields
  - [ ] Summary included (or null if not generated)

- [ ] Update knowledge item
  - [ ] PATCH `/api/knowledge-items/:id`
  - [ ] Fields updated correctly
  - [ ] Tags deduplicated on update
  - [ ] updated_at timestamp changes

- [ ] Delete knowledge item
  - [ ] DELETE `/api/knowledge-items/:id`
  - [ ] Item removed from database
  - [ ] No orphaned tags or metadata

**Code Snippet (Verify DB Schema):**
```sql
-- In Supabase SQL editor, verify schema:
SELECT * FROM knowledge_items LIMIT 1;
-- Expected columns:
-- id, user_id, title, content, type, tags, source_url, summary, created_at, updated_at

-- Check tag normalization:
SELECT tags FROM knowledge_items WHERE id = '<item-id>';
-- Expected: tags should be Array (lowercase) or JSON array
```

---

### 2.4 Public API Endpoints (if applicable)
**Priority:** MEDIUM  
**Test Type:** Integration  

- [ ] GET `/api/knowledge-items` (list public items)
  - [ ] Returns JSON array with schema:
    ```json
    {
      "items": [
        {
          "id": "uuid",
          "title": "string",
          "summary": "string or null",
          "tags": ["string"],
          "type": "note|link|insight",
          "created_at": "ISO timestamp"
        }
      ],
      "total": 10
    }
    ```
  - [ ] Pagination works (limit, offset params)
  - [ ] Filtering works (type, tags)
  - [ ] Sorting works (created_at, title)

- [ ] Rate Limiting
  - [ ] API limited to X requests per minute per IP
  - [ ] Returns 429 when exceeded
  - [ ] Includes `Retry-After` header

- [ ] Authentication (if needed)
  - [ ] Public endpoints don't require auth
  - [ ] Private endpoints (create/update/delete) require valid JWT
  - [ ] Invalid JWT returns 401

---

## AI Functionality

### 3.1 Summarization
**Priority:** HIGH  
**Test Type:** Manual + Automated  

- [ ] Correctness
  - [ ] Short content (< 100 words) → No summary generated (or optional)
  - [ ] Medium content (100–1000 words) → 2–3 sentence summary
  - [ ] Long content (> 1000 words) → 3–5 sentence summary
  - [ ] Summary is relevant and coherent

- [ ] Edge cases
  - [ ] Content with only punctuation → Graceful handling (null or empty)
  - [ ] Content with special characters → Properly escaped
  - [ ] Content in non-English → Handled (or skipped with message)

- [ ] Performance
  - [ ] Summary generated within 5 seconds
  - [ ] No timeout on long content

**Test Data:**
```markdown
# Short Content (< 100 words)
"React is a JavaScript library for building UIs."

# Medium Content
"React is a JavaScript library for building user interfaces using components.
It uses a virtual DOM to optimize rendering. Hooks like useState and useEffect
manage state and side effects. React Router enables navigation across pages."

# Long Content
"React is a JavaScript library...
[Full article, > 1000 words]"
```

---

### 3.2 Auto-tagging (AI-powered)
**Priority:** HIGH  
**Test Type:** Manual  

- [ ] AI-generated tags (when available)
  - [ ] Tags relevant to content
  - [ ] 2–6 tags returned
  - [ ] Tags are single words (no phrases)
  - [ ] No duplicate tags

- [ ] Test content samples
  - [ ] Content: "React hooks guide" → Tags: react, hooks, javascript, guide (or similar)
  - [ ] Content: "PostgreSQL tutorial" → Tags: postgresql, database, sql, tutorial

- [ ] Response includes metadata
  - [ ] `fallback: false` when AI used
  - [ ] `fallback: true` when local extractor used

---

### 3.3 Auto-tagging (Client-side Fallback)
**Priority:** HIGH  
**Test Type:** Manual + Automated  

**Test 3.3.1: Unigram Extraction**
- [ ] Extracts top-frequency single words
  - [ ] Input: "React React hooks hooks hooks learning"
  - [ ] Expected output: ["hooks", "react", "learning"] (by frequency)
  - [ ] Stopwords removed: "the", "and", "is", "are", etc.
  - [ ] Short words (< 3 chars) removed

- [ ] Handles punctuation and URLs
  - [ ] Input: "Learn React! Visit https://example.com for more."
  - [ ] Expected: ["learn", "react"] (URL stripped, punctuation removed)

**Test 3.3.2: Bigram Enhancement (optional)**
- [ ] If bigrams implemented, prefer frequent bigrams
  - [ ] Input: "machine learning machine learning deep learning"
  - [ ] Expected: ["machine learning", "deep learning"] or similar

**Code Snippet (Test Fallback Locally):**
```typescript
// In console or test file:
import { fallbackExtractTags } from '@/hooks/useAI';

const result = fallbackExtractTags(
  'React React hooks hooks hooks learning JavaScript'
);
console.log(result);
// Expected: ["hooks", "react", "learning"] (or similar order by frequency)
```

---

### 3.4 Fallback Metadata
**Priority:** HIGH  
**Test Type:** Automated  

- [ ] `autoTag` returns object with `fallback` flag
  ```typescript
  const result = await autoTag(title, content);
  // result.fallback === false → AI used
  // result.fallback === true → Local fallback used
  ```

- [ ] UI respects the flag
  - [ ] When `fallback: true` → Inline message shown
  - [ ] When `fallback: false` → No inline message

---

## Edge Cases & Error Handling

### 4.1 Empty or Invalid Input
**Priority:** HIGH  
**Test Type:** Manual  

- [ ] Empty title
  - [ ] Form validation prevents submit
  - [ ] "Title is required" error message shown
  - [ ] Suggest Tags button disabled

- [ ] Empty content
  - [ ] Form validation prevents submit
  - [ ] "Content is required" error message shown
  - [ ] Suggest Tags button disabled

- [ ] Long title (> 200 chars)
  - [ ] Form validation prevents submit
  - [ ] "Title too long" error shown

- [ ] Long content (> 10000 chars)
  - [ ] Form validation prevents submit
  - [ ] "Content too long" error shown

- [ ] Invalid URL in source_url field
  - [ ] Form validation shows error
  - [ ] "Invalid URL" message
  - [ ] Can clear field (optional URL)

---

### 4.2 Duplicate Tags
**Priority:** MEDIUM  
**Test Type:** Manual  

- [ ] User enters duplicate tags
  - [ ] Input: "react, react, hooks"
  - [ ] On save: Deduplicated to ["react", "hooks"]
  - [ ] Database stores deduplicated tags

- [ ] User adds suggested tag that's already in input
  - [ ] Click suggested tag that's already in Tags field
  - [ ] Expected: Tag not added again
  - [ ] (Code snippet shows this check: `if (!tagsArray.includes(tag))`)

---

### 4.3 Network Failures
**Priority:** HIGH  
**Test Type:** Simulated  

- [ ] Offline while creating item
  - Expected: Form submit fails with graceful message
  - Expected: Data not lost (user can retry)
  - Expected: No "Failed to fetch" shown (optional offline message)

- [ ] Network drops while fetching knowledge items
  - [ ] Dashboard shows error message
  - [ ] Retry button available
  - [ ] No spinner stuck indefinitely

- [ ] Timeout during summarization
  - [ ] Summarization takes > 30s (or custom timeout)
  - [ ] Request aborted
  - [ ] Summary set to null (item still created)
  - [ ] User notified: "Summary generation timed out"

---

### 4.4 Concurrent Requests
**Priority:** MEDIUM  
**Test Type:** Manual  

- [ ] Click Suggest Tags multiple times quickly
  - [ ] Only latest request result shown
  - [ ] Previous results discarded
  - [ ] No race condition (tags don't mix)

- [ ] Create item while Suggest Tags is loading
  - Expected: Button disabled (loading state)
  - Expected: Can't submit form while AI request pending

---

### 4.5 Large Content
**Priority:** MEDIUM  
**Test Type:** Manual  

- [ ] Very long content (9000 chars)
  - [ ] Creation succeeds
  - [ ] Summarization completes
  - [ ] No UI hangs or memory issues

- [ ] Many tags (50+ tags)
  - [ ] Display handles overflow (scrollable or chip wrapping)
  - [ ] All tags saved correctly
  - [ ] No UI performance degradation

---

## UX & UI Consistency

### 5.1 Toast Notifications
**Priority:** HIGH  
**Test Type:** Manual  

- [ ] Success toast on item creation
  - [ ] Message clear: "Item created" (optional)
  - [ ] Auto-dismisses after 3-4 seconds
  - [ ] Positioned consistently (bottom-right or top-right)

- [ ] Error toast only for critical failures
  - [ ] Missing OpenAI key → (fallback used, no error toast shown)
  - [ ] Network error → (fallback used, no "Failed to fetch" shown)
  - [ ] Database error → Error toast shown (critical)

- [ ] **NO "Failed to fetch" toast visible**
  - [ ] AI endpoint unavailable → Local fallback, inline message only
  - [ ] Supabase down → Show meaningful message, not raw fetch error

---

### 5.2 Inline Fallback Messages
**Priority:** HIGH  
**Test Type:** Manual  

- [ ] Message shown only when fallback is used
  - [ ] When AI available: No message
  - [ ] When AI unavailable: "Using local tag suggestions (offline)" shown

- [ ] Message styling
  - [ ] Color: muted-foreground (subtle gray)
  - [ ] Size: small text (text-sm)
  - [ ] Position: Below Tags input field
  - [ ] Accessible: `aria-live="polite"` attribute

- [ ] Message disappears when
  - [ ] Modal closed
  - [ ] Form reset
  - [ ] New Suggest Tags request starts

---

### 5.3 Loading States
**Priority:** HIGH  
**Test Type:** Manual  

- [ ] Suggest Tags button
  - [ ] Shows spinner when loading
  - [ ] Text changes to loading state (optional: "Generating...")
  - [ ] Button disabled while loading
  - [ ] Spinner smooth and on-brand

- [ ] Form submit
  - [ ] Submit button shows spinner
  - [ ] Button text changes to "Create" → shows spinner, or "Update"
  - [ ] Button disabled while submitting
  - [ ] Form fields disabled (optional)

- [ ] Dashboard loading
  - [ ] Skeleton loaders for cards (if implemented)
  - [ ] Or subtle loading spinner
  - [ ] Not blocky or jarring

---

### 5.4 Error Messages
**Priority:** MEDIUM  
**Test Type:** Manual  

- [ ] All error messages are user-friendly
  - [ ] ✗ Don't show: "Failed to fetch: TypeError at line 42"
  - [ ] ✓ Show: "Unable to create item. Please try again."

- [ ] Field validation errors
  - [ ] Displayed inline below field
  - [ ] Red text color (danger)
  - [ ] Clear message on what's wrong

---

## Accessibility Testing

### 6.1 ARIA and Semantic HTML
**Priority:** HIGH  
**Test Type:** Automated + Manual  

- [ ] Form fields have `<label>` tags
  - [ ] All inputs associated via `htmlFor` attribute
  - [ ] Verify in DevTools: input → label visible in accessibility tree

- [ ] Inline fallback message has `aria-live="polite"`
  - [ ] Screen reader announces message when added
  - [ ] Test with NVDA or JAWS

- [ ] Buttons have descriptive text
  - [ ] ✓ "Suggest Tags" (clear action)
  - [ ] ✓ "Create" (clear action)
  - [ ] Icon buttons have `aria-label` (if no text)

- [ ] Modal dialog
  - [ ] Has `role="dialog"` (automatically via Dialog component)
  - [ ] Close button has `aria-label="Close"` or accessible text
  - [ ] Focus trapped inside modal while open
  - [ ] Focus returns to trigger button on close

- [ ] Tags list
  - [ ] Consider `role="list"` and `role="listitem"` (or semantic `<ul>/<li>`)
  - [ ] Suggested tags are focusable buttons

---

### 6.2 Keyboard Navigation
**Priority:** HIGH  
**Test Type:** Manual  

- [ ] Tab through form
  - [ ] Title field
  - [ ] Type dropdown
  - [ ] Content textarea
  - [ ] Suggest Tags button
  - [ ] Tags input
  - [ ] Suggested tag buttons (if any)
  - [ ] Source URL field
  - [ ] Create/Cancel buttons
  - Expected: Logical tab order (top → bottom)

- [ ] Enter submits form
  - [ ] In text fields, Enter doesn't submit (unless explicitly coded)
  - [ ] In form Submit button, Enter triggers submit

- [ ] Escape closes modal
  - [ ] Press Escape in modal
  - [ ] Modal closes (standard Dialog behavior)

- [ ] Add suggested tag via keyboard
  - [ ] Tab to suggested tag button
  - [ ] Press Enter or Space
  - [ ] Tag added to input

**Code Snippet (Test Keyboard):**
```bash
# Open Knowledge Item modal
# Press Tab repeatedly and note tabbing order
# Press Escape → Modal should close
# Focus should return to button that opened modal
```

---

### 6.3 Screen Reader Testing
**Priority:** HIGH  
**Test Type:** Manual (with NVDA/JAWS or VoiceOver)  

**Using NVDA (Windows, Free):**
```bash
# Download NVDA from nvaccess.org
# Start NVDA (Insert key activates it)
# Tab through form and listen to announcements

# Expected:
# "Title, edit text"
# "Content, multi-line edit text"
# "Type, dropdown button"
# "Suggest Tags, button"
# "Using local tag suggestions (offline), polite alert" (when shown)
```

**Using JAWS or VoiceOver:**
- [ ] Same steps, different key combinations

**Checklist:**
- [ ] All form labels announced
- [ ] Button purposes clear ("Suggest Tags", "Create", "Cancel")
- [ ] Inline fallback message announced as polite alert
- [ ] No hidden text read aloud
- [ ] Skip links (optional for single-page app)

---

### 6.4 Contrast and Color
**Priority:** MEDIUM  
**Test Type:** Automated + Manual  

- [ ] Text contrast ratio
  - [ ] Normal text: WCAG AA (4.5:1 minimum)
  - [ ] Large text (18pt+): WCAG AA (3:1 minimum)
  - [ ] Test with WebAIM Contrast Checker

- [ ] Color not sole means of communication
  - [ ] Error messages use red + icon or text (not just red)
  - [ ] Disabled state uses opacity + visual indicator, not just color

- [ ] Focus indicators
  - [ ] Every focusable element has visible focus ring
  - [ ] Focus ring contrast: 3:1 minimum
  - [ ] Tailwind default focus ring: blue outline (good)

**Code Snippet (Test Contrast):**
```bash
# DevTools → Rendering → Emulate Vision Deficiencies
# Select "Achromatopsia" (no color)
# Verify UI is still readable and functional
```

---

## Architecture & Best Practices

### 7.1 Separation of Concerns
**Priority:** MEDIUM  
**Test Type:** Code Review  

- [ ] AI logic isolated in `useAI` hook
  - [ ] `autoTag`, `summarize` functions are pure(ish)
  - [ ] No React hooks inside AI logic (except useState for isLoading)
  - [ ] Fallback logic self-contained

- [ ] UI logic isolated in components
  - [ ] Components call `useAI` but don't implement AI logic
  - [ ] Toast/inline messages triggered by UI, not AI hook

- [ ] API calls centralized
  - [ ] Single `AI_FUNCTION_URL` constant
  - [ ] Single fetch implementation (not scattered)

---

### 7.2 Structured Return Types
**Priority:** HIGH  
**Test Type:** Code Review + Automated  

- [ ] `autoTag` returns structured object
  ```typescript
  return { tags: string[]; fallback: boolean }
  ```
  - [ ] Allows UI to know if fallback was used
  - [ ] Type-safe (TypeScript enforces shape)

- [ ] Recommended (optional): Extend to include error info
  ```typescript
  return { tags: string[]; fallback: boolean; error?: string }
  ```

- [ ] Error responses from API include structure
  ```json
  { "error": "User-friendly message", "code": "MISSING_API_KEY" }
  ```

---

### 7.3 Privacy & Security
**Priority:** HIGH  
**Test Type:** Code Review + Manual  

- [ ] OpenAI API key never exposed on frontend
  - [ ] Key stored in Supabase function env vars (server-side only)
  - [ ] Frontend calls Supabase function (trusted server)
  - [ ] Network tab shows no API key in request headers or body

- [ ] Environment variables
  - [ ] `.env.local` not committed to git
  - [ ] `.gitignore` includes `.env.local`
  - [ ] README documents required env vars

- [ ] Error messages don't leak secrets
  - [ ] Error responses don't include API keys or full stack traces
  - [ ] Internal errors logged server-side only

**Code Snippet (Verify No Key Exposure):**
```bash
# Check git history for secrets:
git log --all -p -S "sk-" | grep -i key

# Check .gitignore:
cat .gitignore | grep -E "(\.env|\.keys|secrets)"

# Verify frontend env vars don't include keys:
cat .env or .env.example (should have SUPABASE_ANON_KEY, not OPENAI_KEY)
```

---

### 7.4 Error Handling Strategy
**Priority:** HIGH  
**Test Type:** Code Review  

- [ ] Consistent error handling pattern
  ```typescript
  try {
    // Request
  } catch (error) {
    // Log technical error
    console.error('Details:', error);
    // Show user-friendly message
    toast.error('User-friendly message');
    // Return fallback or null
    return fallbackValue;
  }
  ```

- [ ] Network errors → Fallback (tags) or friendly message
- [ ] Validation errors → Inline form validation
- [ ] Server errors (5xx) → Generic message + retry option

---

### 7.5 Type Safety and Documentation
**Priority:** MEDIUM  
**Test Type:** Code Review  

- [ ] All functions have JSDoc comments
  ```typescript
  /**
   * Generate tags for a knowledge item.
   * Uses AI if available, falls back to local keyword extraction.
   * @param title - Knowledge item title
   * @param content - Knowledge item content
   * @returns Object with tags array and fallback flag
   */
  const autoTag = async (
    title: string,
    content: string
  ): Promise<{ tags: string[]; fallback: boolean }> => { ... }
  ```

- [ ] TypeScript strict mode enabled (tsconfig.json)
  - [ ] `"strict": true`
  - [ ] No `any` types (or documented reasons)

- [ ] Props and return types explicit
  - [ ] All React component props typed
  - [ ] Function parameters typed
  - [ ] Return types specified (not inferred)

---

### 7.6 Code Readability
**Priority:** MEDIUM  
**Test Type:** Code Review  

- [ ] Naming is clear
  - [ ] `autoTag` → Could be `generateTags` (more descriptive)
  - [ ] `aiFallbackUsed` → Clear flag name
  - [ ] `fallbackExtractTags` → Descriptive

- [ ] Comments explain "why", not "what"
  - Good: `// Fallback to local extraction if OpenAI key missing`
  - Bad: `// Set fallback to true`

- [ ] Functions are single-responsibility
  - `autoTag` → generates tags (doesn't show toasts)
  - Component → orchestrates UI and calls hooks

---

## Manual Test Checklist

### 8.1 Complete User Flow (Happy Path)
**Priority:** HIGH  
**Duration:** ~10 minutes  

1. [ ] Open app in browser
2. [ ] Log in (if auth required)
3. [ ] Click "New Knowledge Item" button
4. [ ] Enter title: "Machine Learning Basics"
5. [ ] Enter content: (2-3 sentences about ML)
6. [ ] Select type: "Note"
7. [ ] Click "Suggest Tags"
   - [ ] Spinner appears
   - [ ] Tags populate (either AI or fallback)
   - [ ] If fallback: Inline message "Using local..." shown
8. [ ] Click suggested tag "machine" or "learning"
   - [ ] Tag added to the Tags field
9. [ ] Enter source URL: "https://example.com/ml-basics"
10. [ ] Click "Create"
    - [ ] Spinner shows in button
    - [ ] Modal closes
    - [ ] New item appears in dashboard
11. [ ] Click the new item
    - [ ] Detail panel opens
    - [ ] Summary visible (or placeholder)
    - [ ] All metadata correct
12. [ ] Close detail panel
13. [ ] Search for "machine" in search bar
    - [ ] Only matching items shown
14. [ ] Filter by type: "Note"
    - [ ] Only notes shown
15. [ ] Clear filters
    - [ ] All items shown
16. [ ] Sort by "Newest First"
    - [ ] New item appears first
17. [ ] Click "Edit" on new item
    - [ ] Modal opens with "Edit Knowledge Item"
    - [ ] Fields pre-populated
    - [ ] Change title to "Machine Learning Advanced"
    - [ ] Click "Update"
    - [ ] Dashboard updates
18. [ ] Click "Delete" (optional)
    - [ ] Confirm dialog (if implemented)
    - [ ] Item removed from dashboard

**Expected Outcomes:**
- [ ] No console errors
- [ ] No "Failed to fetch" toasts
- [ ] All data persists (reload page)
- [ ] Responsive on desktop

---

### 8.2 Error Path (AI Unavailable)
**Priority:** HIGH  
**Duration:** ~5 minutes  

1. [ ] Open DevTools → Network → Throttling: Offline
2. [ ] Refresh page
3. [ ] Click "New Knowledge Item"
4. [ ] Enter title and content
5. [ ] Click "Suggest Tags"
   - [ ] Tags populate from local fallback
   - [ ] Inline message "Using local tag suggestions (offline)" shown
   - [ ] **NO error toast visible**
6. [ ] Add suggested tags
7. [ ] Create item
   - [ ] Summarization may fail (gracefully)
   - [ ] Item still created without summary (or summary is null)
   - [ ] No error message shown to user (or friendly one)
8. [ ] Switch back to Online (DevTools Throttling)
9. [ ] Reload page
   - [ ] Items load normally

**Expected Outcomes:**
- [ ] Fallback tags visible
- [ ] No "Failed to fetch"
- [ ] Item creation succeeds
- [ ] No loss of user input

---

### 8.3 Accessibility Check
**Priority:** HIGH  
**Duration:** ~10 minutes  

1. [ ] Open app in browser
2. [ ] Start NVDA or use VoiceOver
3. [ ] Press Tab to navigate form
   - [ ] Listen to label announcements
   - [ ] Verify logical order
4. [ ] Tab to "Suggest Tags" button
   - [ ] Press Enter
   - [ ] Tags populate
   - [ ] Listen for fallback message (should be announced as polite alert)
5. [ ] Tab to suggested tag buttons
   - [ ] Press Enter
   - [ ] Tag added (focus remains on button or moves to input)
6. [ ] Tab to Create button
   - [ ] Press Space or Enter
   - [ ] Form submits
7. [ ] Verify all form validation errors are announced

**Expected Outcomes:**
- [ ] No missing labels
- [ ] Tab order logical
- [ ] No keyboard traps
- [ ] Fallback message announced

---

## Automated Test Suggestions

### 9.1 Unit Tests
**Priority:** MEDIUM — HIGH  
**Test Framework:** Vitest (already in project)  

**Test File:** `src/hooks/useAI.test.ts`

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAI } from './useAI';

describe('useAI', () => {
  describe('fallbackExtractTags', () => {
    it('should extract top-frequency words', async () => {
      const { result } = renderHook(() => useAI());
      
      const text = 'React React hooks hooks hooks learning';
      const tags = result.current.autoTag('Title', text); // Would need to refactor to expose fallback directly
      
      // Or test fallbackExtractTags directly by exporting it
      // expect(tags).toContain('hooks');
      // expect(tags).toContain('react');
    });

    it('should filter stopwords', async () => {
      // Input: "the the the react learning"
      // Expected: excludes 'the'
    });

    it('should handle URLs', async () => {
      // Input: "Learn from https://example.com"
      // Expected: URL stripped, "learn" extracted
    });

    it('should handle empty input', async () => {
      // Input: ""
      // Expected: []
    });
  });

  describe('autoTag', () => {
    it('should return fallback true when API fails', async () => {
      // Mock fetch to return 500
      // Call autoTag
      // Expect: { tags: [...], fallback: true }
    });

    it('should return fallback false when API succeeds', async () => {
      // Mock fetch to return 200 with tags
      // Call autoTag
      // Expect: { tags: [...], fallback: false }
    });
  });

  describe('summarize', () => {
    it('should return summary on success', async () => {
      // Mock fetch to return 200 with result
      // Expect: string (summary)
    });

    it('should return null on error', async () => {
      // Mock fetch to fail
      // Expect: null
    });
  });
});
```

**Run Tests:**
```bash
npm run test
npm run test:watch
```

---

### 9.2 Integration Tests
**Priority:** MEDIUM  
**Test Framework:** Vitest + MSW (Mock Service Worker)  

**Test File:** `src/components/KnowledgeFormModal.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KnowledgeFormModal } from './KnowledgeFormModal';
import * as useAI from '@/hooks/useAI';

vi.mock('@/hooks/useAI');

describe('KnowledgeFormModal', () => {
  it('should show fallback message when AI returns fallback: true', async () => {
    vi.mocked(useAI.useAI).mockReturnValue({
      autoTag: vi.fn().mockResolvedValue({ tags: ['react'], fallback: true }),
      summarize: vi.fn(),
      isLoading: false,
    });

    render(
      <KnowledgeFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Enter a descriptive title...'), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write your knowledge...'), {
      target: { value: 'Test content' },
    });

    fireEvent.click(screen.getByText('Suggest Tags'));

    await waitFor(() => {
      expect(screen.getByText(/Using local tag suggestions/i)).toBeInTheDocument();
    });
  });

  it('should NOT show fallback message when AI returns fallback: false', async () => {
    vi.mocked(useAI.useAI).mockReturnValue({
      autoTag: vi.fn().mockResolvedValue({ tags: ['react'], fallback: false }),
      summarize: vi.fn(),
      isLoading: false,
    });

    render(<KnowledgeFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    // Fill form...
    fireEvent.click(screen.getByText('Suggest Tags'));

    await waitFor(() => {
      expect(screen.queryByText(/Using local tag suggestions/i)).not.toBeInTheDocument();
    });
  });

  it('should not submit form with empty title', () => {
    const onSubmit = vi.fn();
    render(
      <KnowledgeFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByText('Create'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
  });
});
```

---

### 9.3 Accessibility Tests (Automated)
**Priority:** MEDIUM  
**Test Framework:** Vitest + `@testing-library/jest-dom` + `jest-axe`  

**Install:**
```bash
npm install --save-dev jest-axe
```

**Test File:** `src/components/KnowledgeFormModal.a11y.test.tsx`

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { KnowledgeFormModal } from './KnowledgeFormModal';

expect.extend(toHaveNoViolations);

describe('KnowledgeFormModal Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <KnowledgeFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have all form fields labeled', () => {
    const { getByText, getByPlaceholderText } = render(
      <KnowledgeFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('Content')).toBeInTheDocument();
    expect(getByText('Tags')).toBeInTheDocument();
  });

  it('fallback message should have aria-live', async () => {
    // Mock autoTag to return fallback: true
    render(<KnowledgeFormModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);

    // Trigger Suggest Tags
    // fireEvent.click(...)

    // Verify aria-live
    const message = screen.getByText(/Using local tag suggestions/i);
    expect(message).toHaveAttribute('aria-live', 'polite');
  });
});
```

---

### 9.4 Visual Regression Tests (Optional)
**Priority:** LOW  
**Tool:** Percy, Chromatic, or Puppeteer  

```bash
npm install --save-dev @percy/cli
```

**Can compare screenshots across deployments to catch unintended design changes.**

---

## Test Execution Plan

### Phase 1: Setup (Day 1)
- [ ] Set up test environment (Vitest, testing-library)
- [ ] Create test files structure
- [ ] Mock Supabase and fetch calls

### Phase 2: Manual Testing (Day 1-2)
- [ ] Run through Section 8.1 (Happy Path)
- [ ] Run through Section 8.2 (Error Path)
- [ ] Run through Section 8.3 (Accessibility)

### Phase 3: Unit Tests (Day 2)
- [ ] Write tests for `fallbackExtractTags`
- [ ] Write tests for `autoTag` return shape
- [ ] Write tests for error handling

### Phase 4: Integration Tests (Day 2-3)
- [ ] Test `KnowledgeFormModal` with mocked hooks
- [ ] Test tag suggestion flow
- [ ] Test form validation

### Phase 5: Accessibility Tests (Day 3)
- [ ] Run jest-axe checks
- [ ] Manual screen reader testing
- [ ] Keyboard navigation testing

### Phase 6: Regression Testing (Ongoing)
- [ ] Run all tests before deployment
- [ ] Monitor for flaky tests

---

## Known Limitations & Notes

1. **Summarization Performance**
   - Cold start: ~2-3 seconds (OpenAI)
   - Warm: ~0.5-1 second
   - Consider caching or background processing for long content

2. **Fallback Tag Quality**
   - Unigram extraction is basic; bigrams would improve quality
   - Consider NLP library for production: `natural`, `compromise`, or`simple-nlp`

3. **Mobile Experience**
   - Modal on mobile: Full-screen overlay (design approved?)
   - Touch targets: Ensure 44-48px (already good)
   - Keyboard on mobile: Test with mobile keyboard navigation

4. **Public API Rate Limiting**
   - Not implemented yet; add if needed for public endpoints
   - Recommended: Supabase RLS + edge function rate-limiting

5. **API Key Rotation**
   - Plan for OpenAI key rotation without downtime
   - Use Supabase secrets management + scheduled refresh

---

## Conclusion

This checklist provides a comprehensive guide for testing and validating the "Second Brain" app. Prioritize:

1. **High Priority** features first (Tag flow, AI fallback, error handling)
2. **Manual testing** to verify UX and no "Failed to fetch" messages
3. **Automated tests** to prevent regressions
4. **Accessibility testing** to ensure inclusive UX

**Success Criteria:**
- [ ] All High priority tests pass
- [ ] No user-facing "Failed to fetch" errors
- [ ] AI fallback works seamlessly
- [ ] Forms are keyboard navigable
- [ ] Screen readers can access all content
- [ ] Responsive on mobile, tablet, desktop

---

**Questions? Issues? Document them in GitHub Issues and reference this checklist.**
