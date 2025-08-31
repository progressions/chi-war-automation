# Spec Summary (Lite)

Create a Rails command to export the master campaign template with all associations into a conflict-safe SQL file for production deployment. The export includes characters, vehicles, factions, junctures, schticks, weapons, join tables, and image URLs, generating INSERT statements with explicit UUIDs that can be imported multiple times without creating duplicates.