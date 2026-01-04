# Internationalization (i18n) Implementation

## ✅ What's Been Done

### 1. **Dependencies Added**
Updated `client/package.json` with:
- `i18next` - Core i18n framework
- `react-i18next` - React bindings for i18next
- `i18next-browser-languagedetector` - Automatic language detection

### 2. **Translation Files Created**
- ✅ `client/src/i18n/locales/en.json` - Complete English translations
- ✅ `client/src/i18n/locales/si.json` - Complete Sinhala translations

### 3. **i18n Configuration**
- ✅ `client/src/i18n/config.js` - i18n setup with language detection

### 4. **Custom Hook Created**
- ✅ `client/src/hooks/useTranslation.js` - Custom hook with utilities:
  - `t()` - Translation function
  - `changeLanguage(lang)` - Switch language
  - `toggleLanguage()` - Toggle between en/si
  - `currentLanguage` - Current language code
  - `isSinhala`, `isEnglish` - Boolean flags

### 5. **Language Switcher Component**
- ✅ `client/src/components/Layout/LanguageSwitcher.js` - UI component for language switching

### 6. **Components Updated**
- ✅ `client/src/index.js` - i18n initialized
- ✅ `client/src/App.js` - Uses translations
- ✅ `client/src/components/Layout/Navbar.js` - Navigation with translations + LanguageSwitcher
- ✅ `client/src/components/Auth/Login.js` - Login form with translations

## 📦 Installation

```bash
cd client
npm install
```

This will install:
- i18next
- react-i18next
- i18next-browser-languagedetector

## 🚀 Usage Examples

### In Any Component

```javascript
import { useTranslation } from '../../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.login')}</button>
    </div>
  );
};
```

### Language Switching

```javascript
import { useTranslation } from '../../hooks/useTranslation';

const MyComponent = () => {
  const { changeLanguage, toggleLanguage, currentLanguage } = useTranslation();

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('si')}>සිංහල</button>
      <button onClick={toggleLanguage}>Toggle</button>
      <p>Current: {currentLanguage}</p>
    </div>
  );
};
```

### Using LanguageSwitcher

```javascript
import LanguageSwitcher from './components/Layout/LanguageSwitcher';

// Already added to Navbar
<LanguageSwitcher />
```

## 📝 Translation Keys Available

### Common (`common.*`)
- welcome, login, logout, register, email, password, name
- cancel, save, delete, edit, submit, loading, error, success
- back, next, previous, close, search, filter
- dashboard, quiz, forum, progress, portfolio, profile, settings, language

### Authentication (`auth.*`)
- signIn, signUp, emailAddress, password, confirmPassword
- forgotPassword, dontHaveAccount, alreadyHaveAccount
- invalidCredentials, loginFailed, registrationFailed
- passwordsNotMatch, passwordMinLength

### Dashboard (`dashboard.*`)
- welcomeBack, learningProgress, totalQuizzes, averageScore
- currentStreak, badgesEarned, takeQuiz, modelPaper
- recentPerformance, topicPerformance, recentQuizzes

### Quiz (`quiz.*`)
- quizGenerator, adaptiveQuiz, generateQuiz, submitQuiz
- question, of, complete, submitting, timeLimit

### Forum (`forum.*`)
- discussionForum, newPost, createNewPost, comments
- backToForum, addComment, postComment

### Progress (`progress.*`)
- yourProgress, trackJourney, badgesEarned, topicPerformance
- topicMastery, recentQuizResults, viewPortfolio

### Portfolio (`portfolio.*`)
- portfolioTitle, studentInformation, academicSummary
- totalQuizzes, averageScore, bestScore, downloadPortfolio

### Stress (`stress.*`)
- stressLevel, currentLevel, recommendation, message

### Errors (`errors.*`)
- somethingWentWrong, tryAgain, notFound, serverError, networkError

## 🔧 Next Steps - Update Remaining Components

To add translations to other components, follow this pattern:

1. **Import the hook:**
```javascript
import { useTranslation } from '../../hooks/useTranslation';
```

2. **Use in component:**
```javascript
const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.welcomeBack', { name: user.name })}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

3. **Components to update:**
- ✅ Login (done)
- ✅ Navbar (done)
- ⏳ Register
- ⏳ Dashboard
- ⏳ Quiz Generator
- ⏳ Quiz Taking
- ⏳ Forum
- ⏳ Progress Tracker
- ⏳ Portfolio
- ⏳ Stress Indicator

## 💡 Features

- ✅ **Language Persistence** - Selected language saved in localStorage
- ✅ **Auto Detection** - Detects browser language on first visit
- ✅ **Easy Switching** - One-click language toggle
- ✅ **Fallback** - Defaults to English if translation missing
- ✅ **Interpolation** - Support for dynamic values: `t('dashboard.welcomeBack', { name: 'John' })`

## 🌐 Language Codes

- `en` - English
- `si` - Sinhala (සිංහල)

## 📖 Documentation

See `client/src/i18n/README.md` for detailed usage guide.



