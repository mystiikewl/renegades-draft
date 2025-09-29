# Implementation Plan: Refactor Supabase Types

**Objective:** Refactor the monolithic `renegades-draft-central/src/integrations/supabase/types.ts` file into smaller, more manageable modules. This will improve code organization, reduce complexity, and make it easier to maintain and scale the application.

---

## 1. Analysis of `types.ts`

The current `types.ts` file is a single, large file containing all Supabase-generated types, including:
- Table schemas (`Row`, `Insert`, `Update`)
- Function definitions (`Args`, `Returns`)
- Generic helper types (`Tables`, `TablesInsert`, `TablesUpdate`)

This monolithic structure makes it difficult to navigate and understand the data model.

---

## 2. Proposed File Structure

I propose creating a new directory at `renegades-draft-central/src/integrations/supabase/schema` to house the modularized type definitions. The new structure will be as follows:

```
renegades-draft-central/src/integrations/supabase/
├── schema/
│   ├── tables/
│   │   ├── draft_picks.ts
│   │   ├── draft_settings.ts
│   │   ├── keepers.ts
│   │   ├── player_seasons.ts
│   │   ├── players.ts
│   │   ├── profiles.ts
│   │   └── teams.ts
│   ├── functions/
│   │   ├── claim_team.ts
│   │   └── invite_and_assign_user_to_team.ts
│   ├── enums.ts
│   └── index.ts
└── types.ts
```

- **`schema/tables/`**: Each file in this directory will contain the `Row`, `Insert`, and `Update` types for a single database table.
- **`schema/functions/`**: Each file will define the `Args` and `Returns` types for a specific RPC function.
- **`schema/enums.ts`**: This file will house any database enums.
- **`schema/index.ts`**: This file will serve as the central hub, exporting all the modularized types from a single entry point.
- **`types.ts`**: The original `types.ts` file will be updated to import the modularized types and re-export them, ensuring backward compatibility.

---

## 3. Refactoring Process

The refactoring will be executed in the following steps:

1.  **Create New Directories and Files**: I will create the new directory structure as outlined above.
2.  **Move Table Definitions**: I will move the `Row`, `Insert`, and `Update` types for each table into its corresponding file in the `schema/tables/` directory.
3.  **Move Function Definitions**: The `Args` and `Returns` types for each RPC function will be moved to their respective files in the `schema/functions/` directory.
4.  **Update `schema/index.ts`**: I will update the `index.ts` file to export all the types from the new modules.
5.  **Update `types.ts`**: The original `types.ts` file will be refactored to import all the types from `schema/index.ts` and re-export them. This will maintain a single entry point for all Supabase types and avoid breaking existing imports.
6.  **Update Application-Wide Imports**: I will search the entire codebase for any imports from `renegades-draft-central/src/integrations/supabase/types.ts` and ensure they are updated to import the correct types from the new modular structure.

---

## 4. Dependencies and Tooling

- **Supabase CLI**: The Supabase CLI's type generation command will need to be updated to output the types in the new modular structure. If the CLI does not support this directly, a custom script may be required to automate the process of splitting the generated types into the new file structure.
- **TypeScript Configuration**: The `tsconfig.json` file should be reviewed to ensure that the new `schema` directory is correctly included in the project's compilation context.

---

## 5. Next Steps

This implementation plan provides a clear path for refactoring the Supabase types. When you are ready to proceed with this task in a future session, we can begin with the first step of creating the new directory structure.
