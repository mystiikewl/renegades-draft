# Draft Rollback System - Administrator Guide

## Introduction

This guide provides step-by-step instructions for administrators on how to use the Draft Rollback System to correct draft mistakes, restart drafts from specific points, or undo problematic picks.

## Prerequisites

- __Admin Access__: You must have administrator privileges (`is_admin = true` in your profile)
- __Draft Admin Access__: Access to the Draft Admin dashboard
- __Understanding of Draft Process__: Familiarity with how the draft system works

## Accessing the Rollback Manager

1. __Navigate to Admin Dashboard__

   - Go to the main application
   - Click on "Admin" in the navigation menu
   - Select "Draft Admin" from the admin menu

2. __Access Rollback Manager__

   - In the Draft Admin dashboard, look for "Draft Rollback" in the navigation
   - Click on "Draft Rollback" to open the Rollback Manager

## Understanding Rollback Types

The system supports three types of rollbacks:

### 1. By Pick Number

- __Use When__: You need to rollback from a specific pick onwards
- __Example__: "Rollback all picks from pick #15 onwards"
- __Input__: Enter the pick number (e.g., 15)

### 2. By Round

- __Use When__: You need to restart the draft from a specific round
- __Example__: "Rollback all picks from Round 3 onwards"
- __Input__: Enter the round number (e.g., 3)

### 3. By Date/Time

- __Use When__: You need to undo picks made after a specific time
- __Example__: "Rollback all picks made after 2:30 PM on September 15th"
- __Input__: Select the date and time using the datetime picker

## Step-by-Step Rollback Process

### Step 1: Select Rollback Criteria

1. __Choose Rollback Type__

   - Click on the "Rollback Type" dropdown
   - Select one of: "By Pick Number", "By Round", or "By Date/Time"

2. __Enter Rollback Value__

   - __For Pick Number__: Enter the pick number in the input field
   - __For Round__: Enter the round number in the input field
   - __For Date/Time__: Use the datetime picker to select date and time

### Step 2: Preview Changes

1. __Click "Preview Rollback"__

   - The system will analyze which picks would be affected

   - A preview screen will show:

     - Number of picks that will be rolled back
     - List of affected picks with player and team information
     - Round and pick numbers for each affected pick

2. __Review Preview Results__

   - Carefully review the list of picks to be rolled back
   - Verify that the correct picks are selected
   - Check player names and team assignments
   - Ensure the rollback scope is appropriate

### Step 3: Execute Rollback

1. __Confirm Rollback__

   - Click the "Execute Rollback" button
   - A confirmation dialog will appear
   - Read the confirmation message carefully
   - Click "Yes" to proceed or "Cancel" to abort

2. __Monitor Progress__

   - The system will show "Rolling Back..." status
   - Wait for the operation to complete
   - Do not navigate away from the page during execution

3. __Verify Results__

   - Check that picks have been properly rolled back
   - Verify that players are no longer marked as drafted
   - Confirm that team assignments have been reset

## Viewing Rollback History

### Access History Tab

1. __Switch to History Tab__

   - Click on the "Rollback History" tab in the Rollback Manager
   - The history will load automatically

2. __Review Past Operations__

   - View recent rollback operations (last 10 by default)

   - See details including:

     - Date and time of rollback
     - Type of rollback performed
     - Number of picks affected
     - Status (executed, failed, pending)

3. __Refresh History__

   - Click the "Refresh" button to load the latest history
   - Useful after performing new rollbacks

## Common Rollback Scenarios

### Scenario 1: Correcting a Single Wrong Pick

__Problem__: A team made an incorrect pick that needs to be undone, but subsequent picks should remain.

__Solution__:

1. Use "By Pick Number" rollback
2. Enter the specific pick number that was wrong
3. Preview to confirm only that pick is affected
4. Execute the rollback

### Scenario 2: Restarting Draft After Technical Issues

__Problem__: Technical problems occurred during the draft, requiring a restart from a specific point.

__Solution__:

1. Use "By Date/Time" rollback
2. Select the date/time when issues started
3. Preview to see all picks made after that time
4. Execute the rollback to undo all problematic picks

### Scenario 3: Complete Round Restart

__Problem__: An entire round needs to be redone due to procedural errors.

__Solution__:

1. Use "By Round" rollback
2. Enter the round number that needs to be restarted
3. Preview to confirm all picks in that round and later rounds are selected
4. Execute the rollback

## Safety Measures

### Preview First

- __Always preview__ before executing any rollback
- Review the list of affected picks carefully
- Ensure the scope of the rollback is appropriate

### Confirmation Required

- All rollbacks require explicit confirmation
- Read the confirmation dialog carefully
- Rollbacks cannot be undone once executed

### Audit Trail

- All rollback operations are logged
- History is maintained for accountability
- Failed operations are recorded for troubleshooting

## Best Practices

### Before Performing Rollbacks

1. __Document the Reason__

   - Note why the rollback is being performed
   - Record which picks are being affected
   - Document any special circumstances

2. __Communicate with Users__

   - Inform affected teams about the rollback
   - Explain why the rollback is necessary
   - Provide guidance on next steps

3. __Backup Considerations__

   - Ensure recent database backups are available
   - Consider the impact on other systems
   - Plan for potential data recovery needs

### During Rollback Process

1. __Use Appropriate Scope__

   - Start with the minimal scope needed
   - Avoid overly broad rollbacks when possible
   - Consider the impact on all affected teams

2. __Monitor System Performance__

   - Large rollbacks may take time to process
   - Monitor for system performance issues
   - Be prepared to handle any errors

3. __Verify Results__

   - Check that all intended picks were rolled back
   - Verify that unintended picks were not affected
   - Confirm that the draft state is consistent

### After Rollback Completion

1. __Verify Draft Integrity__

   - Check that the draft can continue normally
   - Verify that team assignments are correct
   - Ensure that pick numbers are sequential

2. __Update Documentation__

   - Record the rollback in administrative logs
   - Update any relevant documentation
   - Note any lessons learned for future reference

3. __Follow-up Communication__

   - Inform users that the rollback is complete
   - Provide any necessary instructions
   - Address any questions or concerns

## Troubleshooting

### Rollback Preview Shows No Results

__Symptoms__: Preview shows "0 picks affected"

__Possible Causes__:

- No picks match the rollback criteria
- Picks may have already been rolled back
- Database connectivity issues

__Solutions__:

1. Verify the rollback criteria are correct
2. Check if picks exist that should match the criteria
3. Try a broader criteria to see if any picks are found
4. Check the browser console for error messages

### Rollback Execution Fails

__Symptoms__: Rollback fails with an error message

__Possible Causes__:

- Database permission issues
- Network connectivity problems
- Invalid rollback criteria
- System resource constraints

__Solutions__:

1. Check that you have admin permissions
2. Verify database connectivity
3. Try the rollback with a smaller scope
4. Check system resources and retry later

### History Not Loading

__Symptoms__: Rollback history tab shows no data or fails to load

__Possible Causes__:

- Database connectivity issues
- Permission problems
- Large dataset causing timeouts

__Solutions__:

1. Check database connectivity
2. Verify admin permissions
3. Try refreshing the page
4. Check browser console for specific errors

### Performance Issues

__Symptoms__: Rollbacks take a very long time or timeout

__Possible Causes__:

- Large number of picks being rolled back
- Database performance issues
- Network latency
- System resource constraints

__Solutions__:

1. Break large rollbacks into smaller chunks
2. Perform rollbacks during low-traffic periods
3. Monitor system resources
4. Consider database optimization if issues persist

## Getting Help

### Resources Available

1. __This Documentation__: Complete guide to rollback procedures
2. __System Logs__: Check application logs for detailed error information
3. __Database Logs__: Review database logs for performance and error details
4. __Development Team__: Contact for technical issues or feature requests

### Reporting Issues

When reporting rollback issues, please include:

1. __Steps to Reproduce__: Exact steps taken before the issue occurred
2. __Expected Behavior__: What should have happened
3. __Actual Behavior__: What actually happened
4. __Error Messages__: Any error messages displayed
5. __Browser Information__: Browser type and version
6. __Rollback Criteria__: The specific criteria used for the rollback

### Emergency Procedures

In case of critical issues:

1. __Stop All Rollback Operations__: Avoid performing additional rollbacks
2. __Document the Issue__: Record all relevant information
3. __Contact Support__: Reach out to the development team immediately
4. __Consider Backup Recovery__: Be prepared to restore from backup if necessary

## Security Considerations

### Access Control

- Only administrators can access rollback functionality
- All operations are logged with user identification
- Database-level security prevents unauthorized access

### Data Protection

- Rollbacks are atomic operations (all or nothing)
- Failed rollbacks leave the system in a consistent state
- Audit logs provide complete traceability

### Compliance

- All rollback operations are logged for compliance purposes
- User privacy is maintained in audit logs
- Data retention policies apply to rollback history

---

*This guide is intended for authorized administrators only. Unauthorized use of the rollback system may result in data loss or system instability.*
