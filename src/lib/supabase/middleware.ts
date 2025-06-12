// src/lib/supabase/middleware.ts

// ==========================================================================================
// !! CRITICAL BUILD ERROR NOTE (Next.js 15.3.3 & @supabase/ssr 0.4.0 as of June 2024) !!
// ------------------------------------------------------------------------------------------
// If you are repeatedly seeing a build error like:
// "Export createMiddlewareClient doesn't exist in target module"
// where the bundler (for middleware/edge runtime) incorrectly attempts to resolve exports
// from a `node_modules/@supabase/ssr/dist/module/types.js` file:
//
// THIS IS VERY LIKELY A BUG OR INCOMPATIBILITY IN THE NEXT.JS (v15.3.3) BUILD SYSTEM
// FOR THE EDGE RUNTIME, OR A DEEPLY CORRUPTED `node_modules` DIRECTORY.
//
// The import statement below IS THE CORRECT AND STANDARD WAY to import this function.
// Simple changes to the import path or style are unlikely to fix this specific error.
//
// YOU MUST TRY THE FOLLOWING EXTERNAL TROUBLESHOOTING STEPS:
//
// 1. **AGGRESSIVELY CLEAN `node_modules`**:
//    a. Delete `node_modules` folder.
//    b. Delete your lock file (`package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`).
//    c. Clear npm/yarn cache: `npm cache clean --force` or `yarn cache clean`.
//    d. Reinstall: `npm install` or `yarn install`.
//
// 2. **CHANGE NEXT.JS VERSION**:
//    a. Next.js `15.3.3` is a pre-release (canary) version. Canary versions can have bugs.
//    b. **Try downgrading to the latest STABLE Next.js version** (e.g., latest `14.x.x` or an earlier stable `15.x.x` if available).
//       Modify your `package.json` (e.g., `"next": "14.2.3"`) and reinstall.
//    c. Alternatively, try the absolute latest canary if a newer one than `15.3.3` exists.
//
// 3. **CHECK FOR KNOWN ISSUES / REPORT THE BUG**:
//    a. Search Next.js GitHub issues: https://github.com/vercel/next.js/issues
//    b. Search Supabase GitHub issues: https://github.com/supabase/supabase-js/issues
//    c. If no existing issue matches, consider reporting it to the Next.js team, providing
//       your `next --version`, Node.js version, and steps to reproduce.
//
// 4. **VERIFY NODE.JS VERSION**: Ensure your Node.js version is LTS and compatible with
//    your Next.js and `@supabase/ssr` versions.
//
// This code uses the standard import as per Supabase documentation.
// If the error persists after trying the steps above, the issue is outside
// the scope of fixes that can be applied to *this application's code*.
// ==========================================================================================
import { createMiddlewareClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

// This is your custom wrapper for creating a Supabase client in middleware
export function createSupabaseMiddlewareClient(
  req: NextRequest,
  res: NextResponse // Pass the response object to be potentially modified by cookie operations
) {
  return createMiddlewareClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // When Supabase needs to set a cookie, it should be set on the outgoing response
          res.cookies.set({ ...options, name, value });
        },
        remove(name: string, options: CookieOptions) {
          // When Supabase needs to remove a cookie, it should be removed from the outgoing response
          res.cookies.set({ ...options, name, value: '' });
        },
      },
    }
  );
}
