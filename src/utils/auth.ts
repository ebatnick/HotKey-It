import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  githubProvider,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { UserProfile, LeaderboardEntry, SessionResult, PresetId, TestModeType } from '../types';

const LOCAL_STORAGE_CACHE_KEY = 'keyflow_cached_profile_v2';

function getTodayDateStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Memory cache of the active profile
let currentProfileCache: UserProfile | null = null;
const authListeners = new Set<(user: UserProfile | null) => void>();

// Load initial cached profile from localStorage
try {
  const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
  if (cached) {
    currentProfileCache = JSON.parse(cached);
  }
} catch {}

function notifyListeners(user: UserProfile | null) {
  currentProfileCache = user;
  try {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY);
    }
  } catch {}
  authListeners.forEach(listener => listener(user));
}

// Convert Firestore doc or FirebaseUser to UserProfile
function buildUserProfileFromDoc(uid: string, data: Record<string, any>, fallbackEmail = ''): UserProfile {
  return {
    id: uid,
    uid,
    username: data.username || 'typer',
    email: data.email || fallbackEmail,
    joinedDate: data.joinedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    currentStreak: typeof data.currentStreak === 'number' ? data.currentStreak : 1,
    level: typeof data.level === 'number' ? data.level : 1,
    xp: typeof data.xp === 'number' ? data.xp : 0,
    nextLevelXp: typeof data.nextLevelXp === 'number' ? data.nextLevelXp : 500,
    testsStarted: typeof data.testsStarted === 'number' ? data.testsStarted : 0,
    testsCompleted: typeof data.testsCompleted === 'number' ? data.testsCompleted : 0,
    timeTypingSeconds: typeof data.timeTypingSeconds === 'number' ? data.timeTypingSeconds : 0,
    bio: data.bio || '',
    keyboard: data.keyboard || 'Standard Layout',
    badge: data.badge || '', // Default empty, customizable directly in Firestore DB
    personalBests: data.personalBests || {},
    activityHeatmap: data.activityHeatmap || { [getTodayDateStr()]: 0 }
  };
}

let firestoreUnsubscribe: (() => void) | null = null;

// Initialize onAuthStateChanged listener
export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  authListeners.add(callback);
  // Send current cached profile immediately
  callback(currentProfileCache);

  const authUnsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
      firestoreUnsubscribe = null;
    }

    if (!fbUser) {
      notifyListeners(null);
      return;
    }

    // Set up real-time listener on the user's Firestore document
    const userDocRef = doc(db, 'users', fbUser.uid);
    try {
      firestoreUnsubscribe = onSnapshot(
        userDocRef,
        async (snapshot) => {
          if (snapshot.exists()) {
            const profile = buildUserProfileFromDoc(fbUser.uid, snapshot.data(), fbUser.email || '');
            notifyListeners(profile);
          } else {
            // First time login - initialize doc in Firestore
            const initialProfile: UserProfile = {
              id: fbUser.uid,
              uid: fbUser.uid,
              username: fbUser.displayName || fbUser.email?.split('@')[0] || 'typer',
              email: fbUser.email || '',
              joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              currentStreak: 1,
              level: 1,
              xp: 0,
              nextLevelXp: 500,
              testsStarted: 0,
              testsCompleted: 0,
              timeTypingSeconds: 0,
              bio: '',
              keyboard: 'Standard Layout',
              badge: '', // default empty, admin or user can write badge via console
              personalBests: {},
              activityHeatmap: { [getTodayDateStr()]: 0 }
            };

            try {
              await setDoc(userDocRef, {
                uid: initialProfile.uid,
                username: initialProfile.username,
                email: initialProfile.email,
                joinedDate: initialProfile.joinedDate,
                currentStreak: initialProfile.currentStreak,
                level: initialProfile.level,
                xp: initialProfile.xp,
                testsStarted: initialProfile.testsStarted,
                testsCompleted: initialProfile.testsCompleted,
                timeTypingSeconds: initialProfile.timeTypingSeconds,
                bio: initialProfile.bio,
                keyboard: initialProfile.keyboard,
                badge: '',
                personalBests: {},
                activityHeatmap: initialProfile.activityHeatmap
              });
              notifyListeners(initialProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
    }
  });

  return () => {
    authListeners.delete(callback);
    if (authListeners.size === 0) {
      authUnsub();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }
    }
  };
}

export function getCurrentUser(): UserProfile | null {
  return currentProfileCache;
}

/**
 * Register a new user with Email and Password
 */
export async function registerWithEmail(
  username: string,
  email: string,
  pass: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const cleanUser = username.trim().slice(0, 32);
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanUser || cleanUser.length < 2) {
    return { success: false, error: 'Username must be at least 2 characters.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (pass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    await updateProfile(cred.user, { displayName: cleanUser });

    const newProfile: UserProfile = {
      id: cred.user.uid,
      uid: cred.user.uid,
      username: cleanUser,
      email: cleanEmail,
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      currentStreak: 1,
      level: 1,
      xp: 0,
      nextLevelXp: 500,
      testsStarted: 0,
      testsCompleted: 0,
      timeTypingSeconds: 0,
      bio: '',
      keyboard: 'Standard Layout',
      badge: '', // default empty, editable via Firestore DB
      personalBests: {},
      activityHeatmap: { [getTodayDateStr()]: 0 }
    };

    const userDocRef = doc(db, 'users', cred.user.uid);
    await setDoc(userDocRef, {
      uid: newProfile.uid,
      username: newProfile.username,
      email: newProfile.email,
      joinedDate: newProfile.joinedDate,
      currentStreak: newProfile.currentStreak,
      level: newProfile.level,
      xp: newProfile.xp,
      testsStarted: newProfile.testsStarted,
      testsCompleted: newProfile.testsCompleted,
      timeTypingSeconds: newProfile.timeTypingSeconds,
      bio: newProfile.bio,
      keyboard: newProfile.keyboard,
      badge: '',
      personalBests: {},
      activityHeatmap: newProfile.activityHeatmap
    });

    notifyListeners(newProfile);
    return { success: true, user: newProfile };
  } catch (err: any) {
    console.error('Registration error:', err);
    let msg = 'Registration failed. Please try again.';
    if (err.code === 'auth/email-already-in-use') {
      msg = 'This email is already in use.';
    } else if (err.code === 'auth/weak-password') {
      msg = 'Password is too weak.';
    } else if (err.code === 'auth/invalid-email') {
      msg = 'Invalid email address.';
    }
    return { success: false, error: msg };
  }
}

/**
 * Login with Email and Password
 */
export async function loginWithEmail(
  emailOrUsername: string,
  pass: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const queryEmail = emailOrUsername.trim().toLowerCase();
  if (!queryEmail) {
    return { success: false, error: 'Please enter your email or username.' };
  }
  if (!pass) {
    return { success: false, error: 'Please enter your password.' };
  }

  // If user entered username instead of email, check if it needs '@'
  const email = queryEmail.includes('@') ? queryEmail : `${queryEmail}@keyflow.io`;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    const profile = snap.exists()
      ? buildUserProfileFromDoc(cred.user.uid, snap.data(), cred.user.email || '')
      : buildUserProfileFromDoc(cred.user.uid, {}, cred.user.email || '');

    notifyListeners(profile);
    return { success: true, user: profile };
  } catch (err: any) {
    console.error('Login error:', err);
    let msg = 'Invalid email or password.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      msg = 'Invalid username/email or password.';
    }
    return { success: false, error: msg };
  }
}

/**
 * Quick OAuth login (Google)
 */
export async function loginWithGoogle(): Promise<{ success: boolean; error?: string; user?: UserProfile; isNewUser?: boolean }> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const userDocRef = doc(db, 'users', res.user.uid);
    const snap = await getDoc(userDocRef);
    let profile: UserProfile;
    let isNewUser = false;

    if (snap.exists()) {
      profile = buildUserProfileFromDoc(res.user.uid, snap.data(), res.user.email || '');
    } else {
      isNewUser = true;
      profile = {
        id: res.user.uid,
        uid: res.user.uid,
        username: res.user.displayName || res.user.email?.split('@')[0] || 'Typer',
        email: res.user.email || '',
        joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        currentStreak: 1,
        level: 1,
        xp: 0,
        nextLevelXp: 500,
        testsStarted: 0,
        testsCompleted: 0,
        timeTypingSeconds: 0,
        bio: 'Speed keyboard trainer.',
        keyboard: 'Standard Layout',
        badge: '',
        personalBests: {},
        activityHeatmap: { [getTodayDateStr()]: 0 }
      };

      await setDoc(userDocRef, {
        uid: profile.uid,
        username: profile.username,
        email: profile.email,
        joinedDate: profile.joinedDate,
        currentStreak: profile.currentStreak,
        level: profile.level,
        xp: profile.xp,
        testsStarted: profile.testsStarted,
        testsCompleted: profile.testsCompleted,
        timeTypingSeconds: profile.timeTypingSeconds,
        bio: profile.bio,
        keyboard: profile.keyboard,
        badge: '',
        personalBests: {},
        activityHeatmap: profile.activityHeatmap
      });
    }

    notifyListeners(profile);
    return { success: true, user: profile, isNewUser };
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    return { success: false, error: err.message || 'Google sign-in was cancelled or failed.' };
  }
}

/**
 * Link custom username and password to Google / OAuth account
 * Allows user to log in either via Google OR using email & password
 */
export async function linkPasswordAndUsername(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const user = auth.currentUser;
  if (!user) return { success: false, error: 'No active user found.' };

  const cleanUser = username.trim().slice(0, 32);
  if (cleanUser.length < 2) return { success: false, error: 'Username must be at least 2 characters.' };
  if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

  try {
    if (user.email) {
      try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await linkWithCredential(user, credential);
      } catch (linkErr: any) {
        if (linkErr.code === 'auth/credential-already-in-use' || linkErr.code === 'auth/provider-already-linked') {
          await updatePassword(user, password);
        } else {
          console.warn('Link password note:', linkErr);
        }
      }
    }

    await updateProfile(user, { displayName: cleanUser });

    // Update in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { username: cleanUser });

    if (currentProfileCache) {
      currentProfileCache = { ...currentProfileCache, username: cleanUser };
      notifyListeners(currentProfileCache);
    }

    return { success: true, user: currentProfileCache || undefined };
  } catch (err: any) {
    console.error('Error linking password and username:', err);
    return { success: false, error: err.message || 'Failed to update username or link password.' };
  }
}

/**
 * Quick OAuth login (GitHub)
 */
export async function loginWithGithub(): Promise<{ success: boolean; error?: string; user?: UserProfile; isNewUser?: boolean }> {
  try {
    const res = await signInWithPopup(auth, githubProvider);
    const userDocRef = doc(db, 'users', res.user.uid);
    const snap = await getDoc(userDocRef);
    let profile: UserProfile;
    let isNewUser = false;

    if (snap.exists()) {
      profile = buildUserProfileFromDoc(res.user.uid, snap.data(), res.user.email || '');
    } else {
      isNewUser = true;
      profile = {
        id: res.user.uid,
        uid: res.user.uid,
        username: res.user.displayName || res.user.email?.split('@')[0] || 'GitHub Dev',
        email: res.user.email || '',
        joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        currentStreak: 1,
        level: 1,
        xp: 0,
        nextLevelXp: 500,
        testsStarted: 0,
        testsCompleted: 0,
        timeTypingSeconds: 0,
        bio: 'KeyFlow power user.',
        keyboard: 'Mechanical QWERTY',
        badge: '',
        personalBests: {},
        activityHeatmap: { [getTodayDateStr()]: 0 }
      };

      await setDoc(userDocRef, {
        uid: profile.uid,
        username: profile.username,
        email: profile.email,
        joinedDate: profile.joinedDate,
        currentStreak: profile.currentStreak,
        level: profile.level,
        xp: profile.xp,
        testsStarted: profile.testsStarted,
        testsCompleted: profile.testsCompleted,
        timeTypingSeconds: profile.timeTypingSeconds,
        bio: profile.bio,
        keyboard: profile.keyboard,
        badge: '',
        personalBests: {},
        activityHeatmap: profile.activityHeatmap
      });
    }

    notifyListeners(profile);
    return { success: true, user: profile, isNewUser };
  } catch (err: any) {
    console.error('GitHub Sign-In Error:', err);
    return { success: false, error: err.message || 'GitHub sign-in was cancelled or failed.' };
  }
}

/**
 * Sign out user
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign out error:', err);
  }
  notifyListeners(null);
}

/**
 * Update user profile bio / keyboard in Firestore
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const current = currentProfileCache;
  if (!current) return null;

  const userDocRef = doc(db, 'users', current.id);
  const patch: Record<string, any> = {};

  if (updates.bio !== undefined) patch.bio = updates.bio.slice(0, 250);
  if (updates.keyboard !== undefined) patch.keyboard = updates.keyboard.slice(0, 100);

  try {
    await updateDoc(userDocRef, patch);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${current.id}`);
  }

  const updated: UserProfile = {
    ...current,
    ...updates,
    bio: patch.bio !== undefined ? patch.bio : current.bio,
    keyboard: patch.keyboard !== undefined ? patch.keyboard : current.keyboard
  };

  notifyListeners(updated);
  return updated;
}

/**
 * Record completed test session: updates testsCompleted, typing time, XP, level, PBs and submits to leaderboard
 */
export async function recordSessionForUser(session: SessionResult): Promise<UserProfile | null> {
  const current = currentProfileCache;
  if (!current) return null;

  const todayStr = getTodayDateStr();
  const currentHeatmap = { ...current.activityHeatmap };
  currentHeatmap[todayStr] = (currentHeatmap[todayStr] || 0) + 1;

  // XP calculation
  const xpGained = Math.round(session.spm * 2 + (session.accuracy === 100 ? 50 : 20));
  let totalXp = current.xp + xpGained;
  let level = current.level;
  let nextLevelXp = current.nextLevelXp;

  while (totalXp >= nextLevelXp) {
    totalXp -= nextLevelXp;
    level += 1;
    nextLevelXp = Math.round(nextLevelXp * 1.25);
  }

  // Personal Best evaluation
  const pbKey = `${session.modeType}_${session.modeValue}`;
  const existingPb = current.personalBests[pbKey];
  const updatedPbs = { ...current.personalBests };
  const dateFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (!existingPb || session.spm > existingPb.spm) {
    updatedPbs[pbKey] = {
      spm: session.spm,
      accuracy: session.accuracy,
      date: dateFormatted
    };
  }

  const updated: UserProfile = {
    ...current,
    testsStarted: current.testsStarted + 1,
    testsCompleted: current.testsCompleted + 1,
    timeTypingSeconds: current.timeTypingSeconds + session.durationSeconds,
    level,
    xp: totalXp,
    nextLevelXp,
    personalBests: updatedPbs,
    activityHeatmap: currentHeatmap
  };

  // 1. Update User Profile in Firestore
  try {
    const userDocRef = doc(db, 'users', current.id);
    await updateDoc(userDocRef, {
      testsStarted: updated.testsStarted,
      testsCompleted: updated.testsCompleted,
      timeTypingSeconds: updated.timeTypingSeconds,
      level: updated.level,
      xp: updated.xp,
      personalBests: updated.personalBests,
      activityHeatmap: updated.activityHeatmap
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${current.id}`);
  }

  // 2. Submit Score to Leaderboard in Firestore
  try {
    const scoreId = `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const scoreDocRef = doc(db, 'leaderboard', scoreId);

    const consistencyVal = session.mistakeCount === 0
      ? 100
      : Math.max(50, Math.round(100 - (session.mistakeCount / Math.max(1, session.totalAttempts)) * 100));

    await setDoc(scoreDocRef, {
      userId: current.id,
      username: current.username,
      badge: current.badge || '', // Badge is passed along so it shows on leaderboard!
      spm: session.spm,
      accuracy: session.accuracy,
      raw: session.spm,
      consistency: consistencyVal,
      preset: session.preset,
      modeType: session.modeType,
      modeValue: session.modeValue,
      date: `${dateFormatted} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'leaderboard');
  }

  notifyListeners(updated);
  return updated;
}

/**
 * Fetch 100% REAL leaderboard entries from Firestore (Zero mock data)
 */
export async function fetchLeaderboardFromFirestore(
  preset: PresetId | 'all',
  modeType: TestModeType,
  modeValue: number
): Promise<LeaderboardEntry[]> {
  const current = currentProfileCache;
  const entries: LeaderboardEntry[] = [];

  try {
    const q = query(
      collection(db, 'leaderboard'),
      where('modeType', '==', modeType),
      where('modeValue', '==', modeValue),
      limit(100)
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      // Filter by preset if specified
      if (preset !== 'all' && data.preset && data.preset !== preset) {
        return;
      }
      entries.push({
        id: docSnap.id,
        rank: 0,
        userId: data.userId,
        username: data.username || 'Anonymous',
        badge: data.badge || '',
        spm: Number(data.spm) || 0,
        accuracy: Number(data.accuracy) || 100,
        raw: typeof data.raw === 'number' ? data.raw : Number(data.spm) || 0,
        consistency: typeof data.consistency === 'number' ? data.consistency : 90,
        avgReactionTimeMs: Math.round(60000 / Math.max(1, Number(data.spm))),
        preset: data.preset || 'vscode',
        modeType,
        modeValue,
        dateStr: data.date || 'Recent',
        isCurrentUser: current ? current.id === data.userId : false
      });
    });
  } catch (error) {
    console.error('Firestore leaderboard query error:', error);
  }

  // Sort real players descending by SPM, then accuracy
  entries.sort((a, b) => b.spm - a.spm || b.accuracy - a.accuracy);

  // Assign 1-indexed ranks
  return entries.map((e, index) => ({
    ...e,
    rank: index + 1
  }));
}
