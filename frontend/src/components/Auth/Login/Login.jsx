import { useState } from "react";
import styles from "./Login.module.css";
import { loginAPICall } from "@services/AuthService";
import { useAuth } from "@context/AuthContext";
import { Eye, EyeOff, X } from "lucide-react";

export default function Login({ closeLogin, openRegister }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  function handleLogin(e) {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      alert("Please enter your email/username and password");
      return;
    }

    loginAPICall(usernameOrEmail, password)
      .then((response) => {
        const token = 'Bearer ' + response.token;
        login(token, response.userData);
        closeLogin();
      })
      .catch(error => {
        console.error("Login failed:", error);
        alert("Login failed. Check your credentials.");
      });
  }

  return (
    <div className={styles.overlay} onClick={closeLogin}>

      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <button onClick={closeLogin} className={styles.closeButton} aria-label="Close">
          <X className={styles.closeIcon} />
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Log In</h2>
        </div>

        <div className={styles.content}>

          <form onSubmit={handleLogin}>

            <input
              type="text"
              placeholder="Email or username"
              className={styles.input}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />

            <div className={styles.passwordWrapper}>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword
                  ? <Eye className={styles.icon} /> 
                  : <EyeOff className={styles.icon} />}
              </button>

            </div>

            <div className={styles.footerText}>
              <a href="#">Forgot password?</a>
            </div>

            <div className={styles.signupText}>
              Don’t have an account?{" "}
              <button
                type="button"
                className={styles.signupLink}
                onClick={() => {
                  closeLogin();
                  openRegister();
                }}
              >
                Sign up
              </button>
            </div>

            <button
              className={`${styles.loginbtn} ${(!usernameOrEmail || !password) ? styles.disabled : ''}`}
              type="submit"
              disabled={!usernameOrEmail || !password}
            >
              Log In
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>OR</span>
          </div>

          <button className={styles.googleButton}>Continue with Google</button>

          <button className={styles.facebookButton}>Continue with Facebook</button>

        </div>

      </div>

    </div>
  );
}
