# Spec Delta

## REMOVED Requirements

### Requirement: The outline lists the lesson's screens
**Reason**: The user found the per-screen outline confusing (15 Nov); the lessons sidebar replaces it (D155).
**Migration**: Use `lesson-sidebar` for moving between lessons; Next and Back move between screens.

### Requirement: The outline marks where the student is
**Reason**: Replaced by the sidebar's lesson states and the lesson frame's "Screen n of m".
**Migration**: See `lesson-sidebar` "The sidebar marks progress and the page".

### Requirement: Moving with the outline
**Reason**: Jumping to a screen by the outline is removed with it; Back stays free and skip ahead is unchanged (D20).
**Migration**: Next, Back and Skip ahead in the lesson frame.

### Requirement: Outline placement
**Reason**: The outline and its two-column lesson layout are removed.
**Migration**: The sidebar's placement in `lesson-sidebar` "The sidebar stays in place".

### Requirement: The outline is accessible
**Reason**: The outline is removed.
**Migration**: `lesson-sidebar` "The sidebar is accessible".
