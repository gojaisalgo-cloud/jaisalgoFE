import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',workers:1,timeout:60000,reporter:'list',use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3000',launchOptions:{...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{}),args:['--no-sandbox']}}});
