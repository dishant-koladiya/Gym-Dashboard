import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('Backend setup', () => {
  it('server.ts should exist and have required imports', () => {
    const content = readFileSync('./server.ts', 'utf-8');
    expect(content).toContain("import express from 'express'");
    expect(content).toContain("import cors from 'cors'");
  });

  it('package.json should have all required dependencies', () => {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps.express).toBeDefined();
    expect(deps['jsonwebtoken']).toBeDefined();
    expect(deps.pg).toBeDefined();
    expect(deps['pino']).toBeDefined();
    expect(deps['multer']).toBeDefined();
  });

  it('tsconfig should have strict mode enabled', () => {
    const tsconfig = JSON.parse(readFileSync('./tsconfig.json', 'utf-8'));
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});
