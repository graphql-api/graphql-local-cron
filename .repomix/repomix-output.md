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
- Pay special attention to the Repository Description. These contain important context and guidelines specific to this project.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: **/*
- Files matching these patterns are excluded: exmaples/, node_modules, tmp/, *.log
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been formatted for parsing in markdown style

## Additional Info
### User Provided Header
Custom header text

# Directory Structure
```
.github/
  workflows/
    apollo-studio.yml
    graphql-inspector.yml
    publish-github-package.yml
    vercel.yml
examples/
  next/
    public/
      vercel.svg
    src/
      app/
        api/
          graphql/
            route.ts
        docs/
          page.tsx
        layout.tsx
        page.tsx
      graphql/
        client.ts
      styles/
        globals.css
        Home.module.css
    .eslintrc.json
    next-env.d.ts
    next.config.ts
    package.json
    README.md
    tsconfig.json
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

## File: .github/workflows/apollo-studio.yml
````yaml
name: Apollo Studio
on: [push]
# https://www.apollographql.com/docs/rover/ci-cd/#full-example-1
# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest
    # https://docs.github.com/en/actions/reference/environments
    environment: apollo
    # https://docs.github.com/en/actions/reference/encrypted-secrets
    # https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstepsenv
    env:
      APOLLO_KEY: ${{ secrets.APOLLO_KEY }}
      APOLLO_VCS_COMMIT: ${{ github.event.pull_request.head.sha }}
    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v2
      - name: Install Rover
        run: |
          curl -sSL https://rover.apollo.dev/nix/v0.1.0 | sh
          # Add Rover to the $GITHUB_PATH so it can be used in another step
          # https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions#adding-a-system-path
          echo "$HOME/.rover/bin" >> $GITHUB_PATH
      - name: Run check against prod
        run: |
          rover graph publish TEMPLATE@current --schema ./schema.graphql
````

## File: .github/workflows/graphql-inspector.yml
````yaml
name: GraphQL Inspector

on: [push]

# https://www.graphql-inspector.com/docs/products/action
jobs:
  test:
    name: Check Schema
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@master

      - uses: kamilkisiela/graphql-inspector@master
        with:
          schema: "master:schema.graphql"
````

## File: .github/workflows/publish-github-package.yml
````yaml
name: Github Package
# https://dev.to/cloudx/publish-an-npm-to-github-packages-3pa8

on:
  release:
    types: [created]
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 16
      - run: npm install
      - run: npm run build
      - run: |
          echo @lexacode:https://npm.pkg.github.com/ > build/.npmrc
          echo '//npm.pkg.github.com/:_authToken=${NPM_TOKEN}' >> build/.npmrc
      - run: npm publish
        working-directory: ./build
        env:
          NPM_TOKEN: ${{ secrets.GITHUB_TOKEN }}
````

## File: .github/workflows/vercel.yml
````yaml
name: Vercel
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: recursiv
          token: ${{ secrets.PTA }}
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_ACCESS_TOKEN }} # Required
          github-token: ${{ secrets.GITHUB_TOKEN }} #Optional 
          #vercel-args: '--prod' #Optional
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID}}  #Required
          scope: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID}} #Required
````

## File: examples/next/public/vercel.svg
````
<svg width="283" height="64" viewBox="0 0 283 64" fill="none" 
    xmlns="http://www.w3.org/2000/svg">
    <path d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z" fill="#000"/>
</svg>
````

## File: examples/next/src/app/api/graphql/route.ts
````typescript
import type { GraphQLSchema } from 'graphql'
import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'

import type { ApolloConfig, ApolloServerOptionsWithTypeDefs, BaseContext } from '@apollo/server'
import { NextRequest } from 'next/server'

type GraphQLRouteOptions<Context extends BaseContext = BaseContext> = (
    | {
        typeDefs: ApolloServerOptionsWithTypeDefs<Context>['typeDefs']
        resolvers: ApolloServerOptionsWithTypeDefs<Context>['resolvers']
    }
    | { schema: GraphQLSchema }
) &
    Partial<ApolloConfig>


const server = new ApolloServer({
    typeDefs: "",
    resolvers: {}
})
const handler: (req: NextRequest) => void = startServerAndCreateNextHandler(server)

export {
    handler as GET,
    handler as POST
}
````

## File: examples/next/src/app/docs/page.tsx
````typescript
export default async function DocsPage() {


    return <div>DOCS</div>
}
````

## File: examples/next/src/app/layout.tsx
````typescript
import React from "react";
import '../styles/globals.css'

export default async function RootLayout({ children }: React.PropsWithChildren<{}>) {
    return <html>
        <head>
            <title>Create Next App</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
            {children}
        </body>
    </html>
}
````

## File: examples/next/src/app/page.tsx
````typescript
import Link from "next/link";
import styles from "../styles/Home.module.css";

export default async function RootPage() {


    return <div className={styles.container}>


        <main className={styles.main}>
            <h1 className={styles.title}>
                <div>GraphQL Library Template</div>

            </h1>

        </main>

        <footer className={styles.footer}>
            <Link href="https://github.com/graphql-api/graphql-local-cron">Github</Link>
        </footer>
    </div>
}
````

## File: examples/next/src/graphql/client.ts
````typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { GraphQLCronJob } from '@graphql-api/cron.local'


export class ApolloGraphqlCronJob extends GraphQLCronJob {
    private client: ApolloClient<any>;
    private jobs: Map<string, GraphQLCronJob>;

    constructor(uri: string) {
        super()
        this.client = new ApolloClient({
            uri,
            cache: new InMemoryCache(),
        });
        this.jobs = new Map();

    }
}
````

## File: examples/next/src/styles/globals.css
````css
html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
````

## File: examples/next/src/styles/Home.module.css
````css
.container {
  padding: 0 2rem;
}

.main {
  min-height: 100vh;
  padding: 4rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.footer {
  display: flex;
  flex: 1;
  padding: 2rem 0;
  border-top: 1px solid #eaeaea;
  justify-content: center;
  align-items: center;
}

.footer a {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.title a {
  color: #0070f3;
  text-decoration: none;
}

.title a:hover,
.title a:focus,
.title a:active {
  text-decoration: underline;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
}

.title,
.description {
  text-align: center;
}

.description {
  margin: 4rem 0;
  line-height: 1.5;
  font-size: 1.5rem;
}

.code {
  background: #fafafa;
  border-radius: 5px;
  padding: 0.75rem;
  font-size: 1.1rem;
  font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono,
    Bitstream Vera Sans Mono, Courier New, monospace;
}

.grid {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 800px;
}

.card {
  margin: 1rem;
  padding: 1.5rem;
  text-align: left;
  color: inherit;
  text-decoration: none;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  transition: color 0.15s ease, border-color 0.15s ease;
  max-width: 300px;
}

.card:hover,
.card:focus,
.card:active {
  color: #0070f3;
  border-color: #0070f3;
}

.card h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.card p {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.5;
}

.logo {
  height: 1em;
  margin-left: 0.5rem;
}

@media (max-width: 600px) {
  .grid {
    width: 100%;
    flex-direction: column;
  }
}
````

## File: examples/next/.eslintrc.json
````json
{
  "extends": "next/core-web-vitals"
}
````

## File: examples/next/next-env.d.ts
````typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
````

## File: examples/next/next.config.ts
````typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
````

## File: examples/next/package.json
````json
{
  "name": "@/example",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "next:upgrade": "pnpm dlx @next/codemod@canary upgrade canary"
  },
  "dependencies": {
    "@apollo/client": "^3.13.1",
    "@apollo/server": "^4.11.3",
    "@apollo/subgraph": "^2.10.0",
    "@apollo/utils.keyvaluecache": "^3.1.0",
    "@as-integrations/next": "^3.2.0",
    "@graphql-api/cron.local": "workspace:*",
    "graphql-scalars": "^1.24.1",
    "graphql-tag": "^2.12.6",
    "next": "^15.2.1-canary.2",
    "node-cron": "^3.0.3",
    "react": "^19",
    "react-dom": "^19",
    "urql": "^4.2.1"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.2.1-canary.2",
    "typescript": "^5"
  }
}
````

## File: examples/next/README.md
````markdown
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
````

## File: examples/next/tsconfig.json
````json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "composite": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "rootDir": "../../",
    "baseUrl": ".",
    "paths": {
      "@graphql-api/cron.local/*": [
        "../../src/*"
      ],
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "next.config.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ],
  "references": [
    {
      "path": "../../tsconfig.reference.json"
    }
  ]
}
````

## File: src/cron.ts
````typescript
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
````

## File: src/index.ts
````typescript
export * as resolvers from "./resolvers";

export { GraphQLCron } from './cron'
````

## File: src/resolvers.ts
````typescript
import type { CronJob as ICronJob, Mutation as IMutation, Query as IQuery } from './types'

export const CronJob = {}
export const Query = {}
export const Mutation = {}
````

## File: src/typeDefs.graphql
````graphql
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
````

## File: src/types.d.ts
````typescript
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
````

## File: .gitignore
````
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
````

## File: .npmignore
````
/.bolt
/examples/
.stackblitzrc
tsconfig.reference.json
````

## File: .npmrc
````
@graphql-api:registry = https://npm.pkg.github.com
````

## File: .prettierrc
````
{ "tabWidth": 2, "useTabs": false }
````

## File: .stackblitzrc
````
{
    "installDependencies": true,
    "startCommand": "pnpm --filter @/example dev"
}
````

## File: codegen.yaml
````yaml
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
````

## File: package.json
````json
{
  "name": "@graphql-api/cron.local",
  "version": "0.0.0",
  "description": "cron",
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
  "scripts": {
    "build": "tsc",
    "codegen": "graphql-codegen",
    "example:build": "pnpm --filter @/example dev",
    "repomix": "repomix"
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
````

## File: pnpm-workspace.yaml
````yaml
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
````

## File: README.md
````markdown
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
````

## File: repomix.config.json
````json
{
    "output": {
        "filePath": ".repomix/repomix-output.md",
        "style": "markdown",
        "parsableStyle": true,
        "compress": false,
        "headerText": "Custom header text",
        // "instructionFilePath": "repomix-instruction.md",
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
            "exmaples/",
            "node_modules",
            "tmp/",
            "*.log"
        ]
    },
    "security": {
        "enableSecurityCheck": true
    }
}
````

## File: tsconfig.json
````json
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
````

## File: tsconfig.reference.json
````json
{
  "extends": [
    "./tsconfig.json"
  ],
  "compilerOptions": {
    "composite": true
  }
}
````
