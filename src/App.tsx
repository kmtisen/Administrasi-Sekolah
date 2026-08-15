import React, { useState, useEffect } from 'react';
import {
  loadSchoolConfig,
  saveSchoolConfig,
  loadUsers,
  saveUsers,
  loadStudents,
  saveStudents,
  loadClasses,
  saveClasses,
  loadAttendanceRecords,
  saveAttendanceRecords,
  loadGrades,
  saveGrades,
  loadTeacherJournals,
  saveTeacherJournals,
  loadHomeroomGuidances,
  saveHomeroomGuidances,
  loadDocuments,
  saveDocumentToDb,
  deleteDocumentFromDb,
  resetToDefaultData,
} from './services/storageService';
import {
  User,
  SchoolConfig,
  Student,
  ClassItem,
  AttendanceRecord,
  GradeRecord,
  TeacherJournal,
  HomeroomGuidance,
  GeneratedDocument,
} from './types';

// Layout & Auth components
import { LoginView } from './components/auth/LoginView';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Dashboard & Core Views
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AttendanceView } from './components/teaching/AttendanceView';
import { JournalView } from './components/teaching/JournalView';
import { GradesView } from './components/teaching/GradesView';
import { HomeroomView } from './components/homeroom/HomeroomView';

// Curriculum Generator Views
import { AdmMerdekaView } from './components/curriculum/AdmMerdekaView';
import { DeepLearningView } from './components/curriculum/DeepLearningView';
import { Kbc10View } from './components/curriculum/Kbc10View';
import { SavedDocsView } from './components/curriculum/SavedDocsView';

// Admin Views
import { ConfigView } from './components/admin/ConfigView';
import { UserManagementView } from './components/admin/UserManagementView';
import { StudentManagementView } from './components/admin/StudentManagementView';
import { ClassManagementView } from './components/admin/ClassManagementView';

export default function App() {
  // Global Application State
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(loadSchoolConfig());
  const [users, setUsers] = useState<User[]>(loadUsers());
  const [students, setStudents] = useState<Student[]>(loadStudents());
  const [classes, setClasses] = useState<ClassItem[]>(loadClasses());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(loadAttendanceRecords());
  const [grades, setGrades] = useState<GradeRecord[]>(loadGrades());
  const [journals, setJournals] = useState<TeacherJournal[]>(loadTeacherJournals());
  const [guidances, setGuidances] = useState<HomeroomGuidance[]>(loadHomeroomGuidances());
  const [documents, setDocuments] = useState<GeneratedDocument[]>(loadDocuments());

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kbc_active_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    // Default logged in as admin for immediate exploration
    const defaultAdmin = loadUsers().find((u) => u.role === 'admin') || loadUsers()[0];
    return defaultAdmin || null;
  });

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync active user to localStorage
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('kbc_active_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kbc_active_user');
  };

  const handleSwitchUser = (newUser: User) => {
    setCurrentUser(newUser);
    localStorage.setItem('kbc_active_user', JSON.stringify(newUser));
  };

  // Handlers for data updates
  const handleSaveConfig = (newConfig: SchoolConfig) => {
    setSchoolConfig(newConfig);
    saveSchoolConfig(newConfig);
  };

  const handleSaveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    saveUsers(newUsers);
    if (currentUser) {
      const refreshed = newUsers.find((u) => u.id === currentUser.id);
      if (refreshed) {
        setCurrentUser(refreshed);
        localStorage.setItem('kbc_active_user', JSON.stringify(refreshed));
      }
    }
  };

  const handleSaveStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStudents(newStudents);
  };

  const handleSaveClasses = (newClasses: ClassItem[]) => {
    setClasses(newClasses);
    saveClasses(newClasses);
  };

  const handleSaveAttendance = (newAttendance: AttendanceRecord[]) => {
    setAttendanceRecords(newAttendance);
    saveAttendanceRecords(newAttendance);
  };

  const handleSaveGrades = (newGrades: GradeRecord[]) => {
    setGrades(newGrades);
    saveGrades(newGrades);
  };

  const handleSaveJournals = (newJournals: TeacherJournal[]) => {
    setJournals(newJournals);
    saveTeacherJournals(newJournals);
  };

  const handleSaveGuidances = (newGuidances: HomeroomGuidance[]) => {
    setGuidances(newGuidances);
    saveHomeroomGuidances(newGuidances);
  };

  const handleSaveDocument = (doc: GeneratedDocument) => {
    saveDocumentToDb(doc);
    setDocuments(loadDocuments());
  };

  const handleDeleteDocument = (docId: string) => {
    deleteDocumentFromDb(docId);
    setDocuments(loadDocuments());
  };

  const handleResetDatabase = () => {
    resetToDefaultData();
    setSchoolConfig(loadSchoolConfig());
    setUsers(loadUsers());
    setStudents(loadStudents());
    setClasses(loadClasses());
    setAttendanceRecords(loadAttendanceRecords());
    setGrades(loadGrades());
    setJournals(loadTeacherJournals());
    setGuidances(loadHomeroomGuidances());
    setDocuments(loadDocuments());
    setCurrentUser(loadUsers()[0]);
    localStorage.setItem('kbc_active_user', JSON.stringify(loadUsers()[0]));
  };

  // If not logged in, show Dark Mode Glassmorphism Login View
  if (!currentUser) {
    return (
      <LoginView
        schoolConfig={schoolConfig}
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        schoolConfig={schoolConfig}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Sticky Top Header */}
        <Header
          currentUser={currentUser}
          schoolConfig={schoolConfig}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSwitchUser={handleSwitchUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              currentUser={currentUser}
              schoolConfig={schoolConfig}
              students={students}
              classes={classes}
              documents={documents}
              guidances={guidances}
              attendanceRecords={attendanceRecords}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Daily Teaching */}
          {currentTab === 'attendance' && (
            <AttendanceView
              students={students}
              classes={classes}
              currentUser={currentUser}
              schoolConfig={schoolConfig}
              attendanceRecords={attendanceRecords}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {currentTab === 'journal' && (
            <JournalView
              journals={journals}
              classes={classes}
              currentUser={currentUser}
              schoolConfig={schoolConfig}
              onSaveJournals={handleSaveJournals}
            />
          )}

          {currentTab === 'grades' && (
            <GradesView
              students={students}
              classes={classes}
              currentUser={currentUser}
              schoolConfig={schoolConfig}
              grades={grades}
              onSaveGrades={handleSaveGrades}
            />
          )}

          {/* Homeroom Guidance & Recap */}
          {currentTab === 'homeroom' && (
            <HomeroomView
              students={students}
              classes={classes}
              currentUser={currentUser}
              schoolConfig={schoolConfig}
              attendanceRecords={attendanceRecords}
              grades={grades}
              guidances={guidances}
              onSaveGuidances={handleSaveGuidances}
            />
          )}

          {/* Curriculum Generator Views */}
          {currentTab === 'adm-merdeka' && (
            <AdmMerdekaView
              currentUser={currentUser}
              schoolConfig={schoolConfig}
              classes={classes}
              onSaveDocument={handleSaveDocument}
            />
          )}

          {currentTab === 'deep-learning' && (
            <DeepLearningView
              currentUser={currentUser}
              schoolConfig={schoolConfig}
              classes={classes}
              onSaveDocument={handleSaveDocument}
            />
          )}

          {currentTab === 'kbc-10' && (
            <Kbc10View
              currentUser={currentUser}
              schoolConfig={schoolConfig}
              classes={classes}
              onSaveDocument={handleSaveDocument}
            />
          )}

          {currentTab === 'saved-docs' && (
            <SavedDocsView
              documents={documents}
              currentUser={currentUser}
              onSaveDocument={handleSaveDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {/* School & Admin Management */}
          {currentTab === 'users' && currentUser.role === 'admin' && (
            <UserManagementView
              users={users}
              classes={classes}
              onSaveUsers={handleSaveUsers}
            />
          )}

          {currentTab === 'students' && (
            <StudentManagementView
              students={students}
              classes={classes}
              onSaveStudents={handleSaveStudents}
            />
          )}

          {currentTab === 'classes' && (
            <ClassManagementView
              classes={classes}
              users={users}
              onSaveClasses={handleSaveClasses}
            />
          )}

          {currentTab === 'config' && currentUser.role === 'admin' && (
            <ConfigView
              config={schoolConfig}
              onSaveConfig={handleSaveConfig}
              onResetDatabase={handleResetDatabase}
            />
          )}
        </main>
      </div>
    </div>
  );
}
