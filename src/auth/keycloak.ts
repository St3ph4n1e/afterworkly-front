import axios from "axios";

async function getClientToken() {
  const data = new URLSearchParams();
  data.append("client_id", import.meta.env.VITE_CLIENT_ID);
  data.append("client_secret", import.meta.env.VITE_CLIENT_SECRET);
  data.append("grant_type", "client_credentials");  // Client Credentials Flow

  try {
    const response = await axios.post(import.meta.env.VITE_KEYCLOAK_URL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log(response.data);
    return response.data.access_token;  // Return the access token
  } catch (error) {
    console.error("Error getting client token:", error.response?.data || error.message);
    throw new Error("Failed to get token");
  }
}


export async function loginWithKeycloak(username: string, password: string) {
  try {
    const response = await axios.post(
      import.meta.env.VITE_KEYCLOAK_URL,
      new URLSearchParams({
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        grant_type: "password",
        username,
        password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log(response.data)
    localStorage.setItem("token", response.data.access_token);
    return response.data.access_token;
  } catch (error: any) {
    console.error("Keycloak login failed:", error.response?.data || error.message);
    throw new Error("Échec de la connexion");
  }
}

export async function createUser(userData: { email: string; username: string; password: string }) {

  try {
    // Get token using client credentials flow
    const token = await getClientToken();

    // Set up the user object for Keycloak
    const user = {
      username: userData.username,
      email: userData.email,
      firstName: userData.username,
      lastName: "User", // Default lastName to "User" if not provided
      enabled: true,
      credentials: [
        {
          type: "password",
          value: userData.password,
          temporary: false,
        },
      ],
    };

    // Create the user via the Admin API
    const response = await axios.post(
      `http://localhost:8080/admin/realms/${import.meta.env.VITE_REALM_NAME}/users`, // Admin API endpoint to create a user
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Use the client token for authentication
        },
      }
    );

    console.log("User created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
  }
}



export function logoutFromKeycloak() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("id_token");
}
