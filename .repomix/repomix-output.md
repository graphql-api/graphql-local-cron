This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix. The content has been processed where content has been formatted for parsing.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: **/*
- Files matching these patterns are excluded: examples/, .github/, .repomix/, node_modules/, *.log
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been formatted for parsing in markdown style

## Additional Info

# Directory Structure
```
src/
  cron.ts
  index.ts
  resolvers.ts
  typeDefs.graphql
  types.d.ts
.gitignore
.npmignore
.npmrc
.prettierrc
.stackblitzrc
codegen.yaml
package.json
pnpm-workspace.yaml
README.md
repomix.config.json
tsconfig.json
tsconfig.reference.json
```

# Files

## File: src/cron.ts
```typescript
import type { ScheduledTask as NodeCronJob } from 'node-cron';
import { EventEmitter } from 'events'


interface CronJobConfig {
    cronTime: string;
    onTick: () => void;
}

export class CronJob extends EventEmitter implements NodeCronJob {
    [EventEmitter.captureRejectionSymbol]?<K>(error: Error, event: string | symbol, ...args: any[]): void {
        throw new Error('Method not implemented.');
    }

    constructor(args: CronJobConfig) {
        super()
    }

    addListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    on<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    once<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    removeListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    off<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    removeAllListeners(event?: string | symbol | undefined): this {
        throw new Error('Method not implemented.');
    }
    setMaxListeners(n: number): this {
        throw new Error('Method not implemented.');
    }
    getMaxListeners(): number {
        throw new Error('Method not implemented.');
    }
    listeners<K>(eventName: string | symbol): Function[] {
        throw new Error('Method not implemented.');
    }
    rawListeners<K>(eventName: string | symbol): Function[] {
        throw new Error('Method not implemented.');
    }
    emit<K>(eventName: string | symbol, ...args: any[]): boolean {
        throw new Error('Method not implemented.');
    }
    listenerCount<K>(eventName: string | symbol, listener?: Function | undefined): number {
        throw new Error('Method not implemented.');
    }
    prependListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    prependOnceListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error('Method not implemented.');
    }
    eventNames(): (string | symbol)[] {
        throw new Error('Method not implemented.');
    }
    now() { }
    start() { }
    stop() { }


}


export class GraphQLCron {
    private jobs: Map<string, CronJob>;

    constructor(uri: string) {

        this.jobs = new Map();
    }

    public async createJob(id: string, config: CronJobConfig) {
        if (this.jobs.has(id)) {
            throw new Error(`Job with ID ${id} already exists.`);
        }

        const job = new CronJob(config);
        this.jobs.set(id, job);
        job.start();
        return true;
    }

    public async stopJob(id: string) {
        const job = this.jobs.get(id);
        if (job) {
            job.stop();
            this.jobs.delete(id);
            return true;
        }
        return false;
    }

    public async getJobs() {
        return Array.from(this.jobs.keys());
    }
}

export default GraphQLCron;
```

## File: src/index.ts
```typescript
export * as resolvers from "./resolvers";

export { GraphQLCron } from './cron'
```

## File: src/resolvers.ts
```typescript
import type { CronJob as ICronJob, Mutation as IMutation, Query as IQuery } from './types'

export const CronJob = {}
export const Query = {}
export const Mutation = {}
```

## File: src/typeDefs.graphql
```graphql
interface Node {
  id: ID!
}

type Query {
  hello: String
}

type Mutation {
  say(input: String!): String!
}

type CronJob {
  id: ID!
  cronTime: String!
}

type Query {
  cronJobs: [CronJob!]!
}

type Mutation {
  createCronJob(id: ID!, cronTime: String!): Boolean!
  stopCronJob(id: ID!): Boolean!
}
```

## File: src/types.d.ts
```typescript
export interface CronJob<ID extends string = string> {
    id: string;
    cronTime: string;
}

export interface Query<ID extends string = string> {
    jobs: CronJob<ID>[];
}

export interface Mutation<ID extends string = string> {
    createJob(id: ID, cronTime: string): boolean;
    stopJob(id: ID): boolean;
}
```

## File: .gitignore
```
.env
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
node_modules
.next
dist
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
package-lock.json
yarn-debug.log*
yarn-error.log*
pnpm-lock.yaml
*/.yarn-lock.yaml

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
```

## File: .npmignore
```
/.bolt
/examples/
.stackblitzrc
tsconfig.reference.json
```

## File: .npmrc
```
@graphql-api:registry = https://npm.pkg.github.com
```

## File: .prettierrc
```
{ "tabWidth": 2, "useTabs": false }
```

## File: .stackblitzrc
```
{
    "installDependencies": true,
    "startCommand": "pnpm --filter @/example dev"
}
```

## File: codegen.yaml
```yaml
schema:
  - src/**/*.graphql
generates:
  schema.graphql:
    plugins:
      - schema-ast
  types.ts:
    plugins:
      - typescript
  # https://www.graphql-code-generator.com/plugins/typescript-apollo-client-helpers
  helpers/apollo-client.ts:
    plugins:
      - typescript-apollo-client-helpers
  helpers/introspection-result.json:
    plugins:
      - fragment-matcher
    config:
      module: es2015
  helpers/introspection-result.cjs.json:
    plugins:
      - fragment-matcher
    config:
      module: commonjs
```

## File: package.json
```json
{
  "name": "@graphql-api/cron.local",
  "version": "0.0.0",
  "description": "cron",
  "scripts": {
    "build": "tsc",
    "codegen": "graphql-codegen",
    "example:build": "pnpm --filter @/example dev",
    "repomix": "repomix",
    "prepare": "repomix"
  },
  "main": "src/index.js",
  "type": "module",
  "exports": {
    ".": {
      "import": "./src/index.ts",
      "federation": []
    },
    "./resolvers": [
      "./build/resolvers"
    ],
    "./schema": [
      "./schema.graphql"
    ],
    "./tsconfig": {
      "import": "./tsconfig.json"
    }
  },
  "typesVersions": {
    "*": {
      ".": [
        "./build/types.d.ts"
      ],
      "federation:": [
        "./federation/types.d.ts"
      ]
    }
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/graphql-api/graphql-local-cron.git"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/graphql-api"
  },
  "keywords": [
    "graphql",
    "apollo",
    "gql",
    "template",
    "typescript"
  ],
  "author": {
    "url": "https://codeberg.org/jfa",
    "name": "jfa"
  },
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/graphql-api/graphql-local-cron/issues"
  },
  "homepage": "https://github.com/graphql-api/graphql-local-cron#readme",
  "dependencies": {
    "events": "^3.3.0"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^2.16.5",
    "@graphql-codegen/schema-ast": "^2.6.1",
    "@graphql-codegen/typescript": "^2.8.8",
    "@graphql-codegen/typescript-apollo-client-helpers": "^2.2.6",
    "@graphql-codegen/typescript-resolvers": "^2.7.13",
    "@types/node-cron": "^3.0.11",
    "graphql": "^16.10.0",
    "graphql-tag": "^2.12.6",
    "repomix": "^0.2.30",
    "typescript": "^5.7.3"
  },
  "peerDependencies": {
    "graphql": "^16.10.0"
  },
  "pnpm": {
    "overrides": {
      "@types/react": "19.0.10"
    }
  }
}
```

## File: pnpm-workspace.yaml
```yaml
packages:
  - .
  - examples/*

catalog:
  '@types/react': ^19
  '@types/react-dom': ^19
  eslint: ^9
  graphql: ^16
  next: ^15.2.0-canary.57
  next-auth: ^5.0.0-beta.25
  react: ^19
  react-dom: ^19
  prettier: ^3
  tailwindcss: ^4
  typescript: ^5.7.3
  zustand: ^5.0.3
  zod: ^3
```

## File: README.md
```markdown
# @graphql-api/template

### examples

stackblitz
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/graphql-api/graphql-api-template/tree/main/examples/next)

codesandbox


#### deploy:

koyeb
[![Deploy to Koyeb](https://www.koyeb.com/static/images/deploy/button.svg)](https://app.koyeb.com/deploy?type=git&repository=github.com/koyeb/example-nestjs&branch=main&build_command=yarn%20run%20build&run_command=yarn%20run%20start:prod&name=nestjs-on-koyeb)

gatsby.cloud

netlify

vercel

next
```

## File: repomix.config.json
```json
{
    "output": {
        "filePath": ".repomix/repomix-output.md",
        "style": "markdown",
        "parsableStyle": true,
        "compress": false,
        "fileSummary": true,
        "directoryStructure": true,
        "removeComments": false,
        "removeEmptyLines": false,
        "topFilesLength": 5,
        "showLineNumbers": false,
        "copyToClipboard": false,
        "includeEmptyDirectories": false
    },
    "include": [
        "**/*"
    ],
    "ignore": {
        "useGitignore": true,
        "useDefaultPatterns": true,
        "customPatterns": [
            "examples/",
            ".github/",
            ".repomix/",
            "node_modules/",
            "*.log"
        ]
    },
    "security": {
        "enableSecurityCheck": true
    }
}
```

## File: tsconfig.json
```json
{
  "display": "@graphq-api",
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig.json to read more about this file */
    /* Projects */
    // "incremental": true,                              /* Enable incremental compilation */
    //"composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./",                          /* Specify the folder for .tsbuildinfo incremental compilation files. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */
    /* Language and Environment */
    "target": "es2016", /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    "lib": [
      "ESNext"
    ], /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    // "jsx": "preserve",                                /* Specify what JSX code is generated. */
    // "experimentalDecorators": true,                   /* Enable experimental support for TC39 stage 2 draft decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h' */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using `jsx: react-jsx*`.` */
    // "reactNamespace": "",                             /* Specify the object invoked for `createElement`. This only applies when targeting `react` JSX emit. */
    // "noLib": true, /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    /* Modules */
    "module": "ESNext",
    "rootDir": "./",
    "moduleResolution": "bundler",
    "baseUrl": "./",
    // "paths": {},                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like `./node_modules/@types`. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "resolveJsonModule": true,                        /* Enable importing .json files */
    // "noResolve": true,                                /* Disallow `import`s, `require`s or `<reference>`s from expanding the number of files TypeScript should add to a project. */
    /* JavaScript Support */
    "allowJs": true, /* Allow JavaScript files to be a part of your program. Use the `checkJS` option to get errors from these files. */
    "checkJs": true, /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from `node_modules`. Only applicable with `allowJs`. */
    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If `declaration` is true, also designates a file that bundles all .d.ts output. */
    "outDir": "./build" /* Specify an output folder for all emitted files. */,
    // "removeComments": true,                           /* Disable emitting comments. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "importsNotUsedAsValues": "remove",               /* Specify emit/checking behavior for imports that are only used for types */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have `@internal` in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like `__extends` in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing `const enum` declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */
    // "preserveValueImports": true,                     /* Preserve unused imported values in the JavaScript output that would otherwise be removed. */
    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    "allowSyntheticDefaultImports": true, /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility. */,
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true /* Ensure that casing is correct in imports. */,
    /* Type Checking */
    "strict": true /* Enable all strict type-checking options. */,
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied `any` type.. */
    // "strictNullChecks": true,                         /* When type checking, take into account `null` and `undefined`. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for `bind`, `call`, and `apply` methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "noImplicitThis": true,                           /* Enable error reporting when `this` is given the type `any`. */
    // "useUnknownInCatchVariables": true,               /* Type catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when a local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Include 'undefined' in index signature results */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */
    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true /* Skip type checking all .d.ts files. */
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules",
    "examples"
  ]
}
```

## File: tsconfig.reference.json
```json
{
  "extends": [
    "./tsconfig.json"
  ],
  "compilerOptions": {
    "composite": true
  }
}
```
