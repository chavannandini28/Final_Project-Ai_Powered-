# Contributing to AI Power Tours

First off, thank you for considering contributing to AI Power Tours! It's people like you that make this platform amazing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples
- Describe the behavior you observed and what you expected
- Include screenshots if possible
- Include your environment details (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Explain why this enhancement would be useful
- List any alternative solutions you've considered

### Pull Requests

- Fill in the required template
- Follow the coding standards
- Include screenshots for UI changes
- Update documentation as needed
- Add tests if applicable

## 🛠️ Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/YOUR-USERNAME/ai-power-tours.git
cd ai-power-tours
```

2. **Install Dependencies**
```bash
npm install --legacy-peer-deps
cd backend && npm install --legacy-peer-deps && cd ..
```

3. **Setup Environment**
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🔄 Pull Request Process

1. **Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow the coding standards
   - Add comments where necessary
   - Test your changes

3. **Commit Your Changes**
```bash
git add .
git commit -m "feat: add amazing feature"
```

4. **Push to Your Fork**
```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template
   - Wait for review

## 📝 Coding Standards

### JavaScript/React

- Use functional components with hooks
- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Keep functions small and focused
- Add JSDoc comments for complex functions

**Example:**
```javascript
/**
 * Fetches hotel data for a given city
 * @param {string} city - City name
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {Promise<Array>} Hotel list
 */
async function fetchHotels(city, checkIn, checkOut) {
  // Implementation
}
```

### File Organization

```
src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.jsx
│   │   └── ComponentName.test.jsx
│   └── ui/
│       └── button.jsx
├── pages/
│   └── PageName.jsx
└── utils/
    └── helpers.js
```

### Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Component description
 */
export function ComponentName({ prop1, prop2 }) {
  // State
  const [state, setState] = useState(initialValue);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

ComponentName.defaultProps = {
  prop2: 0,
};
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first approach
- Group related classes
- Use component variants when needed

```jsx
<button 
  className="
    px-4 py-2 
    bg-blue-600 hover:bg-blue-700 
    text-white font-medium 
    rounded-lg shadow-md 
    transition-colors duration-200
  "
>
  Click Me
</button>
```

## 💬 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add password reset functionality

Added email-based password reset with token generation and validation.
Includes email service integration with Gmail SMTP.

Closes #123
```

```bash
fix(booking): resolve date picker timezone issue

Fixed timezone conversion bug that caused incorrect booking dates.

Fixes #456
```

```bash
docs(readme): update installation instructions

Added detailed steps for MongoDB setup on Windows.
```

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# E2E tests
npm run test:e2e
```

### Writing Tests

```javascript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick} />);
    
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Update API documentation for new endpoints
- Include examples for complex features

## 🎨 UI/UX Guidelines

- Follow existing design patterns
- Ensure responsive design (mobile, tablet, desktop)
- Use consistent spacing and colors
- Add loading states and error messages
- Ensure accessibility (ARIA labels, keyboard navigation)

## 🐛 Debugging Tips

```bash
# Enable verbose logging
NODE_ENV=development npm run dev

# Check MongoDB connection
mongosh

# Test API endpoints
curl http://localhost:5000/api/auth/status

# Check frontend build
npm run build
npm run preview
```

## 🔐 Security

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Follow OWASP security best practices
- Report security vulnerabilities privately

## 📞 Questions?

- Open an issue with the "question" label
- Start a discussion on GitHub Discussions
- Check existing documentation

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Added to the contributors page

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AI Power Tours! 🌍✈️
