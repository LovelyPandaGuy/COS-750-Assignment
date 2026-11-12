# Spec Delta

## REMOVED Requirements

### Requirement: Module screen placeholder
**Reason**: The placeholder becomes the real module screen, which also lists the module's activities and links back to the path. Unknown module IDs still go to Start.
**Migration**: See "Module screen" in `module-hub` and "Unknown paths go somewhere safe" in `app-routing`. Start and Resume still open the module screen at once, and its heading is still the module's D1 title.
