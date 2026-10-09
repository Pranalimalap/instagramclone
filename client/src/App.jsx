  import { useState, useEffect } from "react";
  import axios from "axios";
  import "./App.css";

  function App() {
    const [page, setPage] = useState("login");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [username, setUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const [message, setMessage] = useState("");

    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const [image, setImage] = useState("");
    const [caption, setCaption] = useState("");
    const [postMessage, setPostMessage] = useState("");

    const [posts, setPosts] = useState([]);

    const [comment, setComment] = useState("");

    const [activePage, setActivePage] = useState("home");
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [messageUnreadCount, setMessageUnreadCount] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [stories, setStories] = useState([]);

    const [storyImage, setStoryImage] = useState("");

    const [selectedStory, setSelectedStory] = useState(null);
    // =========================
    // LOGIN
    // =========================

    const handleLogin = async (e) => {
      e.preventDefault();

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email,
            password,
          }
        );

        localStorage.setItem("token", response.data.token);

        setUser(response.data.user);
        setLoggedIn(true);
        setActivePage("home");

        setMessage("Login Successful! 🎉");

        fetchPosts();
      } catch (error) {
        console.log(error.response?.data);

        setMessage(
          error.response?.data?.message ||
            "Login failed ❌"
        );
      }
    };

    // =========================
    // REGISTER
    // =========================

    const handleRegister = async (e) => {
      e.preventDefault();

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            username,
            email: registerEmail,
            password: registerPassword,
          }
        );

        console.log(response.data);

        setMessage("Registration Successful! 🎉");

        setUsername("");
        setRegisterEmail("");
        setRegisterPassword("");

        setTimeout(() => {
          setPage("login");
          setMessage("");
        }, 1500);
      } catch (error) {
        console.log(error.response?.data);

        setMessage(
          error.response?.data?.message ||
            "Registration failed ❌"
        );
      }
    };

    // =========================
    // CREATE POST
    // =========================

    const handleCreatePost = async (e) => {
      e.preventDefault();

      try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
          "http://localhost:5000/api/posts/create",
          {
            image,
            caption,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);

        setPostMessage(
          "Post created successfully! 📸"
        );

        setImage("");
        setCaption("");

        fetchPosts();
      } catch (error) {
        console.log(error.response?.data);

        setPostMessage(
          error.response?.data?.message ||
            "Post creation failed ❌"
        );
      }
    };

    // =========================
    // GET POSTS
    // =========================

    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/posts"
        );

        console.log("POST DATA:", response.data);

        setPosts(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    // =========================
// GET STORIES
// =========================

const fetchStories = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      "http://localhost:5000/api/stories",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("STORIES:", response.data);

    setStories(response.data);

  } catch (error) {
    console.log(
      "FETCH STORIES ERROR:",
      error.response?.data || error.message
    );
  }
};
// =========================
// CREATE STORY
// =========================

const createStory = async () => {
  if (!storyImage.trim()) {
    alert("Please enter story image URL 📸");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:5000/api/stories/create",
      {
        image: storyImage.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("STORY CREATED:", response.data);

    setStoryImage("");

    await fetchStories();

    alert("Story added successfully! 🎉");

  } catch (error) {
    console.log(
      "CREATE STORY ERROR:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      "Story creation failed ❌"
    );
  }
};
    // =========================
// UNREAD MESSAGE COUNT
// =========================

const fetchUnreadMessageCount = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      "http://localhost:5000/api/messages/unread-count",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessageUnreadCount(response.data.count);
  } catch (error) {
    console.log(
      "UNREAD MESSAGE COUNT ERROR:",
      error.response?.data
    );
  }
};
// =========================
// GET MESSAGES
// =========================

const fetchMessages = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    // Get chat messages
    const response = await axios.get(
      `http://localhost:5000/api/messages/chat/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessages(response.data);

    // Mark received messages as read
    const readResponse = await axios.put(
      `http://localhost:5000/api/messages/read/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("READ RESPONSE:", readResponse.data);

    // Update red notification count
    setMessageUnreadCount(
      readResponse.data.unreadCount
    );

  } catch (error) {
    console.log(
      "FETCH MESSAGES ERROR:",
      error.response?.data || error
    );
  }
};


// =========================
// SEND MESSAGE
// =========================

const sendMessage = async () => {
  if (!messageText.trim() || !selectedUser) {
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:5000/api/messages/send",
      {
        receiver: selectedUser._id,
        text: messageText.trim(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("MESSAGE SENT:", response.data);

    setMessageText("");

    // Refresh chat
    fetchMessages(selectedUser._id);

  } catch (error) {
    console.log(
      "SEND MESSAGE ERROR:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      "Message send failed ❌"
    );
  }
};
    // GET USERS
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/users"
      );

      console.log("USERS:", response.data);

      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/users/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("NOTIFICATIONS:", response.data);

      setNotifications(response.data);
    } catch (error) {
      console.log(
        "NOTIFICATION FETCH ERROR:",
        error.response?.data
      );
    }
  };
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/users/notifications/unread-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(response.data.count);
    } catch (error) {
      console.log(
        "UNREAD COUNT ERROR:",
        error.response?.data
      );
    }
  };
  const markNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/users/notifications/read",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(0);
    } catch (error) {
      console.log(
        "MARK READ ERROR:",
        error.response?.data
      );
    }
  };
  const fetchCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");

    const userId = user?.id || user?._id;

    if (!userId) return;

    const response = await axios.get(
      `http://localhost:5000/api/users/profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser(response.data.user);

  } catch (error) {
    console.log(
      "CURRENT USER ERROR:",
      error.response?.data || error.message
    );
  }
};
  // =========================
  // FOLLOW / UNFOLLOW
  // =========================

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/users/follow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("FOLLOW RESPONSE:", response.data);

      // Update current user's following list
      setUser((prevUser) => ({
        ...prevUser,
        following: [
          ...(prevUser.following || []),
          userId,
        ],
      }));

      // Refresh users list
      fetchUsers();

      alert(
        `Follow successful ❤️ Followers: ${response.data.followersCount}`
      );

    } catch (error) {
      console.log(
        "FOLLOW ERROR:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        "Follow failed ❌"
      );
    }
  };


  const handleUnfollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/users/unfollow/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("UNFOLLOW RESPONSE:", response.data);

      // Remove user from current user's following list
      setUser((prevUser) => ({
        ...prevUser,
        following: (prevUser.following || []).filter(
          (id) =>
            id.toString() !== userId.toString()
        ),
      }));

      // Refresh users list
      fetchUsers();

      alert("User unfollowed successfully 💔");

    } catch (error) {
      console.log(
        "UNFOLLOW ERROR:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        "Unfollow failed ❌"
      );
    }
  };
    // =========================
    // LIKE / UNLIKE
    // =========================

    async function handleLike(postId) {
      try {
        const token = localStorage.getItem("token");

        await axios.post(
          `http://localhost:5000/api/posts/like/${postId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        fetchPosts();
      } catch (error) {
        console.log(error.response?.data);
      }
    }

    // =========================
    // COMMENT
    // =========================

    const handleComment = async (postId) => {
      if (!comment.trim()) {
        return;
      }

      try {
        const token = localStorage.getItem("token");

        await axios.post(
          `http://localhost:5000/api/posts/comment/${postId}`,
          {
            text: comment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setComment("");

        fetchPosts();
      } catch (error) {
        console.log(error.response?.data);
      }
    };

    // =========================
    // LOAD POSTS AFTER LOGIN
    // =========================

    useEffect(() => {
    if (loggedIn) {
      fetchPosts();
      fetchUsers();
      fetchStories();
    }

    if (loggedIn && activePage !== "notifications") {
      fetchUnreadCount();
    }

    if (loggedIn) {
      fetchUnreadMessageCount();
    }

    if (loggedIn && activePage === "profile") {
      fetchCurrentUser();
    }

    if (loggedIn && activePage === "notifications") {
      fetchNotifications();
      markNotificationsAsRead();
    }
  }, [loggedIn, activePage]);
  


  const fetchMessageUnreadCount = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      "http://localhost:5000/api/messages/unread-count",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMessageUnreadCount(response.data.count);
  } catch (error) {
    console.log(
      "MESSAGE UNREAD COUNT ERROR:",
      error.response?.data
    );
  }
};

  // =========================
// AUTO REFRESH CHAT
// =========================

useEffect(() => {
  if (
    loggedIn &&
    activePage === "messages" &&
    selectedUser
  ) {
    const interval = setInterval(() => {
      fetchMessages(selectedUser._id);
    }, 3000);

    return () => clearInterval(interval);
  }
}, [loggedIn, activePage, selectedUser]);
    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
      localStorage.removeItem("token");

      setLoggedIn(false);
      setUser(null);
      setActivePage("home");

      setEmail("");
      setPassword("");
    };

    // =========================
// SEARCH PAGE
// =========================

if (loggedIn && activePage === "search") {
  const searchResults = users
    .filter(
      (otherUser) =>
        otherUser._id !== user?._id &&
        otherUser._id !== user?.id
    )
    .filter((otherUser) =>
      otherUser.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  return (
    <div className="container">

      {/* NAVBAR */}

      <nav className="navbar">

        <h2>Instagram 📸</h2>

        <div className="nav-buttons">

          <button onClick={() => setActivePage("home")}>
            🏠 Home
          </button>

          <button onClick={() => setActivePage("profile")}>
            👤 Profile
          </button>

          <button onClick={() => setActivePage("users")}>
            👥 Users
          </button>

          <button onClick={() => setActivePage("notifications")}>
            🔔 Notifications
          </button>

          <button onClick={() => setActivePage("messages")}>
            💬 Messages
          </button>

          <button onClick={handleLogout}>
            🚪 Logout
          </button>

        </div>

      </nav>


      {/* SEARCH */}

      <div className="profile-page">

        <h1>🔍 Search</h1>

        <input
          type="text"
          placeholder="Search username..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          autoFocus
        />


        {/* SEARCH RESULTS */}

        <div style={{ marginTop: "20px" }}>

          {searchTerm.trim() === "" ? (

            <p>
              Start typing to search users 🔍
            </p>

          ) : searchResults.length === 0 ? (

            <p>
              No users found ❌
            </p>

          ) : (

            searchResults.map((otherUser) => (

              <div
                key={otherUser._id}
                className="post-card"
                style={{
                  padding: "15px",
                  marginBottom: "12px",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setSelectedUser(otherUser);
                  setActivePage("public-profile");
                }}
              >

                <div className="post-header">

                  {otherUser.profilePic ? (

                    <img
                      src={otherUser.profilePic}
                      alt="profile"
                      className="post-profile-pic"
                    />

                  ) : (

                    <div className="post-profile-pic default-profile">
                      👤
                    </div>

                  )}

                  <div>

                    <strong>
                      {otherUser.username}
                    </strong>

                    <p
                      style={{
                        margin: "5px 0",
                        color: "#777"
                      }}
                    >
                      👥{" "}
                      {otherUser.followers?.length || 0}
                      {" "}followers
                    </p>

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}
// =========================
// EXPLORE PAGE
// =========================

if (loggedIn && activePage === "explore") {
  return (
    <div className="container">

      {/* NAVBAR */}

      <nav className="navbar">

        <h2>Instagram 📸</h2>

        <div className="nav-buttons">

          <button onClick={() => setActivePage("home")}>
            🏠 Home
          </button>

          <button onClick={() => setActivePage("profile")}>
            👤 Profile
          </button>

          <button onClick={() => setActivePage("users")}>
            👥 Users
          </button>

          <button onClick={() => setActivePage("notifications")}>
            🔔 Notifications
          </button>

          <button onClick={() => setActivePage("messages")}>
            💬 Messages
          </button>

          <button onClick={handleLogout}>
            🚪 Logout
          </button>

        </div>

      </nav>


      {/* EXPLORE */}

      <div className="explore-page">

        <h1>🧭 Explore</h1>

        <p className="explore-subtitle">
          Discover posts from everyone
        </p>


        {/* POST GRID */}

        {posts.length === 0 ? (

          <div className="no-posts-card">
            <h3>No posts available 📸</h3>
            <p>Create a post to see it here.</p>
          </div>

        ) : (

          <div className="explore-grid">

            {posts.map((post) => (

              <div
                className="explore-post"
                key={post._id}
                onClick={() => {

                  const postUser = users.find(
                    (u) =>
                      u._id === post.user?._id
                  );

                  if (postUser) {
                    setSelectedUser(postUser);
                    setActivePage("public-profile");
                  }

                }}
              >

                <img
                  src={post.image}
                  alt="post"
                />

                <div className="explore-overlay">

                  <span>
                    ❤️ {post.likes?.length || 0}
                  </span>

                  <span>
                    💬 {post.comments?.length || 0}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}
    // =========================
  // USERS PAGE
  // =========================

  if (loggedIn && activePage === "users") {
    return (
      <div className="container">

        {/* NAVBAR */}

        <nav className="navbar">

          <h2>Instagram 📸</h2>

          <div className="nav-buttons">

            <button onClick={() => setActivePage("home")}>
              🏠 Home
            </button>

            <button onClick={() => setActivePage("profile")}>
              👤 Profile
            </button>

            <button onClick={() => setActivePage("users")}>
              👥 Users
            </button>

            <button onClick={() => setActivePage("notifications")}>
              🔔 Notifications
            {unreadCount > 0 && (
              
      <span
      
        style={{
          background: "red",
          color: "white",
          borderRadius: "50%",
          padding: "3px 7px",
          marginLeft: "6px",
          fontSize: "12px",
        }}
      >
        {unreadCount}
      </span>
    )}
  </button>

            <button onClick={handleLogout}>
              🚪 Logout
            </button>

          </div>

        </nav>


        {/* USERS */}

        <div className="profile-page">

          <h1>👥 All Users</h1>
          
          <input
    type="text"
    placeholder="🔍 Search users..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      width: "100%",
      maxWidth: "500px",
      padding: "12px",
      marginBottom: "20px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      fontSize: "16px"
    }}
  />

          {users.length === 0 ? (

            <p>No users found.</p>

          ) : (

            <div>

              {users
    .filter(
      (otherUser) =>
        otherUser._id !== user?._id &&
        otherUser._id !== user?.id
    )
    .filter((otherUser) =>
      otherUser.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      otherUser.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .map((otherUser) => (
                  <div
                    key={otherUser._id}
                    className="post-card"
                    style={{
                      padding: "20px",
                      marginBottom: "15px"
                    }}
                  >

                    <div className="post-header">

                      {otherUser.profilePic ? (

                        <img
                          src={otherUser.profilePic}
                          alt="profile"
                          className="post-profile-pic"
                        />

                      ) : (

                        <div className="post-profile-pic default-profile">
                          👤
                        </div>

                      )}

                      <div>

                        <strong
    style={{
      cursor: "pointer",
      color: "#0095f6"
    }}
    onClick={() => {
      setSelectedUser(otherUser);
      setActivePage("public-profile");
    }}
  >
    {otherUser.username}
  </strong>

                        <p style={{ margin: "5px 0" }}>
                          📧 {otherUser.email}
                        </p>

                        <p style={{ margin: "5px 0" }}>
                          👥 Followers:{" "}
                          {otherUser.followers?.length || 0}
                        </p>
                        {(user?.following || []).some(
    (id) =>
      id.toString() === otherUser._id.toString()
  ) ? (
    <button
      className="edit-profile-btn"
      onClick={() => handleUnfollow(otherUser._id)}
    >
      💔 Unfollow
    </button>
  ) : (
    <button
      className="edit-profile-btn"
      onClick={() => handleFollow(otherUser._id)}
    >
      ❤️ Follow
    </button>
  )}
  <button
    className="edit-profile-btn"
    onClick={() => {
      setSelectedUser(otherUser);
      fetchMessages(otherUser._id);
      setActivePage("messages");
    }}
  >
    💬 Message
  </button>

                      </div>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>

      </div>
    );
  }
  // =========================
  // NOTIFICATIONS PAGE
  // =========================

  if (loggedIn && activePage === "notifications") {
    return (
      <div className="container">

        {/* NAVBAR */}
        <nav className="navbar">

          <h2>Instagram 📸</h2>

          <div className="nav-buttons">

            <button onClick={() => setActivePage("home")}>
              🏠 Home
            </button>

            <button onClick={() => setActivePage("profile")}>
              👤 Profile
            </button>

            <button onClick={() => setActivePage("users")}>
              👥 Users
            </button>

            <button onClick={() => setActivePage("notifications")}>
              🔔 Notifications
            </button>

            <button onClick={handleLogout}>
              🚪 Logout
            </button>

          </div>

        </nav>

        {/* NOTIFICATIONS */}
        <div className="profile-page">

          <h1>🔔 Notifications</h1>

          {notifications.length === 0 ? (

            <p>
              No notifications yet 🔔
            </p>

          ) : (

            notifications
            
              .map((notification) => (

                <div
                  key={notification._id}
                  className="post-card"
                  style={{
                    padding: "15px",
                    marginBottom: "10px"
                  }}
                >

                  <strong>
                    🔔 {notification.message}
                  </strong>

                  <p>
                    🕐 {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

              ))

          )}

        </div>

      </div>
    );
  }
 // =========================
// MESSAGES PAGE
// =========================

if (loggedIn && activePage === "messages") {
  return (
    <div className="instagram-home">

      {/* =========================
          LEFT SIDEBAR
      ========================= */}

      <aside className="instagram-sidebar">

        <h1 className="instagram-logo">
          Instagram
        </h1>

        <div className="sidebar-menu">

          <button
            className="sidebar-button"
            onClick={() => setActivePage("home")}
          >
            🏠 <span>Home</span>
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("search")}
          >
            🔍 <span>Search</span>
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("explore")}
          >
            🧭 <span>Explore</span>
          </button>

          <button
            className="sidebar-button active"
            onClick={() => setActivePage("messages")}
          >
            💬 <span>Messages</span>

            {messageUnreadCount > 0 && (
              <span className="sidebar-badge">
                {messageUnreadCount}
              </span>
            )}
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("notifications")}
          >
            ❤️ <span>Notifications</span>

            {unreadCount > 0 && (
              <span className="sidebar-badge">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("profile")}
          >
            👤 <span>Profile</span>
          </button>

        </div>


        {/* CURRENT USER */}

        <div className="sidebar-user">

          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt="profile"
            />
          ) : (
            <div className="sidebar-user-default">
              👤
            </div>
          )}

          <div>
            <strong>
              {user?.username}
            </strong>

            <small>
              Your profile
            </small>
          </div>

        </div>


        {/* LOGOUT */}

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>


      {/* =========================
          MAIN MESSAGES
      ========================= */}

      <main className="instagram-main">

        <div className="messages-page">

          <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
            💬 Messages
          </h1>


          <div className="messages-container">


            {/* =========================
                CHAT USERS
            ========================= */}

            <div className="chat-users">

              <h3>
                Chats {users.length}
              </h3>


              {users
                .filter(
                  (otherUser) =>
                    otherUser._id !== user?._id &&
                    otherUser._id !== user?.id
                )
                .map((otherUser) => (

                  <div
                    key={otherUser._id}
                    className={`chat-user ${
                      selectedUser?._id === otherUser._id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedUser(otherUser);
                      setActivePage("messages");
                    }}
                  >

                    {otherUser.profilePic ? (

                      <img
                        src={otherUser.profilePic}
                        alt="profile"
                      />

                    ) : (

                      <div className="chat-user-default">
                        👤
                      </div>

                    )}


                    <div className="chat-user-info">

                      <strong>
                        {otherUser.username}
                      </strong>

                      <small>
                        Tap to chat
                      </small>

                    </div>

                  </div>

                ))}

            </div>


            {/* =========================
                CHAT WINDOW
            ========================= */}

            {!selectedUser ? (

              <div className="chat-window">

                <div className="no-chat-selected">

                  <div>

                    <h2>
                      💬 Your Messages
                    </h2>

                    <p>
                      Select a user to start chatting.
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div className="chat-window">


                {/* CHAT HEADER */}

                <div className="chat-header">

                  {selectedUser.profilePic ? (

                    <img
                      src={selectedUser.profilePic}
                      alt="profile"
                    />

                  ) : (

                    <div className="chat-header-default">
                      👤
                    </div>

                  )}


                  <div className="chat-header-info">

                    <strong>
                      {selectedUser.username}
                    </strong>

                    <small>
                      Instagram Clone
                    </small>

                  </div>

                </div>


                {/* CHAT MESSAGES */}

                <div className="chat-messages">

                  {messages.length === 0 ? (

                    <p style={{ textAlign: "center", color: "#888" }}>
                      No messages yet 💬
                    </p>

                  ) : (

                    messages.map((msg) => {

                      const senderId =
                        msg.sender?._id?.toString() ||
                        msg.sender?.toString();

                      const currentUserId =
                        user?._id?.toString() ||
                        user?.id?.toString();

                      const isMyMessage =
                        senderId === currentUserId;


                      return (

                        <div
                          key={msg._id}
                          className={`message-bubble ${
                            isMyMessage
                              ? "sent"
                              : "received"
                          }`}
                        >

                          <div>
                            {msg.text}
                          </div>


                          <small className="message-time">
                            {new Date(
                              msg.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </small>


                          {/* DELETE */}

                          {isMyMessage && (

                            <button
                              type="button"
                              className="message-delete"
                              onClick={async () => {

                                try {

                                  const token =
                                    localStorage.getItem("token");

                                  await axios.delete(
                                    `http://localhost:5000/api/messages/${msg._id}`,
                                    {
                                      headers: {
                                        Authorization:
                                          `Bearer ${token}`,
                                      },
                                    }
                                  );


                                  setMessages(
                                    (prevMessages) =>
                                      prevMessages.filter(
                                        (message) =>
                                          message._id !==
                                          msg._id
                                      )
                                  );

                                } catch (error) {

                                  console.log(
                                    "DELETE MESSAGE ERROR:",
                                    error.response?.data
                                  );

                                  alert(
                                    error.response?.data?.message ||
                                    "Message delete failed ❌"
                                  );

                                }

                              }}
                            >
                              🗑️
                            </button>

                          )}

                        </div>

                      );

                    })

                  )}

                </div>


                {/* =========================
                    MESSAGE INPUT
                ========================= */}

                <div className="chat-input-area">

                  <input
                    type="text"
                    placeholder="Message..."
                    value={messageText}
                    onChange={(e) =>
                      setMessageText(e.target.value)
                    }
                    onKeyDown={(e) => {

                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }

                    }}
                  />


                  <button
                    type="button"
                    onClick={sendMessage}
                  >
                    📤 Send
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </main>


      {/* =========================
          RIGHT SIDEBAR
      ========================= */}

      <aside className="instagram-right-sidebar">

        <div className="current-user-card">

          {user?.profilePic ? (

            <img
              src={user.profilePic}
              alt="profile"
            />

          ) : (

            <div className="right-default-avatar">
              👤
            </div>

          )}

          <div>

            <strong>
              {user?.username}
            </strong>

            <small>
              Welcome back 👋
            </small>

          </div>

        </div>


        <div className="suggestions-header">

          <strong>
            Suggestions for you
          </strong>

          <button
            onClick={() =>
              setActivePage("users")
            }
          >
            See All
          </button>

        </div>


        <div className="suggestions-list">

          {users
            .filter(
              (otherUser) =>
                otherUser._id !== user?._id &&
                otherUser._id !== user?.id
            )
            .slice(0, 5)
            .map((otherUser) => {

              const isFollowing =
                (user?.following || []).some(
                  (id) =>
                    id.toString() ===
                    otherUser._id.toString()
                );

              return (

                <div
                  className="suggestion-item"
                  key={otherUser._id}
                >

                  <div className="suggestion-user">

                    {otherUser.profilePic ? (

                      <img
                        src={otherUser.profilePic}
                        alt="profile"
                      />

                    ) : (

                      <div className="suggestion-default-avatar">
                        👤
                      </div>

                    )}

                    <div>

                      <strong>
                        {otherUser.username}
                      </strong>

                      <small>
                        Suggested for you
                      </small>

                    </div>

                  </div>


                  {isFollowing ? (

                    <button
                      className="following-button"
                      onClick={() =>
                        handleUnfollow(otherUser._id)
                      }
                    >
                      Following
                    </button>

                  ) : (

                    <button
                      className="follow-button"
                      onClick={() =>
                        handleFollow(otherUser._id)
                      }
                    >
                      Follow
                    </button>

                  )}

                </div>

              );

            })}

        </div>


        <p className="instagram-footer">
          About · Help · Privacy · Terms
        </p>

        <p className="instagram-footer">
          © 2026 Instagram Clone
        </p>

      </aside>

    </div>
  );
}
  // =========================
  // PROFILE PAGE
  // =========================

  if (loggedIn && activePage === "profile") {
    return (
      <div className="container">

        {/* NAVBAR */}
        <nav className="navbar">

          <h2>Instagram 📸</h2>

          <div className="nav-buttons">

            <button onClick={() => setActivePage("home")}>
              🏠 Home
            </button>

            <button onClick={() => setActivePage("profile")}>
              👤 Profile
            </button>

            <button onClick={() => setActivePage("users")}>
              👥 Users
            </button>
            <button onClick={() => setActivePage("messages")}>
              💬 Messages
          </button>

            <button onClick={handleLogout}>
              🚪 Logout
            </button>

          </div>

        </nav>

        {/* PROFILE */}
        <div className="profile-page">

          <div className="profile-header">

            {/* PROFILE PICTURE */}
            <div>

              {user?.profilePic ? (
                <img
                  className="profile-picture"
                  src={user.profilePic}
                  alt="Profile"
                />
              ) : (
                <div className="profile-picture">
                  👤
                </div>
              )}

            </div>

            {/* PROFILE INFORMATION */}
            <div className="profile-info">

              <h1>{user?.username}</h1>

              <p>
                📧 {user?.email}
              </p>

              {/* STATS */}
              <div className="profile-stats">

                <div>
                  <strong>
                    {
                      posts.filter(
                        (post) =>
                          post.user?._id === user?.id ||
                          post.user?._id === user?._id
                      ).length
                    }
                  </strong>

                  <span>Posts</span>
                </div>

                <div>
                  <strong>
                    {user?.followers?.length || 0}
                  </strong>

                  <span>Followers</span>
                </div>

                <div>
                  <strong>
                    {user?.following?.length || 0}
                  </strong>

                  <span>Following</span>
                </div>

              </div>

              {/* EDIT PROFILE */}
              <button
                className="edit-profile-btn"
                onClick={() => setActivePage("edit-profile")}
              >
                ✏️ Edit Profile
              </button>

            </div>

          </div>

          {/* MY POSTS */}
          <h2>📸 My Posts</h2>

          <div className="profile-posts">

            {posts.filter(
              (post) =>
                post.user?._id === user?.id ||
                post.user?._id === user?._id
            ).length === 0 ? (

              <p>No posts available 📸</p>

            ) : (

              posts
                .filter(
                  (post) =>
                    post.user?._id === user?.id ||
                    post.user?._id === user?._id
                )
                .map((post) => (

                  <div
                    key={post._id}
                    className="profile-post"
                  >

                    <img
                      src={post.image}
                      alt="post"
                    />

                    <p>
                      {post.caption}
                    </p>

                  </div>

                ))

            )}

          </div>

        </div>

      </div>
    );
  }
  // =========================
  // EDIT PROFILE PAGE
  // =========================

  if (loggedIn && activePage === "edit-profile") {
    return (
      <div className="container">

        <nav className="navbar">

          <h2>Instagram 📸</h2>

          <div className="nav-buttons">

            <button onClick={() => setActivePage("home")}>
              🏠 Home
            </button>

            <button onClick={() => setActivePage("profile")}>
              👤 Profile
            </button>

            <button onClick={() => setActivePage("users")}>
              👥 Users
            </button>
            <button onClick={() => setActivePage("messages")}>
              💬 Messages
            </button>
            <button onClick={handleLogout}>
              🚪 Logout
            </button>

          </div>

        </nav>

        <div className="profile-page">

          <h1>✏️ Edit Profile</h1>

          <input
            type="text"
            placeholder="Username"
            value={user?.username || ""}
            onChange={(e) =>
              setUser({
                ...user,
                username: e.target.value
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            value={user?.email || ""}
            onChange={(e) =>
              setUser({
                ...user,
                email: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Profile Picture URL"
            value={user?.profilePic || ""}
            onChange={(e) =>
              setUser({
                ...user,
                profilePic: e.target.value
              })
            }
          />

          <button
            onClick={async () => {
              try {

                const token = localStorage.getItem("token");

                const response = await axios.put(
    "http://localhost:5000/api/users/profile",
    {
      username: user.username,
      email: user.email,
      profilePic: user.profilePic
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  

                setUser(response.data.user);

                alert("Profile updated successfully! ✅");

                setActivePage("profile");

              } catch (error) {

                console.log(error.response?.data);

                alert(
                  error.response?.data?.message ||
                  "Profile update failed ❌"
                );

              }
            }}
          >
            💾 Save Changes
          </button>

          <button
            onClick={() => setActivePage("profile")}
          >
            ❌ Cancel
          </button>

        </div>

      </div>
    );
  }
 // =========================
// HOME PAGE
// =========================

if (loggedIn && activePage === "home") {
  return (
    <div className="instagram-home">

      {/* =========================
          LEFT SIDEBAR
      ========================= */}

      <aside className="instagram-sidebar">

        <h1 className="instagram-logo">
          Instagram
        </h1>

        <div className="sidebar-menu">

          <button
            className="sidebar-button active"
            onClick={() => setActivePage("home")}
          >
            🏠 <span>Home</span>
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("search")}
          >
            🔍 <span>Search</span>
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("explore")}
          >
            🧭 <span>Explore</span>
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("messages")}
          >
            💬 <span>Messages</span>

            {messageUnreadCount > 0 && (
              <span className="sidebar-badge">
                {messageUnreadCount}
              </span>
            )}
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("notifications")}
          >
            ❤️ <span>Notifications</span>

            {unreadCount > 0 && (
              <span className="sidebar-badge">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            className="sidebar-button"
            onClick={() => setActivePage("profile")}
          >
            👤 <span>Profile</span>
          </button>

        </div>


        {/* USER */}

        <div className="sidebar-user">

          {user?.profilePic ? (
            <img
              src={user.profilePic}
              alt="profile"
            />
          ) : (
            <div className="sidebar-user-default">
              👤
            </div>
          )}

          <div>
            <strong>
              {user?.username}
            </strong>

            <small>
              Your profile
            </small>
          </div>

        </div>


        {/* LOGOUT */}

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="instagram-main">


        {/* =========================
    STORIES
========================= */}

<div className="stories-card">

  {/* YOUR STORY */}

  <div className="story">

    <div
      className="story-avatar add-story"
      onClick={async () => {
        const imageUrl = prompt("Enter Story Image URL 📸");

        if (!imageUrl || !imageUrl.trim()) {
          return;
        }

        try {
          const token = localStorage.getItem("token");

          await axios.post(
            "http://localhost:5000/api/stories/create",
            {
              image: imageUrl.trim(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          await fetchStories();

          alert("Story added successfully! 🎉");

        } catch (error) {
          console.log(
            "CREATE STORY ERROR:",
            error.response?.data || error.message
          );

          alert(
            error.response?.data?.message ||
            "Story creation failed ❌"
          );
        }
      }}
    >
      +
    </div>

    <span>Your story</span>

  </div>


  {/* DATABASE STORIES */}

  {stories.map((story) => (

    <div
      className="story"
      key={story._id}
      onClick={() => setSelectedStory(story)}
    >

      {story.image ? (

        <img
          src={story.image}
          alt="story"
          className="story-avatar"
        />

      ) : (

        <div className="story-avatar">
          👤
        </div>

      )}

      <span>
        {story.user?.username || "User"}
      </span>

    </div>

  ))}


  {/* OTHER USERS */}

  {users
    .filter(
      (otherUser) =>
        otherUser._id !== user?._id &&
        otherUser._id !== user?.id
    )
    .slice(0, 6)
    .map((otherUser) => (

      <div
        className="story"
        key={`user-${otherUser._id}`}
      >

        {otherUser.profilePic ? (

          <img
            className="story-avatar"
            src={otherUser.profilePic}
            alt="profile"
          />

        ) : (

          <div className="story-avatar">
            👤
          </div>

        )}

        <span>
          {otherUser.username}
        </span>

      </div>

    ))}


  {/* STORY VIEWER */}

  {selectedStory && (

    <div
      className="story-viewer"
      onClick={() => setSelectedStory(null)}
    >

      <div
        className="story-viewer-content"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="story-close"
          onClick={() => setSelectedStory(null)}
        >
          ✕
        </button>

        <img
          src={selectedStory.image}
          alt="Story"
        />

        <p>
          {selectedStory.user?.username || "User"}
        </p>

      </div>

    </div>

  )}

</div>

        {/* CREATE POST */}

        <div className="create-post-card">

          <div className="create-post-title">

            <strong>
              Create a new post
            </strong>

          </div>

          <form onSubmit={handleCreatePost}>

            <input
              type="text"
              placeholder="Image URL"
              value={image}
              onChange={(e) =>
                setImage(e.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              required
            />

            <button type="submit">
              📸 Share
            </button>

          </form>

          {postMessage && (
            <p className="post-message">
              {postMessage}
            </p>
          )}

        </div>


        {/* FEED */}

        <div className="instagram-feed">

          {posts.length === 0 ? (

            <div className="no-posts-card">
              <h3>
                No posts yet 📸
              </h3>

              <p>
                Create your first post!
              </p>
            </div>

          ) : (

            posts.map((post) => (

              <article
                className="instagram-post"
                key={post._id}
              >


                {/* POST HEADER */}

                <div className="instagram-post-header">

                  <div className="post-user">

                    {post.user?.profilePic ? (

                      <img
  src={post.user.profilePic}
  alt="profile"
  onClick={() => {
    const postUser = users.find(
      (u) => u._id === post.user?._id
    );

    if (postUser) {
      setSelectedUser(postUser);
      setActivePage("public-profile");
    }
  }}
  style={{ cursor: "pointer" }}
/>

                    ) : (

                      <div
  className="post-default-avatar"
  style={{ cursor: "pointer" }}
  onClick={() => {
    const postUser = users.find(
      (u) => u._id === post.user?._id
    );

    if (postUser) {
      setSelectedUser(postUser);
      setActivePage("public-profile");
    }
  }}
>
  👤
</div>

                    )}

                    <strong
  style={{ cursor: "pointer" }}
  onClick={() => {
    const postUser = users.find(
      (u) => u._id === post.user?._id
    );

    if (postUser) {
      setSelectedUser(postUser);
      setActivePage("public-profile");
    }
  }}
>
  {post.user?.username}
</strong>
                  </div>


                  {/* DELETE */}

                  {(
                    post.user?._id === user?.id ||
                    post.user?._id === user?._id
                  ) && (

                    <button
                      className="delete-button"
                      type="button"
                      onClick={async () => {

                        try {

                          const token =
                            localStorage.getItem("token");

                          await axios.delete(
                            `http://localhost:5000/api/posts/${post._id}`,
                            {
                              headers: {
                                Authorization:
                                  `Bearer ${token}`,
                              },
                            }
                          );

                          setPostMessage(
                            "Post deleted successfully 🗑️"
                          );

                          fetchPosts();

                        } catch (error) {

                          console.log(
                            error.response?.data
                          );

                          setPostMessage(
                            error.response?.data?.message ||
                            "Post delete failed ❌"
                          );

                        }

                      }}
                    >
                      ⋯
                    </button>

                  )}

                </div>


                {/* POST IMAGE */}

                <img
                  src={post.image}
                  alt="post"
                  className="instagram-post-image"
                />


                {/* ACTIONS */}

                <div className="instagram-actions">

                  <div>

                    <button
                      type="button"
                      onClick={() =>
                        handleLike(post._id)
                      }
                    >
                      {post.likes?.some(
                        (id) =>
                          id.toString() ===
                          user?.id?.toString()
                      )
                        ? "❤️"
                        : "🤍"}
                    </button>


                    <button type="button">
                      💬
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        document
                          .getElementById(
                            `comment-${post._id}`
                          )
                          ?.focus();
                      }}
                    >
                      📨
                    </button>

                  </div>


                  <button type="button">
                    🔖
                  </button>

                </div>


                {/* LIKES */}

                <div className="instagram-likes">

                  ❤️ {post.likes?.length || 0} likes

                </div>


                {/* CAPTION */}

                <div className="instagram-caption">

                  <strong>
                    {post.user?.username}
                  </strong>{" "}

                  {post.caption}

                </div>


                {/* COMMENTS */}

                <div className="instagram-comments">

                  {post.comments?.map(
                    (c, index) => (

                      <div
                        className="instagram-comment"
                        key={c._id || index}
                      >

                        <div>

                          <strong>
                            {c.user?.username ||
                              "User"}
                          </strong>{" "}

                          {c.text}

                        </div>


                        {(
                          c.user?._id === user?.id ||
                          c.user?._id === user?._id
                        ) && (

                          <button
                            type="button"
                            onClick={async () => {

                              try {

                                const token =
                                  localStorage.getItem(
                                    "token"
                                  );

                                await axios.delete(
                                  `http://localhost:5000/api/posts/${post._id}/comment/${c._id}`,
                                  {
                                    headers: {
                                      Authorization:
                                        `Bearer ${token}`,
                                    },
                                  }
                                );

                                fetchPosts();

                              } catch (error) {

                                console.log(
                                  error.response?.data
                                );

                              }

                            }}
                          >
                            🗑️
                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>


                {/* ADD COMMENT */}

                <div className="instagram-comment-box">

                  <input
                    id={`comment-${post._id}`}
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleComment(post._id)
                    }
                  >
                    Post
                  </button>

                </div>

              </article>

            ))

          )}

        </div>

      </main>


      {/* =========================
          RIGHT SIDEBAR
      ========================= */}

      <aside className="instagram-right-sidebar">


        {/* CURRENT USER */}

        <div className="current-user-card">

          {user?.profilePic ? (

            <img
              src={user.profilePic}
              alt="profile"
            />

          ) : (

            <div className="right-default-avatar">
              👤
            </div>

          )}

          <div>

            <strong>
              {user?.username}
            </strong>

            <small>
              Welcome back 👋
            </small>

          </div>

        </div>


        {/* SUGGESTIONS */}

        <div className="suggestions-header">

          <strong>
            Suggestions for you
          </strong>

          <button
            onClick={() =>
              setActivePage("users")
            }
          >
            See All
          </button>

        </div>


        <div className="suggestions-list">

          {users
            .filter(
              (otherUser) =>
                otherUser._id !== user?._id &&
                otherUser._id !== user?.id
            )
            .slice(0, 5)
            .map((otherUser) => {

              const isFollowing =
                (user?.following || []).some(
                  (id) =>
                    id.toString() ===
                    otherUser._id.toString()
                );

              return (

                <div
                  className="suggestion-item"
                  key={otherUser._id}
                >

                  <div className="suggestion-user">

                    {otherUser.profilePic ? (

                      <img
                        src={otherUser.profilePic}
                        alt="profile"
                      />

                    ) : (

                      <div className="suggestion-default-avatar">
                        👤
                      </div>

                    )}

                    <div>

                      <strong>
                        {otherUser.username}
                      </strong>

                      <small>
                        Suggested for you
                      </small>

                    </div>

                  </div>


                  {isFollowing ? (

                    <button
                      className="following-button"
                      onClick={() =>
                        handleUnfollow(
                          otherUser._id
                        )
                      }
                    >
                      Following
                    </button>

                  ) : (

                    <button
                      className="follow-button"
                      onClick={() =>
                        handleFollow(
                          otherUser._id
                        )
                      }
                    >
                      Follow
                    </button>

                  )}

                </div>

              );

            })}

        </div>


        {/* FOOTER */}

        <p className="instagram-footer">

          About · Help · Privacy · Terms

        </p>

        <p className="instagram-footer">

          © 2026 Instagram Clone

        </p>

      </aside>

    </div>
  );
}
    // =========================
    // REGISTER PAGE
    // =========================

    if (page === "register") {
      return (
        <div className="container">

          <h1>
            Instagram
          </h1>

          <h2>
            Create Account
          </h2>

          <form onSubmit={handleRegister}>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) =>
                setRegisterEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) =>
                setRegisterPassword(e.target.value)
              }
              required
            />

            <button type="submit">
              Sign Up
            </button>

          </form>

          <p
            onClick={() => {
              setPage("login");
              setMessage("");
            }}
          >
            Already have account? Login
          </p>

          <p>
            {message}
          </p>

        </div>
      );
    }

    // =========================
    // LOGIN PAGE
    // =========================

    return (
      <div className="container">

        <h1>
          Instagram
        </h1>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <p
          onClick={() => {
            setPage("register");
            setMessage("");
          }}
        >
          Don't have account? Sign Up
        </p>

        <p>
          {message}
        </p>

      </div>
    );
  }

  export default App;