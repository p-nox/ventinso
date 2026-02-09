import { useState, useEffect, useRef } from "react";
import { passwordChange, emailChange, nameChange } from "@services/AuthService";
import { getUserProfile } from "@services/UserService";
import { formatDate } from "@utils/utils";

export function useAccountInfo(userId) {
  const [user, setUser] = useState({
    id: null,
    name: "",
    username: "",
    email: "",
    password: "********",
    phoneNumber: "",
    location: "",
    accountType: "",
    registrationDate: "",
    avatarUrl: null
  });

  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await getUserProfile(userId);
        setUser({
          id: response.id,
          name: response.name,
          username: response.username,
          email: response.email,
          password: "********",
          phoneNumber: response.phoneNumber || "",
          location: response.location || "",
          accountType: response.accountType || "",
          registrationDate: response.registeredAt ? formatDate(response.registeredAt) : "",
          avatarUrl: response.avatarUrl
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    if (inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(length, length);
    }
  }, [editField]);

  const handleEdit = (field) => {
    setEditField(field);
    setTempValue(user[field]);
  };

  const handleCancel = () => {
    setEditField(null);
    setTempValue("");
  };

  const handleSubmit = async () => {
    try {
      switch (editField) {
        case "password":
          await passwordChange(user.id, { password: tempValue });
          break;
        case "email":
          await emailChange(user.id, { email: tempValue });
          break;
        case "name":
          await nameChange(user.id, { name: tempValue });
          break;
        default:
          console.warn(`No update function defined for field: ${editField}`);
          return;
      }
      setUser(prev => ({ ...prev, [editField]: tempValue }));
      setEditField(null);
      setTempValue("");
    } catch (error) {
      console.error(`Failed to update ${editField}:`, error);
    }
  };

  const updateAvatar = (newUrl) => {
    setUser(prev => ({ ...prev, avatarUrl: newUrl }));
  };

  return {
    user,
    editField,
    tempValue,
    inputRef,
    setTempValue,
    handleEdit,
    handleCancel,
    handleSubmit,
    updateAvatar,
    loading
  };
}
