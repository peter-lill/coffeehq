CoffeeHQ frontend files

This ZIP contains the new files for:

- Dashboard
- Claims list
- Claim workspace
- Shared layout components
- Mock claim data

INSTALLATION

1. Stop the development server with Ctrl+C.

2. Back up your current source folder:

   cd ~/Development/coffeehq/apps/web
   cp -r src src-backup

3. Extract this ZIP.

4. Copy the included src folder into:

   ~/Development/coffeehq/apps/web/

5. Start the development server:

   npm run dev

6. Open:

   http://localhost:3000
   http://localhost:3000/claims
   http://localhost:3000/claims/S25TD353017

The ZIP does not replace package.json, globals.css, layout.tsx, or other project files.
