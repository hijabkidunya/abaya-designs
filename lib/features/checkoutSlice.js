import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Async thunk for submitting order
export const submitOrder = createAsyncThunk(
    "checkout/submitOrder",
    async (orderData, { rejectWithValue }) => {
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Order submission failed")
            return data
        } catch (err) {
            return rejectWithValue(err.message)
        }
    }
)

const initialState = {
    form: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        province: "", // changed from state
        zipCode: "",
        country: "Pakistan",
        paymentMethod: "cod",
        bankConfirmed: false,
    },
    errors: {},
    submitting: false,
    submitError: null,
    submitSuccess: false,
    touched: {}, // Track touched fields
    submitAttempted: false, // Track if submit was attempted
}

const validate = (form) => {
    const errors = {}
    // Helper to trim and check empty
    const isEmpty = (val) => !val || !val.trim()
    if (isEmpty(form.firstName)) errors.firstName = "First name is required."
    if (isEmpty(form.lastName)) errors.lastName = "Last name is required."
    if (
        isEmpty(form.email) ||
        !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.email.trim())
    )
        errors.email = "Please enter a valid email address."
    if (
        isEmpty(form.phone) ||
        !/^\+?\d{10,15}$/.test(form.phone.replace(/\D/g, ""))
    )
        errors.phone = "Please enter a valid phone number (10-15 digits)."
    if (isEmpty(form.address)) errors.address = "Address is required."
    if (isEmpty(form.city)) errors.city = "City is required."
    if (isEmpty(form.province)) errors.province = "Province is required."
    if (isEmpty(form.zipCode)) errors.zipCode = "Postal code is required."
    if (isEmpty(form.country)) errors.country = "Country is required."
    if (isEmpty(form.paymentMethod)) errors.paymentMethod = "Payment method is required."
    if (form.paymentMethod === "bank" && !form.bankConfirmed)
        errors.bankConfirmed = "You must confirm the bank transfer."
    return errors
}

const checkoutSlice = createSlice({
    name: "checkout",
    initialState,
    reducers: {
        updateField: (state, { payload: { field, value } }) => {
            state.form[field] = value
            state.touched[field] = true
            state.errors = validate(state.form)
        },
        setForm: (state, { payload }) => {
            state.form = { ...state.form, ...payload }
            Object.keys(payload).forEach((field) => {
                state.touched[field] = true
            })
            state.errors = validate(state.form)
        },
        validateForm: (state) => {
            state.errors = validate(state.form)
            state.submitAttempted = true
        },
        resetCheckout: () => initialState,
        markTouched: (state, { payload: field }) => {
            state.touched[field] = true
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitOrder.pending, (state) => {
                state.submitting = true
                state.submitError = null
                state.submitSuccess = false
            })
            .addCase(submitOrder.fulfilled, (state) => {
                state.submitting = false
                state.submitSuccess = true
            })
            .addCase(submitOrder.rejected, (state, action) => {
                state.submitting = false
                state.submitError = action.payload
            })
    },
})

export const { updateField, setForm, validateForm, resetCheckout, markTouched } = checkoutSlice.actions
export default checkoutSlice.reducer 