# Project Issues Tracking

This document tracks known issues and areas for improvement in the Renegades Draft project.

## Current Issues

### 1. Linting Issues
- **Status**: Resolved
- **Priority**: Medium
- **Description**: Multiple linting errors and warnings identified during code review
- **Details**: See [linting_issues.md](./linting_issues.md) for a comprehensive breakdown of all linting issues
- **Impact**: Potential runtime errors, maintainability issues, and code quality concerns
- **Progress**: 
  - ✅ Fixed extensive use of `any` types throughout the codebase
  - ✅ Addressed missing useEffect dependencies
  - ✅ Resolved React Hook usage violations
  - ✅ Implemented proper TypeScript typing throughout the application
  - ✅ Eliminated all linting errors (0 remaining)
- **Next Steps**: 
  - Address remaining linting warnings for optimal code quality

### 2. Draft Pick Reset Error
- **Status**: Investigating
- **Priority**: High
- **Description**: Error when attempting to reset draft picks in the admin panel
- **Details**: 
  ```
  Error: Failed to recreate draft picks: duplicate key value violates unique constraint "draft_picks_round_pick_number_key"
  ```
- **Impact**: Admin users cannot reset the draft, limiting functionality
- **Next Steps**: 
  - Investigate database constraint violations
  - Review draft pick recreation logic
  - Implement proper error handling

### 3. Team Selection Issues
- **Status**: Documented
- **Priority**: Medium
- **Description**: Problems with team selection functionality
- **Details**: See [team_selection_issue.md](./team_selection_issue.md)
- **Impact**: Users may experience difficulties selecting teams
- **Next Steps**: Review and fix team selection component logic

## Technical Debt

### 1. Type Safety
- **Issue**: Extensive use of `any` types throughout the codebase
- **Progress**: ✅ Fully addressed by replacing `any` types with proper TypeScript interfaces and types
- **Recommendation**: Continue maintaining strong type safety practices

### 2. React Hooks Usage
- **Issue**: Incorrect usage of React Hooks in some components
- **Progress**: ✅ Resolved React Hook usage violations by ensuring Hooks follow React's Rules of Hooks
- **Recommendation**: Continue following React's Rules of Hooks

### 3. useEffect Dependencies
- **Issue**: Missing dependencies in useEffect hooks
- **Progress**: ✅ Addressed missing dependencies by adding proper dependency arrays and useCallback where needed
- **Recommendation**: Continue auditing useEffect calls to ensure proper dependency arrays

## Performance Considerations

### 1. Bundle Size
- **Issue**: Large JavaScript bundles may impact loading times
- **Recommendation**: Analyze bundle composition and optimize large modules

### 2. Re-renders
- **Issue**: Potential unnecessary re-renders in complex components
- **Recommendation**: Use React DevTools Profiler to identify performance bottlenecks

## Future Improvements

### 1. Testing
- **Issue**: Lack of automated tests
- **Recommendation**: Implement unit and integration tests for critical functionality

### 2. Error Boundaries
- **Issue**: Limited error handling in UI components
- **Recommendation**: Add React Error Boundaries to gracefully handle component errors

### 3. Accessibility
- **Issue**: Potential accessibility gaps
- **Recommendation**: Audit and improve accessibility compliance

## Resolution Status

| Issue | Status | Owner | Target Date |
|-------|--------|-------|-------------|
| Linting Issues | Resolved | Team | August 2025 |
| Draft Pick Reset Error | Open | TBD | TBD |
| Team Selection Issues | Documented | TBD | TBD |