// Scout2Retire ESLint Configuration
// Enforces code quality and consistency standards

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.js', 'node_modules'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: '18.2'
    }
  },
  plugins: ['react-refresh'],
  rules: {
    // React specific rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    'react/prop-types': 'off', // We're not using PropTypes
    'react/display-name': 'off',
    
    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-debugger': 'error',
    
    // Enforce consistency
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'indent': ['error', 2, { SwitchCase: 1 }],
    
    // Scout2Retire specific patterns
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['../styles/*', '!../styles/uiConfig'],
          message: 'Only import from uiConfig.ts for styles'
        }
      ]
    }],
    
    // Prevent common errors from commit history
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="className"][value.value=/\\b(p|m|px|py|mx|my)-\\d+\\b/]',
        message: 'Use uiConfig.ts spacing values instead of hardcoded padding/margin'
      },
      {
        selector: 'JSXAttribute[name.name="className"][value.value=/\\bmax-w-(sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)\\b/]',
        message: 'Use consistent width classes from uiConfig.ts'
      },
      {
        selector: 'JSXAttribute[name.name="className"][value.value=/\\b(text|bg|border)-(gray|green|blue|red|yellow)-\\d+\\b/]',
        message: 'Use color tokens from uiConfig.ts instead of hardcoded colors'
      }
    ]
  },
  overrides: [
    {
      files: ['src/styles/uiConfig.ts'],
      rules: {
        'no-restricted-syntax': 'off' // Allow hardcoded values in uiConfig
      }
    },
    {
      files: ['*.config.js', '*.config.ts'],
      rules: {
        'no-restricted-syntax': 'off' // Allow in config files
      }
    }
  ]
};