import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faRightToBracket,
  faCheck,
  faCircleExclamation,
  faSpinner,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faGithub } from '@fortawesome/free-brands-svg-icons';
import { ThemeColors, UserProfile } from '../types';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginWithGithub
} from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, isNewUser?: boolean) => void;
  theme: ThemeColors;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  theme,
}) => {
  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVerifyEmail, setRegVerifyEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regVerifyPassword, setRegVerifyPassword] = useState('');

  // Login Form State
  const [loginEmailOrUser, setLoginEmailOrUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Status / Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (regEmail.toLowerCase().trim() !== regVerifyEmail.toLowerCase().trim()) {
      setErrorMessage('Emails do not match.');
      return;
    }
    if (regPassword !== regVerifyPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerWithEmail(regUsername, regEmail, regPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Account created successfully in Firebase!');
      setTimeout(() => {
        onAuthSuccess(res.user!, false);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsLoading(true);
    try {
      const res = await loginWithEmail(loginEmailOrUser, loginPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Invalid credentials.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Logged in successfully!');
      setTimeout(() => {
        onAuthSuccess(res.user!, false);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = provider === 'google' ? await loginWithGoogle() : await loginWithGithub();
      if (!res.success || !res.user) {
        setErrorMessage(res.error || `${provider} authentication failed.`);
        setIsLoading(false);
        return;
      }

      setSuccessMessage(`Signed in with ${provider === 'google' ? 'Google' : 'GitHub'}!`);
      setTimeout(() => {
        onAuthSuccess(res.user!, res.isNewUser);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'OAuth error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
        }}
        className="relative w-full max-w-3xl rounded-3xl border p-6 sm:p-10 shadow-2xl flex flex-col select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <span style={{ color: theme.accent }} className="font-bold text-lg">
              ⌘ hotkey-it account
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            style={{ color: theme.subText }}
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Global Error / Success Alerts */}
        {errorMessage && (
          <div
            style={{ backgroundColor: `${theme.error}20`, borderColor: theme.error, color: theme.error }}
            className="mb-6 p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in"
          >
            <FontAwesomeIcon icon={faCircleExclamation} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{ backgroundColor: `${theme.accent}20`, borderColor: theme.accent, color: theme.accent }}
            className="mb-6 p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in font-semibold"
          >
            <FontAwesomeIcon icon={faCheck} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Monkeytype Signature Dual Columns: Register vs Login */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-xs">
          {/* LEFT: + register */}
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-sm" style={{ color: theme.subText }}>
              <FontAwesomeIcon icon={faUserPlus} />
              <span>register</span>
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="username"
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                required
                disabled={isLoading}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="w-full px-3.5 py-2.5 rounded-xl border outline-none focus:border-amber-400/80 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="email"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="w-full px-3.5 py-2.5 rounded-xl border outline-none focus:border-amber-400/80 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="verify email"
                value={regVerifyEmail}
                onChange={e => setRegVerifyEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="w-full px-3.5 py-2.5 rounded-xl border outline-none focus:border-amber-400/80 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="password"
                placeholder="password (min 6 characters)"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="w-full px-3.5 py-2.5 rounded-xl border outline-none focus:border-amber-400/80 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="password"
                placeholder="verify password"
                value={regVerifyPassword}
                onChange={e => setRegVerifyPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="w-full px-3.5 py-2.5 rounded-xl border outline-none focus:border-amber-400/80 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: theme.accent,
                color: theme.keyActiveText,
              }}
              className="mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faUserPlus} />
              )}
              <span>sign up</span>
            </button>
          </form>

          {/* RIGHT: ➔ login */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-sm" style={{ color: theme.subText }}>
              <FontAwesomeIcon icon={faRightToBracket} />
              <span>login</span>
            </div>

            {/* Quick Provider Buttons (Google & GitHub) */}
            <div className="grid grid-cols-2 gap-2 mb-1">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthLogin('google')}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border hover:opacity-85 transition-opacity cursor-pointer font-semibold text-xs disabled:opacity-50"
                title="Login with Google"
              >
                <FontAwesomeIcon icon={faGoogle} className="text-sm" />
                <span>Google</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleOAuthLogin('github')}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border hover:opacity-85 transition-opacity cursor-pointer font-semibold text-xs disabled:opacity-50"
                title="Login with GitHub"
              >
                <FontAwesomeIcon icon={faGithub} className="text-sm" />
                <span>GitHub</span>
              </button>
            </div>

            <div className="flex items-center my-1" style={{ color: theme.subText }}>
              <div className="flex-1 h-[1px]" style={{ backgroundColor: theme.border }} />
              <span className="px-3 text-[10px] opacity-60">or</span>
              <div className="flex-1 h-[1px]" style={{ backgroundColor: theme.border }} />
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="text"
                placeholder="email"
                value={loginEmailOrUser}
                onChange={e => setLoginEmailOrUser(e.target.value)}
                required
                disabled={isLoading}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="w-full px-3.5 py-2.5 rounded-xl border outline-none focus:border-amber-400/80 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <input
                type="password"
                placeholder="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="w-full px-3.5 py-2.5 rounded-xl border outline-none focus:border-amber-400/80 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between mt-1 text-xs" style={{ color: theme.subText }}>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                <span className={rememberMe ? 'text-zinc-200' : ''}>remember me</span>
              </label>
              <span className="opacity-60 text-[11px]">Firebase Auth</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              }}
              className="mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold hover:opacity-85 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faRightToBracket} style={{ color: theme.accent }} />
              )}
              <span>sign in</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
