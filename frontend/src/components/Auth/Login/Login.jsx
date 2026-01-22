import { useState } from "react";
import styles from "./Login.module.css";
import { loginAPICall } from "@services/AuthService";
import { useAuth } from "@context/AuthContext";
import { AccountIcon, PasswordIcon } from "@assets/icons";
import TabGroup from "@components/Buttons/TabGroup/TabGroup";

export default function Login({ openRegister }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const buttons = [
    { key: 'login', label: 'LOG IN', onClick: null, type: 'submit' },
    { key: 'signup', label: 'SIGN UP', onClick: openRegister, type: 'button' }
  ];


  function handleLogin(e) {
    e.preventDefault();
    console.log("Login form submitted:", { usernameOrEmail, password });

    console.log("Calling loginAPICall...");
    loginAPICall(usernameOrEmail, password)
      .then((response) => {
        console.log("API response:", response);
        const token = 'Bearer ' + response.token;
        console.log("Generated token:", token);

        login(token, response.watchlist);
        console.log("Login function called with token, username/email and watchlist");
      })
      .catch(error => {
        console.error("Login failed:", error);
      });
    console.log("handleLogin finished");
  }

  return (
    <form className={styles.loginForm} onSubmit={handleLogin}>
      <LoginInput
        value={usernameOrEmail}
        onChange={(e) => setUsernameOrEmail(e.target.value)}
        placeholder="Username or Email"
        Icon={AccountIcon}
        iconProps={{ width: 22, height: 22, stroke: "rgba(187, 202, 214, 1)" }}
      />
      <LoginInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
        Icon={PasswordIcon}
        iconProps={{ width: 22, height: 22, fill: "rgba(187, 202, 214, 1)" }}
      />
      <TabGroup
        tabs={buttons}
        activeTab={null}
        buttonClassName={styles.button}
        containerClassName={styles.inputGroup + ' ' + styles.gap}
      />
    </form>
  );
}


function LoginInput({ value, onChange, placeholder, type = "text", Icon, iconProps = {} }) {
  return (
    <div className={styles.inputGroup}>
      {Icon && (
        <div className={styles.iconContainer}>
          <Icon {...iconProps} />
        </div>
      )}
      <input
        className={styles.loginInput}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        aria-label={placeholder}
      />
    </div>
  );
}





