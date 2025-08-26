import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/user")
      if (!res.ok) throw new Error("Failed to fetch user profile")
      return await res.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profile, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error("Failed to update user profile")
      return await res.json()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to change password")
      return data.message
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

const initialState = {
  user: null,
  isAuthenticated: false,
  role: null,
  loading: false,
  error: null,
  passwordChangeSuccess: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.role = action.payload?.role || null
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.role = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.passwordChangeSuccess = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false
        state.passwordChangeSuccess = action.payload
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.passwordChangeSuccess = null
      })
  },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer
