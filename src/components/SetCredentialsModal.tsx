import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey, faCheck, faXmark, faShieldHalved, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { ThemeColors, UserProfile } from '../types';
import { linkPasswordAndUsername } from '../utils/auth';

interface SetCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSuccess: (updated: UserProfile) => void;
  theme: ThemeColors;
}

export const SetCredentialsModal: React.FC<SetCredentialsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
  theme,
}) => {
  const [username, setUsername] = useState(user.username || '');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== verifyPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await linkPasswordAndUsername(username, password);
      if (!res.success) {
        setError(res.error || 'Failed to update credentials.');
        setIsLoading(false);
        return;
      }
      if (res.user) {
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
        }}
        className="relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl flex flex-col select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: theme.border }}>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faShieldHalved} style={{ color: theme.accent }} className="text-base" />
            <h2 className="font-bold text-sm tracking-tight" style={{ color: theme.text }}>
              Choose Username & Password
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: theme.subText }}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className="text-xs mb-4 opacity-80 leading-relaxed" style={{ color: theme.subText }}>
          You signed in via Google (<span className="text-white font-semibold">{user.email}</span>). Set your custom username and create a password to log in either with Google <b>or</b> with email and password!
        </p>

        {error && (
          <div
            style={{ backgroundColor: `${theme.error}20`, borderColor: theme.error, color: theme.error }}
            className="mb-4 p-2.5 rounded-xl border text-xs"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block mb-1 font-semibold opacity-70" style={{ color: theme.subText }}>
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Choose your display name"
                required
                maxLength={30}
                style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
                className="w-full px-3 py-2 rounded-xl border outline-none focus:border-amber-400/80 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold opacity-70" style={{ color: theme.subText }}>
              Create Password (min 6 chars)
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
              className="w-full px-3 py-2 rounded-xl border outline-none focus:border-amber-400/80 transition-colors"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold opacity-70" style={{ color: theme.subText }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={verifyPassword}
              onChange={e => setVerifyPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ backgroundColor: theme.keyBg, borderColor: theme.border, color: theme.text }}
              className="w-full px-3 py-2 rounded-xl border outline-none focus:border-amber-400/80 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border font-semibold opacity-70 hover:opacity-100 transition-opacity"
              style={{ borderColor: theme.border, color: theme.subText }}
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: theme.accent,
                color: theme.keyActiveText,
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faCheck} />
              )}
              <span>Save & Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
