# Admin Workflow

## Access

Requires `editor`, `moderator`, or `admin` role in `user_roles` table.

## Capabilities

| Role | Permissions |
|------|------------|
| editor | Create/edit spots, species, equipment, regulations |
| moderator | Approve community reports and images |
| admin | All above + delete records, view audit log |

## Spot Editing

1. Navigate to Admin → Manage Spots
2. Select or create spot
3. Place coordinates on map
4. Set terrain, seabed, access, methods
5. Connect species with likelihood
6. Add equipment recommendations
7. Mark verification status and date

## Report Review

1. Admin → Review Reports
2. View proposed changes and evidence
3. Approve (merge to spot) or reject with notes

All mutations are logged in `audit_logs`.
