import "./App.css";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import UserProfilePage from "./pages/UserProfilePage";
import Footer from "./components/Footer";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import TaskListPage from "./pages/TaskListPage";
import GroupListPage from "./pages/GroupListPage";
import UpdateTaskPage from "./pages/UpdateTaskPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import { Toaster } from "react-hot-toast";
import CreateGroupPage from "./pages/CreateGroupPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";

function App() {
  return (
    <div className="app-container">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Navbar />
      <div className="content-area">
        <main>
          <Routes>
            <Route path="/" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task-list"
              element={
                <ProtectedRoute>
                  <TaskListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group-list"
              element={
                <ProtectedRoute>
                  <GroupListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-task"
              element={
                <ProtectedRoute>
                  <CreateTaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-group"
              element={
                <ProtectedRoute>
                  <CreateGroupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-task/:taskId"
              element={
                <ProtectedRoute>
                  <UpdateTaskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/group/:groupId"
              element={
                <ProtectedRoute>
                  <GroupDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
