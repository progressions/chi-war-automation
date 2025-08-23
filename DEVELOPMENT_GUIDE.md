# Claude Code Feature Development Guide

## Overview
This guide provides a systematic approach for developing new features using Claude Code. Follow these steps in order to ensure proper code organization, API integration, and consistent patterns.

## Phase 0: Issue & Specification Review

### Step 0.1: Review Issue Documentation
- **Action**: Read the issue description in `issues/` directory
- **Check**: `issues/TEMPLATE.md` for the specific issue structure
- **Extract**:
  - Feature requirements
  - Acceptance criteria
  - User stories
  - Technical constraints
  - Dependencies mentioned
- **Goal**: Understand the complete scope before diving into code

### Step 0.2: Review Technical Specifications
- **Action**: Locate and review relevant spec documents in `specs/` directory
- **Look for**:
  - API specifications
  - Data models
  - UI/UX requirements
  - Integration requirements
  - Performance criteria
- **Document**: Key technical requirements and constraints from specs

### Step 0.3: Cross-Reference Issue and Specs
- **Action**: Ensure issue requirements align with existing specifications
- **Identify**:
  - Any gaps between issue and specs
  - Clarifications needed
  - Potential scope creep
- **Output**: Clear understanding of what needs to be built

## Phase 1: Code Navigation & Context Discovery

### Step 1: Locate the Target Component/Module
- **Action**: Navigate to the relevant component or module directory
- **Examples**: 
  - `fights/List` for fight listing functionality
  - `characters/Show` for character detail views
- **Goal**: Understand the current file structure and identify where the new feature belongs
- **Commands to use**:
  ```bash
  find . -name "*fights*" -type d
  ls -la src/components/fights/
  ```

### Step 2: Analyze Current Component Architecture
- **Action**: Examine the existing component to understand:
  - File organization patterns
  - Import/export structure
  - Component hierarchy
  - State management approach
- **Files to review**:
  - Main component file (e.g., `List.jsx`, `Show.tsx`)
  - Associated hook files
  - Style files
  - Test files (if present)
- **Document**: Current patterns and conventions used

### Step 3: Review API Integration Patterns
- **Action**: Examine how the current component handles API calls
- **Key areas to investigate**:
  - API service files location and structure
  - HTTP client configuration
  - Error handling patterns
  - Loading state management
  - Data transformation/normalization
- **Required reading**: Consult `API_PATTERNS.md` for:
  - Established API conventions
  - Error handling standards
  - Authentication patterns
  - Request/response formatting guidelines

## Phase 2: Research & Pattern Analysis

### Step 4: Search for Similar Implementation Examples
- **Action**: Use agent-code-searcher to find existing patterns that match the desired behavior
- **Search strategies**:
  ```bash
  # Search for similar API endpoints
  agent-code-searcher "api.*fetch.*list"
  
  # Search for similar component patterns
  agent-code-searcher "useState.*loading"
  
  # Search for error handling examples
  agent-code-searcher "try.*catch.*api"
  
  # Search for specific UI patterns
  agent-code-searcher "Modal.*confirm"
  ```
- **Document findings**:
  - Location of similar implementations
  - Code patterns that can be reused
  - API endpoints with similar structure
  - Common utility functions

### Step 5: Analyze Dependencies and Imports
- **Action**: Review what dependencies and utilities are available
- **Check for**:
  - Existing utility functions
  - Shared components
  - API service functions
  - State management tools
  - UI component library usage
- **Goal**: Avoid reinventing existing functionality

## Phase 3: Implementation Setup

### Step 6: Create Placeholder Component Structure
- **Action**: Create the new component with minimal implementation
- **Template structure**:
  ```jsx
  // NewFeature.jsx
  import React from 'react';
  
  const NewFeature = () => {
    // TODO: Implement feature logic
    return (
      <div className="new-feature">
        <h2>New Feature Placeholder</h2>
        {/* TODO: Add component content */}
      </div>
    );
  };
  
  export default NewFeature;
  ```
- **Include**:
  - Basic component shell
  - Proper imports
  - Export statement
  - TODO comments for implementation steps

### Step 7: Set Up Associated Files
- **Action**: Create supporting file structure based on patterns found
- **Files to create**:
  - Hook file (if needed): `useNewFeature.js`
  - API service file (if needed): `newFeatureApi.js`
  - Constants file (if needed): `constants.js`
  - Test file: `NewFeature.test.jsx`
- **Goal**: Establish proper separation of concerns

## Phase 4: Validation & Integration Planning

### Step 8: Verify Integration Points
- **Action**: Confirm where the new component will be integrated
- **Check**:
  - Parent component structure
  - Routing requirements
  - Props that will be passed
  - Context providers needed
- **Document**: Integration requirements and dependencies

### Step 9: Plan API Integration
- **Action**: Design the API integration strategy
- **Based on research, plan**:
  - API endpoints to use/create
  - Request/response data flow
  - Error handling approach
  - Loading states
  - Cache management (if applicable)

### Step 10: Create Implementation Checklist
- **Action**: Generate a detailed todo list for implementation
- **Based on**: Issue requirements, specs, and research findings
- **Include**:
  - Component logic implementation (per issue requirements)
  - API integration steps (per technical specs)
  - Styling requirements (per UI specs)
  - Testing needs (per acceptance criteria)
  - Documentation updates
- **Validation**: Ensure checklist covers all acceptance criteria from issue

## Research Documentation Template

After completing the research phases, document findings using this template:

```markdown
## Feature Research Summary

### Issue & Specs Reference
- Issue: `issues/[ISSUE-NUMBER].md`
- Relevant specs: `specs/[SPEC-NAMES].md`
- Requirements summary: [brief overview]

### Target Location
- Component path: 
- Parent components:
- Related modules:

### API Patterns Found
- Existing endpoints:
- Similar API calls:
- Error handling pattern:
- Authentication requirements:
- Spec alignment: [confirmation]

### Code Patterns Identified
- Similar components:
- Reusable utilities:
- State management approach:
- Styling conventions:

### Implementation Plan
1. [ ] Component structure (per issue requirements)
2. [ ] API integration (per technical specs)
3. [ ] State management
4. [ ] Error handling
5. [ ] Testing (covers acceptance criteria)
6. [ ] Documentation

### Dependencies
- New packages needed:
- Existing utilities to use:
- Components to extend:

### Acceptance Criteria Validation
- [ ] Requirement 1: [from issue]
- [ ] Requirement 2: [from issue]
- [ ] Requirement 3: [from issue]
```

## Context Window Management

### Strategy: Work in Focused Sessions
- **One phase at a time**: Complete each research phase fully before moving to implementation
- **Summarize findings**: After each step, create concise summaries rather than keeping full file contents
- **Use targeted searches**: Be specific with agent-code-search queries to get relevant results only

### Step-by-Step Context Conservation

#### During Research Phase:
1. **Limit file exploration**: Only examine 2-3 key files at once
2. **Extract patterns, not full code**: Note the structure and approach, not entire implementations
3. **Use grep/search for specifics**: Instead of opening large files, search for specific patterns
4. **Document key findings**: Create bullet-point summaries after each investigation

#### During Implementation:
1. **Work on one file at a time**: Focus on single component implementation
2. **Reference patterns by description**: Instead of copying full examples, describe the pattern to follow
3. **Use incremental commits**: Save progress frequently to avoid re-explaining context

### Context-Efficient Commands

```bash
# Review issue and specs first:
cat issues/[ISSUE-NUMBER].md
ls specs/ | grep -i [relevant-feature]
cat specs/[relevant-spec].md

# Then proceed with targeted code searches:
grep -n "useState" src/components/fights/List.jsx
grep -A 5 -B 5 "api.*fetch" src/services/

# Get file structure without content:
find src/components -name "*.jsx" | head -10
ls -la src/components/fights/

# Search for specific patterns only:
agent-code-searcher "error handling" --limit 3
agent-code-searcher "Modal.*confirm" --files "*.jsx"
```

### Research Session Template (Context-Optimized)

```markdown
## Quick Research Notes - [Feature Name]

### Issue Reference: `issues/[ISSUE-NUMBER].md`
### Spec Reference: `specs/[SPEC-NAME].md`

### Requirements Summary:
- Primary goal: [from issue]
- Technical specs: [from specs]
- Acceptance criteria: [key points]

### Location: `[path]`
- Pattern: [brief description]
- Key files: [list 2-3 main files]
- API approach: [one-line summary]

### Similar Examples Found:
1. `[component]` - [what pattern it shows]
2. `[component]` - [what pattern it shows]

### Next Actions:
- [ ] Create placeholder in `[specific path]`
- [ ] Follow `[specific pattern name]` from `[reference component]`
- [ ] Implement `[specific API pattern]`
- [ ] Validate against acceptance criteria from issue
```

### Context Window Checkpoints

After each major step, create a checkpoint summary:

1. **After Step 0 (Requirements Review)**:
   - "Issue: [brief summary from issues/]"
   - "Specs require: [key technical points from specs/]"
   - "Acceptance criteria: [main points]"

2. **After Step 3 (API Analysis)**:
   - "API follows [pattern name] from API_PATTERNS.md"
   - "Uses [specific service structure]"
   - "Error handling: [brief approach]"
   - "Aligns with specs: [confirmation]"

3. **After Step 4 (Pattern Search)**:
   - "Found [number] similar examples"
   - "Best pattern: [component name] approach"
   - "Key utilities: [list 2-3]"

4. **After Step 6 (Placeholder Creation)**:
   - "Placeholder created at [path]"
   - "Ready for [specific implementation approach]"
   - "Dependencies: [brief list]"
   - "Meets issue requirements: [validation]"

## Best Practices Reminders

- Always follow existing code conventions
- Reuse established patterns when possible
- Maintain consistent error handling
- Include proper TypeScript types (if applicable)
- Add comprehensive tests
- Update documentation as needed
- Consider accessibility requirements
- Plan for mobile responsiveness

### Context Management Best Practices
- **Batch similar operations**: Do all file exploration in one session, all implementation in another
- **Use concise documentation**: Bullet points over paragraphs for research notes
- **Reference by pattern name**: Instead of showing full code, refer to "the Modal pattern from UserProfile"
- **Clean context regularly**: Summarize progress and start fresh sessions for new phases